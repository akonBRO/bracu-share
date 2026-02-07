import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, TextField, Button, CircularProgress, Alert,
  Select, MenuItem, InputLabel, FormControl, Backdrop, Fade, Grid,
  Paper, alpha, IconButton
} from '@mui/material';
import DateTimePicker from 'react-datetime-picker';
import CloseIcon from '@mui/icons-material/Close';
import { useDarkMode } from '../context/DarkModeContext';
import '../styles/DateTimePicker.css';

// Available event types
const eventTypes = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'midterm', label: 'Midterm Exam' },
  { value: 'lab_final', label: 'Lab Final' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'other', label: 'Other' },
];

// Color palette with professional, classy colors
const colorPalette = [
  { value: '#3b82f6', label: 'Blue', rgb: '59, 130, 246' },
  { value: '#8b5cf6', label: 'Purple', rgb: '139, 92, 246' },
  { value: '#6366f1', label: 'Indigo', rgb: '99, 102, 241' },
  { value: '#10b981', label: 'Green', rgb: '16, 185, 129' },
  { value: '#ef4444', label: 'Red', rgb: '239, 68, 68' },
  { value: '#f97316', label: 'Orange', rgb: '249, 115, 22' },
  { value: '#06b6d4', label: 'Teal', rgb: '6, 182, 212' },
  { value: '#ec4899', label: 'Pink', rgb: '236, 72, 153' },
];

const EventModal = ({ 
  open, 
  handleClose, 
  onCreateEvent, 
  boardName, 
  isEditMode = false, 
  initialData = null 
}) => {
  const { darkMode } = useDarkMode();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('assignment');
  const [otherTypeText, setOtherTypeText] = useState('');
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorPalette[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens or closes
  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setEventType(initialData.eventType || 'assignment');
        setOtherTypeText(initialData.otherTypeText || '');
        setStart(initialData.start ? new Date(initialData.start) : new Date());
        setEnd(initialData.end ? new Date(initialData.end) : null);
        
        // Set color from initialData if exists
        const savedColor = colorPalette.find(c => c.value === initialData.color);
        setSelectedColor(savedColor || colorPalette[0]);
      } else {
        setTitle('');
        setDescription('');
        setEventType('assignment');
        setOtherTypeText('');
        setStart(new Date());
        setEnd(null);
        setSelectedColor(colorPalette[0]);
      }
      setError('');
    }
  }, [open, isEditMode, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate "Other" type has text
    if (eventType === 'other' && !otherTypeText.trim()) {
      setError('Please specify what type of event this is.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const eventData = {
      title,
      description,
      eventType,
      otherTypeText: eventType === 'other' ? otherTypeText : '',
      start: start.toISOString(),
      end: end ? end.toISOString() : null,
      color: selectedColor.value,
      colorRgb: selectedColor.rgb,
    };
    
    try {
      await onCreateEvent(eventData);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event.`);
    }
    setLoading(false);
  };

  const modalTitle = isEditMode ? 'Edit Event' : `Add Event to "${boardName}"`;
  const buttonText = isEditMode ? 'Save Changes' : 'Add Event';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: darkMode 
            ? 'rgba(0, 0, 0, 0.75)' 
            : 'rgba(0, 0, 0, 0.4)',
        },
      }}
    >
      <Fade in={open}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          className={darkMode ? 'dark-mode' : ''} 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '600px', md: '650px' },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: darkMode ? '#1a1a2e' : '#ffffff',
            borderRadius: 4,
            boxShadow: darkMode
              ? '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(96, 165, 250, 0.2)'
              : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(10, 10, 92, 0.1)',
            border: darkMode 
              ? '1px solid rgba(96, 165, 250, 0.2)' 
              : '1px solid rgba(10, 10, 92, 0.1)',
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
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              pb: { xs: 2, sm: 2.5, md: 3 },
              borderBottom: darkMode 
                ? '1px solid rgba(96, 165, 250, 0.2)' 
                : '1px solid #e5e7eb',
              background: darkMode
                ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.3) 0%, rgba(30, 64, 175, 0.1) 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              position: 'relative',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                background: darkMode
                  ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                  : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
                pr: 5,
              }}
            >
              {modalTitle}
            </Typography>
            
            {/* Close Button */}
            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                position: 'absolute',
                right: { xs: 12, sm: 16 },
                top: { xs: 12, sm: 16 },
                color: darkMode ? '#9ca3af' : '#6b7280',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: darkMode ? '#ffffff' : '#000000',
                  bgcolor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(10, 10, 92, 0.05)',
                  transform: 'rotate(90deg)',
                },
              }}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 2,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : undefined,
                  border: darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Event Title */}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              disabled={loading}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(30, 64, 175, 0.05)' : '#f9fafb',
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
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#b0b0b0' : '#6b7280',
                  '&.Mui-focused': {
                    color: darkMode ? '#60a5fa' : '#0a0a5c',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: darkMode ? '#ffffff' : '#000000',
                },
              }}
            />

            {/* Description */}
            <TextField
              margin="normal"
              fullWidth
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              disabled={loading}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(30, 64, 175, 0.05)' : '#f9fafb',
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
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#b0b0b0' : '#6b7280',
                  '&.Mui-focused': {
                    color: darkMode ? '#60a5fa' : '#0a0a5c',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: darkMode ? '#ffffff' : '#000000',
                },
              }}
            />

            {/* Event Type and Other Type Text */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={eventType === 'other' ? 6 : 12}>
                <FormControl fullWidth required disabled={loading}>
                  <InputLabel
                    sx={{
                      color: darkMode ? '#b0b0b0' : '#6b7280',
                      '&.Mui-focused': {
                        color: darkMode ? '#60a5fa' : '#0a0a5c',
                      },
                    }}
                  >
                    Event Type
                  </InputLabel>
                  <Select
                    value={eventType}
                    label="Event Type"
                    onChange={(e) => setEventType(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(30, 64, 175, 0.05)' : '#f9fafb',
                      color: darkMode ? '#ffffff' : '#000000',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? 'rgba(96, 165, 250, 0.4)' : '#d1d5db',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
                        borderWidth: '2px',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: darkMode ? '#2d2d2d' : '#ffffff',
                          borderRadius: 2,
                          mt: 1,
                          boxShadow: darkMode
                            ? '0 10px 40px rgba(0, 0, 0, 0.5)'
                            : '0 10px 40px rgba(0, 0, 0, 0.1)',
                          '& .MuiMenuItem-root': {
                            color: darkMode ? '#ffffff' : '#000000',
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                            '&:hover': {
                              bgcolor: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#f3f4f6',
                            },
                            '&.Mui-selected': {
                              bgcolor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb',
                              '&:hover': {
                                bgcolor: darkMode ? 'rgba(96, 165, 250, 0.25)' : '#d1d5db',
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {eventTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {eventType === 'other' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Specify Type"
                    value={otherTypeText}
                    onChange={(e) => setOtherTypeText(e.target.value)}
                    placeholder="e.g., Workshop, Seminar"
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(30, 64, 175, 0.05)' : '#f9fafb',
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
                      '& .MuiInputLabel-root': {
                        color: darkMode ? '#b0b0b0' : '#6b7280',
                        '&.Mui-focused': {
                          color: darkMode ? '#60a5fa' : '#0a0a5c',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        color: darkMode ? '#ffffff' : '#000000',
                      },
                    }}
                  />
                </Grid>
              )}
            </Grid>

            {/* Color Picker */}
            <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  color: darkMode ? '#e5e7eb' : '#374151',
                }}
              >
                Choose Color *
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: { xs: 2, sm: 2.5 },
                  alignItems: 'center',
                }}
              >
                {colorPalette.map((color) => (
                  <Box
                    key={color.value}
                    onClick={() => !loading && setSelectedColor(color)}
                    sx={{
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75,
                      '&:hover': {
                        transform: loading ? 'none' : 'translateY(-2px)',
                      },
                    }}
                  >
                    {/* Circular Color Dot */}
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${color.value} 0%, ${alpha(color.value, 0.9)} 100%)`,
                        border: selectedColor.value === color.value
                          ? `3px solid ${darkMode ? '#60a5fa' : '#0a0a5c'}`
                          : `2px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(10, 10, 92, 0.15)'}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: selectedColor.value === color.value
                          ? `0 6px 20px ${alpha(color.value, 0.5)}, 0 0 0 4px ${alpha(darkMode ? '#60a5fa' : '#0a0a5c', 0.15)}`
                          : `0 3px 12px ${alpha(color.value, 0.35)}`,
                        '&:hover': {
                          boxShadow: `0 8px 24px ${alpha(color.value, 0.6)}`,
                          border: `2px solid ${darkMode ? '#60a5fa' : '#0a0a5c'}`,
                          transform: 'scale(1.1)',
                        },
                        '&::after': selectedColor.value === color.value ? {
                          content: '"✓"',
                          position: 'absolute',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          color: '#ffffff',
                          textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                        } : {},
                      }}
                    />
                    
                    {/* Color Label */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        fontWeight: selectedColor.value === color.value ? 700 : 500,
                        color: selectedColor.value === color.value
                          ? (darkMode ? '#60a5fa' : '#0a0a5c')
                          : (darkMode ? '#9ca3af' : '#6b7280'),
                        transition: 'all 0.2s ease',
                        maxWidth: '70px',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {color.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Date Time Pickers */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: darkMode ? '#e5e7eb' : '#374151',
                  }}
                >
                  Start Date & Time *
                </Typography>
                <Box
                  sx={{
                    '& .react-datetime-picker': {
                      width: '100%',
                      '& .react-datetime-picker__wrapper': {
                        border: `1px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb'}`,
                        borderRadius: 2,
                        padding: '10px 12px',
                        bgcolor: darkMode ? 'rgba(30, 64, 175, 0.05)' : '#f9fafb',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: darkMode ? 'rgba(96, 165, 250, 0.4)' : '#d1d5db',
                        },
                      },
                      '& .react-datetime-picker__inputGroup': {
                        color: darkMode ? '#ffffff' : '#000000',
                      },
                      '& .react-datetime-picker__button': {
                        color: darkMode ? '#60a5fa' : '#0a0a5c',
                      },
                    },
                  }}
                >
                  <DateTimePicker
                    onChange={setStart}
                    value={start}
                    required
                    disabled={loading}
                    className="custom-datetime-picker"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: darkMode ? '#e5e7eb' : '#374151',
                  }}
                >
                  End Date & Time (Optional)
                </Typography>
                <Box
                  sx={{
                    '& .react-datetime-picker': {
                      width: '100%',
                      '& .react-datetime-picker__wrapper': {
                        border: `1px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : '#e5e7eb'}`,
                        borderRadius: 2,
                        padding: '10px 12px',
                        bgcolor: darkMode ? 'rgba(30, 64, 175, 0.05)' : '#f9fafb',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: darkMode ? 'rgba(96, 165, 250, 0.4)' : '#d1d5db',
                        },
                      },
                      '& .react-datetime-picker__inputGroup': {
                        color: darkMode ? '#ffffff' : '#000000',
                      },
                      '& .react-datetime-picker__button': {
                        color: darkMode ? '#60a5fa' : '#0a0a5c',
                      },
                    },
                  }}
                >
                  <DateTimePicker
                    onChange={setEnd}
                    value={end}
                    disabled={loading}
                    className="custom-datetime-picker"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              pt: { xs: 2, sm: 2.5 },
              borderTop: darkMode 
                ? '1px solid rgba(96, 165, 250, 0.2)' 
                : '1px solid #e5e7eb',
              background: darkMode
                ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.2) 0%, rgba(30, 64, 175, 0.05) 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 2 },
              justifyContent: 'flex-end',
            }}
          >
            <Button
              onClick={handleClose}
              disabled={loading}
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1.2, sm: 1 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                color: darkMode ? '#b0b0b0' : '#6b7280',
                borderRadius: 2,
                order: { xs: 2, sm: 1 },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#f3f4f6',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                px: { xs: 2.5, sm: 4 },
                py: { xs: 1.2, sm: 1 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                borderRadius: 2,
                order: { xs: 1, sm: 2 },
                background: darkMode
                  ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
                  : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                boxShadow: darkMode
                  ? '0 4px 12px rgba(96, 165, 250, 0.3)'
                  : '0 4px 12px rgba(10, 10, 92, 0.25)',
                '&:hover': {
                  background: darkMode
                    ? 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)'
                    : 'linear-gradient(135deg, #1e40af 0%, #0a0a5c 100%)',
                  boxShadow: darkMode
                    ? '0 6px 16px rgba(96, 165, 250, 0.4)'
                    : '0 6px 16px rgba(10, 10, 92, 0.35)',
                },
                '&:disabled': {
                  background: darkMode ? '#374151' : '#d1d5db',
                },
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={24} 
                  sx={{ color: '#ffffff' }} 
                />
              ) : (
                buttonText
              )}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default EventModal;