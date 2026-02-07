import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from './AppLayout'; // <-- Import the layout

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is logged in, render the AppLayout.
  // AppLayout will then render the correct page (e.g., Dashboard)
  return <AppLayout />;
};

export default ProtectedRoute;