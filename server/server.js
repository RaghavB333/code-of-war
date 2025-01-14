const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
// const connectDB = require("../lib/mongoose");
// const userModel = require("../models/user.model")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Update with your Next.js frontend URL
    methods: ["GET", "POST"],
  },
});

// Handle socket connections
io.on('connection', async(socket) => {
  console.log('A user connected:', socket.id);


  socket.on('send-request', (data) => {
    console.log('Request received:', data);

    // Emit the event to a specific user
    if (data.to) {
      console.log(data.to);
      io.to(data.to).emit('receive-request', data);
    }
  });

  socket.on('disconnect', async() => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
