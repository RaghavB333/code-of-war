// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');


// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000", // Update with your Next.js frontend URL
//     methods: ["GET", "POST"],
//   },
// });

// // Handle socket connections
// io.on('connection', async(socket) => {
//   console.log('A user connected:', socket.id);


//   socket.on('send-request', (data) => {
//     console.log('Request received:', data);
//     // Emit the event to a specific user
//     if (data.to) {
//       // console.log(data.to);
//       io.to(data.to).emit('receive-request', data);
//     }
//   });

//   socket.on('accept-invite', (data) => {
//     console.log('Request accepted:', data);

//     // Emit the event to a specific user
//     if (data.sendersocketid) {
//        io.to(data.sendersocketid).emit('request-accepted', data);
//       console.log("request has been accepted");
//     }
//   } );

//   // socket.on('joinLobby', (data) => {

//   //   const socketid = data.socketid;

//   //   console.log("socketid start",socketid);
    
//   //     // io.to(socketid).emit('changeRoute',{id:data.lobbyid});
//   //     io.emit('changeRoute',{id:data.lobbyid});
//   // });

//   socket.on('joinLobby', (data) => {
//     const socketid = data.socketid;
//     console.log("Attempting to emit to socket:", socketid);
    
//     if (io.sockets.sockets.has(socketid)) {
//       io.to(socketid).emit('changeRoute', {id: data.lobbyid});
//       console.log("Emission successful");
//     } else {
//       console.log("Socket not found:", socketid);
//     }
//   });

//   socket.on('disconnect', async() => {
//     console.log('A user disconnected:', socket.id);
//   });
// });

// const PORT = 4000;
// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Database connection
mongoose.connect('mongodb://localhost:27017/codeofwar', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Playground = mongoose.model('Playground', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  members: { type: Array, default: [] },
  owner: { type: String, required: true },
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now }
}));

const UserSocket = mongoose.model('UserSocket', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  socketId: { type: String },
  lastActive: { type: Date, default: Date.now }
}));

const app = express();
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

// Lobby management


// Handle socket connections
// io.on('connection', async (socket) => {
//   console.log('A user connected:', socket.id);

//   // Update user's socket ID in database
//   socket.on('register-user', async ({ email }) => {
//     try {
//       await UserSocket.findOneAndUpdate(
//         { email },
//         { socketId: socket.id, lastActive: new Date() },
//         { upsert: true }
//       );
//       console.log(`Registered socket ${socket.id} for user ${email}`);
//     } catch (err) {
//       console.error('Error registering user socket:', err);
//     }
//   });

//   // Create a new lobby
//   socket.on('create-lobby', async ({ email }) => {
//     try {
//       const lobbyId = generateLobbyId();
//       const newLobby = new Playground({
//         id: lobbyId,
//         members: [email],
//         owner: email,
//         status: 'waiting'
//       });
      
//       await newLobby.save();
//       lobbies.set(lobbyId, {
//         id: lobbyId,
//         members: [email],
//         sockets: [socket.id],
//         status: 'waiting'
//       });

//       socket.join(lobbyId);
//       socket.emit('lobby-created', { lobbyId });
//       console.log(`Lobby ${lobbyId} created by ${email}`);
//     } catch (err) {
//       console.error('Error creating lobby:', err);
//       socket.emit('lobby-error', { message: 'Failed to create lobby' });
//     }
//   });

//   // Join an existing lobby
//   socket.on('join-lobby', async ({ lobbyId, email }) => {
//     try {
//       const lobby = await Playground.findOne({ id: lobbyId });
//       if (!lobby) {
//         return socket.emit('lobby-error', { message: 'Lobby not found' });
//       }

//       if (lobby.members.includes(email)) {
//         return socket.emit('lobby-error', { message: 'Already in lobby' });
//       }

//       lobby.members.push(email);
//       await lobby.save();

//       const lobbyData = lobbies.get(lobbyId) || {
//         id: lobbyId,
//         members: lobby.members,
//         sockets: [],
//         status: 'waiting'
//       };
      
//       lobbyData.members = lobby.members;
//       lobbyData.sockets.push(socket.id);
//       lobbies.set(lobbyId, lobbyData);

//       socket.join(lobbyId);
//       io.to(lobbyId).emit('lobby-updated', lobbyData);
//       console.log(`User ${email} joined lobby ${lobbyId}`);
//     } catch (err) {
//       console.error('Error joining lobby:', err);
//       socket.emit('lobby-error', { message: 'Failed to join lobby' });
//     }
//   });

//   // Start the playground (only lobby owner can do this)
//   socket.on('start-playground', async ({ lobbyId, email }) => {
//     try {
//       const lobby = await Playground.findOne({ id: lobbyId });
//       if (!lobby || lobby.owner !== email) {
//         return socket.emit('lobby-error', { message: 'Not authorized' });
//       }

//       lobby.status = 'active';
//       await lobby.save();

//       const lobbyData = lobbies.get(lobbyId);
//       if (lobbyData) {
//         lobbyData.status = 'active';
//         lobbies.set(lobbyId, lobbyData);
        
//         // Notify all members to redirect to problems page
//         io.to(lobbyId).emit('playground-started', { 
//           lobbyId,
//           problemId: 'default-problem' // You can customize this
//         });
        
//         console.log(`Playground ${lobbyId} started by ${email}`);
//       }
//     } catch (err) {
//       console.error('Error starting playground:', err);
//       socket.emit('lobby-error', { message: 'Failed to start playground' });
//     }
//   });

//   // Handle disconnections
//   socket.on('disconnect', async () => {
//     console.log('User disconnected:', socket.id);
    
//     // Clean up empty lobbies
//     lobbies.forEach((lobby, lobbyId) => {
//       lobby.sockets = lobby.sockets.filter(id => id !== socket.id);
//       if (lobby.sockets.length === 0) {
//         lobbies.delete(lobbyId);
//       }
//     });
//   });
// });

// ... (previous imports and setup)

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
  socket.on('create-lobby', async ({ email }, callback) => {
    console.log('Create lobby request received from:', email);
    
    try {
      if (!email) {
        throw new Error('Email is required');
      }
  
      const lobbyId = generateLobbyId();
      console.log('Generating new lobby ID:', lobbyId);
  
      const newLobby = new Playground({
        id: lobbyId,
        members: [email],
        owner: email,
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

      lobby.members.push(email);
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
    const lobby = await Playground.findOne({ id: lobbyId });
    if (lobby && lobby.owner === email) {
      io.to(lobbyId).emit('lobby-started', { 
        redirectTo: `/problems/${lobbyId}?difficulty=${difficulty}&no=${no}`, 
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

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});