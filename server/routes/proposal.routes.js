// routes/proposal.routes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import {
  submitProposal,
  getProposalsForJob,
  acceptProposal,
  rejectProposal,
} from '../controllers/proposal.controller.js';

const router = express.Router();

// Submit a proposal for a job (only freelancers can do this)
router.post('/submit', authenticate, authorizeRoles('freelancer'), submitProposal);

// Get all proposals for a job (client or freelancer can view)
router.get('/:jobId', authenticate, getProposalsForJob);

// Client can update proposal status (accept/reject)
// Accept a proposal
router.put('/:proposalId/accept', authenticate, authorizeRoles('client'), acceptProposal);

// Reject a proposal
router.put('/:proposalId/reject', authenticate, authorizeRoles('client'), rejectProposal);

export default router;
