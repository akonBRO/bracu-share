import mongoose from 'mongoose';
const { Schema } = mongoose;

const attachmentSchema = new Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['file', 'link'] }
});

const postSchema = new Schema(
  {
    board: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    attachments: [attachmentSchema],
    isPinned: { type: Boolean, default: false },
    parentPost: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    replyCount: { type: Number, default: 0 },
    hiddenFrom: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// --- THIS IS THE CORRECTED VALIDATION LOGIC ---
// This hook now only runs when a document is NEW (this.isNew)
postSchema.pre('save', function(next) {
  if (this.isNew) {
    const hasContent = this.content && this.content.trim().length > 0;
    const hasAttachment = this.attachments && this.attachments.length > 0;

    if (!hasContent && !hasAttachment) {
      return next(new Error('Post validation failed: A post must have content or an attachment.'));
    }
  }
  
  // For all other saves (like our soft delete), just proceed.
  next();
});
// --- END OF FIX ---

postSchema.index({ parentPost: 1, createdAt: 1 });
const Post = mongoose.model('Post', postSchema);
export default Post;