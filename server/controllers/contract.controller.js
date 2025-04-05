import Contract from '../models/contract.model.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';

// Create a new contract (Client accepts the proposal and a contract is formed)
export const createContract = async (req, res) => {
  try {
    const { jobId, freelancerId, terms } = req.body;

    // Ensure the user is a client
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can create contracts.' });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Check if the freelancer is correct
    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(400).json({ error: 'Invalid freelancer.' });
    }

    // Create the contract
    const contract = new Contract({
      job: jobId,
      freelancer: freelancerId,
      client: req.user._id, // Client's ID (the one who created the contract)
      terms,
    });

    await contract.save();

    res.status(201).json({ message: 'Contract created successfully.', contract });
  } catch (err) {
    res.status(500).json({ error: 'Error creating contract' });
  }
};

// Get all contracts for a specific freelancer
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
};

// Update contract status (e.g., client starts or completes contract)
export const updateContractStatus = async (req, res) => {
  try {
    const { contractId, status } = req.body;

    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Ensure the user is the client or freelancer who can update the status
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the client can update contract status.' });
    }

    contract.status = status;
    await contract.save();

    res.status(200).json({ message: 'Contract status updated', contract });
  } catch (err) {
    res.status(500).json({ error: 'Error updating contract status' });
  }
};
