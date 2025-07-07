import { createContext, useState, useEffect } from 'react';
import { getUserProfile } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);

  // Clean up legacy firstName storage on mount
  useEffect(() => {
    const legacyFirstName = localStorage.getItem('firstName');
    if (legacyFirstName) {
      localStorage.removeItem('firstName');
    }
  }, []);

  // Load user profile when token exists
  useEffect(() => {
    const loadUserProfile = async () => {
      if (token) {
        try {
          const profile = await getUserProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // If profile fetch fails, clear token
          localStorage.removeItem('token');
          localStorage.removeItem('firstName');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUserProfile();
  }, [token]);

  const login = (newToken, firstName = null) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // If firstName is provided (legacy), store it temporarily
    if (firstName) {
      setUser({ firstName });
    }
    // The useEffect will fetch the complete profile
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName'); // Clean up legacy storage
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const profile = await getUserProfile();
        setUser(profile);
        return profile;
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      login, 
      logout, 
      updateUser, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};