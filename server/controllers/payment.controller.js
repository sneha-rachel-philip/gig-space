import dotenv from 'dotenv';
dotenv.config();
import stripe from 'stripe';
import Payment from '../models/payment.model.js';
import Contract from '../models/contract.model.js';
import User from '../models/user.model.js';

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY); // Stripe secret key
// Create a payment for a contract
export const createPayment = async (req, res) => {
  try {
    const { contractId, paymentMethodId, amount } = req.body;

    // Ensure the user is involved in the contract
    const contract = await Contract.findById(contractId).populate('client freelancer');
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const payer = req.user._id.equals(contract.client._id) ? contract.client : contract.freelancer;
    const receiver = payer.equals(contract.client._id) ? contract.freelancer : contract.client;

    // Create a Stripe Payment Intent (this handles the payment process)
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amount * 100, // Stripe accepts amount in cents, so multiply by 100
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Confirm the payment immediately
      return_url: 'http://localhost:3000/payment-success',  // Placeholder return URL for testing
    });

    // Save the payment details to the database
    const payment = new Payment({
      contract: contractId,
      payer: payer._id,
      receiver: receiver._id,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      paymentMethodId,
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
    });

    await payment.save();

    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Error creating payment' });
  }
};

// Get all payments for a user
export const getPaymentsForUser = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ payer: req.user._id }, { receiver: req.user._id }],
    })
      .populate('contract')
      .populate('payer', 'name')
      .populate('receiver', 'name');

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
};

// Handle payment webhook (optional, for Stripe events)
export const paymentWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.');
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });

      if (payment) {
        payment.status = 'completed';
        await payment.save();
        console.log('Payment succeeded:', paymentIntent.id);
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentFailed = event.data.object;
      const failedPayment = await Payment.findOne({ stripePaymentIntentId: paymentFailed.id });

      if (failedPayment) {
        failedPayment.status = 'failed';
        await failedPayment.save();
        console.log('Payment failed:', paymentFailed.id);
      }
      break;

    // Handle other event types as needed

    default:
      console.log('Unhandled event type:', event.type);
  }

  res.status(200).json({ received: true });
};
