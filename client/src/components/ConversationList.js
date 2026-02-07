import React, { useState } from 'react';
import { 
  List, ListItem, ListItemButton, ListItemAvatar, 
  Avatar, ListItemText, Typography, Box, useMediaQuery, useTheme, TextField, InputAdornment 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

const ConversationList = ({ conversations, onSelectConversation, selectedConversationId }) => {
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((convo) => {
    const otherParticipant = convo.participants.find(p => p?._id !== user?._id);
    const displayName = otherParticipant?.name || 'Unknown User';
    const initials = otherParticipant?.initials || '';
    
    return (
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      initials.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Box>
      {/* Search Box */}
      <Box 
        sx={{ 
          p: { xs: 1.5, sm: 2 },
          borderBottom: darkMode
            ? '1px solid rgba(30, 64, 175, 0.3)'
            : '1px solid #e5e7eb',
          background: darkMode
            ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 0.5) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon 
                  sx={{ 
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: { xs: 18, sm: 20 },
                  }} 
                />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <ClearIcon
                  onClick={handleClearSearch}
                  sx={{
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: { xs: 18, sm: 20 },
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: darkMode ? '#ef4444' : '#dc2626',
                    },
                  }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: { xs: '16px', sm: '18px' },
              bgcolor: darkMode ? 'rgba(30, 64, 175, 0.1)' : '#f9fafb',
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
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              fontWeight: 500,
              py: { xs: 1, sm: 1.25 },
              '&::placeholder': {
                color: darkMode ? '#6b7280' : '#9ca3af',
                opacity: 1,
              },
            },
          }}
        />
        
        {/* Search Results Count */}
        {searchQuery && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              ml: 0.5,
              color: darkMode ? '#9ca3af' : '#6b7280',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: 500,
            }}
          >
            {filteredConversations.length} {filteredConversations.length === 1 ? 'conversation' : 'conversations'} found
          </Typography>
        )}
      </Box>

      <List disablePadding sx={{ p: { xs: 0.5, sm: 1 } }}>
        {filteredConversations.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 3,
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '2.5rem', sm: '3rem' },
              opacity: 0.2,
            }}
          >
            {searchQuery ? '🔍' : '💬'}
          </Typography>
          <Typography
            sx={{
              color: darkMode ? '#9ca3af' : '#6b7280',
              fontSize: { xs: '0.9rem', sm: '0.95rem' },
              textAlign: 'center',
            }}
          >
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </Typography>
        </Box>
      ) : (
        filteredConversations.map((convo) => {
          const otherParticipant = convo.participants.find(p => p?._id !== user?._id);
          const displayName = otherParticipant?.name || 'Unknown User';
          const avatarSrc = otherParticipant?.profilePicture || '';
          const initials = otherParticipant?.initials || '';
          const titleText = initials ? `[${initials}] ${displayName}` : displayName;
          const isSelected = selectedConversationId === convo._id;

          // Highlight matching text
          const highlightText = (text) => {
            if (!searchQuery.trim()) return text;
            
            const regex = new RegExp(`(${searchQuery})`, 'gi');
            const parts = text.split(regex);
            
            return parts.map((part, index) => 
              regex.test(part) ? (
                <span 
                  key={index} 
                  style={{ 
                    background: darkMode ? 'rgba(251, 191, 36, 0.3)' : '#fef3c7',
                    color: darkMode ? '#fbbf24' : '#d97706',
                    fontWeight: 700,
                    padding: '2px 4px',
                    borderRadius: '3px',
                  }}
                >
                  {part}
                </span>
              ) : part
            );
          };

          return (
            <ListItem 
              key={convo._id} 
              disablePadding 
              sx={{ 
                px: { xs: 0.5, sm: 1 }, 
                mb: { xs: 0.5, sm: 0.75 },
              }}
            >
              <ListItemButton
                selected={isSelected}
                onClick={() => onSelectConversation(convo)}
                sx={{
                  borderRadius: { xs: 2, sm: 2.5 },
                  transition: 'all 0.2s ease',
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 1.5, sm: 2 },
                  '&.Mui-selected': {
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(30, 64, 175, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(10, 10, 92, 0.1) 0%, rgba(30, 64, 175, 0.08) 100%)',
                    borderLeft: `4px solid ${darkMode ? '#60a5fa' : '#0a0a5c'}`,
                    boxShadow: darkMode
                      ? '0 4px 12px rgba(96, 165, 250, 0.2)'
                      : '0 2px 8px rgba(10, 10, 92, 0.1)',
                    '&:hover': {
                      background: darkMode
                        ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.25) 0%, rgba(30, 64, 175, 0.2) 100%)'
                        : 'linear-gradient(135deg, rgba(10, 10, 92, 0.12) 0%, rgba(30, 64, 175, 0.1) 100%)',
                    },
                  },
                  '&:hover': {
                    background: darkMode
                      ? 'rgba(30, 64, 175, 0.1)'
                      : 'rgba(10, 10, 92, 0.05)',
                    transform: isMobile ? 'none' : 'translateX(4px)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={avatarSrc} 
                    alt={displayName}
                    sx={{
                      width: { xs: 44, sm: 48 },
                      height: { xs: 44, sm: 48 },
                      border: isSelected
                        ? `3px solid ${darkMode ? '#60a5fa' : '#0a0a5c'}`
                        : `2px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(10, 10, 92, 0.1)'}`,
                      boxShadow: isSelected
                        ? (darkMode
                            ? '0 4px 12px rgba(96, 165, 250, 0.4)'
                            : '0 2px 8px rgba(10, 10, 92, 0.2)')
                        : 'none',
                      transition: 'all 0.2s ease',
                      background: darkMode
                        ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(96, 165, 250, 0.2) 100%)'
                        : 'linear-gradient(135deg, rgba(10, 10, 92, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%)',
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography
                      component="div"
                      sx={{
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        color: isSelected
                          ? (darkMode ? '#60a5fa' : '#0a0a5c')
                          : (darkMode ? '#e5e7eb' : '#1e293b'),
                        mb: 0.5,
                        letterSpacing: '-0.01em',
                        transition: 'color 0.2s ease',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {highlightText(titleText)}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        fontWeight: 500,
                      }}
                      noWrap
                    >
                      {convo.lastMessageAt 
                        ? `Last active: ${new Date(convo.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`
                        : 'No messages yet'}
                    </Typography>
                  }
                  sx={{
                    ml: { xs: 1, sm: 1.5 },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })
      )}
    </List>
    </Box>
  );
};

export default ConversationList;