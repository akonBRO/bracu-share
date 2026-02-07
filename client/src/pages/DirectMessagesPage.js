import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, IconButton, useMediaQuery, useTheme, Drawer, Fab } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import ConversationList from '../components/ConversationList';
import MessageWindow from '../components/MessageWindow';
import { useSocket } from '../context/SocketContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

const DirectMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [errorConvos, setErrorConvos] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const socket = useSocket();
  const location = useLocation();
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Ref to track the *currently joined* socket room ID
  const joinedRoomRef = useRef(null);

  // Fetch conversations and handle initial selection
  const fetchConversations = useCallback(async () => {
    setLoadingConvos(true);
    setErrorConvos('');
    try {
      const { data } = await axios.get('http://localhost:5000/api/conversations', { withCredentials: true });
      setConversations(data);

      const initialSelectedId = location.state?.selectedConversationId;
      if (initialSelectedId && !selectedConversation) {
        const foundConvo = data.find(c => c._id === initialSelectedId);
        if (foundConvo) {
          setSelectedConversation(foundConvo);
        }
        window.history.replaceState({}, document.title);
      }
    } catch (err) {
      setErrorConvos(err.response?.data?.message || 'Failed to fetch conversations.');
    }
    setLoadingConvos(false);
  }, [selectedConversation, location.state]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [isMobile]);

  // Handle back to conversations list on mobile
  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  // Toggle mobile drawer
  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Effect to manage joining/leaving socket rooms
  useEffect(() => {
    if (!socket || !selectedConversation) {
      if (joinedRoomRef.current) {
        socket?.emit('leaveConversation', joinedRoomRef.current);
        joinedRoomRef.current = null;
      }
      return;
    }

    const newRoomId = selectedConversation._id;

    if (newRoomId !== joinedRoomRef.current) {
      if (joinedRoomRef.current) {
        socket.emit('leaveConversation', joinedRoomRef.current);
      }

      socket.emit('joinConversation', newRoomId);
      joinedRoomRef.current = newRoomId;
    }

    return () => {
      if (newRoomId && socket) {
        socket.emit('leaveConversation', newRoomId);
        joinedRoomRef.current = null;
      }
    };
  }, [selectedConversation, socket]);

  // Socket listener for DMs
  useEffect(() => {
    if (!socket || !user) return;

    const handleIncomingDM = (newMessage) => {
      if (newMessage.conversation !== joinedRoomRef.current) {
        setConversations(prevConvos => {
          const convoIndex = prevConvos.findIndex(c => c._id === newMessage.conversation);
          if (convoIndex > -1) {
            const updatedConvo = {
              ...prevConvos[convoIndex],
              lastMessageAt: newMessage.createdAt,
            };
            return [updatedConvo, ...prevConvos.slice(0, convoIndex), ...prevConvos.slice(convoIndex + 1)];
          } else {
            fetchConversations();
            return prevConvos;
          }
        });
      }
    };

    socket.on('dmReceived', handleIncomingDM);

    return () => {
      socket.off('dmReceived', handleIncomingDM);
    };
  }, [socket, user, fetchConversations]);

  // Conversation List Content
  const conversationListContent = (
    <>
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderBottom: darkMode
            ? '1px solid rgba(30, 64, 175, 0.3)'
            : '1px solid #e5e7eb',
          background: darkMode
            ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.4) 0%, rgba(2, 6, 23, 0.6) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              Messages
            </Typography>
          </Box>
          
          {/* Close button for mobile drawer */}
          {isMobile && mobileDrawerOpen && (
            <IconButton
              onClick={toggleMobileDrawer}
              sx={{
                color: darkMode ? '#60a5fa' : '#0a0a5c',
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Loading/Error States */}
      {loadingConvos && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress
            sx={{
              color: darkMode ? '#60a5fa' : '#0a0a5c',
            }}
            size={40}
          />
        </Box>
      )}

      {errorConvos && (
        <Alert
          severity="error"
          sx={{
            m: 2,
            borderRadius: 2,
            bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : undefined,
            border: darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
          }}
        >
          {errorConvos}
        </Alert>
      )}

      {/* Conversation List */}
      {!loadingConvos && !errorConvos && (
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?._id}
        />
      )}
    </>
  );

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
      {/* Desktop: Left Panel - Conversation List */}
      {!isMobile && (
        <Paper
          elevation={0}
          sx={{
            width: { md: 320, lg: 360 },
            minWidth: { md: 320, lg: 360 },
            height: '100%',
            overflowY: 'auto',
            background: darkMode
              ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)'
              : '#ffffff',
            backdropFilter: 'blur(20px)',
            borderRight: darkMode
              ? '1.5px solid rgba(30, 64, 175, 0.3)'
              : '1px solid #e5e7eb',
            boxShadow: darkMode
              ? '0 30px 90px rgba(10, 10, 92, 0.6), 0 0 0 1px rgba(10, 10, 92, 0.3) inset'
              : '0 20px 60px rgba(10, 10, 92, 0.08), 0 0 0 1px rgba(10, 10, 92, 0.04) inset',
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
          {conversationListContent}
        </Paper>
      )}

      {/* Mobile: Full-Screen Views */}
      {isMobile ? (
        <>
          {/* Floating Menu Button - Only show when conversation is selected and drawer is closed */}
          {selectedConversation && !mobileDrawerOpen && (
            <Fab
              color="primary"
              aria-label="open conversations"
              onClick={toggleMobileDrawer}
              sx={{
                position: 'fixed',
                bottom: 80,
                left: 16,
                zIndex: 1300,
                background: darkMode
                  ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
                  : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                color: '#ffffff',
                boxShadow: darkMode
                  ? '0 8px 32px rgba(96, 165, 250, 0.4)'
                  : '0 8px 32px rgba(10, 10, 92, 0.3)',
                '&:hover': {
                  background: darkMode
                    ? 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)'
                    : 'linear-gradient(135deg, #080850 0%, #1e3a8a 100%)',
                  boxShadow: darkMode
                    ? '0 12px 40px rgba(96, 165, 250, 0.5)'
                    : '0 12px 40px rgba(10, 10, 92, 0.4)',
                },
              }}
            >
              <MenuIcon />
            </Fab>
          )}

          {/* Mobile Drawer for Conversations */}
          <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={toggleMobileDrawer}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: '85%',
                maxWidth: 360,
                height: '100%',
                background: darkMode
                  ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)'
                  : '#ffffff',
                backdropFilter: 'blur(20px)',
                borderRight: darkMode
                  ? '1.5px solid rgba(30, 64, 175, 0.3)'
                  : '1px solid #e5e7eb',
                boxShadow: darkMode
                  ? '0 30px 90px rgba(10, 10, 92, 0.6), 0 0 0 1px rgba(10, 10, 92, 0.3) inset'
                  : '0 20px 60px rgba(10, 10, 92, 0.08), 0 0 0 1px rgba(10, 10, 92, 0.04) inset',
              },
            }}
          >
            {conversationListContent}
          </Drawer>

          {/* Show conversation list when no conversation is selected */}
          {!selectedConversation && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                background: darkMode
                  ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)'
                  : '#ffffff',
              }}
            >
              {conversationListContent}
            </Box>
          )}

          {/* Show message window when conversation is selected */}
          {selectedConversation && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <MessageWindow
                  conversation={selectedConversation}
                  key={selectedConversation._id}
                />
              </Box>
            </Box>
          )}
        </>
      ) : (
        /* Desktop: Right Panel - Message Window */
        <Box
          sx={{
            flexGrow: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {selectedConversation ? (
            <MessageWindow
              conversation={selectedConversation}
              key={selectedConversation._id}
            />
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: darkMode ? 'rgba(10, 10, 92, 0.05)' : '#fafbfc',
                background: darkMode
                  ? 'radial-gradient(ellipse at center, rgba(10, 10, 92, 0.2) 0%, transparent 70%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              }}
            >
              <Box
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  borderRadius: '50%',
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.2) 0%, rgba(96, 165, 250, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(10, 10, 92, 0.08) 0%, rgba(30, 64, 175, 0.04) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  border: darkMode
                    ? '2px solid rgba(96, 165, 250, 0.2)'
                    : '2px solid rgba(10, 10, 92, 0.1)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    opacity: 0.3,
                  }}
                >
                  💬
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  fontWeight: 500,
                }}
              >
                Select or start a conversation
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DirectMessagesPage;