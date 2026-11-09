// src/services/api/client.ts
import axios from 'axios';
import { secureStorage } from '@/utils/storage';

const rawUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://super-backend-production.up.railway.app').replace(/\/+$/, '');
export const API_BASE_URL = rawUrl.endsWith('/api/v1') ? rawUrl : `${rawUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

import { useLanguageStore } from '@/localization/languageStore';

apiClient.interceptors.request.use(
  async (config) => {
    // Prevent duplicate prefixing if an endpoint starts with /api/v1
    if (config.url?.startsWith('/api/v1')) {
      config.url = config.url.replace('/api/v1', '');
    }

    const lang = useLanguageStore.getState().currentLanguage || 'en';
    if (config.headers) {
      config.headers['Accept-Language'] = lang;
    }

    const token = await secureStorage.getSecureToken('user_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // If backend returns { success: true, data: ... }, extract data or return payload
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Auto-refresh token if 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await secureStorage.getSecureToken('user_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newToken = res.data?.data?.accessToken || res.data?.accessToken;
          if (newToken) {
            await secureStorage.setSecureToken('user_auth_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          await secureStorage.deleteSecureToken('user_auth_token');
          await secureStorage.deleteSecureToken('user_refresh_token');
        }
      }
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      'Network communication error. Please check your connection.';
    return Promise.reject(new Error(errorMessage));
  }
);
