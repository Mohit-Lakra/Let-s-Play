let io;

module.exports = {
  init: (httpServer) => {
    // Import Socket.io
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Clients can join a room specific to their User ID so we can send private updates
      socket.on('join_room', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined room user:${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
