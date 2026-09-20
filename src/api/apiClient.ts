import axios from 'axios';

export const BASE_API_URL = 'https://rukoob-api.runasp.net';

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStoredToken = (): string | null => {
  return localStorage.getItem('rukoob_admin_token');
};

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('rukoob_admin_token', token);
  } else {
    localStorage.removeItem('rukoob_admin_token');
  }
};

// Request interceptor to automatically attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
      localStorage.removeItem('rukoob_admin_user');
    }
    return Promise.reject(error);
  }
);

export const getFullImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
