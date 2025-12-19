import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedNickname = localStorage.getItem('nickname');

    if (token && storedNickname) {
      setIsAuthenticated(true);
      setNickname(storedNickname);
    }
    setLoading(false);
  }, []);

  const loginUser = (token, userNickname) => {
    localStorage.setItem('token', token);
    localStorage.setItem('nickname', userNickname);
    setIsAuthenticated(true);
    setNickname(userNickname);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    setIsAuthenticated(false);
    setNickname('');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, nickname, loginUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
