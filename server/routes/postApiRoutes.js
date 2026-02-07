import express from 'express';
import { deletePost, hidePost, togglePinPost } from '../controllers/postController.js';
import { isAuth, isBoardModerator } from '../middleware/authMiddleware.js';

const router = express.Router();

// DELETE /api/posts/:postId
router.delete('/:postId', isAuth, deletePost);

// PATCH /api/posts/:postId/hide
router.patch('/:postId/hide', isAuth, hidePost);

// PATCH /api/posts/:postId/pin - Toggle pin status
router.patch('/:postId/pin', isAuth, isBoardModerator, togglePinPost);

export default router;