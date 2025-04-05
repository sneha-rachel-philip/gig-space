// models/user.model.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'freelancer',
    },

    // Common profile fields
    bio: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '', // URL to image
    },

    // Freelancer-specific fields
    skills: [
      {
        type: String,
      },
    ],
    hourlyRate: {
      type: Number,
      default: 0,
    },
    experience: {
      type: String,
      default: '',
    },
    portfolio: [
      {
        title: String,
        link: String,
        description: String,
      },
    ],

    // Client-specific fields
    company: {
      type: String,
    },

    // Ratings + Reviews (optional, but useful!)
    averageRating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String,
        createdAt: {
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
