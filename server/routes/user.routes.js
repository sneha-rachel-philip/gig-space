import express from 'express';
import {
  getCurrentUser,
  getUserById,
  updateUser,
  getUsersByRole,
} from '../controllers/user.controller.js';

import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import { uploadProfileImage } from '../controllers/user.controller.js';
import uploadImage from '../middlewares/uploadImage.js';
import { changePassword } from '../controllers/user.controller.js';

const router = express.Router();

// Protected: Get current logged-in user
router.get('/me', authenticate, getCurrentUser);


// Public route: Get user by ID (profile)
router.get('/:id', getUserById);



// Protected: Update current user's profile
router.put('/me', authenticate, updateUser);

// Protected: Only 'client' can view freelancers, or vice versa
router.get('/role/:role', authenticate, authorizeRoles('client', 'freelancer'), getUsersByRole);

router.post('/upload', authenticate, uploadImage.single('profileImage'), uploadProfileImage);


router.put('/changePassword', authenticate, changePassword);


export default router;
