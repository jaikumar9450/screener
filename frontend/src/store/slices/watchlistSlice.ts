import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { watchlistAPI } from '../../services/api';

// Types
export interface WatchlistStock {
  id: string;
  symbol: string;
  companyName: string;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  addedAt: string;
  alerts?: {
    upperLimit?: number;
    lowerLimit?: number;
    enabled: boolean;
  };
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  stocks: WatchlistStock[];
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistAlert {
  id: string;
  watchlistId: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_spike' | 'breakout';
  condition: {
    value: number;
    operator: 'gt' | 'lt' | 'eq';
  };
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
}

interface WatchlistState {
  watchlists: Watchlist[];
  currentWatchlist: Watchlist | null;
  alerts: WatchlistAlert[];
  isLoading: boolean;
  error: string | null;
  marketOverview: {
    topGainers: WatchlistStock[];
    topLosers: WatchlistStock[];
    mostActive: WatchlistStock[];
    lastUpdated: string | null;
  };
  searchResults: WatchlistStock[];
  isSearching: boolean;
}

// Initial state
const initialState: WatchlistState = {
  watchlists: [],
  currentWatchlist: null,
  alerts: [],
  isLoading: false,
  error: null,
  marketOverview: {
    topGainers: [],
    topLosers: [],
    mostActive: [],
    lastUpdated: null,
  },
  searchResults: [],
  isSearching: false,
};

// Async thunks
export const fetchWatchlists = createAsyncThunk(
  'watchlist/fetchWatchlists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await watchlistAPI.getWatchlists();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch watchlists');
    }
  }
);

export const fetchWatchlistById = createAsyncThunk(
  'watchlist/fetchWatchlistById',
  async (watchlistId: string, { rejectWithValue }) => {
    try {
      const response = await watchlistAPI.getWatchlist(watchlistId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch watchlist');
    }
  }
);

export const createWatchlist = createAsyncThunk(
  'watchlist/createWatchlist',
  async (
    watchlistData: { name: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await watchlistAPI.createWatchlist(watchlistData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create watchlist');
    }
  }
);

export const updateWatchlist = createAsyncThunk(
  'watchlist/updateWatchlist',
  async (
    { watchlistId, updates }: { watchlistId: string; updates: Partial<Watchlist> },
    { rejectWithValue }
  ) => {
    try {
      const response = await watchlistAPI.updateWatchlist(watchlistId, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update watchlist');
    }
  }
);

export const deleteWatchlist = createAsyncThunk(
  'watchlist/deleteWatchlist',
  async (watchlistId: string, { rejectWithValue }) => {
    try {
      await watchlistAPI.deleteWatchlist(watchlistId);
      return watchlistId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete watchlist');
    }
  }
);

export const addStockToWatchlist = createAsyncThunk(
  'watchlist/addStockToWatchlist',
  async (
    { watchlistId, symbol }: { watchlistId: string; symbol: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await watchlistAPI.addStock(watchlistId, symbol);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add stock to watchlist');
    }
  }
);

export const removeStockFromWatchlist = createAsyncThunk(
  'watchlist/removeStockFromWatchlist',
  async (
    { watchlistId, stockId }: { watchlistId: string; stockId: string },
    { rejectWithValue }
  ) => {
    try {
      await watchlistAPI.removeStock(watchlistId, stockId);
      return { watchlistId, stockId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to remove stock from watchlist');
    }
  }
);

export const updateStockAlert = createAsyncThunk(
  'watchlist/updateStockAlert',
  async (
    { 
      watchlistId, 
      stockId, 
      alerts 
    }: { 
      watchlistId: string; 
      stockId: string; 
      alerts: WatchlistStock['alerts'] 
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await watchlistAPI.updateStockAlert(watchlistId, stockId, alerts);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update stock alert');
    }
  }
);

export const fetchWatchlistAlerts = createAsyncThunk(
  'watchlist/fetchWatchlistAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await watchlistAPI.getAlerts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch alerts');
    }
  }
);

export const fetchMarketOverview = createAsyncThunk(
  'watchlist/fetchMarketOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await watchlistAPI.getMarketOverview();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch market overview');
    }
  }
);

export const searchStocks = createAsyncThunk(
  'watchlist/searchStocks',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await watchlistAPI.searchStocks(query);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to search stocks');
    }
  }
);

// Watchlist slice
const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWatchlist: (state, action: PayloadAction<Watchlist | null>) => {
      state.currentWatchlist = action.payload;
    },
    updateStockPrice: (state, action: PayloadAction<{ symbol: string; price: number; change: number; changePercent: number }>) => {
      const { symbol, price, change, changePercent } = action.payload;
      
      // Update in current watchlist
      if (state.currentWatchlist) {
        const stock = state.currentWatchlist.stocks.find(s => s.symbol === symbol);
        if (stock) {
          stock.currentPrice = price;
          stock.dayChange = change;
          stock.dayChangePercent = changePercent;
        }
      }
      
      // Update in all watchlists
      state.watchlists.forEach(watchlist => {
        const stock = watchlist.stocks.find(s => s.symbol === symbol);
        if (stock) {
          stock.currentPrice = price;
          stock.dayChange = change;
          stock.dayChangePercent = changePercent;
        }
      });
      
      // Update in market overview
      [
        ...state.marketOverview.topGainers,
        ...state.marketOverview.topLosers,
        ...state.marketOverview.mostActive
      ].forEach(stock => {
        if (stock.symbol === symbol) {
          stock.currentPrice = price;
          stock.dayChange = change;
          stock.dayChangePercent = changePercent;
        }
      });
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearWatchlistState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Fetch watchlists
    builder
      .addCase(fetchWatchlists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchlists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.watchlists = action.payload.watchlists;
        // Set default watchlist as current if none selected
        if (!state.currentWatchlist && action.payload.watchlists.length > 0) {
          state.currentWatchlist = action.payload.watchlists.find(w => w.isDefault) || action.payload.watchlists[0];
        }
        state.error = null;
      })
      .addCase(fetchWatchlists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch watchlist by ID
    builder
      .addCase(fetchWatchlistById.fulfilled, (state, action) => {
        state.currentWatchlist = action.payload.watchlist;
        // Update in watchlists array too
        const index = state.watchlists.findIndex(w => w.id === action.payload.watchlist.id);
        if (index !== -1) {
          state.watchlists[index] = action.payload.watchlist;
        }
      });

    // Create watchlist
    builder
      .addCase(createWatchlist.fulfilled, (state, action) => {
        state.watchlists.push(action.payload.watchlist);
      });

    // Update watchlist
    builder
      .addCase(updateWatchlist.fulfilled, (state, action) => {
        const index = state.watchlists.findIndex(w => w.id === action.payload.watchlist.id);
        if (index !== -1) {
          state.watchlists[index] = action.payload.watchlist;
        }
        if (state.currentWatchlist?.id === action.payload.watchlist.id) {
          state.currentWatchlist = action.payload.watchlist;
        }
      });

    // Delete watchlist
    builder
      .addCase(deleteWatchlist.fulfilled, (state, action) => {
        state.watchlists = state.watchlists.filter(w => w.id !== action.payload);
        if (state.currentWatchlist?.id === action.payload) {
          state.currentWatchlist = state.watchlists.length > 0 ? state.watchlists[0] : null;
        }
      });

    // Add stock to watchlist
    builder
      .addCase(addStockToWatchlist.fulfilled, (state, action) => {
        const { watchlistId, stock } = action.payload;
        const watchlist = state.watchlists.find(w => w.id === watchlistId);
        if (watchlist) {
          watchlist.stocks.push(stock);
        }
        if (state.currentWatchlist?.id === watchlistId) {
          state.currentWatchlist.stocks.push(stock);
        }
      });

    // Remove stock from watchlist
    builder
      .addCase(removeStockFromWatchlist.fulfilled, (state, action) => {
        const { watchlistId, stockId } = action.payload;
        const watchlist = state.watchlists.find(w => w.id === watchlistId);
        if (watchlist) {
          watchlist.stocks = watchlist.stocks.filter(s => s.id !== stockId);
        }
        if (state.currentWatchlist?.id === watchlistId) {
          state.currentWatchlist.stocks = state.currentWatchlist.stocks.filter(s => s.id !== stockId);
        }
      });

    // Update stock alert
    builder
      .addCase(updateStockAlert.fulfilled, (state, action) => {
        const { watchlistId, stockId, alerts } = action.payload;
        const watchlist = state.watchlists.find(w => w.id === watchlistId);
        if (watchlist) {
          const stock = watchlist.stocks.find(s => s.id === stockId);
          if (stock) {
            stock.alerts = alerts;
          }
        }
        if (state.currentWatchlist?.id === watchlistId) {
          const stock = state.currentWatchlist.stocks.find(s => s.id === stockId);
          if (stock) {
            stock.alerts = alerts;
          }
        }
      });

    // Fetch alerts
    builder
      .addCase(fetchWatchlistAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload.alerts;
      });

    // Fetch market overview
    builder
      .addCase(fetchMarketOverview.fulfilled, (state, action) => {
        state.marketOverview = {
          ...action.payload.overview,
          lastUpdated: new Date().toISOString(),
        };
      });

    // Search stocks
    builder
      .addCase(searchStocks.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchStocks.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.stocks;
      })
      .addCase(searchStocks.rejected, (state) => {
        state.isSearching = false;
        state.searchResults = [];
      });
  },
});

export const {
  clearError,
  setCurrentWatchlist,
  updateStockPrice,
  clearSearchResults,
  clearWatchlistState,
} = watchlistSlice.actions;

export default watchlistSlice.reducer;