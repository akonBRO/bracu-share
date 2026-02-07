import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemText,
  Box, Typography, Divider, IconButton,
  useMediaQuery, useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useDarkMode } from '../context/DarkModeContext';

const courseSidebarWidth = 280;

const CourseSidebar = ({ course, boards, activeBoard, onSelectBoard }) => {
  const { darkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const openDrawer = () => setMobileOpen(true);
  const closeDrawer = () => setMobileOpen(false);


  const handleDrawerToggle = () => {
    setMobileOpen(prev => !prev);
  }

  const handleBoardSelect = (board) => {
    onSelectBoard(board);
    if (isMobile) setMobileOpen(false);
  };

  // board filtering (unchanged)
  const centralBoards = boards.filter(b =>
    b.type === 'central_theory' || b.type === 'central_lab'
  );

  const generalBoards = boards.filter(b =>
    b.type === 'resource' || b.type === 'query' || b.type === 'discussion'
  );

  const sectionBoards = boards.filter(b =>
    b.type.startsWith('section_')
  );


  // Helper function to render a list of boards
  const renderBoardList = (boardList) => (
    boardList.map(board => (
      <ListItem key={board._id} disablePadding sx={{ px: 1, mb: 0.5 }}>
        <ListItemButton
          selected={activeBoard?._id === board._id}
          onClick={() => handleBoardSelect(board)}
          sx={{
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              background: darkMode
                ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(30, 64, 175, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(10, 10, 92, 0.1) 0%, rgba(30, 64, 175, 0.08) 100%)',
              borderLeft: `4px solid ${darkMode ? '#60a5fa' : '#0a0a5c'}`,
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
            },
          }}
        >
          <ListItemText
            primary={board.name}
            primaryTypographyProps={{
              sx: {
                fontWeight: activeBoard?._id === board._id ? 700 : 500,
                fontSize: '0.95rem',
                color: activeBoard?._id === board._id
                  ? (darkMode ? '#60a5fa' : '#0a0a5c')
                  : (darkMode ? '#e5e7eb' : '#374151'),
              }
            }}
          />
        </ListItemButton>
      </ListItem>
    ))
  );

  const drawerContent = (
    <>
      {/* Course Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          background: darkMode
            ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.4) 0%, rgba(2, 6, 23, 0.6) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 4,
                height: 32,
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
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '1.15rem',
                background: darkMode
                  ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                  : '#0a0a5c',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}
            >
              {course.code}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            noWrap
            sx={{
              color: darkMode ? '#9ca3af' : '#6b7280',
              fontSize: '0.875rem',
              fontWeight: 500,
              pl: 2.5,
            }}
          >
            {course.title}
          </Typography>
        </Box>

        {/* Close button for mobile */}
        {isMobile && (
          <IconButton
            onClick={closeDrawer}
            sx={{ color: darkMode ? '#60a5fa' : '#0a0a5c' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider
        sx={{
          borderColor: darkMode
            ? 'rgba(96, 165, 250, 0.15)'
            : 'rgba(10, 10, 92, 0.1)',
        }}
      />

      {/* Board Lists */}
      <Box
        sx={{
          overflow: 'auto',
          flexGrow: 1,
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
        {/* 1. Central Boards */}
        <List
          subheader={
            <Typography
              sx={{
                px: 2.5,
                pt: 2.5,
                pb: 1,
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: darkMode ? '#60a5fa' : '#0a0a5c',
              }}
            >
              Central Boards
            </Typography>
          }
        >
          {renderBoardList(centralBoards)}
        </List>

        {/* 2. General Boards */}
        <List
          subheader={
            <Typography
              sx={{
                px: 2.5,
                pt: 2.5,
                pb: 1,
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: darkMode ? '#60a5fa' : '#0a0a5c',
              }}
            >
              General
            </Typography>
          }
        >
          {renderBoardList(generalBoards)}
        </List>

        {/* 3. Section-Specific Boards */}
        {sectionBoards.length > 0 && (
          <List
            subheader={
              <Typography
                sx={{
                  px: 2.5,
                  pt: 2.5,
                  pb: 1,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                }}
              >
                My Sections
              </Typography>
            }
          >
            {renderBoardList(sectionBoards)}
          </List>
        )}
      </Box>
    </>
  );

  return (
    <>
      {/* Top Menu Button for Mobile */}
      {isMobile && !mobileOpen && (
        <IconButton
          aria-label="open menu"
          onClick={openDrawer}
          sx={{
            position: 'fixed',
            top: 72,
            left: 8,
            zIndex: 1200,
            background: 'transparent',
            color: darkMode ? '#60a5fa' : '#0a0a5c',
            '&:hover': {
              background: 'transparent',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: courseSidebarWidth,
              boxSizing: 'border-box',
              top: '64px',
              height: 'calc(100% - 64px)',
              borderRight: darkMode
                ? '1.5px solid rgba(30, 64, 175, 0.3)'
                : '1px solid #e5e7eb',
              background: darkMode
                ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)'
                : '#ffffff',
              backdropFilter: 'blur(20px)',
              boxShadow: darkMode
                ? '0 30px 90px rgba(10, 10, 92, 0.6), 0 0 0 1px rgba(10, 10, 92, 0.3) inset'
                : '0 20px 60px rgba(10, 10, 92, 0.08), 0 0 0 1px rgba(10, 10, 92, 0.04) inset',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: courseSidebarWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: courseSidebarWidth,
              boxSizing: 'border-box',
              top: '64px',
              height: 'calc(100% - 64px)',
              borderRight: darkMode
                ? '1.5px solid rgba(30, 64, 175, 0.3)'
                : '1px solid #e5e7eb',
              background: darkMode
                ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)'
                : '#ffffff',
              backdropFilter: 'blur(20px)',
              boxShadow: darkMode
                ? '0 30px 90px rgba(10, 10, 92, 0.6), 0 0 0 1px rgba(10, 10, 92, 0.3) inset'
                : '0 20px 60px rgba(10, 10, 92, 0.08), 0 0 0 1px rgba(10, 10, 92, 0.04) inset',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default CourseSidebar;