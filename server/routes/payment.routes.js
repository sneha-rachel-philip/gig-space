// routes/payment.routes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { createPayment, getPaymentsForUser, paymentWebhook, createCheckoutSession } from '../controllers/payment.controller.js';

const router = express.Router();

// POST /api/payments - Create a payment for a contract
router.post('/', authenticate, createPayment);

// GET /api/payments - Get all payments for the authenticated user
router.get('/', authenticate, getPaymentsForUser);

// POST /api/payments/webhook - Stripe webhook for payment status updates
router.post('/webhook', express.raw({ type: 'application/json' }), paymentWebhook);

router.post('/create-checkout-session', authenticate, createCheckoutSession);


export default router;
