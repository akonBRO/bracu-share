import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom'; 
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SectionManager from '../components/SectionManager';
import { useDarkMode } from '../context/DarkModeContext';

const ManageCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 4 },
        minHeight: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)',
        background: darkMode
          ? '#000000'
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header Section - Responsive Layout */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5, md: 2 },
          position: 'relative',
          zIndex: 1,
          flexWrap: isMobile ? 'nowrap' : 'wrap',
        }}
      >
        {/* Back Button - Touch Optimized */}
        <Tooltip 
          title={isMobile ? "" : "Back to Course"} 
          placement="right"
          disableHoverListener={isMobile}
        >
          <IconButton
            onClick={() => navigate(`/course/${courseId}`)}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: darkMode ? '#60a5fa' : '#0a0a5c',
              bgcolor: darkMode ? 'rgba(30, 64, 175, 0.2)' : 'rgba(10, 10, 92, 0.05)',
              transition: 'all 0.3s ease',
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40,
              '&:hover': {
                bgcolor: darkMode ? 'rgba(30, 64, 175, 0.3)' : 'rgba(10, 10, 92, 0.1)',
                transform: isMobile ? 'scale(1.05)' : 'translateX(-4px)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
          </IconButton>
        </Tooltip>

        {/* Accent Bar - Responsive Size */}
        <Box
          sx={{
            width: { xs: 3, sm: 4, md: 5 },
            height: { xs: 28, sm: 36, md: 44 },
            background: darkMode
              ? 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)'
              : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
            borderRadius: 1,
            boxShadow: darkMode
              ? '0 4px 12px rgba(96, 165, 250, 0.3)'
              : '0 2px 8px rgba(10, 10, 92, 0.15)',
            flexShrink: 0,
          }}
        />
        
        {/* Title - Responsive Typography */}
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{
            fontWeight: 700,
            background: darkMode
              ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
              : '#0a0a5c',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: { 
              xs: '1.25rem', 
              sm: '1.5rem', 
              md: '1.75rem',
              lg: '2rem' 
            },
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: isMobile ? 'nowrap' : 'normal',
          }}
        >
          {isMobile ? 'Manage' : 'Manage Course'}
        </Typography>
      </Box>

      {/* Content Container - Responsive Paper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3, md: 4 },
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          background: darkMode
            ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)'
            : '#ffffff',
          backdropFilter: 'blur(20px)',
          border: darkMode
            ? `${isMobile ? '1px' : '1.5px'} solid rgba(30, 64, 175, 0.3)`
            : '1px solid #e5e7eb',
          boxShadow: darkMode
            ? isMobile 
              ? '0 15px 45px rgba(10, 10, 92, 0.5), 0 0 0 1px rgba(10, 10, 92, 0.25) inset'
              : '0 30px 90px rgba(10, 10, 92, 0.6), 0 0 0 1px rgba(10, 10, 92, 0.3) inset, 0 0 40px rgba(30, 64, 175, 0.2)'
            : isMobile
              ? '0 10px 30px rgba(10, 10, 92, 0.06), 0 0 0 1px rgba(10, 10, 92, 0.03) inset'
              : '0 20px 60px rgba(10, 10, 92, 0.08), 0 0 0 1px rgba(10, 10, 92, 0.04) inset',
          maxWidth: '100%',
          mx: 'auto',
        }}
      >
        <SectionManager courseId={courseId} />
      </Paper>

      {isMobile && (
        <Box sx={{ height: 20 }} />
      )}
    </Box>
  );
};

export default ManageCoursePage;