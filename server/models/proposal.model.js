// models/proposal.model.js
import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposalText: {
      type: String,
      required: true,
    },
    proposedBudget: {
      type: Number,
      required: true,
    },
    proposedDuration: {
      type: String, // e.g., "1 week", "3 days", etc.
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Proposal = mongoose.model('Proposal', proposalSchema);
export default Proposal;
