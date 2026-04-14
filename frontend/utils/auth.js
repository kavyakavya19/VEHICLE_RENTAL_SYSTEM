/**
 * Utility functions for authentication state management
 */

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

export const setToken = (token, refresh = null) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  if (refresh) {
    localStorage.setItem('refresh_token', refresh);
  }
};

export const removeToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('is_profile_complete');
};
