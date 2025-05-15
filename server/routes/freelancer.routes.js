import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import {  getJobsByFreelancer} from '../controllers/job.controller.js';
import { getFreelancerDashboardStats } from '../controllers/user.controller.js';

const router = express.Router();

// All freelancer routes should be protected + role checked
router.use(authenticate, authorizeRoles('freelancer'));


// GET /api/freelancer/jobs - Get all jobs for the freelancer
router.get('/jobs', getJobsByFreelancer);

router.get('/dashboard-stats', getFreelancerDashboardStats);


export default router;