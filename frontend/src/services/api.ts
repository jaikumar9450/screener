import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { store } from '../store/store';
import { clearAuthState, refreshAuthToken, setTokens } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/appSlice';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        await store.dispatch(refreshAuthToken());
        const newState = store.getState();
        const newToken = newState.auth.token;
        
        if (newToken && originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth state
        store.dispatch(clearAuthState());
        store.dispatch(addNotification({
          type: 'error',
          title: 'Session Expired',
          message: 'Please log in again to continue.',
        }));
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Show error notification for non-auth errors
    if (error.response?.status !== 401) {
      const errorData = error.response?.data as any;
      store.dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: errorData?.error?.message || error.message || 'An error occurred',
      }));
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<ApiResponse>('/auth/login', credentials),
    
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    api.post<ApiResponse>('/auth/register', userData),
    
  logout: () =>
    api.post<ApiResponse>('/auth/logout'),
    
  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse>('/auth/refresh-token', { refreshToken }),
    
  forgotPassword: (email: string) =>
    api.post<ApiResponse>('/auth/forgot-password', { email }),
    
  resetPassword: (data: { token: string; password: string }) =>
    api.post<ApiResponse>('/auth/reset-password', data),
    
  verifyEmail: (token: string) =>
    api.post<ApiResponse>('/auth/verify-email', { token }),
    
  resendVerification: () =>
    api.post<ApiResponse>('/auth/resend-verification'),
    
  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    api.post<ApiResponse>('/auth/change-password', passwords),
    
  getProfile: () =>
    api.get<ApiResponse>('/auth/me'),
    
  updateProfile: (updates: any) =>
    api.put<ApiResponse>('/auth/me', updates),
    
  getSessions: () =>
    api.get<ApiResponse>('/auth/sessions'),
    
  revokeSession: (sessionId: string) =>
    api.delete<ApiResponse>(`/auth/sessions/${sessionId}`),
    
  revokeAllSessions: () =>
    api.post<ApiResponse>('/auth/sessions/revoke-all'),
};

// Companies API
export const companiesAPI = {
  getCompanies: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sector?: string;
    industry?: string;
    exchange?: string;
  }) =>
    api.get<ApiResponse>('/companies', { params }),
    
  getCompany: (symbol: string) =>
    api.get<ApiResponse>(`/companies/${symbol}`),
    
  getCompanyFinancials: (symbol: string, params?: {
    period?: 'annual' | 'quarterly';
    years?: number;
  }) =>
    api.get<ApiResponse>(`/companies/${symbol}/financials`, { params }),
    
  getCompanyRatios: (symbol: string) =>
    api.get<ApiResponse>(`/companies/${symbol}/ratios`),
    
  getCompanyPrice: (symbol: string, params?: {
    period?: string;
    interval?: string;
  }) =>
    api.get<ApiResponse>(`/companies/${symbol}/price`, { params }),
    
  searchCompanies: (query: string) =>
    api.get<ApiResponse>('/companies/search', { params: { q: query } }),
    
  getSectors: () =>
    api.get<ApiResponse>('/companies/sectors'),
    
  getIndustries: (sector?: string) =>
    api.get<ApiResponse>('/companies/industries', { params: { sector } }),
};

// Portfolio API
export const portfolioAPI = {
  getPortfolios: () =>
    api.get<ApiResponse>('/portfolios'),
    
  getPortfolio: (portfolioId: string) =>
    api.get<ApiResponse>(`/portfolios/${portfolioId}`),
    
  createPortfolio: (data: { name: string; description?: string }) =>
    api.post<ApiResponse>('/portfolios', data),
    
  updatePortfolio: (portfolioId: string, updates: any) =>
    api.put<ApiResponse>(`/portfolios/${portfolioId}`, updates),
    
  deletePortfolio: (portfolioId: string) =>
    api.delete<ApiResponse>(`/portfolios/${portfolioId}`),
    
  getPortfolioSummary: () =>
    api.get<ApiResponse>('/portfolios/summary'),
    
  getTransactions: (params?: {
    portfolioId?: string;
    page?: number;
    limit?: number;
    type?: string;
    dateRange?: string;
  }) =>
    api.get<ApiResponse>('/portfolios/transactions', { params }),
    
  addTransaction: (data: any) =>
    api.post<ApiResponse>('/portfolios/transactions', data),
    
  updateTransaction: (transactionId: string, updates: any) =>
    api.put<ApiResponse>(`/portfolios/transactions/${transactionId}`, updates),
    
  deleteTransaction: (transactionId: string) =>
    api.delete<ApiResponse>(`/portfolios/transactions/${transactionId}`),
    
  importTransactions: (file: File, portfolioId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('portfolioId', portfolioId);
    return api.post<ApiResponse>('/portfolios/transactions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Watchlist API
export const watchlistAPI = {
  getWatchlists: () =>
    api.get<ApiResponse>('/watchlists'),
    
  getWatchlist: (watchlistId: string) =>
    api.get<ApiResponse>(`/watchlists/${watchlistId}`),
    
  createWatchlist: (data: { name: string; description?: string }) =>
    api.post<ApiResponse>('/watchlists', data),
    
  updateWatchlist: (watchlistId: string, updates: any) =>
    api.put<ApiResponse>(`/watchlists/${watchlistId}`, updates),
    
  deleteWatchlist: (watchlistId: string) =>
    api.delete<ApiResponse>(`/watchlists/${watchlistId}`),
    
  addStock: (watchlistId: string, symbol: string) =>
    api.post<ApiResponse>(`/watchlists/${watchlistId}/stocks`, { symbol }),
    
  removeStock: (watchlistId: string, stockId: string) =>
    api.delete<ApiResponse>(`/watchlists/${watchlistId}/stocks/${stockId}`),
    
  updateStockAlert: (watchlistId: string, stockId: string, alerts: any) =>
    api.put<ApiResponse>(`/watchlists/${watchlistId}/stocks/${stockId}/alerts`, alerts),
    
  getAlerts: () =>
    api.get<ApiResponse>('/watchlists/alerts'),
    
  getMarketOverview: () =>
    api.get<ApiResponse>('/watchlists/market-overview'),
    
  searchStocks: (query: string) =>
    api.get<ApiResponse>('/watchlists/search', { params: { q: query } }),
};

// Screening API
export const screeningAPI = {
  getAvailableFilters: () =>
    api.get<ApiResponse>('/screening/filters'),
    
  runScreen: (params: {
    criteria: any;
    page?: number;
    limit?: number;
  }) =>
    api.post<ApiResponse>('/screening/run', params),
    
  saveScreen: (data: {
    name: string;
    description?: string;
    criteria: any;
    isPublic?: boolean;
  }) =>
    api.post<ApiResponse>('/screening/screens', data),
    
  getSavedScreens: () =>
    api.get<ApiResponse>('/screening/screens'),
    
  getSavedScreen: (screenId: string) =>
    api.get<ApiResponse>(`/screening/screens/${screenId}`),
    
  updateSavedScreen: (screenId: string, updates: any) =>
    api.put<ApiResponse>(`/screening/screens/${screenId}`, updates),
    
  deleteSavedScreen: (screenId: string) =>
    api.delete<ApiResponse>(`/screening/screens/${screenId}`),
    
  getTemplates: () =>
    api.get<ApiResponse>('/screening/templates'),
    
  exportResults: (criteria: any, format: 'csv' | 'excel' | 'pdf') =>
    api.post<ApiResponse>('/screening/export', { criteria, format }, {
      responseType: 'blob',
    }),
};

// Export API
export const exportAPI = {
  exportData: (params: {
    type: 'portfolio' | 'watchlist' | 'transactions' | 'screening';
    format: 'csv' | 'excel' | 'pdf';
    filters?: any;
  }) =>
    api.post<Blob>('/export', params, {
      responseType: 'blob',
    }),
    
  getExportHistory: () =>
    api.get<ApiResponse>('/export/history'),
    
  downloadExport: (exportId: string) =>
    api.get<Blob>(`/export/${exportId}/download`, {
      responseType: 'blob',
    }),
};

// System API
export const systemAPI = {
  getHealth: () =>
    api.get<ApiResponse>('/system/health'),
    
  getMarketStatus: () =>
    api.get<ApiResponse>('/system/market-status'),
    
  getSystemStats: () =>
    api.get<ApiResponse>('/system/stats'),
    
  getNotifications: () =>
    api.get<ApiResponse>('/system/notifications'),
    
  markNotificationRead: (notificationId: string) =>
    api.put<ApiResponse>(`/system/notifications/${notificationId}/read`),
};

// WebSocket connection
let socket: WebSocket | null = null;

export const websocketAPI = {
  connect: () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      socket = new WebSocket(`${wsUrl}?token=${token}`);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        switch (data.type) {
          case 'price_update':
            // Dispatch price updates to store
            break;
          case 'portfolio_update':
            // Handle portfolio updates
            break;
          case 'alert':
            store.dispatch(addNotification({
              type: 'info',
              title: 'Alert',
              message: data.message,
            }));
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        socket = null;
      };
    }
  },
  
  disconnect: () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  },
  
  subscribe: (channel: string, symbols?: string[]) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        action: 'subscribe',
        channel,
        symbols,
      }));
    }
  },
  
  unsubscribe: (channel: string, symbols?: string[]) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        action: 'unsubscribe',
        channel,
        symbols,
      }));
    }
  },
};

// Helper function to handle file downloads
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export default api;