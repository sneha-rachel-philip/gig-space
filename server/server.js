import dotenv from 'dotenv';
dotenv.config(); // Load environment variables
import cors from 'cors';
import connectDB from './config/db.js';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import stripe from 'stripe';
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
import freelancerRoutes from './routes/freelancer.routes.js'; 
import { paymentWebhook } from './controllers/payment.controller.js'; // Make sure this is exported
import Message from './models/message.model.js';




const app = express();
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Connect to MongoDB
connectDB();



// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      origin === 'http://localhost:5173' ||
      origin === 'https://gig-space-jobs.vercel.app' ||
      /^https:\/\/gig-space-jobs.*\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


app.post('/api/webhook', express.raw({ type: 'application/json' }), paymentWebhook);


app.use(express.json()); // Parse JSON bodies



app.use('/uploads', express.static('uploads'));


// app.use('/api/stripe', paymentRoutes);

// Routes
app.use('/api/client', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes); 
app.use('/api/proposal', proposalRoutes);
app.use('/api/contract', contractRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/freelancer', freelancerRoutes); // Add this line to include freelancer routes


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
    origin: function (origin, callback) {
      if (
        !origin ||
        origin === 'http://localhost:5173' ||
        origin === 'https://gig-space-jobs.vercel.app' ||
        /^https:\/\/gig-space-jobs.*\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS (Socket.io)"));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  }
  
});


// Socket implementation
io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);

  socket.on('joinRoom', (jobId) => {
    socket.join(jobId);
    console.log(`User ${socket.id} joined room: ${jobId}`);
  });

  socket.on('leaveRoom', (jobId) => {
    socket.leave(jobId);
    console.log(`User ${socket.id} left room: ${jobId}`);
  });

  socket.on('sendMessage', async (msg) => {
    try {
      // Create message document with consistent field names
      const saved = new Message({
        sender: msg.sender,
        sender_name: msg.name, // Store sender name
        jobId: msg.jobId,
        content: msg.content, // Now matches the frontend field
        time: msg.time,
        read: false,
      });
      await saved.save();
      
      // Convert to format expected by frontend
      const messageToSend = {
        _id: saved._id,
        sender: saved.sender,
        name: msg.name,
        content: saved.content,
        jobId: saved.jobId,
        time: saved.time,
        read: saved.read
      };
      
      io.to(msg.jobId).emit('receiveMessage', messageToSend);
    } catch (err) {
      console.error('❌ Failed to save message:', err);
      socket.emit('messageError', {
        error: 'Failed to send message',
        originalMessage: msg,
      });
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.jobId).emit('userTyping', {
      user: data.user,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});


// Start server
const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
