import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    milestonePayments: [
      {
        label: String,
        amount: Number,
        paidAt: { type: Date },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
        completedByFreelancer: { type: Boolean, default: false }, 
        completedAt: Date                                           
      }
    ],
    
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    budget: { type: Number, required: true },
    terms: {
      type: String,
    },

/*     terms: {
      budget: Number,
      title: String,
      deadline: Date
    }, */
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
