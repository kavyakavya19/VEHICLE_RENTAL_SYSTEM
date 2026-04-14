'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Safe localStorage check for SSR
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const res = await API.get('users/profile/');
            setUser(res.data);
            setIsProfileComplete(res.data.is_profile_complete);
            setIsAuthenticated(true);
            localStorage.setItem('is_profile_complete', String(res.data.is_profile_complete));
          } catch (err) {
            console.error('Auth initialization failed:', err);
            logout();
          }
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (tokens, userData = null) => {
    if (typeof window === 'undefined') return;
    
    const accessToken = tokens.token || tokens.access;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', tokens.refresh);
    
    setIsAuthenticated(true);
    if (userData) {
      setUser(userData);
      setIsProfileComplete(userData.is_profile_complete);
      localStorage.setItem('is_profile_complete', String(userData.is_profile_complete));
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    if (typeof window === 'undefined') return;
    
    ['token', 'refresh_token', 'user', 'is_profile_complete'].forEach((k) =>
      localStorage.removeItem(k)
    );
    setIsAuthenticated(false);
    setUser(null);
    setIsProfileComplete(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, user, isProfileComplete, login, logout, setIsProfileComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
