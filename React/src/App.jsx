import React, { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider, useAuth } from './components/AuthProvider';
import { CartProvider } from './components/CartContext';
import './styles.css';
import './styles/cupertino.css';
import './styles/cargo.css';

// Lazy load heavy components for code splitting and performance optimization
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AppLayout = lazy(() => import('./pages/AppLayout'));
const GuestLayout = lazy(() => import('./pages/GuestLayout'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-transparent">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[rgba(60,60,67,0.16)] border-t-[#111111]"></div>
      <p className="mt-4 text-sm" style={{ color: 'var(--c-secondary)' }}>Загрузка...</p>
    </div>
  </div>
);

// Optimized React Query client with performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 30 * 60 * 1000, // Keep cache for 30 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on component mount if data is fresh
      retry: 1, // Retry failed requests once
      retryDelay: 1000, // Wait 1 second before retry
    },
  },
});

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  const LayoutComponent = useMemo(() => {
    if (!isAuthenticated) {
      return GuestLayout;
    }
    return user?.role === 'ADMIN' ? AdminLayout : AppLayout;
  }, [isAuthenticated, user?.role]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LayoutComponent />
    </Suspense>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
