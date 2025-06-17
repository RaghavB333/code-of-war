const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require("cors");
const app = express();
app.use(cors());


// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


const Playground = mongoose.model('Playground', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  members: { type: [{name: String, totalPoints: Number}], default: [] },
  owner: { type: String, required: true },
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
  sessionend:{ type: Number,default: null},
  startedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}));

const UserSocket = mongoose.model('UserSocket', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  socketId: { type: String },
  lastActive: { type: Date, default: Date.now }
}));


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000, // 2 minutes
    skipMiddlewares: true
  }
});

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);

  // Register or update user socket ID
  socket.on('register-user', async ({ email }) => {
    if (!email) return;
    
    try {
      await UserSocket.findOneAndUpdate(
        { email },
        {
          socketId: socket.id,
          lastActive: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`Socket ID for ${email} is now ${socket.id}`);
    } catch (err) {
      console.error("Failed to register user socket:", err);
    }
  });

  // Create lobby handler
  socket.on('create-lobby', async ({ email,settings }, callback) => {
    console.log('Create lobby request received from:', email, settings);
    
    try {
      if (!email) {
        throw new Error('Email is required');
      }
  
      const lobbyId = generateLobbyId();
      console.log('Generating new lobby ID:', lobbyId);
  
      const newLobby = new Playground({
        id: lobbyId,
        members: [{name: email, totalPoints: 0}],
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

  // Invite handler
  socket.on('send-invite', async ({ lobbyId, friendEmail,friendSocketId, inviterEmail}) => {
    console.log("invite received");
    try {
      // const friend = await UserSocket.findOne({ email: friendEmail });
      console.log("Attempting to emit to socket ID:", friendSocketId);
      const targetSocket = io.sockets.sockets.get(friendSocketId);
      console.log("Target socket:", targetSocket ? "Found" : "Not found");
      if (targetSocket) {
        io.to(friendSocketId).emit('receive-invite', { lobbyId,
          inviterEmail,
          timestamp: new Date()});
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
  socket.on('accept-invite', async ({ lobbyId, email }, callback) => {
    try {
      const lobby = await Playground.findOne({ id: lobbyId });
      if (!lobby) return callback({ success: false, error: 'Lobby not found' });

      const data = {
        name: email,
        totalPoints: 0
      }
      lobby.members.push(data);
      await lobby.save();
      
      socket.join(lobbyId);
      io.to(lobbyId).emit('lobby-updated', lobby);
      callback({ success: true, lobbyId });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });

  // Start lobby handler (host only)
  socket.on('start-lobby', async ({ lobbyId, email,difficulty,no }) => {
    console.log("Starting Lobby..................");
    await Playground.updateOne({id: lobbyId }, { $set: {status: 'active',startedAt: new Date()}});
    console.log("updated lobby status");
    const lobby = await Playground.findOne({ id: lobbyId });
    console.log("lobby found",lobby);
    if (lobby && lobby.owner === email) {
      io.to(lobbyId).emit('lobby-started', { 
        redirectTo: `/problems/${lobbyId}?difficulty=${difficulty}&no=${no}&sessionend=${lobby.sessionend}&startedAt=${lobby.startedAt}`, 
      });
    }
  });

  socket.on('disconnect', async() => {
        console.log('A user disconnected:', socket.id);
      });

});

function generateLobbyId() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});