import React, { useState } from 'react';
import { 
  Box, TextField, IconButton, CircularProgress, Chip, Tooltip, useMediaQuery, useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';
import { useDarkMode } from '../context/DarkModeContext';

const MessageInput = ({ onSendPost, loading, isModerator, onAddEventClick }) => {
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || (content.trim() === '' && !file)) return;

    onSendPost(content, null, file);
    setContent('');
    setFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddEventClick = () => {
    if (onAddEventClick) onAddEventClick();
  };

  // Responsive Icon Style
  const actionIconStyle = {
    color: darkMode ? '#9ca3af' : '#64748b',
    transition: 'all 0.2s ease',
    mx: isMobile ? 0.25 : 0.5,
    '&:hover': {
      color: darkMode ? '#60a5fa' : '#0a0a5c',
      bgcolor: darkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(10, 10, 92, 0.08)',
      transform: 'translateY(-2px)',
    }
  };

  return (
    <Box sx={{ 
      p: isMobile ? 1.5 : isTablet ? 2 : 2.5,
      borderTop: darkMode 
        ? '1px solid rgba(30, 64, 175, 0.3)' 
        : '1px solid #e5e7eb',
      background: darkMode
        ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.4) 0%, rgba(2, 6, 23, 0.6) 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      backdropFilter: 'blur(10px)',
      boxShadow: darkMode
        ? '0 -4px 12px rgba(10, 10, 92, 0.3)'
        : '0 -2px 8px rgba(10, 10, 92, 0.05)',
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
    }}>
      
      {/* File Attachment Chip - Responsive */}
      {file && (
        <Box sx={{ 
          mb: isMobile ? 1.5 : 2, 
          display: 'flex', 
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <Chip
            icon={<AttachFileIcon sx={{ fontSize: isMobile ? 14 : 16, color: 'inherit !important' }} />}
            label={
              isMobile && file.name.length > 20 
                ? `${file.name.substring(0, 20)}...` 
                : file.name
            }
            onDelete={() => setFile(null)}
            deleteIcon={<CloseIcon sx={{ fontSize: isMobile ? 16 : 18 }} />}
            sx={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.2) 0%, rgba(96, 165, 250, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(10, 10, 92, 0.08) 0%, rgba(30, 64, 175, 0.05) 100%)',
              color: darkMode ? '#60a5fa' : '#0a0a5c',
              fontWeight: 600,
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              borderRadius: isMobile ? '10px' : '12px',
              border: darkMode 
                ? '1px solid rgba(96, 165, 250, 0.3)' 
                : '1px solid rgba(10, 10, 92, 0.15)',
              px: isMobile ? 1 : 1.5,
              py: isMobile ? 1.5 : 2,
              maxWidth: '100%',
              boxShadow: darkMode
                ? '0 2px 8px rgba(96, 165, 250, 0.2)'
                : '0 2px 8px rgba(10, 10, 92, 0.1)',
              '& .MuiChip-deleteIcon': {
                color: darkMode ? '#9ca3af' : '#6b7280',
                transition: 'color 0.2s ease',
                '&:hover': { 
                  color: '#ef4444' 
                }
              },
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                px: isMobile ? 0.5 : 1,
              }
            }}
          />
        </Box>
      )}

      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          display: 'flex', 
          alignItems: 'flex-end',
          gap: isMobile ? 0.75 : isTablet ? 1 : 1.5,
          flexWrap: 'nowrap'
        }}
      >
        {/* Attachment Actions - Responsive Layout */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 0.25 : 0.5,
            p: isMobile ? 0.25 : 0.5,
            borderRadius: isMobile ? 1.5 : 2,
            bgcolor: darkMode ? 'rgba(30, 64, 175, 0.1)' : 'rgba(10, 10, 92, 0.04)',
            flexShrink: 0,
          }}
        >
          <Tooltip title="Attach File" placement="top" arrow>
            <IconButton 
              component="label" 
              size={isMobile ? 'small' : 'medium'}
              sx={{
                ...actionIconStyle,
                padding: isMobile ? '6px' : '8px',
              }}
            >
              <AttachFileIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
              <input type="file" hidden onChange={handleFileChange} />
            </IconButton>
          </Tooltip>

          {isModerator && (
            <Tooltip title="Create Event" placement="top" arrow>
              <IconButton 
                onClick={handleAddEventClick} 
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  ...actionIconStyle,
                  padding: isMobile ? '6px' : '8px',
                }}
              >
                <EventIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Text Input - Fully Responsive */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder={isMobile ? "Message..." : "Type a message or share updates..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          autoComplete="off"
          multiline
          maxRows={isMobile ? 3 : 4}
          sx={{
            flex: 1,
            minWidth: 0,
            '& .MuiOutlinedInput-root': {
              borderRadius: isMobile ? '16px' : '20px',
              bgcolor: darkMode ? 'rgba(30, 64, 175, 0.08)' : '#f9fafb',
              pr: isMobile ? 0.5 : 1,
              transition: 'all 0.2s ease',
              '& fieldset': { 
                borderColor: darkMode 
                  ? 'rgba(96, 165, 250, 0.2)' 
                  : '#e5e7eb' 
              },
              '&:hover fieldset': { 
                borderColor: darkMode 
                  ? 'rgba(96, 165, 250, 0.4)' 
                  : '#d1d5db' 
              },
              '&.Mui-focused fieldset': { 
                borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
                borderWidth: isMobile ? '1.5px' : '2px'
              },
            },
            '& .MuiOutlinedInput-input': {
              color: darkMode ? '#ffffff' : '#0f172a',
              fontSize: isMobile ? '0.875rem' : '0.95rem',
              fontWeight: 400,
              py: isMobile ? 1.25 : 1.5,
              px: isMobile ? 1.25 : 1.5,
              '&::placeholder': {
                color: darkMode ? '#6b7280' : '#9ca3af',
                opacity: 1,
              }
            }
          }}
          InputProps={{
            endAdornment: (
              <Tooltip 
                title={
                  content.trim() === '' && !file 
                    ? 'Type a message or attach a file' 
                    : 'Send message'
                }
                placement="top"
                arrow
              >
                <span>
                  <IconButton 
                    type="submit" 
                    disabled={loading || (content.trim() === '' && !file)}
                    sx={{ 
                      background: darkMode
                        ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
                        : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                      color: '#ffffff',
                      width: isMobile ? 32 : 38,
                      height: isMobile ? 32 : 38,
                      minWidth: isMobile ? 32 : 38,
                      minHeight: isMobile ? 32 : 38,
                      boxShadow: darkMode
                        ? '0 4px 12px rgba(96, 165, 250, 0.3)'
                        : '0 4px 12px rgba(10, 10, 92, 0.25)',
                      transition: 'all 0.2s ease',
                      ml: isMobile ? 0.5 : 1,
                      '&:hover': { 
                        background: darkMode
                          ? 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)'
                          : 'linear-gradient(135deg, #1e40af 0%, #0a0a5c 100%)',
                        transform: isMobile ? 'scale(1.05)' : 'scale(1.08) rotate(-8deg)',
                        boxShadow: darkMode 
                          ? '0 6px 20px rgba(96, 165, 250, 0.5)' 
                          : '0 6px 20px rgba(10, 10, 92, 0.35)'
                      },
                      '&.Mui-disabled': {
                        background: darkMode 
                          ? 'rgba(96, 165, 250, 0.1)' 
                          : '#e5e7eb',
                        color: darkMode 
                          ? 'rgba(255,255,255,0.3)' 
                          : '#9ca3af'
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={isMobile ? 14 : 18} sx={{ color: '#ffffff' }} />
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

export default MessageInput;