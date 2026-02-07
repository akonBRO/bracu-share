import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Box } from '@mui/material';

// 1. Create the Context
const AuthContext = createContext(null);

// This is the backend URL we will hit to check for a user
const API_URL = 'http://localhost:5000/api/auth/me';

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // We are loading at the start

  useEffect(() => {
    // This function runs when the app first loads
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        // We tell axios to send our cookies with the request
        const { data } = await axios.get(API_URL, {
          withCredentials: true,
        });

        if (data.success) {
          setUser(data.user); // User is logged in, save their data
        }
      } catch (error) {
        console.log('User not authenticated');
        setUser(null); // No user is logged in
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // While we're checking, show a loading spinner
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 3. Provide the user and loading state to the whole app
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Create a custom "hook" to easily access the context
export const useAuth = () => {
  return useContext(AuthContext);
};