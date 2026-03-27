import axios from 'axios';

// In development the CRA proxy (set in package.json) forwards /api/* to localhost:3000.
// In production set REACT_APP_API_URL to your deployed backend URL.
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartcare_token');
      localStorage.removeItem('smartcare_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
