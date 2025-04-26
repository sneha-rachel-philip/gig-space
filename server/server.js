import dotenv from 'dotenv';
dotenv.config(); // Load environment variables
import cors from 'cors';
import connectDB from './config/db.js';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
//import stripe from 'stripe';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import jobRoutes from './routes/job.routes.js';
import proposalRoutes from './routes/proposal.routes.js';
import contractRoutes from './routes/contract.routes.js';
import messageRoutes from './routes/message.routes.js';
import reviewRoutes from './routes/review.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import clientRoutes from './routes/client.routes.js'; 




const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/client', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes); 
app.use('/api/proposal', proposalRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);


// Health check route
app.get('/', (req, res) => {
  res.send('Freelance Job Platform API is running...');
});

// Error handling 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // frontend URL
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);

  socket.on('joinRoom', (jobId) => {
    socket.join(jobId);
  });

  socket.on('sendMessage', (msg) => {
    io.to(msg.jobId).emit('receiveMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});



// Start server
const PORT = process.env.PORT || 5000;
/* app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); */

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
