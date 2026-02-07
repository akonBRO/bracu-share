import mongoose from 'mongoose';
const { Schema } = mongoose;

const boardSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'central_theory', 'resource', 'query', 'discussion',
        'central_lab', 'section_theory', 'section_lab',
      ],
      required: true,
    },
    sectionName: { type: String, default: null, trim: true }, // For sections
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // --- THIS WAS THE MISSING FIELD ---
    isGlobal: { 
      type: Boolean, 
      default: false 
    },

    members: [{ user: { type: Schema.Types.ObjectId, ref: 'User' } }],
  },
  { timestamps: true }
);

const Board = mongoose.model('Board', boardSchema);
export default Board;