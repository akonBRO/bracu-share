import mongoose from 'mongoose';
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['quiz', 'assignment', 'midterm', 'lab_final', 'deadline', 'other'],
      required: true,
    },
    otherTypeText: {
      type: String,
      trim: true,
    },
    start: { // Renamed from startDate for compatibility with calendar libraries
      type: Date,
      required: true,
    },
    end: { // Renamed from endDate
      type: Date, // Optional
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    colorRgb: {
      type: String,
      default: '59, 130, 246',
    },
    board: { // Link to the specific Section or Central board
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    course: { // Link to the course (for easier filtering)
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    createdBy: { // Who created the event
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster fetching of events for a user across boards
eventSchema.index({ board: 1, start: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;