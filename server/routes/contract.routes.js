import express from 'express';
import {
  createContract,
  getContractByJobId,
  updateContractStatus,
  markMilestoneAsDone,
  approveMilestone,
  getPendingMilestoneApprovals
} from '../controllers/contract.controller.js';

import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Protected routes: Only authenticated users can access
router.post('/create', authenticate, authorizeRoles('client'), createContract); // Client can create contract
/* router.get('/freelancer', authenticate, getContractsForFreelancer); // Freelancer can view their contracts
router.get('/client', authenticate, getContractsForClient); // Client can view their contracts */
router.put('/update', authenticate, updateContractStatus); // Client can update contract status
router.get('/by-job/:jobId', getContractByJobId);
router.post('/:contractId/milestone/mark-done', authenticate, authorizeRoles('freelancer'), markMilestoneAsDone);
// PATCH /api/contracts/:contractId/milestones/:milestoneLabel/approve
router.patch('/:contractId/milestones/:milestoneLabel/approve', authenticate, authorizeRoles('admin'),approveMilestone);

router.get('/pending-approvals', authenticate, authorizeRoles('admin'), getPendingMilestoneApprovals);

export default router;
