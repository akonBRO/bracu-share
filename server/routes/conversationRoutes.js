import express from 'express';
import {
  getMyConversations,
  startConversation,
  getMessages,
  sendMessage,
  getUnreadCount
} from '../controllers/conversationController.js';
import { isAuth } from '../middleware/authMiddleware.js';
// We can add middleware later to check conversation participation if needed

const router = express.Router();

// --- 2. Add new route (place it before routes with params) ---
router.get('/unread-count', isAuth, getUnreadCount);

router.get('/', isAuth, getMyConversations);
router.post('/', isAuth, startConversation);
router.get('/:conversationId/messages', isAuth, getMessages);
router.post('/:conversationId/messages', isAuth, sendMessage);

export default router;