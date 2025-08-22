import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth(); // Get isLoading from context

  if (isLoading) {
    // While checking auth, show a loading indicator to prevent flashes of content
    return <div>Loading...</div>; 
  }

  if (!user) {
    // If done loading and there's no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If done loading and there is a user, render the protected content
  return (
    <>
      <Navbar />
      <main className="main-container">
        {children}
      </main>
    </>
  );
};

export default PrivateRoute;