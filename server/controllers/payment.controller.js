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
    const { contractId, paymentMethodId, amount, milestoneLabel } = req.body;

    const contract = await Contract.findById(contractId).populate('client freelancer');
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const payer = req.user._id.equals(contract.client._id) ? contract.client : contract.freelancer;
    const receiver = payer.equals(contract.client._id) ? contract.freelancer : contract.client;

    // Create a Stripe Payment Intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        contractId,
        milestoneLabel,
        payerId: payer._id.toString(),
        receiverId: receiver._id.toString(),
      },
    });

    // Save the payment (status is 'pending' for now)
    const payment = new Payment({
      contract: contractId,
      payer: payer._id,
      receiver: receiver._id,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      paymentMethodId,
      milestoneLabel,
      status: 'pending',
    });

    await payment.save();

    res.status(201).json({ message: 'Payment initiated successfully', payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Error creating payment' });
  }
};


//used
// Get all payments for a user
export const getPaymentsForUser = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ payer: req.user._id }, { receiver: req.user._id }],
    })
      .populate({
        path: 'contract',
        populate: [
          { path: 'job', select: 'title' },
          { path: 'client', select: 'name' },
        ],
      })
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
  console.log('Webhook received:', req.body);
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.');
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;

      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (!payment) {
        console.log('Payment record not found for:', paymentIntent.id);
        return res.status(200).send();
      }

      payment.status = 'completed';
      await payment.save();

      const contract = await Contract.findById(payment.contract);
      if (!contract) return res.status(200).send();

      console.log('🔍 Contract found:', contract._id);
      console.log('🔍 Milestone Payments:', contract.milestonePayments);
      console.log('🔍 Payment Milestone Label:', payment.milestoneLabel);

      // Debugging the comparison between milestone label and payment milestone label
      const milestone = contract.milestonePayments.find(
        (m) => m.label.trim().toLowerCase() === payment.milestoneLabel.trim().toLowerCase()
      );

      if (!milestone) {
        console.log('❌ No matching milestone found for:', payment.milestoneLabel);
      }

      if (milestone && !milestone.paidAt) {
        milestone.paidAt = new Date();
        milestone.paymentId = payment._id;
        await contract.save();
        console.log('✅ Milestone marked as paid:', milestone.label);
      }

      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  res.status(200).send();
};



//used
export const verifyStripeSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing session ID" });

    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata;

    const contract = await Contract.findById(metadata.contractId);
    if (!contract) return res.status(404).json({ error: 'Contract not found' })

    // Already paid?
    const existing = await Payment.findOne({ stripeSessionId: sessionId });
    if (existing) {
      return res.json({ success: true, jobId: contract.job });
    }

    const payment = new Payment({
      contract: metadata.contractId,
      payer: metadata.payerId,
      receiver: metadata.receiverId,
      amount: session.amount_total / 100,
      stripeSessionId: sessionId,
      milestoneLabel: metadata.milestoneLabel,
      status: "completed",
    });

    await payment.save();

    res.json({ success: true, jobId: contract.job });
  } catch (err) {
    console.error("Error verifying Stripe payment:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
};


//used
export const finalizeMilestonePayment = async (req, res) => {
  try {
    const { sessionId } = req.query;

    const session = await stripeClient.checkout.sessions.retrieve(sessionId);

    const {
      contractId,
      milestoneLabel,
      payerId,
      receiverId
    } = session.metadata;

    const amount = session.amount_total / 100;

    // Save Payment
    const payment = new Payment({
      contract: contractId,
      payer: payerId,
      receiver: receiverId,
      amount,
      stripePaymentIntentId: session.payment_intent,
      status: 'completed'
    });

    await payment.save();

    // Update contract with milestone payment info
    await Contract.findByIdAndUpdate(contractId, {
      $push: {
        milestonePayments: {
          label: milestoneLabel,
          amount,
          paymentId: payment._id,
        }
      }
    });

    res.status(200).json({ message: 'Milestone payment recorded.' });
  } catch (err) {
    console.error('Finalize milestone error:', err);
    res.status(500).json({ error: 'Could not finalize payment' });
  }
};

//used
export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, milestoneLabel, contractId } = req.body;
    console.log('Incoming create checkout session request:', req.body);
    const contract = await Contract.findById(contractId).populate('client freelancer');
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const payer = req.user._id.equals(contract.client._id) ? contract.client : contract.freelancer;
    const receiver = payer.equals(contract.client._id) ? contract.freelancer : contract.client;

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Milestone: ${milestoneLabel}`,
          },
          unit_amount: amount * 100, 
        },
        quantity: 1,
      }],
      customer_email: contract.client.email,
      metadata: {
        contractId,
        milestoneLabel,
        payerId: payer._id.toString(),
        receiverId: receiver._id.toString(),
      },
      
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&jobId=${contract.job}`,
      cancel_url: `${process.env.CLIENT_URL}/job/${contract._id}`, // or wherever you'd like
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Could not initiate payment' });
  }
};

//used
export const requestWithdrawal = async (req, res) => {
  try {
    const { paymentIds } = req.body;

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({ error: 'No payments selected for withdrawal.' });
    }

    // Optionally: ensure they belong to the logged-in freelancer
    const freelancerId = req.user._id;

    const updated = await Payment.updateMany(
      {
        _id: { $in: paymentIds },
        receiver: freelancerId,
        status: 'completed',
      },
      {
        $set: {
          status: 'withdrawn',
          withdrawnAt: new Date(),
        },
      }
    );

    return res.json({
      success: true,
      message: `${updated.modifiedCount} payments marked as withdrawn.`,
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    return res.status(500).json({ error: 'Withdrawal failed.' });
  }
};

