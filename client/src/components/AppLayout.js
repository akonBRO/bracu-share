import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useDarkMode } from '../context/DarkModeContext';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode } = useDarkMode();

  const handleMenuClick = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar onMenuClick={handleMenuClick} />
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: darkMode ? '#0a0a0a' : '#f8fafc',
          p: 0,
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;