const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('../lib/mongoose');
const userModel = require('../models/user.model');
const Playground = require('../models/playground')
require("dotenv").config({ path: "../.env.local" });
const cors = require("cors");
const app = express();


const server = http.createServer(app);
app.use((req, res, next) => {
  console.log("Incoming Origin Header:", req.headers.origin);
  next();
});

const corsOptions = {
  origin: "*", // OR use a whitelist array
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false
};
console.log("CORS options used:", corsOptions);

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

  const onlineUsers = new Map();

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);


    // When user connects, store their ID and socketId
  socket.on("user_connected", ({userId}) => {
    console.log("user id : ", userId);
    onlineUsers.set(userId, socket.id);
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
          // lastActive: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`Socket ID for ${email} is now ${socket.id}`);
    } catch (err) {
      console.error("Failed to register user socket:", err);
    }
  });

  // Create lobby handler
  socket.on('create-lobby', async ({ email, settings }, callback) => {
    console.log('Create lobby request received from:', email, settings);

    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const lobbyId = generateLobbyId();
      console.log('Generating new lobby ID:', lobbyId);

      const newLobby = new Playground({
        id: lobbyId,
        members: [{ name: email, totalPoints: 0 }],
        owner: email,
        sessionend: settings.timeLimit,
        status: 'waiting'
      });

      const savedLobby = await newLobby.save();
      console.log('Lobby saved to DB:', savedLobby);

      socket.join(lobbyId);
      console.log('Socket joined lobby room:', lobbyId);

      // Important: Verify callback exists before calling it
      if (typeof callback === 'function') {
        callback({ success: true, lobbyId });
      } else {
        console.error('No callback function provided by client');
      }
    } catch (err) {
      console.error('Error creating lobby:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

 socket.on('add-friend', async({data}) => {
   const {email, friendemail} = data;
   console.log(email, friendemail);
      
      const friend = await userModel.findOne({email: friendemail});
      
          if(!friend)
          {
              return new Response(
                  JSON.stringify({ message: "Friend not found"}),
                  { status: 400 }
                );
          }
  
          const notification = {
              senderEmail:email,
              receiverEmail: friendemail,
              status: "panding",
              createdAt: new Date()
          }
          let isSend = true;
          if(friend.friends.includes(email)){
            isSend = false;
          }
          if(isSend){
            friend.notifications.map((n)=> n.senderEmail == email && n.receiverEmail == friendemail ? isSend = false : '');
          }
          if(isSend){
            friend.notifications.push(notification);
            await friend.save();
            io.to(friend.socketId).emit("addFriendRequestReceived", email);
          }
 })

  // Invite handler
  socket.on('send-invite', async ({ lobbyId, friendSocketId, inviterEmail }) => {
    console.log("invite received");
    try {
      // const friend = await UserSocket.findOne({ email: friendEmail });
      console.log("Attempting to emit to socket ID:", friendSocketId);
      const targetSocket = io.sockets.sockets.get(friendSocketId);
      console.log("Target socket:", targetSocket ? "Found" : "Not found");
      if (targetSocket) {
        io.to(friendSocketId).emit('receive-invite', {
          lobbyId,
          inviterEmail,
          timestamp: new Date()
        });
      } else {
        console.log("Socket with ID", friendSocketId, "not currently connected.");
      }
      // if (friendSocketId) {
      //   console.log("friendSocketid",friendSocketId);
      //   io.to(friendSocketId).emit('receive-invite', {
      //     lobbyId,
      //     inviterEmail,
      //     timestamp: new Date()
      //   });
      // }
    } catch (err) {
      console.error('Invite error:', err);
    }
  });

  // Accept invite handler
  socket.on('accept-invite', async ({ lobbyId, id }, callback) => {
    try {
      const lobby = await Playground.findById(lobbyId);
      if (!lobby) return callback({ success: false, error: 'Lobby not found' });

      const data = {
        member: id,
        totalPoints: 0
      }
      lobby.members.push(data);
      await lobby.save();
      const lby = await Playground.findById(lobbyId).populate({
        path: 'members.member',
        select: 'username email'
      });

      socket.join(lobbyId);
      io.to(lobbyId).emit('lobby-updated', lby);
      callback({ success: true, lobbyId });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });

  // Fetch Lobby
  socket.on('fetch-lobby', async({lobbyId}) => {
    const lobby = await Playground.findById(lobbyId).populate({
        path: 'members.member',
        select: 'username email'
      });
      io.to(lobbyId).emit('lobby-updated', lobby);
  })


// Rejoin lobby
  socket.on('rejoin-lobby', ({lobbyId}) =>{
    console.log("rejoin", lobbyId);
    socket.join(lobbyId);
  })

  // Start lobby handler (host only)
  socket.on('start-lobby', async ({ lobbyId, email }) => {
    console.log("Starting Lobby..................");
    await Playground.findByIdAndUpdate(lobbyId, { $set: { status: 'active', startedAt: new Date() } });
    console.log("updated lobby status");
    const lobby = await Playground.findById(lobbyId);
    console.log("lobby found", lobby);
    if (lobby && lobby.owner === email) {
      io.to(lobbyId).emit('lobby-started', {
        redirectTo: `/problems/${lobbyId}`,
      });
    }
  });

  socket.on('fetchOnline_users', ()=> {
    io.emit("online_users", Array.from(onlineUsers.keys())); // optional broadcast
  })

  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);
      for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("online_users", Array.from(onlineUsers.keys())); // optional broadcast
  });

});

function generateLobbyId() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});