import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, TextField, Button, CircularProgress, Alert,
  Backdrop, Fade, IconButton, FormControlLabel, Checkbox, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDarkMode } from '../context/DarkModeContext';

const CreateCourseModal = ({ open, handleClose, onCourseCreated }) => {
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    semester: '',
    description: '',
    hasLab: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: '', code: '', semester: '',
        description: '', hasLab: false
      });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onCourseCreated(formData);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course.');
    }
    setLoading(false);
  };

  // Shared Input Styles from previous pattern
  const inputStyles = {
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
  };

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
          backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.4)',
        },
      }}
    >
      <Fade in={open}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '500px' },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: darkMode ? '#1a1a2e' : '#ffffff',
            borderRadius: 4,
            boxShadow: darkMode
              ? '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(96, 165, 250, 0.2)'
              : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(10, 10, 92, 0.1)',
            border: darkMode ? '1px solid rgba(96, 165, 250, 0.2)' : '1px solid rgba(10, 10, 92, 0.1)',
            // Custom Scrollbar
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': { background: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f3f4f6' },
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
              p: { xs: 2.5, sm: 3 },
              borderBottom: darkMode ? '1px solid rgba(96, 165, 250, 0.2)' : '1px solid #e5e7eb',
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
                background: darkMode
                  ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                  : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.01em',
              }}
            >
              Create New Course
            </Typography>
            
            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                color: darkMode ? '#9ca3af' : '#6b7280',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: darkMode ? '#ffffff' : '#000000',
                  bgcolor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(10, 10, 92, 0.05)',
                  transform: 'rotate(90deg)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth required
              label="Course Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              sx={inputStyles}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                fullWidth required
                label="Course Code"
                name="code"
                placeholder="e.g., CSE220"
                value={formData.code}
                onChange={handleChange}
                sx={inputStyles}
                />
                <TextField
                fullWidth required
                label="Semester"
                name="semester"
                placeholder="Summer 2025"
                value={formData.semester}
                onChange={handleChange}
                sx={inputStyles}
                />
            </Box>

            <TextField
              fullWidth
              multiline rows={2}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              sx={inputStyles}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasLab}
                  onChange={handleChange}
                  name="hasLab"
                  sx={{
                    color: darkMode ? 'rgba(96, 165, 250, 0.4)' : '#6b7280',
                    '&.Mui-checked': {
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: darkMode ? '#e5e7eb' : '#374151', fontSize: '0.9rem' }}>
                  This course includes a Lab component
                </Typography>
              }
            />
          </Box>

          {/* Footer Actions */}
          <Box
            sx={{
              p: 3,
              borderTop: darkMode ? '1px solid rgba(96, 165, 250, 0.2)' : '1px solid #e5e7eb',
              background: darkMode
                ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.2) 0%, rgba(30, 64, 175, 0.05) 100%)'
                : '#f8fafc',
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Button
              onClick={handleClose}
              sx={{ 
                textTransform: 'none', fontWeight: 600, 
                color: darkMode ? '#b0b0b0' : '#6b7280' 
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
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
                }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Course'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CreateCourseModal;