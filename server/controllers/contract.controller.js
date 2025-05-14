import Contract from '../models/contract.model.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';

// Create a new contract (Client accepts the proposal and a contract is formed)
export const createContract = async (req, res) => {
  try {
    // Extract required fields from incoming body
    const {
      job,
      freelancer,
      client,
      milestonePayments,
      startDate,
      endDate,
      budget,
      title,
    } = req.body;

    // Convert strings to correct types
    const contractData = {
      job: job._id,  // job should be ObjectId
      freelancer: freelancer._id,  // freelancer should be ObjectId
      client: client?._id ?? client,
      milestonePayments: milestonePayments.map((milestone) => ({
        label: milestone.label,
        amount: Number(milestone.amount),  // Convert amount to number
        completedAt: new Date(milestone.completedAt),  // Convert completedAt to Date
      })),
      startDate: new Date(startDate),  // Convert startDate to Date
      endDate: new Date(endDate),  // Convert endDate to Date
      budget: Number(budget),  // Convert budget to number
      title: title,  // Title is a string, as it is
      status: 'pending',  // Default status
    };

    // Create the contract
    const contract = new Contract(contractData);

    // Save the contract to the database
    await contract.save();

    // Send response
    res.status(201).json({ message: 'Contract created successfully', contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating contract', error: error.message });
  }
};


// In contract.controller.js
export const getContractByJobId = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const contract = await Contract.findOne({ job: jobId })
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    if (!contract) {
      // Returning 404 if the contract doesn't exist for the given job
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.status(200).json(contract);
  } catch (err) {
    // If there's an error while fetching, respond with a 500 error
    res.status(500).json({ error: 'Error fetching contract' });
  }
};



/* // Get all contracts for a specific freelancer
export const getContractsForFreelancer = async (req, res) => {
  try {
    const freelancerId = req.user._id; // Get the freelancer's ID (from authenticated user)

    const contracts = await Contract.find({ freelancer: freelancerId })
      .populate('job', 'title description') // Populate job details
      .populate('client', 'name email'); // Populate client details

    res.status(200).json(contracts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching contracts' });
  }
};

// Get all contracts for a specific client
export const getContractsForClient = async (req, res) => {
  try {
    const clientId = req.user._id; // Get the client's ID (from authenticated user)

    const contracts = await Contract.find({ client: clientId })
      .populate('job', 'title description') // Populate job details
      .populate('freelancer', 'name email'); // Populate freelancer details

    res.status(200).json(contracts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching contracts' });
  }
}; */

// Update contract status (e.g., client starts or completes contract)
export const updateContractStatus = async (req, res) => {
  try {
    const { contractId, status } = req.body;
    console.log('Incoming update contract status request:', req.body);

    // Valid statuses for the freelancer to update the contract
    if (!['active', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Freelancer can only accept (active) or decline (cancelled) the contract.' });
    }

    // Find the contract by ID
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Ensure the user is the freelancer who can update the status
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the freelancer can update the contract status.' });
    }

    // Ensure the contract is still in 'pending' status before updating
    if (contract.status !== 'pending') {
      return res.status(400).json({ error: 'Contract status can only be updated if it is in the "pending" state.' });
    }

    // Update the contract status to either 'active' or 'cancelled'
    contract.status = status;
    await contract.save();

    res.status(200).json({ message: 'Contract status updated successfully', contract });
  } catch (err) {
    res.status(500).json({ error: 'Error updating contract status' });
  }
};

export const markMilestoneAsDone = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { label } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const milestone = contract.milestonePayments.find(m => m.label === label);
    if (!milestone) return res.status(400).json({ error: 'Milestone not found' });

    milestone.completedByFreelancer = true;
    milestone.completedAt = new Date();

    await contract.save();

    res.json({ message: 'Milestone marked as done', updatedMilestone: milestone });
  } catch (error) {
    console.error('Error marking milestone as done:', error);
    res.status(500).json({ error: 'Server error while marking milestone' });
  }
};

export const approveMilestone = async (req, res) => {
  const { contractId, milestoneLabel } = req.params;

  try {
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ error: 'Contract not found.' });

    const milestone = contract.milestonePayments.find(m => m.label === milestoneLabel);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });

    if (!milestone.completedByFreelancer) {
      return res.status(400).json({ error: 'Milestone has not been marked complete by freelancer.' });
    }

    if (milestone.approvedByAdmin) {
      return res.status(400).json({ error: 'Milestone already approved.' });
    }

    milestone.approvedByAdmin = true;
    milestone.approvalRequestedAt = new Date();

    await contract.save();

    return res.status(200).json({ message: 'Milestone approved successfully.' });
  } catch (err) {
    console.error('Milestone approval error:', err);
    return res.status(500).json({ error: 'Server error during milestone approval.' });
  }
};

export const getPendingMilestoneApprovals = async (req, res) => {
  try {
    // Find all contracts that have at least one milestone needing approval
    const contracts = await Contract.find({
      'milestonePayments.completedByFreelancer': true,
      'milestonePayments.approvedByAdmin': false,
    })
      .populate('freelancer', 'name email')
      .populate('client', 'name email')
      .populate('job', 'title');

    const pendingMilestones = [];

    contracts.forEach(contract => {
      contract.milestonePayments.forEach(milestone => {
        if (milestone.completedByFreelancer && !milestone.approvedByAdmin) {
          pendingMilestones.push({
            contractId: contract._id,
            jobTitle: contract.job?.title || 'Untitled Job',
            client: contract.client,
            freelancer: contract.freelancer,
            milestoneLabel: milestone.label,
            amount: milestone.amount,
            completedAt: milestone.completedAt,
          });
        }
      });
    });

    res.status(200).json(pendingMilestones);
  } catch (err) {
    console.error('Error fetching pending milestone approvals:', err);
    res.status(500).json({ error: 'Server error fetching pending approvals' });
  }
};