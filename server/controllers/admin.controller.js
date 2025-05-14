// controllers/admin.controller.js

import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Contract from '../models/contract.model.js';
import Proposal from '../models/proposal.model.js';
import Review from '../models/review.model.js';


export const getAllUsers = async (req, res) => {
  const { search, page = 1, sortOrder = 'desc', roleFilter = 'all' } = req.query;
  const perPage = 10; // Number of users per page
  const skip = (page - 1) * perPage; // Calculate how many users to skip based on the current page

  try {
    // Construct query filters based on the roleFilter and search
    const query = { role: { $ne: 'admin' } }; // Exclude users with the role 'admin'

    // Filter by role if specified (client or freelancer)
    if (roleFilter !== 'all') {
      query.role = roleFilter; // Only show users with the given role
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case-insensitive search on the 'name' field
        { email: { $regex: search, $options: 'i' } }  // Case-insensitive search on the 'email' field
      ];
    }

    // Fetch users based on query, sort, and pagination
    const users = await User.find(query)
      .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 }) // Sort by joining date (ascending or descending)
      .skip(skip) // Skip users based on the current page
      .limit(perPage); // Limit to the number of users per page

    // Get total count of users for pagination
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / perPage); // Calculate total number of pages

    // Return the users and pagination info
    res.json({
      users,
      totalPages,
      totalUsers,
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};


// DELETE /api/admin/users/:id - Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


export const deleteJobByAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Optionally, cancel related contract(s)
    await Contract.updateMany(
      { job: job._id },
      { $set: { status: 'cancelled' } }
    );

    await job.deleteOne();
    res.json({ success: true, message: 'Job and related contracts handled.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


export const getFlaggedJobs = async (req, res) => {
  try {
    const flaggedJobs = await Job.find({ isFlagged: true }).populate('client', 'name email');
    res.json(flaggedJobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flagged jobs' });
  }
};

export const unflagJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || !job.flagged) return res.status(404).json({ error: 'Flagged job not found' });

    job.flagged = false;
    await job.save();

    res.status(200).json({ success: true, message: 'Job unflagged successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unflag job' });
  }
};

export const getAllJobsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (category) filters.category = category;

    const skip = (page - 1) * limit;

    const jobs = await Job.find(filters)
      .populate('client', 'name email')
      .populate('assignedFreelancer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filters);

    const enrichedJobs = await Promise.all(
      jobs.map(async (job) => {
        const contract = await Contract.findOne({ job: job._id });
        const proposalsCount = await Proposal.countDocuments({ job: job._id });

        return {
          ...job.toObject(),
          contractStatus: contract?.status || 'none',
          proposalsCount,
        };
      })
    );

    res.json({
      jobs: enrichedJobs,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching jobs.' });
  }
};

// PUT /admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [totalOpenJobs, activeUsers, pendingPaymentsAgg, pendingReviews] = await Promise.all([
      Job.countDocuments({ status: 'open' }),
      User.countDocuments({ status: 'active', role: { $ne: 'admin' } }),
      Contract.aggregate([
        { $unwind: '$milestonePayments' },
        {
          $match: {
            'milestonePayments.paidAt': null,
            'milestonePayments.completedByFreelancer': true,
            'milestonePayments.approvedByAdmin': false
          }
        },
        {
          $group: {
            _id: null,
            totalPending: { $sum: '$milestonePayments.amount' }
          }
        }
      ]),
      Review.countDocuments({ isApproved: false })
    ]);

    const totalPendingPayments = pendingPaymentsAgg[0]?.totalPending || 0;

    res.json({
      totalOpenJobs,
      activeUsers,
      totalPendingPayments,
      pendingReviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};




