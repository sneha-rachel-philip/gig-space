// routes/review.routes.js
import express from 'express';
import { addReview, getReviewsForUser } from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, addReview); // POST /api/reviews
router.get('/:userId', getReviewsForUser); // GET /api/reviews/:userId

export default router;
