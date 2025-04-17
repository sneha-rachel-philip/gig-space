import express from 'express';
import {
  postJob,
  getJobs,
  getJobById,
  updateJobStatus,
  applyForJob,
  getJobsByClient,
} from '../controllers/job.controller.js';

import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();






// GET /api/jobs - Get all jobs
router.get('/', authenticate, getJobs);

// GET /api/jobs/:id - Get job details by ID
router.get('/:id', authenticate, getJobById);



// POST /api/jobs/:id/apply - Apply for a job (Only freelancer can apply)
router.post('/:id/apply', authenticate, authorizeRoles('freelancer'), applyForJob);

export default router;
