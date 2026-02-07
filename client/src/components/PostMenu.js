import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Box, useMediaQuery, useTheme } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import PushPinIcon from '@mui/icons-material/PushPin';

const PostMenu = ({ post, onDelete, onHide, isModerator, onTogglePin }) => {
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Check if the current user is the author or a superadmin
  const isAuthor = post.author._id === user._id || user.role === 'superadmin';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // This function calls the onDelete prop
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post for everyone?')) {
      onDelete();
      handleClose();
    }
  };

  // This function calls the onHide prop
  const handleHide = () => {
    onHide();
    handleClose();
  };

  const handleTogglePin = () => {
    onTogglePin();
    handleClose();
  };

  return (
    <Box sx={{ position: 'absolute', top: { xs: 8, sm: 10 }, right: { xs: 8, sm: 10 } }}>
      <IconButton
        size={isMobile ? 'small' : 'medium'}
        onClick={handleClick}
        sx={{
          bgcolor: darkMode 
            ? 'rgba(30, 64, 175, 0.3)' 
            : 'rgba(10, 10, 92, 0.05)',
          border: darkMode
            ? '1px solid rgba(96, 165, 250, 0.2)'
            : '1px solid rgba(10, 10, 92, 0.1)',
          transition: 'all 0.2s ease',
          '&:hover': { 
            bgcolor: darkMode 
              ? 'rgba(30, 64, 175, 0.5)' 
              : 'rgba(10, 10, 92, 0.1)',
            transform: 'scale(1.05)',
          }
        }}
      >
        <MoreVertIcon 
          fontSize="small" 
          sx={{ 
            color: darkMode ? '#60a5fa' : '#0a0a5c',
            fontSize: { xs: '1.1rem', sm: '1.2rem' },
          }} 
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
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
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: darkMode
                  ? 'rgba(96, 165, 250, 0.1)'
                  : '#f3f4f6',
              },
            },
          },
        }}
      >
        {/* --- Pin/Unpin Option --- */}
        {isModerator && !post.isDeleted && (
          <MenuItem onClick={handleTogglePin}>
            <PushPinIcon 
              fontSize="small" 
              sx={{ 
                mr: 1.5,
                color: darkMode ? '#fb923c' : '#f97316',
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }} 
            />
            {post.isPinned ? 'Unpin Post' : 'Pin Post'}
          </MenuItem>
        )}
        {/* --- END Pin/Unpin --- */}
        {isAuthor && <MenuItem onClick={handleDelete}>Delete for Everyone</MenuItem>}
        <MenuItem onClick={handleHide}>Hide for Me</MenuItem>
      </Menu>
    </Box>
  );
};

export default PostMenu;