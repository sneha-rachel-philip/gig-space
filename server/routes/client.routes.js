import express from 'express';
import {
  postJob,
  updateJobStatus,
  getJobsByClient,
  updateJob,
} from '../controllers/job.controller.js';

import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All client routes should be protected + role checked
router.use(authenticate, authorizeRoles('client'));

// POST /api/client/jobs
router.post('/jobs', postJob);

// GET /api/client/jobs
router.get('/jobs', getJobsByClient);

router.put('/jobs/:id', updateJob); // Protect this route

// PUT /api/client/jobs/:id/status
router.put('/jobs/:id/status', updateJobStatus);

export default router;
