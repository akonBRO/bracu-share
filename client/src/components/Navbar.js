import React, { useState } from 'react';
import {
  Button,
  Badge,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import DarkModeToggle from './DarkModeToggle';
import { useDarkMode } from '../context/DarkModeContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const { unreadDmCount } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    window.location.href = 'http://localhost:5000/api/auth/logout';
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: darkMode ? '#000000' : '#ffffff',
        backdropFilter: 'blur(10px)',
        boxShadow: darkMode
          ? '0 4px 24px rgba(10, 10, 92, 0.6), 0 0 0 1px rgba(30, 64, 175, 0.2) inset'
          : '0 2px 12px rgba(0, 0, 0, 0.08)',
        borderBottom: darkMode ? '1px solid rgba(10, 10, 92, 0.6)' : '1.5px solid #0a0a5c',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            color: darkMode ? '#ffffff' : '#0a0a5c',
            '&:hover': { transform: 'scale(1.05)' },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            background: darkMode
              ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
              : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          BRACU Share
        </Typography>

        {/* Calendar */}
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/calendar')} 
          sx={{ 
            color: darkMode ? '#ffffff' : '#0a0a5c',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              transform: 'scale(1.05)', 
              bgcolor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#f3f4f6' 
            },
          }}
        >
          <CalendarMonthIcon />
        </IconButton>

        {/* Notifications Icon */}
        <IconButton
          color="inherit"
          sx={{
            mr: 1,
            color: darkMode ? '#ffffff' : '#0a0a5c',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              transform: 'scale(1.05)', 
              bgcolor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#f3f4f6' 
            },
          }}
        >
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Messages */}
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/messages')} 
          sx={{ 
            mr: 2, 
            color: darkMode ? '#ffffff' : '#0a0a5c',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              transform: 'scale(1.05)', 
              bgcolor: darkMode ? 'rgba(96, 165, 250, 0.2)' : '#f3f4f6' 
            },
          }}
        >
          <Badge badgeContent={unreadDmCount} color="error">
            <MailIcon />
          </Badge>
        </IconButton>

        <Box sx={{ mr: 2 }}>
          <DarkModeToggle />
        </Box>

        {/* Profile Section */}
        {user && (
          <>
            <IconButton 
              onClick={handleMenu} 
              sx={{ 
                p: 0, 
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.08)' } 
              }}
            >
              <Avatar
                alt={user.name}
                src={user.profilePicture}
                sx={{
                  width: 40,
                  height: 40,
                  border: darkMode 
                    ? '2px solid rgba(96, 165, 250, 0.5)' 
                    : '2px solid #e5e7eb',
                }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 3,
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(10, 10, 92, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)'
                    : '#ffffff',
                  backdropFilter: 'blur(10px)',
                  border: darkMode 
                    ? '1.5px solid rgba(30, 64, 175, 0.3)' 
                    : '1px solid #e5e7eb',
                },
              }}
            >
              <Box 
                sx={{ 
                  px: 2, 
                  py: 1.5, 
                  borderBottom: darkMode 
                    ? '1px solid rgba(30, 64, 175, 0.3)' 
                    : '1px solid #e5e7eb' 
                }}
              >
                <Typography 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.95rem', 
                    color: darkMode ? '#ffffff' : '#0a0a5c' 
                  }}
                >
                  {user.name}
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '0.8rem', 
                    color: darkMode ? '#93c5fd' : '#6b7280' 
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
              <MenuItem 
                onClick={handleProfileClick} 
                sx={{ color: darkMode ? '#fff' : '#0a0a5c' }}
              >
                Profile
              </MenuItem>
              <MenuItem 
                onClick={handleLogout} 
                sx={{ color: darkMode ? '#fff' : '#0a0a5c' }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;