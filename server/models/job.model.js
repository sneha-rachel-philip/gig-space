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
    category: {
      type: String,
      enum: ['Design', 'Development', 'Writing', 'Marketing'], // add more as needed
    },
    acceptedTill: {
      type: Date,
    },
    completedBy: {
      type: Date,
    },
    milestones: [
      {
        type: String,
      },
    ],
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  
      default: null, 
    },
    status: {
      type: String,
      enum: ['open', 'inprogress', 'closed'],
      default: 'open',
    },
  
  files: [
    {
      filename: String,
      originalname: String,
      uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
},
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
