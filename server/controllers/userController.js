import User from '../models/UserModel.js';

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Always return a clean, consistent user object
    const user = await User.findById(req.user._id).select(
      'name email username role programs departments bracuId initials profilePicture'
    );

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allowed fields from frontend
    const {
      username,
      bracuId,
      initials,
      programs,
      departments,
    } = req.body;

    /* ======================
       COMMON (ALL ROLES)
    ====================== */
    if (username !== undefined) {
      user.username = username.trim();
    }

    /* ======================
       STUDENT ONLY
    ====================== */
    if (user.role === 'student') {
      if (bracuId !== undefined) {
        user.bracuId = bracuId.trim();
      }
      if (programs !== undefined) {
        user.programs = programs;
      }
      if (departments !== undefined) {
        user.departments = departments;
      }
    }

    /* ======================
       FACULTY / ADMIN
    ====================== */
    if (user.role === 'faculty' || user.role === 'superadmin') {
      if (initials !== undefined) {
        user.initials = initials.trim().toUpperCase();
      }
      if (programs !== undefined) {
        user.programs = programs;
      }
      if (departments !== undefined) {
        user.departments = departments;
      }
    }

    await user.save();

    // Return updated & sanitized user
    const updatedUser = await User.findById(user._id).select(
      'name email username role programs departments bracuId initials profilePicture'
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    // Duplicate BRACU ID handling
    if (error.code === 11000 && error.keyPattern?.bracuId) {
      return res.status(400).json({ message: 'BRACU ID already exists.' });
    }

    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};
