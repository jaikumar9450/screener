import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import appSlice from './slices/appSlice';
import portfolioSlice from './slices/portfolioSlice';
import watchlistSlice from './slices/watchlistSlice';
import screeningSlice from './slices/screeningSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'app'], // Only persist auth and app state
  version: 1,
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  app: appSlice,
  portfolio: portfolioSlice,
  watchlist: watchlistSlice,
  screening: screeningSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;