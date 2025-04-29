// controllers/proposal.controller.js
import Proposal from '../models/proposal.model.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';

// Submit a proposal for a job
export const submitProposal = async (req, res) => {
  try {
    const { jobId, proposalText, proposedBudget, proposedDuration } = req.body;

    // Validate if all necessary fields are provided
    if (!jobId || !proposalText || !proposedBudget || !proposedDuration) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
    // Ensure the user is a freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can submit proposals.' });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Check if the freelancer has already submitted a proposal for this job
    const existingProposal = await Proposal.findOne({ job: jobId, freelancer: req.user._id });
    if (existingProposal) {
      return res.status(400).json({ error: 'You have already submitted a proposal for this job.' });
    }

    // Create the proposal
    const proposal = new Proposal({
      job: jobId,
      freelancer: req.user._id,
      proposalText,
      proposedBudget,
      proposedDuration,
    });

    // Save the proposal
    await proposal.save();

    // Optionally, you can push the proposal into the freelancer's profile or job's proposals array (optional).
    await Job.findByIdAndUpdate(jobId, {
      $push: { proposals: proposal._id },
    });

    res.status(201).json({ message: 'Proposal submitted successfully', proposal });
  } catch (err) {
    res.status(500).json({ error: 'Error submitting proposal' });
  }
};

// Get all proposals for a job
export const getProposalsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const proposals = await Proposal.find({ job: job._id })
      .populate('freelancer', 'name email') // Populate freelancer details
      .populate('job', 'title description'); // Populate job details

    res.status(200).json(proposals);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching proposals' });
  }
};

export const acceptProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Find the proposal
    const proposal = await Proposal.findById(proposalId).populate('job freelancer');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    // Update proposal status to accepted
    proposal.status = 'accepted';
    await proposal.save();

    // Update the job status to in-progress and assign freelancer
    const job = proposal.job;
    job.status = 'inprogress'; // Change the job status to 'inprogress' or any appropriate status
    job.assignedFreelancer = proposal.freelancer._id;
    await job.save();

    // Optionally, reject all other proposals for this job (if needed)
    await Proposal.updateMany(
      { job: job._id, _id: { $ne: proposalId }, status: 'pending' },
      { status: 'rejected' }
    );

    res.status(200).json({ message: 'Proposal accepted', proposal, job });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting proposal', error: err.message });
  }
};

export const rejectProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Find the proposal
    const proposal = await Proposal.findById(proposalId).populate('job freelancer');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    // Update proposal status to rejected
    proposal.status = 'rejected';
    await proposal.save();

    // Optionally, update the job status if necessary
    const job = proposal.job;
    // If the job has no assigned freelancer, you can change its status to 'open'
    if (!job.assignedFreelancer) {
      job.status = 'open';  // Set job status back to 'open' if needed
      await job.save();
    }

    res.status(200).json({ message: 'Proposal rejected', proposal, job });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting proposal', error: err.message });
  }
};

export const getProposalsForFreelancer = async (req, res) => {
  try {
    const freelancerId = req.user._id; // Get the freelancer's ID from the authenticated user

    // Find all proposals submitted by the freelancer
    const proposals = await Proposal.find({ freelancer: freelancerId })
      .populate('job', 'title description') // Populate job details
      .populate('freelancer', 'name email'); // Populate freelancer details

    res.status(200).json(proposals);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching proposals' });
  }
}


// Update the status of a proposal (client can accept/reject)
/* export const updateProposalStatus = async (req, res) => {
  try {
    const { proposalId, status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use "accepted" or "rejected".' });
    }

    // Find and update the proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Ensure the user is the client of the job
    const job = await Job.findById(proposal.job);
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the job client can update proposal status' });
    }

    proposal.status = status;
    await proposal.save();

    res.status(200).json({ message: 'Proposal status updated', proposal });
  } catch (err) {
    res.status(500).json({ error: 'Error updating proposal status' });
  }
};
 */
/* // Accept Proposal
export const acceptProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    proposal.status = 'accepted';
    await proposal.save();

    res.status(200).json({ message: 'Proposal accepted', proposal });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting proposal', error: err.message });
  }
};

// Reject Proposal
export const rejectProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    proposal.status = 'rejected';
    await proposal.save();

    res.status(200).json({ message: 'Proposal rejected', proposal });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting proposal', error: err.message });
  }
}; */
