import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  sendMessage,
  getConversation,
  getUserChats,
} from '../controllers/message.controller.js';

const router = express.Router();

// All routes require authentication
router.post('/send', authenticate, sendMessage);
router.get('/conversation/:userId', authenticate, getConversation);
router.get('/chats', authenticate, getUserChats); // optional

export default router;
