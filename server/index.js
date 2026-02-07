import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Server } from 'socket.io';
import http from 'http';

// Import routes and configs
import './config/passport-setup.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import postApiRoutes from './routes/postApiRoutes.js';
import userRoutes from './routes/userRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// --- Configure Socket.io ---
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// --- Middleware ---
const corsConfig = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};
app.use(cors(corsConfig));
app.use(express.json());

// Session Middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
});
app.use(sessionMiddleware);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// --- Make Socket.io use Passport ---
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

// --- Socket.io Connection Logic ---
io.on('connection', (socket) => {
  const user = socket.request.user;
  
  if (user) {
    console.log(`✅ Socket connected: ${user.name} (${user.id})`);
    // Join user-specific room for notifications
    socket.join(user.id.toString());
    socket.userId = user.id.toString(); // Store userId on socket for easy access
  } else {
    console.log('⚠️  Socket connected: (Guest)');
  }

  // Join a board room
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
    console.log(`📌 User ${user?.name || 'Guest'} joined board ${boardId}`);
  });

  // Leave a board room
  socket.on('leaveBoard', (boardId) => {
    socket.leave(boardId);
    console.log(`📌 User ${user?.name || 'Guest'} left board ${boardId}`);
  });

  // Join a conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`💬 User ${user?.name || 'Guest'} joined conversation ${conversationId}`);
  });

  // Leave a conversation room
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`💬 User ${user?.name || 'Guest'} left conversation ${conversationId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${user?.name || 'Guest'}`);
  });
});

// --- Make 'io' accessible to controllers ---
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postApiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);

app.get('/', (req, res) => {
  res.send('BRACU Share API is running!');
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});