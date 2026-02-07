import Conversation from '../models/ConversationModel.js';
import Message from '../models/MessageModel.js';
import User from '../models/UserModel.js';
import mongoose from 'mongoose';

// @desc    Get all conversations for the logged-in user
// @route   GET /api/conversations
// @access  Private
export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate({ // Populate the *other* participant's info
        path: 'participants',
        match: { _id: { $ne: req.user.id } }, // Exclude self
        select: 'name email profilePicture initials' // Select needed fields
      })
      .sort({ lastMessageAt: -1 }); // Sort by most recent activity

    // TODO: We could add the last message snippet here later

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: 'Server error fetching conversations.' });
  }
};

// @desc    Start a new conversation or get existing one
// @route   POST /api/conversations
// @access  Private
export const startConversation = async (req, res) => {
  try {
    const { recipientId } = req.body; // Expecting the User ID of the other person
    const senderId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required.' });
    }
    if (recipientId === senderId) {
        return res.status(400).json({ message: 'Cannot start conversation with yourself.' });
    }


    // Check if recipient exists
    const recipientExists = await User.findById(recipientId);
    if (!recipientExists) {
        return res.status(404).json({ message: 'Recipient user not found.' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    // If not, create it
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessageAt: Date.now() // Initialize last message time
      });
      await conversation.save();
    }

    // Populate participant info before sending back
    const populatedConversation = await conversation.populate({
         path: 'participants',
         select: 'name email profilePicture initials'
    });

    res.status(200).json(populatedConversation); // Use 200 OK even if found existing
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ message: 'Server error starting conversation.' });
  }
};


// @desc    Get messages for a specific conversation
// @route   GET /api/conversations/:conversationId/messages
// @access  Private (Participant)
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // --- THIS IS THE FIX ---
    // Convert the string IDs to Mongoose ObjectIds for querying
    const userIdObject = new mongoose.Types.ObjectId(req.user.id);
    const convoIdObject = new mongoose.Types.ObjectId(conversationId);
    // --- END FIX ---

    const conversation = await Conversation.findOne({
        _id: convoIdObject,         // <-- Use ObjectId
        participants: userIdObject  // <-- Use ObjectId
    });

    if (!conversation) {
        return res.status(403).json({ message: 'Not authorized to view these messages.'});
    }

    // --- Mark messages as read ---
    await Message.updateMany(
      { 
        conversation: convoIdObject, // <-- Use ObjectId
        receiver: userIdObject,      // <-- Use ObjectId
        isRead: false 
      },
      { $set: { isRead: true } }
    );
    // --- END FIX ---

    const messages = await Message.find({ conversation: convoIdObject }) // <-- Use ObjectId
      .populate('sender', 'name profilePicture initials')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error); // This will log the error on your server
    res.status(500).json({ message: 'Server error fetching messages.' });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/conversations/:conversationId/messages
// @access  Private (Participant)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    const io = req.io;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId
    });

    if (!conversation) {
        return res.status(403).json({ message: 'Not authorized to send messages here.'});
    }

    const recipientId = conversation.participants.find(p => !p.equals(senderId));

    const newMessage = new Message({
      conversation: conversationId,
      sender: senderId,
      receiver: recipientId,
      content: content.trim(),
      isRead: false // --- Explicitly set as unread ---
    });
    await newMessage.save();

    conversation.lastMessageAt = newMessage.createdAt;
    await conversation.save();

    const populatedMessage = await newMessage.populate('sender', 'name profilePicture initials');

    // --- UPDATED SOCKET EMITS ---
    // 1. Emit to the conversation room (for users currently watching)
    io.to(conversationId).emit('dmReceived', populatedMessage);

    // 2. Emit to the recipient's private room (for global notifications)
    // This requires the recipient to be online and in their "user ID" room
    io.to(recipientId.toString()).emit('newDmNotification', populatedMessage);
    // --- END UPDATED EMITS ---

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: 'Server error sending message.' });
  }
};

// --- NEW FUNCTION ---
// @desc    Get total unread conversation count
// @route   GET /api/conversations/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
    try {
        // 1. Find all messages that are unread for this user
        const unreadMessages = await Message.find({
            receiver: req.user.id,
            isRead: false
        }).select('conversation'); // We only need the conversation ID

        // 2. Get the unique conversation IDs from that list
        const unreadConversationIds = new Set(
          unreadMessages.map(msg => msg.conversation.toString())
        );

        // 3. The count is the number of unique conversations
        const count = unreadConversationIds.size;

        res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};