import Course from '../models/CourseModel.js';
import Board from '../models/BoardModel.js';
import mongoose from 'mongoose';

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Faculty/Superadmin)
export const createCourse = async (req, res) => {
  try {
    const { title, code, semester, description, hasLab } = req.body;
    const creatorId = req.user.id;

    // 1. Create the course
    const newCourse = new Course({
      title,
      code,
      semester,
      description,
      hasLab,
      members: [{
        user: creatorId,
        role: 'coordinator', // The creator is the first coordinator [cite: 43]
      }],
    });

    const savedCourse = await newCourse.save();

    // 2. Create the default "Central Boards" for this course
    const defaultBoards = [
      { name: 'Central Theory Board', type: 'central_theory' },
      { name: 'Resource Board', type: 'resource' },
      { name: 'Query Board', type: 'query' },
      { name: 'Discussion Board', type: 'discussion' },
    ];

    if (hasLab) {
      defaultBoards.push({ name: 'Central Lab Board', type: 'central_lab' });
    }

    // Prepare boards for database insertion
    const boardsToCreate = defaultBoards.map(board => ({
      course: savedCourse._id,
      name: board.name,
      type: board.type,
      isGlobal: true, // All central boards are global
      moderators: [creatorId], // The coordinator moderates them by default
    }));

    await Board.insertMany(boardsToCreate);

    res.status(201).json(savedCourse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating course.' });
  }
};

// @desc    Get all courses for the logged-in user
// @route   GET /api/courses
// @access  Private
export const getMyCourses = async (req, res) => {
  try {
    // Find all courses where the 'members.user' array contains the user's ID
    const courses = await Course.find({ 'members.user': req.user.id })
      .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching courses.' });
  }
};
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // We will add a check here later to ensure user is a member

    res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all boards for a specific course
// @route   GET /api/courses/:id/boards
// @access  Private (Course Member)
export const getBoardsForCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId; // Use courseId from params
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const boards = await Board.find({
      course: courseObjectId,
      $or: [
        { isGlobal: true },
        { 'members.user': userId }
      ]
    }).sort({ type: 1, name: 1 });

    // --- ADD THIS LOGIC ---
    // Determine if the user is a moderator for each board they can see
    const boardsWithRole = boards.map(board => {
      const isModerator = board.moderators.some(modId => modId.equals(userId)) || req.user.role === 'superadmin';
      return {
        ...board.toObject(), // Convert Mongoose doc to plain object
        isUserModerator: isModerator // Add the flag
      };
    });
    // --- END ADDED LOGIC ---

    res.status(200).json(boardsWithRole); // Send the modified array
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
// @desc    Get all faculty/coordinators for a course
// @route   GET /api/courses/:id/faculty
// @access  Private (Coordinator)
export const getCourseFaculty = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate({
        path: 'members.user',
        model: 'User',
        select: 'name email initials' // Select only the fields we need
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Filter members to find only faculty and coordinators
    const faculty = course.members
      .filter(m => m.role === 'faculty' || m.role === 'coordinator')
      .map(m => m.user);

    res.status(200).json(faculty);
  } catch (error)
  {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};