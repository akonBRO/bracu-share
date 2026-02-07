import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import theme and context
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext';

// Import pages and components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LoginFailedPage from './pages/LoginFailedPage';
import ProtectedRoute from './components/ProtectedRoute';
import CoursePage from './pages/CoursePage';
import ManageCoursePage from './pages/ManageCoursePage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import DirectMessagesPage from './pages/DirectMessagesPage';

// Component that uses dark mode context to create theme
const ThemedApp = () => {
  const { darkMode } = useDarkMode();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1e3a8a', // Navy blue - same for both modes
          },
          background: {
            default: darkMode ? '#000000' : '#ffffff',
            paper: darkMode ? '#1a1a1a' : '#ffffff',
          },
          text: {
            primary: darkMode ? '#ffffff' : '#000000',
            secondary: darkMode ? '#b0b0b0' : '#6b7280',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: darkMode ? '#000000' : '#ffffff',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

// Routes component that accesses Auth context
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      <Route path="/login/failed" element={<LoginFailedPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/course/:courseId/manage" element={<ManageCoursePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/messages" element={<DirectMessagesPage />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <ThemedApp />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;