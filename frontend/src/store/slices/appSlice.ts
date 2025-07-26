import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  timestamp: number;
}

interface AppState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
  isOnline: boolean;
  lastSync: number | null;
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  modals: {
    [key: string]: boolean;
  };
  preferences: {
    currency: 'INR' | 'USD';
    language: 'en' | 'hi';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    numberFormat: 'indian' | 'international';
    refreshInterval: number; // in seconds
    autoRefresh: boolean;
    soundNotifications: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  chartSettings: {
    defaultTimeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';
    chartType: 'line' | 'candlestick' | 'bar';
    indicators: string[];
    theme: 'light' | 'dark';
  };
}

// Initial state
const initialState: AppState = {
  theme: 'system',
  sidebarOpen: true,
  notifications: [],
  isOnline: navigator.onLine,
  lastSync: null,
  loading: {
    global: false,
  },
  modals: {},
  preferences: {
    currency: 'INR',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'indian',
    refreshInterval: 30,
    autoRefresh: true,
    soundNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
  },
  chartSettings: {
    defaultTimeframe: '1D',
    chartType: 'line',
    indicators: [],
    theme: 'light',
  },
};

// App slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.persistent = false;
      }
    },

    // Online status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },

    // Sync
    updateLastSync: (state) => {
      state.lastSync = Date.now();
    },

    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },

    // Modals
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
    },

    // Preferences
    updatePreferences: (state, action: PayloadAction<Partial<AppState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
    },

    // Chart settings
    updateChartSettings: (state, action: PayloadAction<Partial<AppState['chartSettings']>>) => {
      state.chartSettings = { ...state.chartSettings, ...action.payload };
    },
    addChartIndicator: (state, action: PayloadAction<string>) => {
      if (!state.chartSettings.indicators.includes(action.payload)) {
        state.chartSettings.indicators.push(action.payload);
      }
    },
    removeChartIndicator: (state, action: PayloadAction<string>) => {
      state.chartSettings.indicators = state.chartSettings.indicators.filter(
        (indicator) => indicator !== action.payload
      );
    },
    resetChartSettings: (state) => {
      state.chartSettings = initialState.chartSettings;
    },

    // Reset app state
    resetAppState: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  setOnlineStatus,
  updateLastSync,
  setGlobalLoading,
  setLoading,
  clearLoading,
  openModal,
  closeModal,
  toggleModal,
  closeAllModals,
  updatePreferences,
  resetPreferences,
  updateChartSettings,
  addChartIndicator,
  removeChartIndicator,
  resetChartSettings,
  resetAppState,
} = appSlice.actions;

export default appSlice.reducer;