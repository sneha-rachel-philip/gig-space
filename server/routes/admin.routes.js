// routes/admin.routes.js

import express from 'express';
import { getAllUsers, deleteUser } from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Admin-only routes

// GET /api/admin/users - Get all users
router.get('/users', authenticate, authorizeAdmin, getAllUsers);

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', authenticate, authorizeAdmin, deleteUser);

export default router;
