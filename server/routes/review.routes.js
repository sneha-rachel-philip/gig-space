// routes/review.routes.js
import express from 'express';
import { addReview, getReviewsForUser,  getReviewsForJob} from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, addReview); // POST /api/reviews
router.get('/:userId', getReviewsForUser); // GET /api/reviews/:userId
router.get('/job/:jobId', getReviewsForJob); // GET /api/reviews/job/:jobId
export default router;
