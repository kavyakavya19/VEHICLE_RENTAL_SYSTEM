import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (!refresh) throw new Error('No refresh token');
        const res = await axios.post(
          `${BASE_URL}users/token/refresh/`,
          { refresh }
        );
        const newAccess = res.data.access;
        localStorage.setItem('token', newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return API(original);
      } catch {
        ['token', 'refresh_token', 'user', 'is_profile_complete'].forEach((k) =>
          localStorage.removeItem(k)
        );
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
