import mongoose from 'mongoose';
const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    // Array containing the User IDs of the two participants
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Timestamp of the last message sent in this conversation
    // Useful for sorting conversations in the UI
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Index to quickly find conversations involving a specific user
conversationSchema.index({ participants: 1 });
// Index for sorting by last message time
conversationSchema.index({ lastMessageAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;