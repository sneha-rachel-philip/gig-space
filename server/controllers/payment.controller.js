import dotenv from 'dotenv';
dotenv.config();
import stripe from 'stripe';
import Payment from '../models/payment.model.js';
import Contract from '../models/contract.model.js';
import User from '../models/user.model.js';

import mongoose from 'mongoose';
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
      currency: 'inr',
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

/*   if (process.env.NODE_ENV === 'production') {
    console.log("Skipping webhook processing in production...");
    return res.status(200).send();  // Skip webhook processing
  } */

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log('Received webhook event:', req.body);
  console.log('Stripe signature:', sig);
  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('❌ Webhook signature verification failed.');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      const { contractId, milestoneLabel, payerId, receiverId } = session.metadata;
      console.log('✅ Checkout session completed for contract:', contractId);

      const contract = await Contract.findById(contractId);
      if (!contract) {
        console.log('❌ Contract not found:', contractId);
        return res.status(200).send();
      }

      const milestone = contract.milestonePayments.find(
        (m) => m.label.trim().toLowerCase() === milestoneLabel.trim().toLowerCase()
      );

      if (!milestone) {
        console.log('❌ No matching milestone found for:', milestoneLabel);
      } else if (!milestone.paidAt) {
        milestone.paidAt = new Date();
        milestone.paymentId = session.payment_intent; // or store session.id
        await contract.save();
        console.log('✅ Milestone marked as paid:', milestone.label);
      }

            // Create payment record if not exists
            const existing = await Payment.findOne({ stripeSessionId: session.id });
            if (!existing) {
              const amount = session.amount_total / 100;
              const payment = new Payment({
                contract: contractId,
                payer: payerId,
                receiver: receiverId,
                amount,
                stripeSessionId: session.id,
                milestoneLabel,
                status: 'completed',
              });
      
              await payment.save();
      
              // Credit the receiver
              await User.findByIdAndUpdate(receiverId, {
                $inc: { walletBalance: amount },
              });
      
              console.log('✅ Payment recorded and wallet updated');
            } else {
              console.log('ℹ️ Payment already exists for this session');
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
    if (!metadata) return res.status(400).json({ error: "Missing metadata in session" });

    const contract = await Contract.findById(metadata.contractId);
    if (!contract) return res.status(404).json({ error: "Contract not found" });

    let payment = await Payment.findOne({ stripeSessionId: sessionId });

    if (!payment) {
      // fallback for development (webhook might not run)
      payment = new Payment({
        contract: metadata.contractId,
        payer: metadata.payerId,
        receiver: metadata.receiverId,
        amount: session.amount_total / 100,
        stripeSessionId: sessionId,
        milestoneLabel: metadata.milestoneLabel,
        status: "completed",
      });
      await payment.save();

      await User.findByIdAndUpdate(
        metadata.receiverId,
        { $inc: { walletBalance: session.amount_total / 100 } }
      );

      const milestone = contract.milestonePayments.find(
        (m) => m.label.trim().toLowerCase() === metadata.milestoneLabel.trim().toLowerCase()
      );

      if (milestone && !milestone.paidAt) {
        milestone.paidAt = new Date();
        milestone.paymentId = payment._id;
        await contract.save();
      }

      console.log("✅ Created fallback payment record in dev");
    }

    return res.json({ success: true, jobId: contract.job });
  } catch (err) {
    console.error("Error verifying Stripe payment:", err);
    return res.status(500).json({ error: "Payment verification failed" });
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
    
   /*  const payment = new Payment({
      contract: contractId,
      payer: payerId,
      receiver: receiverId,
      amount,
      stripePaymentIntentId: session.payment_intent,
      status: 'completed'
    });

    await payment.save(); */

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
    const CLIENT_URL = process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL  // Use production URL if in production
    : 'http://localhost:5173'; 
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'inr',
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
        milestoneLabel: milestoneLabel,
        payerId: payer._id.toString(),
        receiverId: receiver._id.toString(),
      },

// Use local URL if in development
      
      success_url: `${CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&jobId=${contract.job}`,
      cancel_url: `${CLIENT_URL}/job/${contract._id}`, // or wherever you'd like
    });
    console.log('Stripe session metadata:', session.metadata);

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

    const totalAmount = await Payment.aggregate([
      {
        $match: {
          _id: { $in: paymentIds.map(id => new mongoose.Types.ObjectId(id)) },
          receiver: new mongoose.Types.ObjectId(freelancerId),
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    
    const amountToWithdraw = totalAmount[0]?.total || 0;
    
    // Deduct from wallet
    await User.findByIdAndUpdate(freelancerId, {
      $inc: { walletBalance: -amountToWithdraw },
    });
    

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

