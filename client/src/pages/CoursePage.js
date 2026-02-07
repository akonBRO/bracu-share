import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Typography, CircularProgress, Alert, IconButton } from '@mui/material';
import axios from 'axios';
import CourseSidebar from '../components/CourseSidebar';
import PostFeed from '../components/PostFeed';
import MessageInput from '../components/MessageInput';
import ThreadView from '../components/ThreadView';
import EventModal from '../components/EventModal';
import { useSocket } from '../context/SocketContext';
import { useDarkMode } from '../context/DarkModeContext';

const CoursePage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');
  const [threadPost, setThreadPost] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const socket = useSocket();
  const activeBoardRef = useRef(activeBoard);

  useEffect(() => {
    activeBoardRef.current = activeBoard;
  }, [activeBoard]);

  // 1. Fetch main course data
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoadingCourse(true);
      try {
        const [courseRes, boardsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/courses/${courseId}`, { withCredentials: true }),
          axios.get(`http://localhost:5000/api/courses/${courseId}/boards`, { withCredentials: true })
        ]);
        setCourse(courseRes.data);
        setBoards(boardsRes.data);
        if (boardsRes.data.length > 0) {
          setActiveBoard(boardsRes.data[0]);
        }
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course data.');
      }
      setLoadingCourse(false);
    };
    fetchCourseData();
  }, [courseId]);

  // 2. Fetch posts
  useEffect(() => {
    if (!activeBoard) return;
    const fetchPosts = async () => {
      setLoadingPosts(true);
      setPostError('');
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/boards/${activeBoard._id}/posts`,
          { withCredentials: true }
        );
        setPosts(data);
      } catch (err) {
        setPostError('Failed to load messages.');
      }
      setLoadingPosts(false);
    };
    fetchPosts();
  }, [activeBoard]);

  // 3. Socket.io Listeners
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewPost = (newPost) => {
      if (newPost.author._id === user._id) {
        return;
      }
      if (newPost.board === activeBoardRef.current?._id) {
        setPosts(prevPosts => {
          if (newPost.parentPost) {
            const newPosts = prevPosts.map(p =>
              p._id === newPost.parentPost ? { ...p, replyCount: p.replyCount + 1 } : p
            );
            return [...newPosts, newPost];
          }
          return [...prevPosts, newPost];
        });
      }
    };

    const handleUpdatePost = (updatedPost) => {
      if (updatedPost.board === activeBoardRef.current?._id) {
        setPosts(prevPosts =>
          prevPosts.map(p => (p._id === updatedPost._id ? updatedPost : p))
        );
      }
    };

    socket.on('postReceived', handleNewPost);
    socket.on('postUpdated', handleUpdatePost);

    return () => {
      socket.off('postReceived', handleNewPost);
      socket.off('postUpdated', handleUpdatePost);
    };
  }, [socket, user]);

  // 4. Socket.io Room Management
  useEffect(() => {
    if (!socket || !boards.length) return;
    return () => { boards.forEach(b => socket.emit('leaveBoard', b._id)); };
  }, [socket, boards]);

  useEffect(() => {
    if (!socket) return;
    if (activeBoard) socket.emit('joinBoard', activeBoard._id);
    return () => { if (activeBoard) socket.emit('leaveBoard', activeBoard._id); };
  }, [activeBoard, socket]);

  // 5. Handle sending a new post
  const handleSendPost = async (content, parentPost, file) => {
    setIsSending(true);
    const formData = new FormData();
    formData.append('content', content);
    if (parentPost) formData.append('parentPost', parentPost);
    if (file) formData.append('file', file);
    try {
      const { data: newPost } = await axios.post(
        `http://localhost:5000/api/boards/${activeBoard._id}/posts`,
        formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setPosts(prevPosts => [...prevPosts, newPost]);
    } catch (err) {
      alert('Failed to send message. (Check server logs)');
    }
    setIsSending(false);
  };

  // 6. Check if user is a coordinator
  const [isCoordinator, setIsCoordinator] = useState(false);
  useEffect(() => {
    if (course && user) {
      const isCoord = course.members.some(
        m => m.user === user._id && m.role === 'coordinator'
      ) || user.role === 'superadmin';
      setIsCoordinator(isCoord);
    }
  }, [course, user]);

  // 7. Handle hiding a post
  const handleHidePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
  };

  // 8. Handler for creating event
  const handleCreateEvent = async (eventData) => {
    if (!activeBoard) return;
    try {
      await axios.post(
        `http://localhost:5000/api/boards/${activeBoard._id}/events`,
        eventData, { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  };

  const handleStartDM = async (recipientUser) => {
    if (!recipientUser || recipientUser._id === user._id) return;
    console.log(`Starting DM with ${recipientUser.name}...`);
    try {
      const { data: conversation } = await axios.post(
        'http://localhost:5000/api/conversations',
        { recipientId: recipientUser._id },
        { withCredentials: true }
      );
      navigate('/messages', { state: { selectedConversationId: conversation._id } });
    } catch (err) {
      console.error("Failed to start DM:", err);
      alert(`Could not start conversation with ${recipientUser.name}.`);
    }
  };

  // Loading state
  if (loadingCourse) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          background: darkMode
            ? 'radial-gradient(ellipse at top, #0a0a5c 0%, #000000 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        <CircularProgress
          sx={{
            color: darkMode ? '#60a5fa' : '#0a0a5c',
          }}
          size={50}
        />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: darkMode
            ? 'radial-gradient(ellipse at top, #0a0a5c 0%, #000000 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Alert
          severity="error"
          sx={{
            maxWidth: '600px',
            mx: 'auto',
            borderRadius: 3,
            boxShadow: darkMode
              ? '0 8px 24px rgba(10, 10, 92, 0.4)'
              : '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!course) return null;

  // Determine moderator status for the active board
  const isCurrentUserModerator = activeBoard?.isUserModerator || user?.role === 'superadmin';

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        background: darkMode ? '#000000' : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <CourseSidebar
        course={course}
        boards={boards}
        activeBoard={activeBoard}
        onSelectBoard={setActiveBoard}
      />

      {/* Main Chat Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Board Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            pl: { xs: 8, md: 3 },
            borderBottom: darkMode
              ? '1px solid rgba(30, 64, 175, 0.3)'
              : '1px solid #e5e7eb',
            background: darkMode
              ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.4) 0%, rgba(2, 6, 23, 0.6) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: darkMode
              ? '0 4px 12px rgba(10, 10, 92, 0.3)'
              : '0 2px 8px rgba(10, 10, 92, 0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: { xs: 4, sm: 5 },
                height: { xs: 28, sm: 36 },
                background: darkMode
                  ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
                  : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                borderRadius: 1,
                boxShadow: darkMode
                  ? '0 4px 12px rgba(96, 165, 250, 0.3)'
                  : '0 2px 8px rgba(10, 10, 92, 0.15)',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                background: darkMode
                  ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                  : '#0a0a5c',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}
            >
              {activeBoard ? activeBoard.name : 'Select a board'}
            </Typography>
          </Box>

          {isCoordinator && (
            <IconButton
              onClick={() => navigate(`/course/${courseId}/manage`)}
              sx={{
                color: darkMode ? '#60a5fa' : '#0a0a5c',
                bgcolor: darkMode ? 'rgba(30, 64, 175, 0.2)' : 'rgba(10, 10, 92, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : 'rgba(10, 10, 92, 0.1)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <SettingsIcon />
            </IconButton>
          )}
        </Box>

        {/* Post Error Alert */}
        {postError && (
          <Alert
            severity="error"
            sx={{
              m: 2,
              borderRadius: 2,
              bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : undefined,
              border: darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
            }}
          >
            {postError}
          </Alert>
        )}

        {/* Post Feed Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            bgcolor: darkMode ? 'rgba(10, 10, 92, 0.1)' : '#fafbfc',
            '&::-webkit-scrollbar': {
              width: 10,
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f3f4f6',
              borderRadius: 5,
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkMode
                ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.6) 0%, rgba(96, 165, 250, 0.4) 100%)'
                : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
              borderRadius: 5,
              border: darkMode ? '2px solid rgba(10, 10, 92, 0.2)' : '2px solid #f3f4f6',
              '&:hover': {
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.8) 0%, rgba(96, 165, 250, 0.6) 100%)'
                  : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
              },
            },
          }}
        >
          {activeBoard && (
            <PostFeed
              posts={posts}
              loading={loadingPosts}
              onPostHidden={handleHidePost}
              onReplyClick={setThreadPost}
              isModerator={isCurrentUserModerator}
              onClickAuthor={handleStartDM}
            />
          )}
        </Box>

        {/* Message Input */}
        {activeBoard && (
          <MessageInput
            onSendPost={handleSendPost}
            loading={isSending}
            isModerator={isCurrentUserModerator}
            onAddEventClick={() => setEventModalOpen(true)}
          />
        )}
      </Box>

      {/* ThreadView Panel */}
      {threadPost && (
        <ThreadView
          mainPost={threadPost}
          posts={posts}
          onClose={() => setThreadPost(null)}
          onSendReply={handleSendPost}
          loading={loadingPosts || isSending}
          onPostHidden={handleHidePost}
        />
      )}

      {/* Event Modal */}
      {activeBoard && (
        <EventModal
          open={eventModalOpen}
          handleClose={() => setEventModalOpen(false)}
          onCreateEvent={handleCreateEvent}
          boardName={activeBoard.name}
        />
      )}
    </Box>
  );
};

export default CoursePage;