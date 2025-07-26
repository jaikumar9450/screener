import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
import PublicLayout from './components/layouts/PublicLayout';
import PrivateLayout from './components/layouts/PrivateLayout';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/auth/VerifyEmailPage'));

const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ScreenerPage = React.lazy(() => import('./pages/ScreenerPage'));
const CompanyPage = React.lazy(() => import('./pages/CompanyPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));
const WatchlistPage = React.lazy(() => import('./pages/WatchlistPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <PublicLayout>
                    <LoginPage />
                  </PublicLayout>
                </PublicRoute>
              }
            />
            
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <PublicLayout>
                    <RegisterPage />
                  </PublicLayout>
                </PublicRoute>
              }
            />
            
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <PublicLayout>
                    <ForgotPasswordPage />
                  </PublicLayout>
                </PublicRoute>
              }
            />
            
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <PublicLayout>
                    <ResetPasswordPage />
                  </PublicLayout>
                </PublicRoute>
              }
            />
            
            <Route
              path="/verify-email"
              element={
                <PublicLayout>
                  <VerifyEmailPage />
                </PublicLayout>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PrivateLayout>
                    <DashboardPage />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/screener"
              element={
                <ProtectedRoute>
                  <PrivateLayout>
                    <ScreenerPage />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/company/:symbol"
              element={
                <ProtectedRoute>
                  <PrivateLayout>
                    <CompanyPage />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <PrivateLayout>
                    <PortfolioPage />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <PrivateLayout>
                    <WatchlistPage />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PrivateLayout>
                    <ProfilePage />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default App;