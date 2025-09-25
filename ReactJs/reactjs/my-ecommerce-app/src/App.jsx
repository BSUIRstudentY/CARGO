import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Header from './pages/Header';
import MultiTerminal from './pages/MultiTerminal';
import Catalog from './pages/Catalog';
import LoginRegister from './pages/LoginRegister';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Profile from './pages/Profile';
import { CartProvider } from './components/CartContext';
import CartPage from './pages/CartPage';
import AdminLayout from './pages/AdminLayout';
import AppLayout from './pages/AppLayout';
import GuestLayout from './pages/GuestLayout';
import Footer from './pages/Footer';
import './styles.css';

// Создаём клиент React Query с дефолтными настройками кэша
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // кэш 5 минут
      cacheTime: 30 * 60 * 1000, // держать кэш 30 минут
      refetchOnWindowFocus: false, // не перезапрашивать при фокусе
    },
  },
});

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    const handleAuthError = (event) => {
      setAuthMessage(event.detail.message);
      setShowAuthModal(true);
    };

    window.addEventListener('authError', handleAuthError);
    return () => window.removeEventListener('authError', handleAuthError);
  }, []);

  const handleModalClose = () => {
    setShowAuthModal(false);
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <>
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 w-full max-w-xs border border-cyan-400/20 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Требуется авторизация</h3>
              <p className="text-gray-300 mb-4">{authMessage}</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleModalClose}
                  className="flex-1 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-sm"
                >
                  Войти / Зарегистрироваться
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 text-sm"
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAuthenticated ? (
        user?.role === 'ADMIN' ? (
          <AdminLayout />
        ) : (
          <AppLayout />
        )
      ) : (
        <GuestLayout />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
