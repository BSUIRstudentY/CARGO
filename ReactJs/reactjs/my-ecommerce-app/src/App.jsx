import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './pages/Header';
import Footer from './pages/Footer';
import MultiTerminal from './pages/MultiTerminal';
import Catalog from './pages/Catalog';
import LoginRegister from './pages/LoginRegister';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Profile from './pages/Profile';
import { CartProvider } from './components/CartContext';
import CartPage from './pages/CartPage';
import AdminLayout from './pages/AdminLayout';
import AppLayout from './pages/AppLayout';

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginRegister />;
  }

  return user?.role === 'ADMIN' ? <AdminLayout /> : <AppLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;