import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Interceptor request - inject Authorization header secara otomatis
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      // Pastikan config.headers sudah ada dan dalam bentuk object
      config.headers = config.headers ?? {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);