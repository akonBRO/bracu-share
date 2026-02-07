import React from 'react';
import { Typography, Container, Box, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';

const LoginFailedPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode
          ? 'radial-gradient(ellipse at top, #0a0a5c 0%, #000000 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            p: { xs: 4, sm: 5, md: 6 },
            borderRadius: 4,
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
          }}
        >
          {/* Error Icon */}
          <Box
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              borderRadius: '50%',
              background: darkMode
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              border: darkMode
                ? '2px solid rgba(239, 68, 68, 0.3)'
                : '2px solid rgba(239, 68, 68, 0.2)',
              boxShadow: darkMode
                ? '0 8px 24px rgba(239, 68, 68, 0.3)'
                : '0 8px 24px rgba(239, 68, 68, 0.2)',
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: { xs: 48, sm: 60 },
                color: '#ef4444',
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: darkMode
                ? 'linear-gradient(135deg, #ffffff 0%, #ef4444 100%)'
                : '#ef4444',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Login Failed
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              color: darkMode ? '#d1d5db' : '#374151',
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              lineHeight: 1.7,
              mb: 4,
              px: { xs: 0, sm: 2 },
            }}
          >
            You must use an official{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: darkMode ? '#60a5fa' : '#0a0a5c',
              }}
            >
              @bracu.ac.bd
            </Box>{' '}
            or{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: darkMode ? '#60a5fa' : '#0a0a5c',
              }}
            >
              @g.bracu.ac.bd
            </Box>{' '}
            email address to log in.
          </Typography>

          {/* Action Button */}
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
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
                transform: 'translateY(-2px)',
                boxShadow: darkMode
                  ? '0 6px 16px rgba(96, 165, 250, 0.4)'
                  : '0 6px 16px rgba(10, 10, 92, 0.35)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Return to Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginFailedPage;