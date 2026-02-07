import Event from '../models/EventModel.js';
import Board from '../models/BoardModel.js';
import Course from '../models/CourseModel.js';
import mongoose from 'mongoose';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';

// @desc    Create a new event for a board
// @route   POST /api/boards/:boardId/events
// @access  Private (Board Moderator)
export const createEvent = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { 
      title, 
      description, 
      eventType, 
      otherTypeText,  // NEW: Custom type text
      start, 
      end,
      color,          // NEW: Event color
      colorRgb        // NEW: Event color RGB
    } = req.body;

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    // Validate "other" type has text
    if (eventType === 'other' && !otherTypeText?.trim()) {
      return res.status(400).json({ 
        message: 'Please specify the event type when selecting "Other".' 
      });
    }

    const newEvent = new Event({
      title,
      description,
      eventType,
      otherTypeText: eventType === 'other' ? otherTypeText : undefined,  // NEW
      start: new Date(start), // Ensure it's a Date object
      end: end ? new Date(end) : undefined,
      color: color || '#3b82f6',        // NEW: Default to blue if not provided
      colorRgb: colorRgb || '59, 130, 246',  // NEW: Default RGB
      board: boardId,
      course: board.course, // Get course from the board
      createdBy: req.user.id,
    });

    const savedEvent = await newEvent.save();
    // TODO: Emit event via Socket.IO if needed for real-time calendar updates

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating event.' });
  }
};

// @desc    Get all events relevant to the logged-in user
// @route   GET /api/events/me
// @access  Private
export const getMyEvents = async (req, res) => {
  try {
    // 1. Find all courses the user is a member of
    const userCourses = await Course.find({ 'members.user': req.user.id }).select('_id');
    const courseIds = userCourses.map(c => c._id);

    // 2. Find all boards within those courses that the user is a member of (global or specific)
    const userBoards = await Board.find({
      course: { $in: courseIds },
      $or: [
        { isGlobal: true },
        { 'members.user': req.user.id }
      ]
    }).select('_id');
    const boardIds = userBoards.map(b => b._id);

    // 3. Find all events belonging to those boards
    const events = await Event.find({ board: { $in: boardIds } })
      .populate('createdBy', 'name initials')  // Optionally get creator info
      .sort({ start: 1 }); // Sort by start date

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:eventId
// @access  Private (Event Creator / Board Moderator)
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { 
      title, 
      description, 
      eventType, 
      otherTypeText,  // NEW: Custom type text
      start, 
      end,
      color,          // NEW: Event color
      colorRgb        // NEW: Event color RGB
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Authorization Check: Must be creator or superadmin
    // Note: isBoardModerator middleware already ran if route is configured correctly
    if (!event.createdBy.equals(req.user.id) && req.user.role !== 'superadmin') {
       return res.status(403).json({ message: 'Forbidden: Only the creator can update this event.' });
    }

    // Validate "other" type has text
    if (eventType === 'other' && !otherTypeText?.trim()) {
      return res.status(400).json({ 
        message: 'Please specify the event type when selecting "Other".' 
      });
    }

    // Update fields
    event.title = title || event.title;
    event.description = description !== undefined ? description : event.description;
    event.eventType = eventType || event.eventType;
    event.otherTypeText = eventType === 'other' ? otherTypeText : undefined;  // NEW
    event.start = start ? new Date(start) : event.start;
    event.end = end ? new Date(end) : (end === null ? undefined : event.end); // Allow setting end to null
    event.color = color || event.color;        // NEW
    event.colorRgb = colorRgb || event.colorRgb;  // NEW

    const updatedEvent = await event.save();
    // TODO: Emit event update via Socket.IO

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating event.' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:eventId
// @access  Private (Event Creator / Board Moderator)
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Authorization Check: Must be creator or superadmin
    if (!event.createdBy.equals(req.user.id) && req.user.role !== 'superadmin') {
       return res.status(403).json({ message: 'Forbidden: Only the creator can delete this event.' });
    }

    await event.deleteOne();
    // TODO: Emit event deletion via Socket.IO

    res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting event.' });
  }
};