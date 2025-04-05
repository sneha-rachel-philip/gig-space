import express from 'express';
import {
  getCurrentUser,
  getUserById,
  updateUser,
  getUsersByRole,
} from '../controllers/user.controller.js';

import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public route: Get user by ID (profile)
router.get('/:id', getUserById);

// Protected: Get current logged-in user
router.get('/me', authenticate, getCurrentUser);

// Protected: Update current user's profile
router.put('/me', authenticate, updateUser);

// Protected: Only 'client' can view freelancers, or vice versa
router.get('/role/:role', authenticate, authorizeRoles('client', 'freelancer'), getUsersByRole);

export default router;
