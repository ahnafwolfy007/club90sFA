import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  // Use relative baseURL so CRA proxy or environment can control the target
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use the same axios instance so baseURL is honored
          const response = await api.post('/auth/refresh', {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait before trying again.');
    } else if (message !== 'Token expired' && message !== 'Invalid token') {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Users API functions
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getPending: () => api.get('/users/pending'),
  approve: (id) => api.patch(`/users/${id}/approve`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  deactivate: (id) => api.delete(`/users/${id}`),
  getById: (id) => api.get(`/users/${id}`),
  getHistory: (id) => api.get(`/users/${id}/history`),
};

// Matches API functions
export const matchesAPI = {
  getAll: (params) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  delete: (id) => api.delete(`/matches/${id}`),
  addStatistics: (id, stats) => api.post(`/matches/${id}/statistics`, stats),
  setMVP: (id, user_id) => api.post(`/matches/${id}/mvp`, { user_id }),
  getVotes: (id) => api.get(`/matches/${id}/votes`),
};

// Tournaments API functions
export const tournamentsAPI = {
  getAll: (params) => api.get('/tournaments', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  getMatches: (id) => api.get(`/tournaments/${id}/matches`),
  vote: (id, playerId, vote) => api.post(`/tournaments/${id}/vote`, { playerId, vote }),
};

// Notices API functions
export const noticesAPI = {
  getAll: (params) => api.get('/notices', { params }),
  getById: (id) => api.get(`/notices/${id}`),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
};

// Subscriptions API functions
export const subscriptionsAPI = {
  getAll: (params) => api.get('/subscriptions', { params }),
  getByUser: (userId) => api.get(`/subscriptions/user/${userId}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  markPaid: (id, data) => api.patch(`/subscriptions/${id}/paid`, data),
  getMonthlyReport: (month, year) => api.get(`/subscriptions/report/${year}/${month}`),
};

// Players API functions
export const playersAPI = {
  getAll: (params) => api.get('/players', { params }),
  getMe: () => api.get('/players/me'),
  updateMe: (data) => api.put('/players/me', data),
  getStatistics: (id) => api.get(`/players/${id}/statistics`),
  getProgress: (id) => api.get(`/players/${id}/progress`),
  exportStatistics: () => api.get('/players/export', { responseType: 'blob' }),
};

// Reports API functions
export const reportsAPI = {
  getMatchParticipants: (matchId) => api.get(`/reports/match/${matchId}/participants`, { responseType: 'blob' }),
  getPaymentStatus: (month, year) => api.get(`/reports/payments/${year}/${month}`, { responseType: 'blob' }),
  getPlayerStatistics: (params) => api.get('/reports/players', { params, responseType: 'blob' }),
};

// Analytics API
export const analyticsAPI = {
  getEngagement: () => api.get('/analytics/engagement'),
  getTopPlayers: () => api.get('/analytics/players/top'),
  getPlayerTimeline: (id) => api.get(`/analytics/players/${id}/timeline`),
}

// File upload helper
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.response?.data?.errors) {
      // Validation errors
      return error.response.data.errors.map(err => err.message).join(', ');
    }
    
    return error.response?.data?.message || 'An unexpected error occurred';
  },

  // Download file from blob response
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Format API response for consistent error handling
  formatResponse: (response) => {
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  },
};

export default api;