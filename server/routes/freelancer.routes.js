import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import {  getJobsByFreelancer} from '../controllers/job.controller.js';

const router = express.Router();

// All freelancer routes should be protected + role checked
router.use(authenticate, authorizeRoles('freelancer'));

/* // GET /api/freelancer/profile - Get freelancer profile
router.get('/profile', getFreelancerProfile);

// PUT /api/freelancer/profile - Update freelancer profile
router.put('/profile', updateFreelancerProfile);
 */
// GET /api/freelancer/jobs - Get all jobs for the freelancer
router.get('/jobs', getJobsByFreelancer);

export default router;