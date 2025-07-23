import axios from 'axios';
import Cookies from 'js-cookie';
import { API_ROUTES } from '@cp-vibe-code/shared';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}${API_ROUTES.AUTH.REFRESH}`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

        // Update cookies
        Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
        Cookies.set('refreshToken', newRefreshToken, { expires: 7 }); // 7 days

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
