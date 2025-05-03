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
import freelancerRoutes from './routes/freelancer.routes.js'; // Import freelancer routes




const app = express();
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Connect to MongoDB
connectDB();

console.log('CLIENT_URL:', process.env.CLIENT_URL);


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

app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Payment successful for session:', session.id);
    // TODO: Handle successful payment (e.g., update DB)
  }

  res.status(200).json({ received: true });
});

app.use(express.json()); // Parse JSON bodies





app.use('/uploads', express.static('uploads'));




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
