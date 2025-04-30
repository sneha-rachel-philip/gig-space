// routes/proposal.routes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import {
  submitProposal,
  getProposalsForJob,
  acceptProposal,
  rejectProposal,
  getProposalsForFreelancer,
  getProposalDetails,
} from '../controllers/proposal.controller.js';

const router = express.Router();

// get proposal by ID
router.get('/id/:id', getProposalDetails);

// Submit a proposal for a job (only freelancers can do this)
router.post('/submit', authenticate, authorizeRoles('freelancer'), submitProposal);

// Get all proposals for a job (client or freelancer can view)
router.get('/job/:jobId', authenticate, getProposalsForJob);

// Client can update proposal status (accept/reject)
// Accept a proposal
router.put('/:proposalId/accept', authenticate, authorizeRoles('client'), acceptProposal);

// Reject a proposal
router.put('/:proposalId/reject', authenticate, authorizeRoles('client'), rejectProposal);

// Get all proposals for a freelancer (only freelancers can view their own proposals)
router.get('/freelancer', authenticate, authorizeRoles('freelancer'), getProposalsForFreelancer);

export default router;
