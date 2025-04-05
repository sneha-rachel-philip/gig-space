import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import jobRoutes from './routes/job.routes.js';
import proposalRoutes from './routes/proposal.routes.js';
import contractRoutes from './routes/contract.routes.js';
import messageRoutes from './routes/message.routes.js';
import reviewRoutes from './routes/review.routes.js';
import paymentRoutes from './routes/payment.routes.js';

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes); 
app.use('/api/proposals', proposalRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send(' Freelance Job Platform API is running...');
});

// Error handling 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
