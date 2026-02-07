import express from 'express';
import { getMyEvents, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { isAuth } from '../middleware/authMiddleware.js';
// We'll add isBoardModerator here if needed for specific routes later

const router = express.Router();

// GET /api/events/me - Get all events for the logged-in user
router.get('/me', isAuth, getMyEvents);

// PUT /api/events/:eventId - Update an event
// Note: The controller handles creator check. Add isBoardModerator if needed.
router.put('/:eventId', isAuth, updateEvent);

// DELETE /api/events/:eventId - Delete an event
// Note: The controller handles creator check. Add isBoardModerator if needed.
router.delete('/:eventId', isAuth, deleteEvent);

export default router;