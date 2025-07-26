import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { screeningAPI } from '../../services/api';

// Types
export interface ScreeningFilter {
  id: string;
  category: 'fundamental' | 'technical' | 'performance';
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between' | 'in';
  value: any;
  displayName: string;
}

export interface ScreeningCriteria {
  filters: ScreeningFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface ScreeningResult {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  marketCap: number;
  pe: number;
  pb: number;
  roe: number;
  debt_to_equity: number;
  revenue_growth: number;
  profit_growth: number;
  dividend_yield: number;
  score: number;
  lastUpdated: string;
}

export interface SavedScreen {
  id: string;
  name: string;
  description?: string;
  criteria: ScreeningCriteria;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  resultsCount?: number;
}

export interface ScreeningTemplate {
  id: string;
  name: string;
  description: string;
  category: 'growth' | 'value' | 'dividend' | 'quality' | 'momentum' | 'custom';
  criteria: ScreeningCriteria;
  isDefault: boolean;
}

interface ScreeningState {
  currentCriteria: ScreeningCriteria;
  results: ScreeningResult[];
  savedScreens: SavedScreen[];
  templates: ScreeningTemplate[];
  availableFilters: {
    fundamental: ScreeningFilter[];
    technical: ScreeningFilter[];
    performance: ScreeningFilter[];
  };
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  summary: {
    totalResults: number;
    avgScore: number;
    topSectors: { [sector: string]: number };
    priceRange: { min: number; max: number };
  } | null;
}

// Initial state
const initialState: ScreeningState = {
  currentCriteria: {
    filters: [],
    sortBy: 'score',
    sortOrder: 'desc',
    limit: 50,
  },
  results: [],
  savedScreens: [],
  templates: [],
  availableFilters: {
    fundamental: [],
    technical: [],
    performance: [],
  },
  isLoading: false,
  isSearching: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
  },
  summary: null,
};

// Async thunks
export const fetchAvailableFilters = createAsyncThunk(
  'screening/fetchAvailableFilters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.getAvailableFilters();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch filters');
    }
  }
);

export const runScreening = createAsyncThunk(
  'screening/runScreening',
  async (
    params: {
      criteria: ScreeningCriteria;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await screeningAPI.runScreen(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Screening failed');
    }
  }
);

export const saveScreen = createAsyncThunk(
  'screening/saveScreen',
  async (
    screenData: {
      name: string;
      description?: string;
      criteria: ScreeningCriteria;
      isPublic?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await screeningAPI.saveScreen(screenData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to save screen');
    }
  }
);

export const updateSavedScreen = createAsyncThunk(
  'screening/updateSavedScreen',
  async (
    {
      screenId,
      updates,
    }: {
      screenId: string;
      updates: Partial<SavedScreen>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await screeningAPI.updateSavedScreen(screenId, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update screen');
    }
  }
);

export const deleteSavedScreen = createAsyncThunk(
  'screening/deleteSavedScreen',
  async (screenId: string, { rejectWithValue }) => {
    try {
      await screeningAPI.deleteSavedScreen(screenId);
      return screenId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete screen');
    }
  }
);

export const fetchSavedScreens = createAsyncThunk(
  'screening/fetchSavedScreens',
  async (_, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.getSavedScreens();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch saved screens');
    }
  }
);

export const fetchScreeningTemplates = createAsyncThunk(
  'screening/fetchScreeningTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.getTemplates();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch templates');
    }
  }
);

export const loadSavedScreen = createAsyncThunk(
  'screening/loadSavedScreen',
  async (screenId: string, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.getSavedScreen(screenId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to load saved screen');
    }
  }
);

export const exportScreeningResults = createAsyncThunk(
  'screening/exportScreeningResults',
  async (
    {
      criteria,
      format,
    }: {
      criteria: ScreeningCriteria;
      format: 'csv' | 'excel' | 'pdf';
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await screeningAPI.exportResults(criteria, format);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Export failed');
    }
  }
);

// Screening slice
const screeningSlice = createSlice({
  name: 'screening',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    // Filter management
    addFilter: (state, action: PayloadAction<ScreeningFilter>) => {
      const existingIndex = state.currentCriteria.filters.findIndex(
        f => f.field === action.payload.field
      );
      
      if (existingIndex !== -1) {
        state.currentCriteria.filters[existingIndex] = action.payload;
      } else {
        state.currentCriteria.filters.push(action.payload);
      }
    },
    
    removeFilter: (state, action: PayloadAction<string>) => {
      state.currentCriteria.filters = state.currentCriteria.filters.filter(
        f => f.id !== action.payload
      );
    },
    
    updateFilter: (state, action: PayloadAction<{ id: string; updates: Partial<ScreeningFilter> }>) => {
      const { id, updates } = action.payload;
      const filterIndex = state.currentCriteria.filters.findIndex(f => f.id === id);
      
      if (filterIndex !== -1) {
        state.currentCriteria.filters[filterIndex] = {
          ...state.currentCriteria.filters[filterIndex],
          ...updates,
        };
      }
    },
    
    clearFilters: (state) => {
      state.currentCriteria.filters = [];
    },
    
    // Criteria management
    updateCriteria: (state, action: PayloadAction<Partial<ScreeningCriteria>>) => {
      state.currentCriteria = { ...state.currentCriteria, ...action.payload };
    },
    
    loadCriteria: (state, action: PayloadAction<ScreeningCriteria>) => {
      state.currentCriteria = action.payload;
    },
    
    resetCriteria: (state) => {
      state.currentCriteria = initialState.currentCriteria;
    },
    
    // Results management
    clearResults: (state) => {
      state.results = [];
      state.summary = null;
    },
    
    updatePagination: (state, action: PayloadAction<Partial<{ page: number; limit: number; total: number }>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Template management
    applyTemplate: (state, action: PayloadAction<ScreeningTemplate>) => {
      state.currentCriteria = action.payload.criteria;
    },
    
    clearScreeningState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Fetch available filters
    builder
      .addCase(fetchAvailableFilters.fulfilled, (state, action) => {
        state.availableFilters = action.payload.filters;
      });

    // Run screening
    builder
      .addCase(runScreening.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(runScreening.fulfilled, (state, action) => {
        state.isSearching = false;
        state.results = action.payload.results;
        state.summary = action.payload.summary;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(runScreening.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });

    // Save screen
    builder
      .addCase(saveScreen.fulfilled, (state, action) => {
        state.savedScreens.push(action.payload.screen);
      });

    // Update saved screen
    builder
      .addCase(updateSavedScreen.fulfilled, (state, action) => {
        const index = state.savedScreens.findIndex(s => s.id === action.payload.screen.id);
        if (index !== -1) {
          state.savedScreens[index] = action.payload.screen;
        }
      });

    // Delete saved screen
    builder
      .addCase(deleteSavedScreen.fulfilled, (state, action) => {
        state.savedScreens = state.savedScreens.filter(s => s.id !== action.payload);
      });

    // Fetch saved screens
    builder
      .addCase(fetchSavedScreens.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSavedScreens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedScreens = action.payload.screens;
      })
      .addCase(fetchSavedScreens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch templates
    builder
      .addCase(fetchScreeningTemplates.fulfilled, (state, action) => {
        state.templates = action.payload.templates;
      });

    // Load saved screen
    builder
      .addCase(loadSavedScreen.fulfilled, (state, action) => {
        state.currentCriteria = action.payload.screen.criteria;
      });

    // Export results
    builder
      .addCase(exportScreeningResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(exportScreeningResults.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportScreeningResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  addFilter,
  removeFilter,
  updateFilter,
  clearFilters,
  updateCriteria,
  loadCriteria,
  resetCriteria,
  clearResults,
  updatePagination,
  applyTemplate,
  clearScreeningState,
} = screeningSlice.actions;

export default screeningSlice.reducer;