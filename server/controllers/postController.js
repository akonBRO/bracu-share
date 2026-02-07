import Post from '../models/PostModel.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary-setup.js';
// @desc    Get all posts for a specific board
// @route   GET /api/boards/:boardId/posts
// @access  Private (Course Member)
export const getPostsForBoard = async (req, res) => {
  try {
    const posts = await Post.find({ board: req.params.boardId,hiddenFrom: { $ne: req.user.id } })
      .populate('author', 'name email profilePicture initials') // Get author's info
      .sort({ createdAt: 'asc' }); // Show oldest first

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Create a new post
// @route   POST /api/boards/:boardId/posts
// @access  Private (Course Member)
export const createPost = async (req, res) => {
  try {
    const { content, parentPost } = req.body;
    const { boardId } = req.params;
    const io = req.io;

    let attachment = null;

    // --- 2. Check if a file is attached ---
    if (req.file) {
      // We need to upload the buffer to Cloudinary
      // We'll use a Promise-based upload
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto', // Auto-detect file type (image, pdf, etc.)
            folder: `bracu-share/${boardId}`, // Organize by board
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        // Send the file buffer to the stream
        uploadStream.end(req.file.buffer);
      });

      attachment = {
        fileName: req.file.originalname,
        url: uploadResult.secure_url,
        type: 'file'
      };
    }

    // --- 3. Create the post (with or without attachment) ---
    const newPost = new Post({
      board: boardId,
      author: req.user.id,
      content: content || '', // Content can be empty if there's a file
      parentPost: parentPost || null,
      attachments: attachment ? [attachment] : [], // Add the new attachment
    });

    const savedPost = await newPost.save();

    if (parentPost) {
      await Post.findByIdAndUpdate(parentPost, { $inc: { replyCount: 1 } });
    }

    const populatedPost = await savedPost.populate('author', 'name email profilePicture initials');
    console.log(`SERVER: Emitting 'postReceived' to board ${boardId} for post ${populatedPost._id}`);
    // --- 2. EMIT THE NEW POST ---
    // Emit to everyone in the room *except* the sender (they add it instantly)
    io.to(boardId).emit('postReceived', populatedPost);

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('--- CLOUDINARY UPLOAD ERROR ---'); // <-- ADD THIS
    console.error(error); // <-- ADD THIS
    res.status(500).json({ message: 'Server error.' });
  }
};

export const togglePinPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.isDeleted) {
       return res.status(400).json({ message: 'Cannot pin a deleted post.' });
    }

    // Toggle the isPinned status
    post.isPinned = !post.isPinned;
    await post.save();

    // Populate author info
    const populatedPost = await post.populate('author', 'name email profilePicture initials');

    // Emit update event
    const io = req.io;
    io.to(post.board.toString()).emit('postUpdated', populatedPost);

    res.status(200).json(populatedPost);
  } catch (error) {
    console.error('--- PIN POST ERROR ---', error);
    res.status(500).json({ message: 'Server error pinning post.' });
  }
};
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check if user is the author
    if (!post.author.equals(req.user.id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

   // --- THIS IS THE NEW "SOFT DELETE" LOGIC ---
    // 1. Mark as deleted and clear content
    post.isDeleted = true;
    post.content = ''; // Clear the message
    post.attachments = []; // Clear any files

    // 2. Save the updated (deleted) post
    await post.save();

    // 3. Populate the author info (so we can show "User deleted...")
    const populatedPost = await post.populate('author', 'name email profilePicture initials');

    // 4. Emit an "update" event, not a "delete" event
    const io = req.io;
    io.to(post.board.toString()).emit('postUpdated', populatedPost);

    // 5. If it was a reply, we must update the parent's reply count
    if (post.parentPost) {
      await Post.findByIdAndUpdate(post.parentPost, { $inc: { replyCount: -1 } });

      // Also emit an update for the parent post
      const updatedParent = await Post.findById(post.parentPost)
                                  .populate('author', 'name email profilePicture initials');
      io.to(post.board.toString()).emit('postUpdated', updatedParent);
    }

    res.status(200).json(populatedPost);
  } catch (error) {
    console.error('--- DELETE POST ERROR ---', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// --- NEW FUNCTION ---
// @desc    Hide a post (for me)
// @route   PATCH /api/posts/:postId/hide
export const hidePost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Add the user's ID to the 'hiddenFrom' array
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { hiddenFrom: req.user.id }
    });

    res.status(200).json({ message: 'Post hidden.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};