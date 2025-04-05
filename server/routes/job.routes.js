import express from 'express';
import {
  postJob,
  getJobs,
  getJobById,
  updateJobStatus,
  applyForJob,
} from '../controllers/job.controller.js';

import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// POST /api/jobs - Post a new job (Only client can post)
router.post('/', authenticate, authorizeRoles('client'), postJob);

// GET /api/jobs - Get all jobs
router.get('/', authenticate, getJobs);

// GET /api/jobs/:id - Get job details by ID
router.get('/:id', authenticate, getJobById);

// PUT /api/jobs/:id/status - Update job status (open/closed)
router.put('/:id/status', authenticate, authorizeRoles('client'), updateJobStatus);

// POST /api/jobs/:id/apply - Apply for a job (Only freelancer can apply)
router.post('/:id/apply', authenticate, authorizeRoles('freelancer'), applyForJob);

export default router;
