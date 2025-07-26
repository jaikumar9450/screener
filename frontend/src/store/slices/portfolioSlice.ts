import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { portfolioAPI } from '../../services/api';

// Types
export interface Holding {
  id: string;
  symbol: string;
  companyName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  totalInvestment: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend';
  quantity: number;
  price: number;
  amount: number;
  fees?: number;
  date: string;
  notes?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  totalInvestment: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  totalPortfolios: number;
  totalValue: number;
  totalInvestment: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  topGainers: Holding[];
  topLosers: Holding[];
  sectorAllocation: { [sector: string]: number };
  assetAllocation: { stocks: number; cash: number };
}

interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  summary: PortfolioSummary | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filters: {
    dateRange: string;
    portfolioId?: string;
    transactionType?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Initial state
const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolio: null,
  summary: null,
  transactions: [],
  isLoading: false,
  error: null,
  filters: {
    dateRange: '1M',
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
  },
};

// Async thunks
export const fetchPortfolios = createAsyncThunk(
  'portfolio/fetchPortfolios',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioAPI.getPortfolios();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch portfolios');
    }
  }
);

export const fetchPortfolioById = createAsyncThunk(
  'portfolio/fetchPortfolioById',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      const response = await portfolioAPI.getPortfolio(portfolioId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch portfolio');
    }
  }
);

export const createPortfolio = createAsyncThunk(
  'portfolio/createPortfolio',
  async (
    portfolioData: { name: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await portfolioAPI.createPortfolio(portfolioData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create portfolio');
    }
  }
);

export const updatePortfolio = createAsyncThunk(
  'portfolio/updatePortfolio',
  async (
    { portfolioId, updates }: { portfolioId: string; updates: Partial<Portfolio> },
    { rejectWithValue }
  ) => {
    try {
      const response = await portfolioAPI.updatePortfolio(portfolioId, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update portfolio');
    }
  }
);

export const deletePortfolio = createAsyncThunk(
  'portfolio/deletePortfolio',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      await portfolioAPI.deletePortfolio(portfolioId);
      return portfolioId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete portfolio');
    }
  }
);

export const addTransaction = createAsyncThunk(
  'portfolio/addTransaction',
  async (
    transactionData: Omit<Transaction, 'id'>,
    { rejectWithValue }
  ) => {
    try {
      const response = await portfolioAPI.addTransaction(transactionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'portfolio/updateTransaction',
  async (
    { transactionId, updates }: { transactionId: string; updates: Partial<Transaction> },
    { rejectWithValue }
  ) => {
    try {
      const response = await portfolioAPI.updateTransaction(transactionId, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'portfolio/deleteTransaction',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      await portfolioAPI.deleteTransaction(transactionId);
      return transactionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete transaction');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'portfolio/fetchTransactions',
  async (
    params: {
      portfolioId?: string;
      page?: number;
      limit?: number;
      type?: string;
      dateRange?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await portfolioAPI.getTransactions(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchPortfolioSummary = createAsyncThunk(
  'portfolio/fetchPortfolioSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioAPI.getPortfolioSummary();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch portfolio summary');
    }
  }
);

// Portfolio slice
const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPortfolio: (state, action: PayloadAction<Portfolio | null>) => {
      state.currentPortfolio = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<PortfolioState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updatePagination: (state, action: PayloadAction<Partial<PortfolioState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateHoldingPrice: (state, action: PayloadAction<{ symbol: string; price: number }>) => {
      // Update current prices for real-time updates
      if (state.currentPortfolio) {
        const holding = state.currentPortfolio.holdings.find(h => h.symbol === action.payload.symbol);
        if (holding) {
          holding.currentPrice = action.payload.price;
          holding.totalValue = holding.quantity * action.payload.price;
          holding.unrealizedPnL = holding.totalValue - holding.totalInvestment;
          holding.unrealizedPnLPercent = (holding.unrealizedPnL / holding.totalInvestment) * 100;
        }
      }
      
      // Update in portfolios array
      state.portfolios.forEach(portfolio => {
        const holding = portfolio.holdings.find(h => h.symbol === action.payload.symbol);
        if (holding) {
          holding.currentPrice = action.payload.price;
          holding.totalValue = holding.quantity * action.payload.price;
          holding.unrealizedPnL = holding.totalValue - holding.totalInvestment;
          holding.unrealizedPnLPercent = (holding.unrealizedPnL / holding.totalInvestment) * 100;
        }
      });
    },
    clearPortfolioState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Fetch portfolios
    builder
      .addCase(fetchPortfolios.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.isLoading = false;
        state.portfolios = action.payload.portfolios;
        state.error = null;
      })
      .addCase(fetchPortfolios.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch portfolio by ID
    builder
      .addCase(fetchPortfolioById.fulfilled, (state, action) => {
        state.currentPortfolio = action.payload.portfolio;
        // Update in portfolios array too
        const index = state.portfolios.findIndex(p => p.id === action.payload.portfolio.id);
        if (index !== -1) {
          state.portfolios[index] = action.payload.portfolio;
        }
      });

    // Create portfolio
    builder
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.portfolios.push(action.payload.portfolio);
      });

    // Update portfolio
    builder
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        const index = state.portfolios.findIndex(p => p.id === action.payload.portfolio.id);
        if (index !== -1) {
          state.portfolios[index] = action.payload.portfolio;
        }
        if (state.currentPortfolio?.id === action.payload.portfolio.id) {
          state.currentPortfolio = action.payload.portfolio;
        }
      });

    // Delete portfolio
    builder
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.portfolios = state.portfolios.filter(p => p.id !== action.payload);
        if (state.currentPortfolio?.id === action.payload) {
          state.currentPortfolio = null;
        }
      });

    // Transactions
    builder
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t.id === action.payload.transaction.id);
        if (index !== -1) {
          state.transactions[index] = action.payload.transaction;
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
      });

    // Portfolio summary
    builder
      .addCase(fetchPortfolioSummary.fulfilled, (state, action) => {
        state.summary = action.payload.summary;
      });
  },
});

export const {
  clearError,
  setCurrentPortfolio,
  updateFilters,
  updatePagination,
  updateHoldingPrice,
  clearPortfolioState,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;