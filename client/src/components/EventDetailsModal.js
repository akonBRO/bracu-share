import React, { useState } from 'react';
import { Modal, Box, Typography, Button, IconButton, Divider, CircularProgress, Alert, Chip, Backdrop, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import EventModal from './EventModal';

const EventDetailsModal = ({ event, open, handleClose, onEventModified }) => {
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Check if current user can modify (creator or superadmin)
  const canModify = event.createdBy._id === user._id || user.role === 'superadmin';

  // Get event type display text
  const getEventTypeDisplay = () => {
    if (event.eventType === 'other' && event.otherTypeText) {
      return event.otherTypeText;
    }
    const typeMap = {
      quiz: 'Quiz',
      assignment: 'Assignment',
      midterm: 'Midterm Exam',
      lab_final: 'Lab Final',
      deadline: 'Deadline',
      other: 'Other',
    };
    return typeMap[event.eventType] || event.eventType;
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }
    setLoadingDelete(true);
    setDeleteError('');
    try {
      await axios.delete(`http://localhost:5000/api/events/${event._id}`, {
        withCredentials: true,
      });
      onEventModified();
      handleClose(); 
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete event.');
    }
    setLoadingDelete(false);
  };

  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  // Handler for submitting the EDIT form
  const handleUpdateEvent = async (eventData) => {
    try {
      await axios.put(
        `http://localhost:5000/api/events/${event._id}`,
        eventData,
        { withCredentials: true }
      );
      onEventModified(); 
      handleCloseEditModal();
      handleClose();
    } catch (error) {
       console.error("Failed to update event:", error);
       throw error; 
    }
  };

  return (
    <>
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
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '500px', md: '550px' },
              maxWidth: '550px',
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
                p: { xs: 2.5, sm: 3 },
                pb: { xs: 2, sm: 2.5 },
                borderBottom: darkMode 
                  ? '1px solid rgba(96, 165, 250, 0.2)' 
                  : '1px solid #e5e7eb',
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.3) 0%, rgba(30, 64, 175, 0.1) 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Color Indicator */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${event.color || '#3b82f6'} 0%, rgba(${event.colorRgb || '59, 130, 246'}, 0.8) 100%)`,
                    border: darkMode 
                      ? '2px solid rgba(96, 165, 250, 0.3)' 
                      : '2px solid rgba(10, 10, 92, 0.2)',
                    boxShadow: `0 4px 12px rgba(${event.colorRgb || '59, 130, 246'}, 0.4)`,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    color: darkMode ? '#ffffff' : '#0a0a5c',
                  }}
                >
                  Event Details
                </Typography>
              </Box>

              {/* Close Button */}
              <IconButton
                onClick={handleClose}
                sx={{
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
            <Box sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
              {/* Event Title */}
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  fontWeight: 700,
                  fontSize: { xs: '1.35rem', sm: '1.5rem' },
                  color: darkMode ? '#ffffff' : '#000000',
                  lineHeight: 1.3,
                }}
              >
                {event.title}
              </Typography>

              {/* Event Type Chip */}
              <Chip
                label={getEventTypeDisplay()}
                sx={{
                  mb: 2.5,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  bgcolor: darkMode 
                    ? 'rgba(96, 165, 250, 0.15)' 
                    : 'rgba(10, 10, 92, 0.1)',
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                  border: darkMode 
                    ? '1px solid rgba(96, 165, 250, 0.3)' 
                    : '1px solid rgba(10, 10, 92, 0.2)',
                }}
              />

              {/* Description */}
              {event.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: darkMode ? '#d1d5db' : '#374151',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {event.description}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ 
                my: 2.5,
                borderColor: darkMode 
                  ? 'rgba(96, 165, 250, 0.15)' 
                  : 'rgba(10, 10, 92, 0.1)',
              }} />

              {/* Date/Time Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Start Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarTodayIcon 
                    sx={{ 
                      fontSize: '1.2rem',
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                    }} 
                  />
                  <Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        display: 'block',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Start Date & Time
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: darkMode ? '#ffffff' : '#000000',
                        fontWeight: 500,
                      }}
                    >
                      {event.start.toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Box>

                {/* End Date (if exists and different from start) */}
                {event.end && event.end.getTime() !== event.start.getTime() && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccessTimeIcon 
                      sx={{ 
                        fontSize: '1.2rem',
                        color: darkMode ? '#60a5fa' : '#0a0a5c',
                      }} 
                    />
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: darkMode ? '#9ca3af' : '#6b7280',
                          display: 'block',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        End Date & Time
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: darkMode ? '#ffffff' : '#000000',
                          fontWeight: 500,
                        }}
                      >
                        {event.end.toLocaleString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Creator Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PersonIcon 
                    sx={{ 
                      fontSize: '1.2rem',
                      color: darkMode ? '#60a5fa' : '#0a0a5c',
                    }} 
                  />
                  <Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        display: 'block',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Created By
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: darkMode ? '#ffffff' : '#000000',
                        fontWeight: 500,
                      }}
                    >
                      {event.createdBy.name} 
                      {event.createdBy.initials && (
                        <Typography 
                          component="span" 
                          sx={{ 
                            color: darkMode ? '#9ca3af' : '#6b7280',
                            ml: 0.5,
                          }}
                        >
                          [{event.createdBy.initials}]
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Error Alert */}
              {deleteError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2.5,
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(239, 68, 68, 0.1)' : undefined,
                    border: darkMode ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
                  }}
                >
                  {deleteError}
                </Alert>
              )}
            </Box>

            {/* Footer with Action Buttons */}
            {canModify && (
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
                  variant="outlined"
                  color="error"
                  startIcon={loadingDelete ? <CircularProgress size={16} color="inherit"/> : <DeleteIcon />}
                  onClick={handleDelete}
                  disabled={loadingDelete}
                  sx={{
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    borderRadius: 2,
                    order: { xs: 2, sm: 1 },
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                    },
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleOpenEditModal}
                  sx={{
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
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
                  }}
                >
                  Edit
                </Button>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Edit Event Modal */}
      <EventModal
         open={editModalOpen}
         handleClose={handleCloseEditModal}
         onCreateEvent={handleUpdateEvent}
         boardName={event.title}
         isEditMode={true}
         initialData={event}
      />
    </>
  );
};

export default EventDetailsModal;