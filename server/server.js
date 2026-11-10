const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const connectDB = require('../lib/mongoose');
const userModel = require('../models/user.model');
const Playground = require('../models/playground');
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: "../.env.local" });

const INTERNAL_SECRET = process.env.SOCKET_INTERNAL_SECRET;
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "token";

if (!INTERNAL_SECRET) throw new Error("SOCKET_INTERNAL_SECRET is required");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");

const app = express();
const server = http.createServer(app);


app.use((req, res, next) => {
  console.log("Incoming Origin Header:", req.headers.origin);
  next();
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false 
}));

// Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000,
    skipMiddlewares: true
  }
});

/* ------------------------------ auth helpers ------------------------------ */

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ""));
  const y = Buffer.from(String(b ?? ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
 
function tokenFromCookie(header = "") {
  const part = header
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE_NAME}=`));
  return part ? decodeURIComponent(part.slice(COOKIE_NAME.length + 1)) : null;
}

// Returns the verified user id from the login cookie / auth token, or null.
function authUserId(socket) {
  const token = socket.handshake.auth?.token || tokenFromCookie(socket.handshake.headers.cookie);
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload._id || payload.id || payload.userId || payload.sub;
    return mongoose.isValidObjectId(id) ? String(id) : null;
  } catch {
    return null;
  }
}

// Soft auth: we never reject a connection, so friend requests and online users keep
// working exactly as before. Only the lobby features below need a verified user.
io.use((socket, next) => {
  socket.data.userId = authUserId(socket);
  next();
});

/* ----------------- Next.js -> socket: "emit this event to these rooms" ----------------- */


app.post("/internal/emit", express.json({ limit: "64kb" }), (req, res) => {
  if (!INTERNAL_SECRET) return res.status(503).end();
  if (!safeEqual(req.headers["x-internal-secret"], INTERNAL_SECRET)) return res.status(401).end();
 
  const { room, rooms, event, payload } = req.body ?? {};
  const targets = (Array.isArray(rooms) ? rooms : [room]).filter((r) => typeof r === "string" && r);
  if (!targets.length || typeof event !== "string") return res.status(400).end();
 
  // chaining .to() sends the event once even if a socket is in several of the rooms
  let op = io.to(targets[0]);
  for (const target of targets.slice(1)) op = op.to(target);
  op.emit(event, payload ?? {});
  res.status(204).end();
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v) => String(v || '').trim().toLowerCase();

/* ---------------------------------- sockets ---------------------------------- */

const onlineUsers = new Map(); // userId -> Set of socket ids
 
// Next.js asks: "which of these users are online?" (used to allow invites only to online friends)

app.post("/internal/online", express.json({ limit: "64kb" }), (req, res) => {
  if (!INTERNAL_SECRET) return res.status(503).end();
  if (!safeEqual(req.headers["x-internal-secret"], INTERNAL_SECRET)) return res.status(401).end();
  const ids = Array.isArray(req.body?.userIds) ? req.body.userIds.map(String) : [];
  res.json({ online: ids.filter((id) => onlineUsers.has(id)) });
});


io.on('connection', async (socket) => {
  const { userId } = socket.data;
  console.log('A user connected:', userId, socket.id);

  // personal room for lobby invites (all tabs of this user)
  if (socket.data.userId) socket.join(`user:${socket.data.userId}`);

  // When user connects, store their ID and socketId
  socket.on("user_connected", ({userId}) => {
    console.log("user id : ", userId);
    const sockets = onlineUsers.get(userId) ?? new Set();
    sockets.add(socket.id);
    onlineUsers.set(userId, sockets);

    if (!socket.data.userId && mongoose.isValidObjectId(userId)) {
      socket.data.userId = String(userId);
      socket.join(`user:${userId}`);
    }

  io.emit("online_users", Array.from(onlineUsers.keys())); // optional broadcast
  });

  // Register or update user socket ID
  socket.on('register-user', async ({ email }) => {
    if (!email) return;

    try {
      await connectDB();
      await userModel.findOneAndUpdate(
        { email },
        {
          socketId: socket.id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`Socket ID for ${email} is now ${socket.id}`);
    } catch (err) {
      console.error("Failed to register user socket:", err);
    }
  });

  socket.on("playground:unsubscribe", ({ id } = {}) => {
    if (typeof id === "string") socket.leave(`pg:${id}`);
  });

  socket.on('add-friend', async (payload, ack) => {
    console.log('add-friend event received:', payload);
    const reply = typeof ack === 'function' ? ack : () => {};
    try {
      const data = payload?.data || {};
     
      const from = clean(socket.data?.user?.email || data.email);
      const to = clean(data.friendemail);
 
      if (!EMAIL_RE.test(to)) return reply({ ok: false, message: 'Enter a valid email address.' });
      if (from === to) return reply({ ok: false, message: "You can't add yourself." });
 
      const [me, target] = await Promise.all([
        userModel.findOne({ email: from, accountStatus: 'active' }),
        userModel.findOne({ email: to, accountStatus: 'active' }),
      ]);
      if (!me) return reply({ ok: false, message: 'Please sign in again.' });
      if (!target) return reply({ ok: false, message: 'No player found with this email.' });
      if (me.friends.some((f) => f.equals(target._id))) {
        return reply({ ok: false, message: `You are already friends with ${target.username}.` });
      }
 
      if (me.notifications.some((n) => n.senderEmail === to && n.status === 'pending')) {
        await Promise.all([
          userModel.updateOne({ _id: me._id }, { $addToSet: { friends: target._id }, $pull: { notifications: { senderEmail: to } } }),
          userModel.updateOne({ _id: target._id }, { $addToSet: { friends: me._id }, $pull: { notifications: { senderEmail: from } } }),
        ]);
        if (target.socketId) io.to(target.socketId).emit('friend-list-changed');
        return reply({ ok: true, accepted: true, message: `You and ${target.username} are now friends.` });
      }
 
      const res = await userModel.updateOne(
        { _id: target._id, 'notifications.senderEmail': { $ne: from } },
        { $push: { notifications: { senderEmail: from, receiverEmail: to, status: 'pending', createdAt: new Date() } } }
      );
      if (res.modifiedCount === 0) {
        return reply({ ok: false, message: 'You already sent a request to this player.' });
      }
 
      if (target.socketId) io.to(target.socketId).emit('addFriendRequestReceived', from);
      return reply({ ok: true, message: `Request sent to ${target.username}.` });
    } catch (err) {
      console.error('add-friend failed', err);
      return reply({ ok: false, message: 'Something went wrong. Please try again.' });
    }
  });
 
  socket.on('friend-accepted-notify', async (payload) => {
    try {
      const sender = await userModel.findOne({ email: clean(payload?.senderEmail) }).select('socketId');
      if (sender?.socketId) io.to(sender.socketId).emit('friend-list-changed');
    } catch (err) {
      console.error('friend-accepted-notify failed', err);
    }
  });


  socket.on("playground:subscribe", async ({ id } = {}, ack) => {
    try {
      const userId = socket.data.userId;
      if (!userId || !mongoose.isValidObjectId(id)) return ack?.({ ok: false });
 
      await connectDB();
      const allowed = await Playground.exists({
        _id: id,
        members: { $elemMatch: { user: userId, status: { $in: ["invited", "joined"] } } },
      });
      if (!allowed) return ack?.({ ok: false });
 
      socket.join(`pg:${id}`);
      ack?.({ ok: true });
    } catch (err) {
      console.error("playground:subscribe failed:", err);
      ack?.({ ok: false });
    }
  });

  socket.on("playground:unsubscribe", ({ id } = {}) => {
    if (typeof id === "string") socket.leave(`pg:${id}`);
  });

  socket.on('fetchOnline_users', ()=> {
    io.emit("online_users", Array.from(onlineUsers.keys())); // optional broadcast
  })

  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);
      for (const [userId, sockets] of onlineUsers.entries()) {
      if (sockets.delete(socket.id)) {
        if (sockets.size === 0) onlineUsers.delete(userId); // last tab closed -> offline
        break;
      }
    }
    io.emit("online_users", Array.from(onlineUsers.keys())); // optional broadcast
  });

});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});