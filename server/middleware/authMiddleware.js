import Course from '../models/CourseModel.js';
import Board from '../models/BoardModel.js';
import Post from '../models/PostModel.js';
// This middleware checks if a user is logged in
export const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) { // isAuthenticated() is from Passport
    return next();
  }
  res.status(401).json({ message: 'You are not authenticated.' });
};

// This middleware checks if a user is faculty or superadmin
export const isFaculty = (req, res, next) => {
  if (req.user.role === 'faculty' || req.user.role === 'superadmin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden. Requires faculty role.' });
};

export const isCourseMember = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if the user's ID is in the course's member list
    const isMember = course.members.some(
      (member) => member.user.equals(req.user.id)
    );

    if (isMember || req.user.role === 'superadmin') {
      return next(); // User is a member or an admin, allow access
    }

    res.status(403).json({ message: 'Forbidden. You are not a member of this course.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
// This middleware checks if a user is a Coordinator of the course
export const isCoordinator = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const isCoord = course.members.some(
      (member) => member.user.equals(req.user.id) && member.role === 'coordinator'
    );

    if (isCoord || req.user.role === 'superadmin') {
      return next(); // User is a coordinator or an admin
    }

    res.status(403).json({ message: 'Forbidden. Requires coordinator role.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
export const isBoardModerator = async (req, res, next) => {
  try {
    let boardId;
    // --- 2. ADD THIS LOGIC ---
    // Try to get boardId from URL params first
    if (req.params.boardId) {
      boardId = req.params.boardId;
    } 
    // If not, try to get it from the post being modified (e.g., pinning)
    else if (req.params.postId) { 
      const post = await Post.findById(req.params.postId).select('board');
      if (!post) return res.status(404).json({ message: 'Post not found.' });
      boardId = post.board;
    } 
    // If still not found, try the request body (e.g., creating an event)
    else if (req.body.boardId) {
        boardId = req.body.boardId;
    }

    if (!boardId) {
      return res.status(400).json({ message: 'Board ID not found in request.' });
    }
    // --- END ADDED LOGIC ---

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }

    // Check if user's ID is in the board's moderators list
    const isMod = board.moderators.some(
      (moderatorId) => moderatorId.equals(req.user.id)
    );

    if (isMod || req.user.role === 'superadmin') {
      return next(); // User is a moderator or an admin
    }

    res.status(403).json({ message: 'Forbidden. Requires moderator role for this board.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during board moderator check.' });
  }
};