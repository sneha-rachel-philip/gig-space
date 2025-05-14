// routes/admin.routes.js

import express from 'express';
import { getAllUsers, deleteUser, deleteJobByAdmin, getAllJobsForAdmin, getFlaggedJobs, unflagJob, updateUserStatus, getAdminDashboardStats} from '../controllers/admin.controller.js';
import { getPendingReviews, approveReview, deleteReview, flagReview } from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// ----------- USERS ------------
router.get('/users', authenticate, authorizeAdmin, getAllUsers);
router.delete('/users/:id', authenticate, authorizeAdmin, deleteUser);
router.put('/users/:id/status', authenticate, authorizeAdmin, updateUserStatus);
router.get('/dashboard/stats', authenticate, authorizeAdmin, getAdminDashboardStats);


// ----------- JOBS ------------
router.get('/jobs', authenticate, authorizeAdmin, getAllJobsForAdmin);
router.get('/jobs/flagged', authenticate, authorizeAdmin, getFlaggedJobs);
router.delete('/jobs/:id', authenticate, authorizeAdmin, deleteJobByAdmin);
router.put('/jobs/:id/unflag', authenticate, authorizeAdmin, unflagJob);

// ----------- REVIEWS (Moderation) ------------
router.get('/reviews/pending', authenticate, authorizeAdmin, getPendingReviews);
router.post('/reviews/:reviewId/approve', authenticate, authorizeAdmin, approveReview);
router.delete('/reviews/:reviewId', authenticate, authorizeAdmin, deleteReview);
router.post('/reviews/:reviewId/flag', authenticate, authorizeAdmin, flagReview); 


export default router;
