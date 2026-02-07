import mongoose from 'mongoose';
const { Schema } = mongoose;

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    semester: { type: String, required: true },
    description: { type: String },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['student', 'faculty', 'coordinator'],
          default: 'student',
        },
      },
    ],
    hasLab: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;