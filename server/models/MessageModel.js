import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: { // Store receiver for potential direct targeting/notifications
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // We can add read status later if needed
    // readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true } // Adds createdAt (message time) and updatedAt
);

// Index for fetching messages within a conversation, sorted by time
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// --- Auto-Deletion Setup ---
// Create a TTL index on the 'createdAt' field.
// Documents will be automatically deleted after 120 days (in seconds).
messageSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 120 * 24 * 60 * 60 } // 120 days * 24 hrs * 60 min * 60 sec
);
// IMPORTANT: This TTL index needs to be enabled on your MongoDB server.
// For local dev, it usually works automatically. For cloud DBs (like Atlas),
// you might need to ensure TTL indexing is active.

const Message = mongoose.model('Message', messageSchema);
export default Message;