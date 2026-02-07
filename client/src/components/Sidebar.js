import React, { useRef } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MailIcon from '@mui/icons-material/Mail';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';

const drawerWidth = 280;

const Sidebar = ({ open, onClose, onHamburgerDoublePress }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useDarkMode();
  const lastPressTime = useRef(0);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
    { text: 'Messages', icon: <MailIcon />, path: '/messages' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose(); // Close sidebar after navigation
  };

  // Handle clicks on the drawer paper to detect double press
  const handleDrawerClick = (e) => {
    // Only trigger if clicking on the drawer background, not on menu items
    if (e.target === e.currentTarget || e.target.closest('.drawer-background')) {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastPressTime.current;

      if (timeDiff < 300) { // 300ms window for double press
        onClose();
      }

      lastPressTime.current = currentTime;
    }
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: darkMode 
            ? '#000000'
            : '#0a0a5c',
          borderRight: darkMode ? 'none' : '1px solid #e5e7eb',
          boxShadow: darkMode 
            ? '4px 0 24px rgba(10, 10, 92, 0.6), inset -1px 0 0 rgba(30, 64, 175, 0.2)'
            : '4px 0 12px rgba(0, 0, 0, 0.1)',
          backdropFilter: darkMode ? 'blur(10px)' : 'none',
        },
      }}
      PaperProps={{
        onClick: handleDrawerClick,
        className: 'drawer-background'
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          gap: 2,
        }}
      >
        
        
      </Box>

      <Divider
        sx={{
          borderColor: darkMode ? 'rgba(10, 10, 92, 0.5)' : 'rgba(255, 255, 255, 0.15)',
          mx: 2,
        }}
      />

      {/* Navigation Menu */}
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: isActive
                      ? darkMode 
                        ? 'rgba(30, 64, 175, 0.3)'
                        : '#ffffff'
                      : 'transparent',
                    border: darkMode && isActive 
                      ? '1.5px solid rgba(30, 64, 175, 0.5)'
                      : isActive 
                        ? 'none'
                        : 'none',
                    '&:hover': {
                      bgcolor: isActive
                        ? darkMode 
                          ? 'rgba(30, 64, 175, 0.4)'
                          : '#f3f4f6'
                        : darkMode 
                          ? 'rgba(10, 10, 92, 0.4)'
                          : 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateX(4px)',
                      boxShadow: darkMode 
                        ? '0 4px 12px rgba(10, 10, 92, 0.4)'
                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    },
                    ...(isActive && {
                      boxShadow: darkMode 
                        ? '0 4px 12px rgba(30, 64, 175, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      borderLeft: darkMode 
                        ? '3px solid #60a5fa'
                        : '3px solid #60a5fa',
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive 
                        ? darkMode ? '#60a5fa' : '#0a0a5c'
                        : darkMode ? '#93c5fd' : 'rgba(255, 255, 255, 0.7)',
                      minWidth: 40,
                      transition: 'color 0.3s ease',
                      '& .MuiSvgIcon-root': {
                        fontSize: 24,
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: {
                        color: isActive
                          ? darkMode ? '#ffffff' : '#0a0a5c'
                          : darkMode ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Section */}
      <Box
        sx={{
          mt: 'auto',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            fontSize: '0.75rem',
            color: darkMode ? '#93c5fd' : 'rgba(255, 255, 255, 0.6)',
            fontWeight: 500,
          }}
        >
          © 2026 BRAC University
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;