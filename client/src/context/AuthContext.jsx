import { createContext, useState, useEffect } from 'react';
import { getUserProfile } from '../api/auth';
export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const legacyFirstName = localStorage.getItem('firstName');
    if (legacyFirstName) {
      localStorage.removeItem('firstName');
    }
  }, []);
  useEffect(() => {
    const loadUserProfile = async () => {
      if (token) {
        try {
          const profile = await getUserProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
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
    if (firstName) {
      setUser({ firstName });
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName'); 
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