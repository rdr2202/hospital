import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Simple check for token in localStorage
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Simple implementation for development
          setUser({ id: 1, name: 'Example User', role: 'patient' });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      // Simple implementation for development
      localStorage.setItem('auth_token', 'dummy_token');
      setUser({ id: 1, name: credentials.username, role: 'patient' });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Value to provide
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};