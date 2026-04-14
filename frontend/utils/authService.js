import API from '../utils/api';

export const login = async (email, password) => {
  const res = await API.post('users/login/', { email, password });
  return res.data; // { token, refresh, user }
};

export const register = async (formData) => {
  const res = await API.post('users/register/', formData);
  return res.data;
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};
