import React from 'react';
import { IconButton } from '@mui/material';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useDarkMode } from '../context/DarkModeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <IconButton
      onClick={toggleDarkMode}
      size="small"
      sx={{
        color: darkMode ? '#fbbf24' : '#0a0a5c',
        bgcolor: 'transparent',
        width: 36,
        height: 36,
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.1)',
          transform: 'scale(1.1)',
        },
      }}
    >
      {darkMode ? (
        <Brightness7Icon sx={{ fontSize: 22 }} />
      ) : (
        <Brightness4Icon sx={{ fontSize: 22 }} />
      )}
    </IconButton>
  );
};

export default DarkModeToggle;