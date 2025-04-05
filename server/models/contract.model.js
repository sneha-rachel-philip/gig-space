import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    terms: {
      type: String, // You can store a simple contract term or link to a document.
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Contract = mongoose.model('Contract', contractSchema);
export default Contract;
