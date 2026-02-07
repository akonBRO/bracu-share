import React, { useState } from 'react';
import { Button, Container, Typography, Box, TextField, InputAdornment, IconButton, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { Navigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';

const GOOGLE_LOGIN_URL = 'http://localhost:5000/api/auth/google';

const LoginPage = () => {
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setErrors({ email: '', password: '' });

    let hasError = false;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    console.log('Email login:', email, password);
  };

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        background: darkMode
          ? 'radial-gradient(ellipse at top, #0a0a5c 0%, #000000 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 50%, #dce7ff 100%)',
      }}
    >
      {/* Floating orbs for visual interest */}
      <Box
        sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(10, 10, 92, 0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(10, 10, 92, 0.08) 0%, transparent 70%)',
          top: '-200px',
          right: '-150px',
          pointerEvents: 'none',
          filter: 'blur(80px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(30, 64, 175, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(30, 64, 175, 0.06) 0%, transparent 70%)',
          bottom: '-150px',
          left: '-100px',
          pointerEvents: 'none',
          filter: 'blur(80px)',
        }}
      />

      {/* Dark Mode Toggle */}



      <Container maxWidth="sm">
        <Box
          sx={{
            position: 'relative',
            background: darkMode
              ? 'radial-gradient(circle at top, rgba(10, 10, 92, 0.3) 0%, rgba(2, 6, 23, 1) 70%)'
              : '#ffffff',
            backdropFilter: 'blur(20px)',
            borderRadius: 5,
            boxShadow: darkMode
              ? '0 30px 90px rgba(10, 10, 92, 0.6), 0 0 0 1px rgba(10, 10, 92, 0.3) inset, 0 0 40px rgba(30, 64, 175, 0.2)'
              : '0 20px 60px rgba(10, 10, 92, 0.12), 0 0 0 1px rgba(10, 10, 92, 0.06) inset, 0 8px 32px rgba(10, 10, 92, 0.08)',
            overflow: 'hidden',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          {/* Dark Mode Toggle at top-right */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 5,
            }}
          >
            <DarkModeToggle />
          </Box>
        
          {/* Top accent bar */}
          <Box
            sx={{
              height: '4px',
              background: darkMode
                ? 'linear-gradient(90deg, #0a0a5c 0%, #1e40af 100%)'
                : 'linear-gradient(90deg, #0a0a5c 0%, #1e40af 100%)',
            }}
          />

          {/* Header Section */}
          <Box
            sx={{
              pt: { xs: 3, sm: 3.5 },
              pb: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 4 },
              textAlign: 'center',
            }}
          >
            <Box
              component="img"
              src={darkMode ? "/bracu-logo-dark.png" : "/bracu-logo.png"}
              alt="BRAC University"
              sx={{
                width: { xs: 100, sm: 110 },
                height: { xs: 100, sm: 110 },
                mb: 2,
                objectFit: 'contain',
                filter: darkMode ? 'drop-shadow(0 4px 12px rgba(10, 10, 92, 0.5))' : 'drop-shadow(0 2px 8px rgba(10, 10, 92, 0.1))',
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: darkMode
                  ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
                  : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                letterSpacing: '-0.03em',
              }}
            >
              BRACU Share
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: darkMode ? '#93c5fd' : '#0a0a5c',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 500,
              }}
            >
              Sign in to continue
            </Typography>
          </Box>

          {/* Form Section */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              px: { xs: 3, sm: 4 },
              pb: { xs: 3, sm: 4 },
            }}
          >
            {/* Email Field */}
            <TextField
              fullWidth
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon
                      sx={{
                        color: darkMode ? '#60a5fa' : '#1e40af',
                        fontSize: 20
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f8fafc',
                  color: darkMode ? '#ffffff' : '#0f172a',
                  fontSize: '0.9375rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: darkMode ? '1.5px solid rgba(10, 10, 92, 0.5)' : '1.5px solid #e2e8f0',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(10, 10, 92, 0.3)' : '#f1f5f9',
                    transform: 'translateY(-1px)',
                    boxShadow: darkMode
                      ? '0 4px 12px rgba(10, 10, 92, 0.4)'
                      : '0 4px 12px rgba(10, 10, 92, 0.08)',
                    border: darkMode ? '1.5px solid rgba(30, 64, 175, 0.6)' : '1.5px solid #cbd5e1',
                  },
                  '&.Mui-focused': {
                    backgroundColor: darkMode ? 'rgba(10, 10, 92, 0.35)' : '#ffffff',
                    border: darkMode
                      ? '1.5px solid #1e40af'
                      : '1.5px solid #0a0a5c',
                    boxShadow: darkMode
                      ? '0 0 0 4px rgba(30, 64, 175, 0.25)'
                      : '0 0 0 4px rgba(10, 10, 92, 0.12)',
                  },
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: 0.5,
                  fontSize: '0.8125rem',
                },
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon
                      sx={{
                        color: darkMode ? '#60a5fa' : '#1e40af',
                        fontSize: 20
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{
                        color: darkMode ? '#60a5fa' : '#1e40af',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(10, 10, 92, 0.4)' : 'rgba(10, 10, 92, 0.05)',
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f8fafc',
                  color: darkMode ? '#ffffff' : '#0f172a',
                  fontSize: '0.9375rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: darkMode ? '1.5px solid rgba(10, 10, 92, 0.5)' : '1.5px solid #e2e8f0',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(10, 10, 92, 0.3)' : '#f1f5f9',
                    transform: 'translateY(-1px)',
                    boxShadow: darkMode
                      ? '0 4px 12px rgba(10, 10, 92, 0.4)'
                      : '0 4px 12px rgba(10, 10, 92, 0.08)',
                    border: darkMode ? '1.5px solid rgba(30, 64, 175, 0.6)' : '1.5px solid #cbd5e1',
                  },
                  '&.Mui-focused': {
                    backgroundColor: darkMode ? 'rgba(10, 10, 92, 0.35)' : '#ffffff',
                    border: darkMode
                      ? '1.5px solid #1e40af'
                      : '1.5px solid #0a0a5c',
                    boxShadow: darkMode
                      ? '0 0 0 4px rgba(30, 64, 175, 0.25)'
                      : '0 0 0 4px rgba(10, 10, 92, 0.12)',
                  },
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: 0.5,
                  fontSize: '0.8125rem',
                },
              }}
            />

            {/* Forgot Password */}
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: darkMode ? '#60a5fa' : '#0a0a5c',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: darkMode ? '#93c5fd' : '#1e40af',
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                py: 1.75,
                fontSize: '0.9375rem',
                fontWeight: 600,
                textTransform: 'none',
                background: darkMode
                  ? 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)'
                  : 'linear-gradient(135deg, #0a0a5c 0%, #1e40af 100%)',
                color: '#ffffff',
                borderRadius: 3,
                boxShadow: darkMode
                  ? '0 8px 24px rgba(10, 10, 92, 0.5), 0 0 20px rgba(30, 64, 175, 0.3)'
                  : '0 8px 24px rgba(10, 10, 92, 0.25), 0 4px 12px rgba(10, 10, 92, 0.15)',
                mb: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: darkMode
                    ? '0 12px 32px rgba(10, 10, 92, 0.6), 0 0 30px rgba(30, 64, 175, 0.4)'
                    : '0 12px 32px rgba(10, 10, 92, 0.35), 0 6px 16px rgba(10, 10, 92, 0.2)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
              }}
            >
              Sign In
            </Button>

            {/* Divider */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Divider
                sx={{
                  flexGrow: 1,
                  borderColor: darkMode ? 'rgba(10, 10, 92, 0.5)' : '#e2e8f0',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  color: darkMode ? '#93c5fd' : '#0a0a5c',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}
              >
                OR
              </Typography>
              <Divider
                sx={{
                  flexGrow: 1,
                  borderColor: darkMode ? 'rgba(10, 10, 92, 0.5)' : '#e2e8f0',
                }}
              />
            </Box>

            {/* Google Button */}
            <Button
              variant="outlined"
              startIcon={<GoogleIcon sx={{ fontSize: 18 }} />}
              onClick={handleGoogleLogin}
              fullWidth
              sx={{
                py: 1.75,
                fontSize: '0.9375rem',
                fontWeight: 500,
                textTransform: 'none',
                color: darkMode ? '#ffffff' : '#334155',
                backgroundColor: darkMode ? 'rgba(10, 10, 92, 0.2)' : '#f8fafc',
                border: darkMode
                  ? '1.5px solid rgba(10, 10, 92, 0.5)'
                  : '1.5px solid #e2e8f0',
                borderRadius: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(10, 10, 92, 0.35)' : '#ffffff',
                  border: darkMode
                    ? '1.5px solid #1e40af'
                    : '1.5px solid #0a0a5c',
                  transform: 'translateY(-1px)',
                  boxShadow: darkMode
                    ? '0 4px 12px rgba(10, 10, 92, 0.4)'
                    : '0 4px 12px rgba(10, 10, 92, 0.08)',
                },
              }}
            >
              Continue with Google
            </Button>

            {/* Footer */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 4,
                color: darkMode ? '#93c5fd' : '#333333',
                textAlign: 'center',
                fontSize: '0.8125rem',
              }}
            >
              Use your @bracu.ac.bd or @g.bracu.ac.bd email
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;