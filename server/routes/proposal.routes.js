// routes/proposal.routes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import {
  submitProposal,
  getProposalsForJob,
  updateProposalStatus,
} from '../controllers/proposal.controller.js';

const router = express.Router();

// Submit a proposal for a job (only freelancers can do this)
router.post('/submit', authenticate, authorizeRoles('freelancer'), submitProposal);

// Get all proposals for a job (client or freelancer can view)
router.get('/:jobId', authenticate, getProposalsForJob);

// Client can update proposal status (accept/reject)
router.put('/update', authenticate, authorizeRoles('client'), updateProposalStatus);

export default router;
