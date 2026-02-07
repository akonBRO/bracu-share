import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ['student', 'faculty', 'superadmin'],
      required: true,
    },

    profilePicture: {
      type: String,
      default: '',
    },

    /* ===== STUDENT ===== */
    bracuId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    programs: [
      {
        type: String,
        trim: true,
      },
    ],

    departments: [
      {
        type: String,
        trim: true,
      },
    ],

    /* ===== FACULTY ===== */
    initials: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 3,
      default: '',
    },

    facultyBadge: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
