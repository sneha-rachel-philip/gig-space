// models/payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'withdrawn'],
      default: 'pending',
    },
    stripeSessionId: {
      type: String, // ID provided by Stripe for the payment
    },
    paymentMethodId: {
      type: String, // ID of the payment method used
    },
    milestoneLabel: { type: String, required: true },

    withdrawnAt: {
      type: Date, 
      default: null,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
