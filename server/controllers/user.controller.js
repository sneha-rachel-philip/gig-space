import User from '../models/user.model.js';
import mongoose from 'mongoose';
import upload from '../middlewares/uploadImage.js';
import bcrypt from 'bcryptjs';
import Job from '../models/job.model.js';
import Proposal from '../models/proposal.model.js';
import Contract from '../models/contract.model.js';
import Payment from '../models/payment.model.js';

// POST /upload - Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.file.path },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Upload profile pic error:', err);
    res.status(500).json({ error: 'Server error uploading image' });
  }
};

// PUT /change-password - Change password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  console.log('Request body:', req.body);
  console.log('User in req:', req.user);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Please provide both passwords' });
  }

  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



// GET /me - Get logged-in user's data
export const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
  console.error('Error in getCurrentUser:', err);
  res.status(500).json({ error: 'Server error' });
}

};

// GET /:id - Public user profile
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
  console.error('Error in getCurrentUser:', err);
  res.status(500).json({ error: 'Server error' });
}

};

// PUT /me - Update profile
export const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    }).select('-password');
    res.json(updated);
  } catch (err) {
  console.error('Error in getCurrentUser:', err);
  res.status(500).json({ error: 'Server error' });
}

};

// GET /role/:role - Get users by role (e.g., all freelancers)
export const getUsersByRole = async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select('-password');
    res.json(users);
  } catch (err) {
  console.error('Error in getCurrentUser:', err);
  res.status(500).json({ error: 'Server error' });
}

};

export const getClientDashboardStats = async (req, res) => {
  try {
    const clientId = req.user._id;
    const openJobs = await Job.countDocuments({client: clientId, status: 'in progress'});
    const activeProjects = await Job.countDocuments({ client: clientId, status: 'active' });
    const completedProjects = await Job.countDocuments({ client: clientId, status: 'closed' });
    const pendingContracts = await Contract.countDocuments({ client: clientId, status: 'pending'});

    const contracts = await Contract.find({ client: clientId, status: 'active' });

    const totalSpending = contracts.reduce((sum, contract) => {
      const paid = contract.milestonePayments
        ?.filter(m => m.paidAt)
        ?.reduce((acc, m) => acc + (m.amount || 0), 0);
      return sum + (paid || 0);
    }, 0);

    res.status(200).json({
      openJobs,
      activeProjects,
      completedProjects,
      totalSpending,
      pendingContracts,
    });
  } catch (err) {
    console.error('Client dashboard error:', err);
    res.status(500).json({ error: 'Failed to load client dashboard stats' });
  }
};

export const getFreelancerDashboardStats = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const activeJobs = await Job.countDocuments({
      assignedFreelancer: freelancerId,
      status: { $in: ['in progress', 'accepted'] },
    });

    const completedJobs = await Job.countDocuments({
      assignedFreelancer: freelancerId,
      status: 'closed',
    });

    const pendingProposals = await Proposal.countDocuments({
      freelancer: freelancerId,
      status: 'pending',
    });

    const totalEarningsAgg = await Payment.aggregate([
      {
        $match: {
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

    const totalEarnings = totalEarningsAgg[0]?.total || 0;

    res.json({
      activeJobs,
      completedJobs,
      pendingProposals,
      totalEarnings,
    });
    console.log('Freelancer dashboard stats:', {
      activeJobs,
      completedJobs,
      pendingProposals,
      totalEarnings,
    });
  } catch (err) {
    console.error('Freelancer dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch freelancer stats' });
  }
};