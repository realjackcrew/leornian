import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName') || null);

  const login = (newToken, name) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('firstName', name || '');
    setToken(newToken);
    setFirstName(name || '');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    setToken(null);
    setFirstName(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedFirstName = localStorage.getItem('firstName');
    if (storedToken) setToken(storedToken);
    if (storedFirstName) setFirstName(storedFirstName);
  }, []);

  return (
    <AuthContext.Provider value={{ token, firstName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};