import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    skillsRequired: [
      {
        type: String,
        required: true,
      },
    ],
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Link to the user who created the job
      required: true,
    },
    freelancers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
      },
    ],
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,  
  }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
