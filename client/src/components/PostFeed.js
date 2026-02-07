import React, { useState } from 'react';
import { Box, Typography, Avatar, CircularProgress, Paper, Button, Link, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import PostMenu from './PostMenu';
import axios from 'axios';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PushPinIcon from '@mui/icons-material/PushPin';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

// Individual Post Component
export const PostItem = ({ post, onPostHidden, onReplyClick, isModerator, onClickAuthor }) => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [isHovering, setIsHovering] = useState(false);
  const [authorMenuAnchorEl, setAuthorMenuAnchorEl] = useState(null);
  const authorMenuOpen = Boolean(authorMenuAnchorEl);

  // --- DELETE HANDLER (for PostMenu) ---
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${post._id}`, { withCredentials: true });
      // Socket event 'postUpdated' will handle UI changes
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  // --- HIDE HANDLER (for PostMenu) ---
  const handleHide = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/posts/${post._id}/hide`, {}, { withCredentials: true });
      onPostHidden(post._id); // Tell CoursePage to remove it locally
    } catch (err) {
      alert('Failed to hide post.');
    }
  };

  // --- PIN/UNPIN HANDLER (for PostMenu) ---
  const handleTogglePin = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/posts/${post._id}/pin`, {}, { withCredentials: true });
      // Socket event 'postUpdated' will handle UI changes
    } catch (err) {
      alert('Failed to toggle pin.');
    }
  };

  // --- Handler for clicking Author Avatar/Name to open DM Menu ---
  const handleAuthorClick = (event) => {
    // Don't open menu for own profile or if handler is missing
    if (!onClickAuthor || post.author._id === user?._id) {
      return;
    }
    setAuthorMenuAnchorEl(event.currentTarget); // Anchor menu to the clicked element
  };

  // Close the Author Action Menu
  const handleAuthorMenuClose = () => {
    setAuthorMenuAnchorEl(null);
  };

  // Trigger the DM start process from the Author Action Menu
  const handleStartDmClick = () => {
    onClickAuthor(post.author); // Call the original handler passed from CoursePage
    handleAuthorMenuClose();
  };

  // --- Render logic for deleted posts ---
  if (post.isDeleted) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          display: 'flex',
          mb: { xs: 1, sm: 1.5 },
          alignItems: 'center',
          opacity: 0.7,
          borderRadius: { xs: 2, sm: 3 },
          background: darkMode
            ? 'rgba(30, 64, 175, 0.05)'
            : '#f9fafb',
          border: darkMode
            ? '1px solid rgba(96, 165, 250, 0.15)'
            : '1px solid #e5e7eb',
        }}
      >
        <DeleteOutlineIcon 
          sx={{ 
            mr: { xs: 1.5, sm: 2 }, 
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
          }} 
        />
        <Typography 
          variant="body2" 
          sx={{ 
            fontStyle: 'italic', 
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
          }}
        >
          {post.author.name} deleted a message
        </Typography>
      </Paper>
    );
  }

  // --- Regular Post Render Logic ---
  const attachment = post.attachments && post.attachments[0];
  const isImage = attachment && attachment.url.match(/\.(jpeg|jpg|gif|png)$/i);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        mb: { xs: 1.5, sm: 2 },
        position: 'relative',
        borderRadius: { xs: 2, sm: 3 },
        background: post.isPinned
          ? (darkMode 
              ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(30, 64, 175, 0.05) 100%)'
              : 'linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%)')
          : (darkMode 
              ? 'rgba(30, 64, 175, 0.05)'
              : '#ffffff'),
        border: post.isPinned
          ? (darkMode 
              ? '1.5px solid rgba(251, 146, 60, 0.4)'
              : '1.5px solid rgba(251, 146, 60, 0.3)')
          : (darkMode 
              ? '1px solid rgba(96, 165, 250, 0.15)'
              : '1px solid #e5e7eb'),
        borderLeft: post.isPinned 
          ? (darkMode 
              ? '4px solid #fb923c'
              : '4px solid #f97316')
          : (darkMode 
              ? '1px solid rgba(96, 165, 250, 0.15)'
              : '1px solid #e5e7eb'),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: post.isPinned
          ? (darkMode 
              ? '0 4px 12px rgba(251, 146, 60, 0.2), 0 0 0 1px rgba(251, 146, 60, 0.1) inset'
              : '0 2px 8px rgba(251, 146, 60, 0.15)')
          : 'none',
        '&:hover': {
          bgcolor: darkMode 
            ? 'rgba(30, 64, 175, 0.1)' 
            : '#f9fafb',
          boxShadow: darkMode
            ? '0 4px 12px rgba(96, 165, 250, 0.15)'
            : '0 2px 8px rgba(10, 10, 92, 0.08)',
          transform: 'translateY(-1px)',
        },
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* --- Avatar clickable for DM Menu --- */}
      <Box
        onClick={handleAuthorClick}
        sx={{ 
          cursor: post.author._id !== user?._id ? 'pointer' : 'default',
          mr: { xs: 0, sm: 2 },
          mb: { xs: 1.5, sm: 0 },
          display: 'flex',
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: { xs: 1.5, sm: 0 },
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: post.author._id !== user?._id ? 'scale(1.05)' : 'none',
          },
        }}
      >
        <Avatar
          src={post.author.profilePicture}
          alt={post.author.name}
          sx={{ 
            width: { xs: 36, sm: 40, md: 44 },
            height: { xs: 36, sm: 40, md: 44 },
            border: darkMode 
              ? '2px solid rgba(96, 165, 250, 0.2)'
              : '2px solid rgba(10, 10, 92, 0.1)',
            boxShadow: darkMode
              ? '0 2px 8px rgba(96, 165, 250, 0.2)'
              : '0 2px 8px rgba(10, 10, 92, 0.1)',
          }}
        />
        
        {/* Mobile: Show name next to avatar */}
        {isMobile && (
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
              {post.isPinned && (
                <PushPinIcon 
                  fontSize="small" 
                  sx={{ 
                    color: darkMode ? '#fb923c' : '#f97316',
                    fontSize: '1rem',
                  }} 
                />
              )}
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: darkMode ? '#ffffff' : '#0a0a5c',
                }}
              >
                {post.author.initials ? `[${post.author.initials}]` : ''} {post.author.name}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: darkMode ? '#9ca3af' : '#6b7280',
                fontSize: '0.75rem',
              }}
            >
              {new Date(post.createdAt).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ width: '100%' }}>
        {/* Desktop/Tablet: Show author info */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {post.isPinned && (
              <PushPinIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5, 
                  color: darkMode ? '#fb923c' : '#f97316',
                  fontSize: { sm: '1rem', md: '1.1rem' },
                }} 
              />
            )}
            <Box
              onClick={handleAuthorClick}
              sx={{ 
                cursor: post.author._id !== user?._id ? 'pointer' : 'default',
                display: 'inline-block',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: post.author._id !== user?._id 
                    ? (darkMode ? '#60a5fa' : '#1e40af')
                    : 'inherit',
                },
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 700,
                  mr: 1,
                  display: 'inline',
                  fontSize: { sm: '0.95rem', md: '1rem' },
                  color: darkMode ? '#ffffff' : '#0a0a5c',
                }}
              >
                {post.author.initials ? `[${post.author.initials}]` : ''} {post.author.name}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 1,
                color: darkMode ? '#9ca3af' : '#6b7280',
                fontSize: { sm: '0.8rem', md: '0.85rem' },
              }}
            >
              {new Date(post.createdAt).toLocaleString()}
            </Typography>
          </Box>
        )}

        {/* Content */}
        {post.content && (
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              mb: 1.5,
              fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
              lineHeight: 1.6,
              color: darkMode ? '#e5e7eb' : '#1f2937',
            }}
          >
            {post.content}
          </Typography>
        )}

        {/* Attachment */}
        {attachment && (
          <Box sx={{ my: { xs: 1.5, sm: 2 } }}>
            {isImage ? (
              <Link 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{
                  display: 'inline-block',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: darkMode
                      ? '0 8px 24px rgba(96, 165, 250, 0.3)'
                      : '0 8px 24px rgba(10, 10, 92, 0.15)',
                  },
                }}
              >
                <img 
                  src={attachment.url} 
                  alt={attachment.fileName} 
                  style={{ 
                    maxWidth: isMobile ? '100%' : '300px',
                    maxHeight: isMobile ? '250px' : '200px',
                    borderRadius: '8px',
                    border: darkMode 
                      ? '1px solid rgba(96, 165, 250, 0.2)'
                      : '1px solid #e5e7eb',
                  }} 
                />
              </Link>
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: { xs: 1.5, sm: 2 },
                  display: 'inline-flex',
                  alignItems: 'center',
                  maxWidth: isMobile ? '100%' : 300,
                  borderRadius: 2,
                  background: darkMode
                    ? 'rgba(10, 10, 92, 0.2)'
                    : '#f9fafb',
                  border: darkMode
                    ? '1px solid rgba(96, 165, 250, 0.2)'
                    : '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
                    bgcolor: darkMode
                      ? 'rgba(30, 64, 175, 0.15)'
                      : '#ffffff',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <InsertDriveFileIcon 
                  sx={{ 
                    mr: 1.5,
                    fontSize: { xs: '1.2rem', sm: '1.3rem' },
                    color: darkMode ? '#60a5fa' : '#0a0a5c',
                  }} 
                />
                <Link 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  underline="hover"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    fontWeight: 600,
                    color: darkMode ? '#60a5fa' : '#0a0a5c',
                    '&:hover': {
                      color: darkMode ? '#93c5fd' : '#1e40af',
                    },
                  }}
                >
                  {attachment.fileName}
                </Link>
              </Paper>
            )}
          </Box>
        )}

        {/* Reply Button */}
        {onReplyClick && (
          <Button
            size={isMobile ? 'small' : 'medium'}
            startIcon={<ReplyIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />}
            onClick={() => onReplyClick(post)}
            sx={{ 
              mt: { xs: 1, sm: 1.5 },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 0.75 },
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              fontWeight: 600,
              textTransform: 'none',
              color: darkMode ? '#9ca3af' : '#6b7280',
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: darkMode ? '#60a5fa' : '#0a0a5c',
                bgcolor: darkMode
                  ? 'rgba(96, 165, 250, 0.1)'
                  : 'rgba(10, 10, 92, 0.05)',
              },
            }}
          >
            {post.replyCount > 0 
              ? `${post.replyCount} ${post.replyCount === 1 ? 'Reply' : 'Replies'}` 
              : 'Reply'}
          </Button>
        )}
      </Box>

      {/* Post Menu (Delete/Hide/Pin) - only shows on hover */}
      {isHovering && !post.isDeleted && !isMobile && ( // Don't show menu on deleted posts or mobile
        <PostMenu
          post={post}
          onDelete={handleDelete}
          onHide={handleHide}
          isModerator={isModerator}
          onTogglePin={handleTogglePin}
        />
      )}

      {/* --- Author Action Menu (for DM) --- */}
      <Menu
        anchorEl={authorMenuAnchorEl}
        open={authorMenuOpen}
        onClose={handleAuthorMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#2d2d2d' : '#ffffff',
            borderRadius: 2,
            mt: 1,
            boxShadow: darkMode
              ? '0 10px 40px rgba(0, 0, 0, 0.5)'
              : '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: darkMode
              ? '1px solid rgba(96, 165, 250, 0.2)'
              : '1px solid #e5e7eb',
            '& .MuiMenuItem-root': {
              color: darkMode ? '#ffffff' : '#000000',
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
              fontWeight: 600,
              '&:hover': {
                bgcolor: darkMode
                  ? 'rgba(96, 165, 250, 0.1)'
                  : '#f3f4f6',
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleStartDmClick}>
          Direct message {post.author.name}
        </MenuItem>
        {/* Add "View Profile" later */}
      </Menu>
      {/* --- END Author Menu --- */}
    </Paper>
  );
};

// This is the main feed component (parent)
const PostFeed = ({ posts, loading, onPostHidden, onReplyClick, isModerator, onClickAuthor }) => {
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 4 },
        }}
      >
        <CircularProgress 
          sx={{
            color: darkMode ? '#60a5fa' : '#0a0a5c',
          }}
          size={isMobile ? 40 : 50}
        />
      </Box>
    );
  }

  // Sort posts - Pinned first, then by time
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // If same pin status, sort by time (oldest first in feed)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const topLevelPosts = sortedPosts.filter(p => !p.parentPost);

  if (topLevelPosts.length === 0) {
    return (
      <Box 
        sx={{ 
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
        }}
      >
        <Typography 
          sx={{
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: { xs: '0.9rem', sm: '1rem' },
          }}
        >
          No messages in this board yet. Be the first to post!
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        flexGrow: 1,
        overflowY: 'auto',
        p: { xs: 1.5, sm: 2 },
        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-track': {
          background: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f3f4f6',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          background: darkMode
            ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.6) 0%, rgba(96, 165, 250, 0.4) 100%)'
            : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
          borderRadius: 4,
          '&:hover': {
            background: darkMode
              ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.8) 0%, rgba(96, 165, 250, 0.6) 100%)'
              : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
          },
        },
      }}
    >
      {topLevelPosts.map(post => (
        <PostItem
          key={post._id}
          post={post}
          onPostHidden={onPostHidden}
          onReplyClick={onReplyClick}
          isModerator={isModerator}
          onClickAuthor={onClickAuthor}
        />
      ))}
    </Box>
  );
};

export default PostFeed;