import express from 'express';
import { getPostsForBoard, createPost } from '../controllers/postController.js';
import { createEvent } from '../controllers/eventController.js'; // <-- Import createEvent
import { isAuth, isBoardModerator } from '../middleware/authMiddleware.js'; // <-- Import isBoardModerator
import multer from 'multer';

// ... (multer config) ...
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 }});

const router = express.Router();

// --- Post Routes ---
router.get('/:boardId/posts', isAuth, getPostsForBoard); // No moderator check needed to view
router.post(
  '/:boardId/posts',
  isAuth, // Any member can post
  upload.single('file'),
  createPost
);

// --- Event Routes ---
// POST /api/boards/:boardId/events - Create an event for this board
router.post('/:boardId/events', isAuth, isBoardModerator, createEvent); // <-- Add the new route

export default router;