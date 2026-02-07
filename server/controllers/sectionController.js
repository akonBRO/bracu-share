import Course from '../models/CourseModel.js';
import Board from '../models/BoardModel.js';
import User from '../models/UserModel.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

// @desc    Create a new section (Theory + Lab boards)
// @route   POST /api/courses/:courseId/sections
// @access  Private (Coordinator)
export const createSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionName, theoryFacultyIds, labFacultyIds } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // 1. Create Theory Board
    const theoryBoard = new Board({
      course: courseId,
      name: `${sectionName} Theory`,
      type: 'section_theory',
      sectionName: sectionName,
      isGlobal: false,
      moderators: theoryFacultyIds || [req.user.id],
    });
    await theoryBoard.save();

    // 2. Create Lab Board (if applicable)
    if (course.hasLab) {
      const labBoard = new Board({
        course: courseId,
        name: `${sectionName} Lab`,
        type: 'section_lab',
        sectionName: sectionName,
        isGlobal: false,
        moderators: labFacultyIds || theoryFacultyIds || [req.user.id],
      });
      await labBoard.save();
    }

    res.status(201).json({ message: `Section '${sectionName}' created.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Upload a CSV roster to add students to a section
// @route   POST /api/courses/:courseId/roster
// @access  Private (Coordinator)
export const uploadRoster = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { courseId } = req.params;
    const { sectionName } = req.body;
    const studentEmails = [];

    // 1. Parse the CSV file buffer
    Readable.from(req.file.buffer)
      .pipe(csv())
      .on('data', (row) => {
        // Look for an 'email' column (case-insensitive)
        const email = row.email || row.Email || row.EMAIL;
        if (email) {
          studentEmails.push(email.trim());
        }
      })
      .on('end', async () => {
        if (studentEmails.length === 0) {
          return res.status(400).json({ message: 'No valid emails found in CSV.' });
        }

        // 2. Find the boards for this section
        const sectionBoards = await Board.find({
          course: courseId,
          sectionName: sectionName,
        });
        if (sectionBoards.length === 0) {
          return res.status(404).json({ message: 'Section boards not found.' });
        }

        // 3. Find the user IDs for these emails
        const users = await User.find({ email: { $in: studentEmails } });
        const userIds = users.map(u => u._id);
        const userMap = new Map(users.map(u => [u.email, u._id]));

        // 4. Add users to the main course
        await Course.findByIdAndUpdate(courseId, {
          $addToSet: { 'members': { $each: userIds.map(id => ({ user: id, role: 'student' })) } }
        });

        // 5. Add users to the section boards
        const boardUpdatePromises = sectionBoards.map(board => 
          Board.findByIdAndUpdate(board._id, {
            $addToSet: { 'members': { $each: userIds.map(id => ({ user: id })) } }
          })
        );
        await Promise.all(boardUpdatePromises);

        const addedCount = userIds.length;
        const notFoundCount = studentEmails.length - addedCount;

        res.status(200).json({
          message: `Roster processed. Added ${addedCount} students. ${notFoundCount} emails not found.`,
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
// @desc    Get all existing sections for a course
// @route   GET /api/courses/:courseId/sections
// @access  Private (Coordinator)
export const getSections = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find all "section_theory" boards
    const theoryBoards = await Board.find({
      course: courseId,
      type: 'section_theory'
    }).populate('moderators', 'name initials'); // Get moderator info

    // We can add logic here to count students later

    res.status(200).json(theoryBoards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};