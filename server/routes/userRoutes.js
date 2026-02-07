import express from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/userController.js';
import { isAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/me - Get logged-in user's profile
router.get('/me', isAuth, getMyProfile);

// PUT /api/users/me - Update logged-in user's profile
router.put('/me', isAuth, updateMyProfile);

export default router;