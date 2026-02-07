import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, TextField, IconButton, CircularProgress, Alert, Avatar, Paper, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';
import { useDarkMode } from '../context/DarkModeContext';

const MessageWindow = ({ conversation }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const { darkMode } = useDarkMode();
  const { refetchDmCount } = useNotifications();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const conversationId = conversation._id;
  const stateRef = useRef({ userId: user?._id, conversationId: conversationId });

  useEffect(() => {
    stateRef.current = { userId: user?._id, conversationId: conversationId };
  }, [user, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/conversations/${conversationId}/messages`,
        { withCredentials: true }
      );
      setMessages(data);
      refetchDmCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages.');
    }
    setLoading(false);
  }, [conversationId, refetchDmCount]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!socket) return;
    const handleNewDM = (incomingMessage) => {
      const { userId, conversationId: currentId } = stateRef.current;
      if (incomingMessage.conversation === currentId) {
        if (incomingMessage.sender._id !== userId) {
          setMessages(prev => [...prev, incomingMessage]);
        }
      }
    };
    socket.on('dmReceived', handleNewDM);
    return () => socket.off('dmReceived', handleNewDM);
  }, [socket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || isSending) return;
    setIsSending(true);
    const content = newMessage;
    setNewMessage('');

    try {
      const { data: sentMessage } = await axios.post(
        `http://localhost:5000/api/conversations/${conversationId}/messages`,
        { content },
        { withCredentials: true }
      );
      setMessages(prev => [...prev, sentMessage]);
    } catch (err) {
      setError('Failed to send message.');
      setNewMessage(content);
    }
    setIsSending(false);
  };

  const otherParticipant = conversation.participants.find(p => p?._id !== user?._id);
  const headerTitle = otherParticipant?.name || 'Conversation';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      bgcolor: darkMode ? 'rgba(10, 10, 92, 0.05)' : '#fafbfc',
      background: darkMode
        ? 'radial-gradient(ellipse at top, rgba(10, 10, 92, 0.15) 0%, transparent 60%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      position: 'relative' 
    }}>
      
      {/* Header */}
      <Box sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 },
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: darkMode
          ? '1px solid rgba(30, 64, 175, 0.3)'
          : '1px solid #e5e7eb',
        background: darkMode
          ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.4) 0%, rgba(2, 6, 23, 0.6) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: darkMode
          ? '0 4px 12px rgba(10, 10, 92, 0.3)'
          : '0 2px 8px rgba(10, 10, 92, 0.05)',
        zIndex: 10
      }}>
        <Avatar 
          src={otherParticipant?.avatar} 
          sx={{ 
            width: { xs: 40, sm: 44 }, 
            height: { xs: 40, sm: 44 }, 
            border: `3px solid ${darkMode ? '#60a5fa' : '#0a0a5c'}`,
            boxShadow: darkMode
              ? '0 4px 12px rgba(96, 165, 250, 0.4)'
              : '0 2px 8px rgba(10, 10, 92, 0.2)',
          }}
        >
          {headerTitle.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              background: darkMode
                ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                : '#0a0a5c',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.01em',
            }}
          >
            {headerTitle}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: darkMode ? '#9ca3af' : '#6b7280',
              fontSize: '0.8rem',
            }}
          >
            Direct Message
          </Typography>
        </Box>
      </Box>

      {/* Message List */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: { xs: 2, sm: 2.5, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        '&::-webkit-scrollbar': { 
          width: 10 
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
        }
      }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress 
              size={40} 
              sx={{ color: darkMode ? '#60a5fa' : '#0a0a5c' }}
            />
          </Box>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : undefined,
              border: darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
            }}
          >
            {error}
          </Alert>
        )}
        
        {!loading && messages.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8,
            gap: 2
          }}>
            <Typography 
              sx={{ 
                fontSize: '3rem',
                opacity: 0.3,
              }}
            >
              💬
            </Typography>
            <Typography 
              sx={{ 
                color: darkMode ? '#9ca3af' : '#6b7280',
                fontSize: '0.95rem',
              }}
            >
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        )}
        
        {!loading && messages.map((msg) => {
          const isMe = msg.sender._id === user?._id;
          return (
            <Box key={msg._id} sx={{ 
              display: 'flex', 
              justifyContent: isMe ? 'flex-end' : 'flex-start',
              width: '100%',
              animation: 'fadeIn 0.3s ease-in',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Paper 
                elevation={0} 
                sx={{
                  p: { xs: 1.2, sm: 1.5 },
                  px: { xs: 2, sm: 2.5 },
                  maxWidth: { xs: '85%', sm: '75%' },
                  borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: isMe 
                    ? (darkMode 
                        ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)' 
                        : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)')
                    : (darkMode 
                        ? 'rgba(30, 64, 175, 0.15)' 
                        : '#ffffff'),
                  color: isMe ? '#ffffff' : (darkMode ? '#e5e7eb' : '#1e293b'),
                  border: !isMe 
                    ? (darkMode 
                        ? '1px solid rgba(96, 165, 250, 0.2)' 
                        : '1px solid #e5e7eb') 
                    : 'none',
                  boxShadow: isMe 
                    ? (darkMode
                        ? '0 4px 16px rgba(96, 165, 250, 0.25)'
                        : '0 4px 16px rgba(10, 10, 92, 0.2)')
                    : (darkMode
                        ? '0 2px 8px rgba(10, 10, 92, 0.2)'
                        : '0 2px 8px rgba(0, 0, 0, 0.05)'),
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-1px)',
                  }
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    lineHeight: 1.6, 
                    fontWeight: 400,
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    textAlign: 'right', 
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    opacity: isMe ? 0.8 : 0.6, 
                    mt: 0.5,
                    fontWeight: 500
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
              </Paper>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 },
          background: darkMode
            ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.4) 0%, rgba(2, 6, 23, 0.6) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: 'blur(10px)',
          borderTop: darkMode
            ? '1px solid rgba(30, 64, 175, 0.3)'
            : '1px solid #e5e7eb',
          boxShadow: darkMode
            ? '0 -4px 12px rgba(10, 10, 92, 0.3)'
            : '0 -2px 8px rgba(10, 10, 92, 0.05)',
        }}
      >
        <TextField
          fullWidth
          placeholder={isMobile ? "Message..." : "Write your message..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
          autoComplete="off"
          multiline={!isMobile}
          maxRows={isMobile ? 1 : 3}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: isMobile ? '20px' : '24px',
              bgcolor: darkMode ? 'rgba(30, 64, 175, 0.1)' : '#f9fafb',
              pr: 1,
              transition: 'all 0.2s ease',
              '& fieldset': { 
                borderColor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb',
              },
              '&:hover fieldset': { 
                borderColor: darkMode ? 'rgba(96, 165, 250, 0.4)' : '#d1d5db',
              },
              '&.Mui-focused fieldset': { 
                borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
                borderWidth: '2px',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: darkMode ? '#ffffff' : '#0f172a',
              fontSize: { xs: '0.9rem', sm: '0.95rem' },
              fontWeight: 400,
              py: { xs: 1, sm: 1.5 },
            }
          }}
          InputProps={{
            endAdornment: (
              <Tooltip title={newMessage.trim() === '' ? 'Type a message' : 'Send message'} placement="top">
                <span>
                  <IconButton 
                    type="submit" 
                    disabled={isSending || newMessage.trim() === ''}
                    sx={{ 
                      background: darkMode
                        ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
                        : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                      color: '#ffffff',
                      width: { xs: 34, sm: 38 },
                      height: { xs: 34, sm: 38 },
                      boxShadow: darkMode
                        ? '0 4px 12px rgba(96, 165, 250, 0.3)'
                        : '0 4px 12px rgba(10, 10, 92, 0.25)',
                      '&:hover': { 
                        background: darkMode
                          ? 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)'
                          : 'linear-gradient(135deg, #1e40af 0%, #0a0a5c 100%)',
                        transform: isMobile ? 'scale(1.02)' : 'scale(1.05)',
                        boxShadow: darkMode
                          ? '0 6px 16px rgba(96, 165, 250, 0.4)'
                          : '0 6px 16px rgba(10, 10, 92, 0.35)',
                      },
                      '&.Mui-disabled': {
                        background: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#e5e7eb',
                        color: darkMode ? 'rgba(255,255,255,0.3)' : '#9ca3af'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSending ? (
                      <CircularProgress size={isMobile ? 16 : 18} sx={{ color: '#ffffff' }} />
                    ) : (
                      <SendIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default MessageWindow;