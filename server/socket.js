// Add this to your server.js or create a new socket.js file to be imported in your main server file
import { Server } from 'socket.io';
import http from 'http';
import Message from './models/message.model.js'; // Adjust path as needed

export const setupSocketServer = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // your frontend URL
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket.io middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // You could verify JWT token here if needed
    // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {...});
    next();
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room (for job-specific messages)
    socket.on('joinRoom', (jobId) => {
      socket.join(jobId);
      console.log(`User ${socket.id} joined room: ${jobId}`);
    });

    // Leave a room
    socket.on('leaveRoom', (jobId) => {
      socket.leave(jobId);
      console.log(`User ${socket.id} left room: ${jobId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (messageData) => {
      try {
        // Save to database if needed
        if (messageData.saveToDb !== false) {
          const message = new Message({
            sender: messageData.sender,
            receiver: messageData.jobId, // Using jobId as receiver
            content: messageData.text,
            read: false
          });
          
          await message.save();
          
          // Add the saved message ID to the messageData
          messageData.id = message._id;
        }
        
        // Broadcast to everyone in the room including sender
        io.to(messageData.jobId).emit('receiveMessage', messageData);
        
      } catch (error) {
        console.error('Error saving message:', error);
        // Send error back to sender only
        socket.emit('messageError', { 
          error: 'Failed to send message', 
          originalMessage: messageData 
        });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(data.jobId).emit('userTyping', {
        user: data.user,
        isTyping: data.isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return server;
};