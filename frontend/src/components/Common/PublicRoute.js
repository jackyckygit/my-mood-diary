import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // While checking for auth, you can show a loader or nothing
    return <div>Loading...</div>; // Or return null;
  }

  if (user) {
    // If the user is logged in, redirect them from public pages (like login)
    // to the main diary page.
    return <Navigate to="/diary" replace />;
  }

  // If not loading and no user, render the child component (e.g., LoginPage)
  return children;
};

export default PublicRoute;