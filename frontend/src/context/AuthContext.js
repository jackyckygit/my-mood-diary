import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 
// This helps decode the JWT to get user info without a separate API call on every load.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Decode the token to check for expiration and get user info
          const decodedToken = jwtDecode(token);
          
          // Check if the token is expired
          if (decodedToken.exp * 1000 < Date.now()) {
            // Token is expired, remove it
            localStorage.removeItem('token');
            setUser(null);
          } else {
            // Token is valid, set the user state
            // The payload from our backend includes { id, username }
            setUser({
              id: decodedToken.id,
              username: decodedToken.username,
            });
          }
        } catch (error) {
          // If token is invalid or malformed
          console.error("Invalid token:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      
      // We are done checking, so set loading to false
      setIsLoading(false);
    };

    initializeAuth();
  }, []); 

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Pass down the loading state
  const value = { user, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};