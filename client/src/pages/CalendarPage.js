import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import enUS from 'date-fns/locale/en-US';
import axios from 'axios';
import {
  Box, Typography, CircularProgress, Alert, Paper, Button,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventDetailsModal from '../components/EventDetailsModal';
import EventModal from '../components/EventModal';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup for react-big-calendar localization
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // States for creating events
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [boardSelectOpen, setBoardSelectOpen] = useState(false);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [loadingBoards, setLoadingBoards] = useState(false);

  // Fetch events for the logged-in user
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('http://localhost:5000/api/events/me', {
        withCredentials: true,
      });
      // Format events for react-big-calendar
      const formattedEvents = data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: event.end ? new Date(event.end) : new Date(event.start),
      }));
      setEvents(formattedEvents);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch calendar events.');
    }
    setLoading(false);
  }, []);

  // Fetch boards where user is a moderator
  const fetchModeratorBoards = useCallback(async () => {
    setLoadingBoards(true);
    try {
      // Fetch all courses the user is part of
      const { data: courses } = await axios.get('http://localhost:5000/api/courses', {
        withCredentials: true,
      });

      // Fetch boards for each course and filter by moderator status
      const allBoards = [];
      for (const course of courses) {
        const { data: courseBoards } = await axios.get(
          `http://localhost:5000/api/courses/${course._id}/boards`,
          { withCredentials: true }
        );
        // Filter boards where user is a moderator
        const moderatorBoards = courseBoards.filter(board =>
          board.isUserModerator || user.role === 'superadmin'
        );
        allBoards.push(...moderatorBoards.map(b => ({ ...b, courseName: course.title })));
      }
      setBoards(allBoards);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
    }
    setLoadingBoards(false);
  }, [user]);

  useEffect(() => {
    fetchEvents();
    fetchModeratorBoards();
  }, [fetchEvents, fetchModeratorBoards]);

  // Handler when an event is clicked
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedEvent(null);
  };

  // Handler for successful update/delete
  const handleEventModified = () => {
    fetchEvents();
  };

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  // Create event handlers
  const handleOpenBoardSelect = () => {
    setBoardSelectOpen(true);
  };

  const handleCloseBoardSelect = () => {
    setBoardSelectOpen(false);
    setSelectedBoard(null);
  };

  const handleBoardSelect = () => {
    if (selectedBoard) {
      setBoardSelectOpen(false);
      setCreateModalOpen(true);
    }
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setSelectedBoard(null);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await axios.post(
        `http://localhost:5000/api/boards/${selectedBoard._id}/events`,
        eventData,
        { withCredentials: true }
      );
      fetchEvents(); // Refresh events
      handleCloseCreateModal();
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  };

  const eventStyleGetter = (event) => {
    const baseColor = event.color || '#3b82f6';
    const rgbValues = event.colorRgb || '59, 130, 246';

    return {
      style: {
        backgroundColor: `rgba(${rgbValues}, 0.2)`,
        borderLeft: `6px solid ${baseColor}`,
        border: `2px solid rgba(${rgbValues}, 1.0)`,
        borderRadius: '2px',
        color: darkMode ? '#ffffff' : '#1f2937',
        fontSize: '0.8rem',
        fontWeight: '600',
        boxShadow: `0 1px 3px rgba(${rgbValues}, 0.3)`,
        transition: 'all 0.2s ease',
      },
    };
  };

  // Custom toolbar component
  const CustomToolbar = ({ date }) => {
    return (
      <Box
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: darkMode
            ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.4) 0%, rgba(2, 6, 23, 0.6) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: darkMode
            ? '1px solid rgba(30, 64, 175, 0.3)'
            : '1px solid #e5e7eb',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Previous Month Button */}
        <IconButton
          onClick={handlePreviousMonth}
          sx={{
            color: darkMode ? '#60a5fa' : '#0a0a5c',
            bgcolor: darkMode ? 'rgba(30, 64, 175, 0.2)' : 'rgba(10, 10, 92, 0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : 'rgba(10, 10, 92, 0.1)',
              transform: 'scale(1.1)',
            },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Month/Year Display with Today Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.35rem', sm: '1.6rem', md: '1.85rem' },
              background: darkMode
                ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                : '#0a0a5c',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}
          >
            {format(date, 'MMMM yyyy')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleTodayClick}
            sx={{
              py: 0.5,
              px: 2,
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'none',
              color: darkMode ? '#60a5fa' : '#0a0a5c',
              borderColor: darkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(10, 10, 92, 0.2)',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: darkMode ? '#60a5fa' : '#0a0a5c',
                bgcolor: darkMode ? 'rgba(30, 64, 175, 0.1)' : 'rgba(10, 10, 92, 0.05)',
              },
            }}
          >
            Today
          </Button>
        </Box>

        {/* Next Month Button */}
        <IconButton
          onClick={handleNextMonth}
          sx={{
            color: darkMode ? '#60a5fa' : '#0a0a5c',
            bgcolor: darkMode ? 'rgba(30, 64, 175, 0.2)' : 'rgba(10, 10, 92, 0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : 'rgba(10, 10, 92, 0.1)',
              transform: 'scale(1.1)',
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    );
  };

  if (loading) {
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

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: 'calc(100vh - 64px)',
        background: darkMode
          ? '#000000'
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating orbs for visual interest (dark mode only) */}
      {/* Floating orbs for visual interest (dark mode only) */}
      {darkMode && (
        <>
          <Box
            sx={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(30, 64, 175, 0.15) 0%, transparent 70%)',
              top: '-150px',
              right: '-100px',
              pointerEvents: 'none',
              filter: 'blur(80px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(10, 10, 92, 0.2) 0%, transparent 70%)',
              bottom: '-100px',
              left: '-80px',
              pointerEvents: 'none',
              filter: 'blur(80px)',
            }}
          />
        </>
      )}

      {/* Header Section */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left side - Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: { xs: 4, sm: 5 },
              height: { xs: 32, sm: 40 },
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
            variant="h4"
            sx={{
              fontWeight: 700,
              background: darkMode
                ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                : '#0a0a5c',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              letterSpacing: '-0.02em',
            }}
          >
            My Calendar
          </Typography>
        </Box>

        {/* Right side - Create Event Button */}
        {boards.length > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenBoardSelect}
            sx={{
              py: { xs: 1, sm: 1.2 },
              px: { xs: 2, sm: 3 },
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              fontWeight: 600,
              textTransform: 'none',
              background: darkMode
                ? '#1e40af'
                : '#0a0a5c',
              borderRadius: 2,
              boxShadow: darkMode
                ? '0 4px 12px rgba(96, 165, 250, 0.3)'
                : '0 4px 12px rgba(10, 10, 92, 0.25)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: darkMode
                  ? '0 6px 16px rgba(96, 165, 250, 0.4)'
                  : '0 6px 16px rgba(10, 10, 92, 0.35)',
                background: darkMode
                  ? '#60a5fa'
                  : 'linear-gradient(135deg, #1e40af 0%, #0a0a5c 100%)',
              },
            }}
          >
            Create Event
          </Button>
        )}
      </Box>

      {/* Calendar Container */}
      <Paper
        elevation={0}
        sx={{
          height: { xs: 'calc(100vh - 180px)', sm: 'calc(100vh - 180px)', md: 'calc(100vh - 200px)' },
          borderRadius: 4,
          overflow: 'auto',
          position: 'relative',
          zIndex: 1,
          background: darkMode
            ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)'
            : '#ffffff',
          backdropFilter: 'blur(20px)',
          border: darkMode
            ? '1.5px solid rgba(30, 64, 175, 0.3)'
            : '1px solid #e5e7eb',
          boxShadow: darkMode
            ? '0 30px 90px rgba(10, 10, 92, 0.6), 0 0 0 1px rgba(10, 10, 92, 0.3) inset, 0 0 40px rgba(30, 64, 175, 0.2)'
            : '0 20px 60px rgba(10, 10, 92, 0.08), 0 0 0 1px rgba(10, 10, 92, 0.04) inset',
          '& .rbc-calendar': {
            height: '100%',
            fontFamily: 'inherit',
          },
          '& .rbc-toolbar': {
            display: 'none',
          },
          '& .rbc-header': {
            p: { xs: 1.5, sm: 2 },
            fontWeight: 700,
            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
            color: darkMode ? '#60a5fa' : '#0a0a5c',
            background: darkMode ? 'rgba(10, 10, 92, 0.3)' : '#f8fafc',
            borderBottom: darkMode ? '2px solid rgba(30, 64, 175, 0.4)' : '2px solid #e5e7eb',
            borderLeft: darkMode ? '1px solid rgba(30, 64, 175, 0.2)' : '1px solid #f3f4f6',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          },
          '& .rbc-month-view': {
            bgcolor: 'transparent',
            border: 'none',
          },
          '& .rbc-month-row': {
            borderTop: darkMode ? '1px solid rgba(30, 64, 175, 0.15)' : '1px solid #f3f4f6',
            overflow: 'visible',
          },
          '& .rbc-day-bg': {
            borderLeft: darkMode ? '1px solid rgba(30, 64, 175, 0.15)' : '1px solid #f3f4f6',
            '&:hover': {
              background: darkMode ? 'rgba(30, 64, 175, 0.15)' : 'rgba(10, 10, 92, 0.05)',
            },
          },
          '& .rbc-off-range-bg': {
            background: darkMode ? 'rgba(10, 10, 92, 0.1)' : '#fafbfc',
          },
          '& .rbc-today': {
            background: darkMode ? 'rgba(30, 64, 175, 0.35)' : 'rgba(10, 10, 92, 0.12)',
            borderLeft: darkMode ? '1px solid rgba(30, 64, 175, 0.4)' : '1px solid rgba(10, 10, 92, 0.2)',
          },
          '& .rbc-date-cell': {
            p: { xs: 0.75, sm: 1.25 },
            textAlign: 'right',
            fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.05rem' },
            fontWeight: 600,
            color: darkMode ? '#e5e7eb' : '#374151',
          },
          '& .rbc-off-range': {
            color: darkMode ? '#4b5563' : '#d1d5db',
          },

          '& .rbc-date-cell.rbc-now': {
            fontWeight: 700,
          },

          '& .rbc-now .rbc-button-link': {
            background: darkMode
              ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
              : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
            color: '#ffffff',
            borderRadius: '50%',
            width: { xs: 28, sm: 32, md: 36 },
            height: { xs: 28, sm: 32, md: 36 },
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            boxShadow: darkMode
              ? '0 4px 12px rgba(96, 165, 250, 0.4), 0 0 20px rgba(96, 165, 250, 0.2)'
              : '0 4px 12px rgba(10, 10, 92, 0.3)',
            transition: 'all 0.3s ease',
          },

          '& .rbc-now .rbc-button-link:hover': {
            transform: 'scale(1.1)',
            boxShadow: darkMode
              ? '0 6px 16px rgba(96, 165, 250, 0.5), 0 0 30px rgba(96, 165, 250, 0.3)'
              : '0 6px 16px rgba(10, 10, 92, 0.4)',
          },

          '& .rbc-event': {
            borderRadius: '4px !important',
            px: { xs: 1, sm: 1.5 },
            py: { xs: 0.75, sm: 1 },
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            fontWeight: 600,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            marginBottom: '2px',
            '&:hover': {
              transform: 'translateX(2px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15) !important',
              filter: 'brightness(1.05)',
            },
          },
          '& .rbc-event-label': {
            fontSize: { xs: '0.65rem', sm: '0.7rem' },
            fontWeight: 700,
            opacity: 0.8,
          },
          '& .rbc-event-content': {
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          '& .rbc-event-label': {
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            fontWeight: 700,
            textShadow: darkMode ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
          },
          '& .rbc-event-content': {
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: darkMode ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
          },
          '& .rbc-row-segment': {
            padding: '1px 2px',
          },
          '& .rbc-event-overlaps': {
            boxShadow: 'none',
          },
          '& .rbc-addons-dnd-drag-preview': {
            opacity: 0.8,
          },
          '& .rbc-selected': {
            background: darkMode
              ? 'linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)'
              : 'linear-gradient(135deg, #1e40af 0%, #0a0a5c 100%)',
          },
          '& .rbc-show-more': {
            color: darkMode ? '#60a5fa' : '#0a0a5c',
            fontWeight: 700,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            mt: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              textDecoration: 'underline',
              transform: 'translateX(2px)',
            },
          },
          '& *::-webkit-scrollbar': {
            width: 10,
            height: 10,
          },
          '& *::-webkit-scrollbar-track': {
            background: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f3f4f6',
            borderRadius: 5,
          },
          '& *::-webkit-scrollbar-thumb': {
            background: darkMode
              ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.6) 0%, rgba(96, 165, 250, 0.4) 100%)'
              : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
            borderRadius: 5,
            border: darkMode ? '2px solid rgba(10, 10, 92, 0.2)' : '2px solid #f3f4f6',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: darkMode
                ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.8) 0%, rgba(96, 165, 250, 0.6) 100%)'
                : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
            },
          },
        }}
      >
        <CustomToolbar date={currentDate} />

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100% - 70px)' }}
          onSelectEvent={handleSelectEvent}
          views={[Views.MONTH]}
          view={Views.MONTH}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          toolbar={false}
          step={30}
          showMultiDayTimes
          eventPropGetter={eventStyleGetter}
        />
      </Paper>

      {/* Board Selection Dialog */}
      <Dialog
        open={boardSelectOpen}
        onClose={handleCloseBoardSelect}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
            borderRadius: 3,
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: darkMode ? '#ffffff' : '#0a0a5c',
            borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
          }}
        >
          Select a Board for Event
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth>
            <InputLabel
              sx={{
                color: darkMode ? '#b0b0b0' : '#6b7280',
                '&.Mui-focused': { color: '#0a0a5c' },
              }}
            >
              Board
            </InputLabel>
            <Select
              value={selectedBoard?._id || ''}
              onChange={(e) => {
                const board = boards.find(b => b._id === e.target.value);
                setSelectedBoard(board);
              }}
              label="Board"
              disabled={loadingBoards}
              sx={{
                borderRadius: 2,
                bgcolor: darkMode ? '#2d2d2d' : '#f9fafb',
                color: darkMode ? '#ffffff' : '#000000',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#404040' : '#e5e7eb',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#525252' : '#d1d5db',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0a0a5c',
                  borderWidth: '2px',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: darkMode ? '#2d2d2d' : '#ffffff',
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      color: darkMode ? '#ffffff' : '#000000',
                      '&:hover': {
                        bgcolor: darkMode ? '#404040' : '#f3f4f6',
                      },
                      '&.Mui-selected': {
                        bgcolor: darkMode ? '#404040' : '#e5e7eb',
                        '&:hover': {
                          bgcolor: darkMode ? '#525252' : '#d1d5db',
                        },
                      },
                    },
                  },
                },
              }}
            >
              {boards.map((board) => (
                <MenuItem key={board._id} value={board._id}>
                  {board.name} ({board.courseName})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseBoardSelect}
            sx={{
              color: darkMode ? '#b0b0b0' : '#6b7280',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBoardSelect}
            variant="contained"
            disabled={!selectedBoard}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#0a0a5c',
              '&:hover': {
                bgcolor: '#0d0d7a',
              },
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Creation Modal */}
      {
        selectedBoard && (
          <EventModal
            open={createModalOpen}
            handleClose={handleCloseCreateModal}
            onCreateEvent={handleCreateEvent}
            boardName={selectedBoard.name}
            isEditMode={false}
          />
        )
      }

      {/* Event Details Modal */}
      {
        selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            open={detailsModalOpen}
            handleClose={handleCloseDetailsModal}
            onEventModified={handleEventModified}
          />
        )
      }
    </Box >
  );
};

export default CalendarPage;