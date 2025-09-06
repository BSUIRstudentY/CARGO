import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import LoginButton from '../components/LoginButton';
import { useCart } from '../components/CartContext';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2 className="text-center text-red-500">Произошла ошибка в хедере. Пожалуйста, перезагрузите страницу.</h2>;
    }
    return this.props.children;
  }
}

function Header({ isAuthenticated, handleLogout, backgroundColor, accentColor, setBackgroundColor, setAccentColor }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading: cartLoading, error: cartError } = useCart();

  const cartCount = cart ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

  return (
    <ErrorBoundary>
      <header className="shadow-md p-4 sm:p-6" style={{ backgroundColor }}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className={`text-2xl sm:text-3xl font-bold text-[${accentColor}]`}>ChinaShopBY</h1>
          <nav className="hidden sm:flex space-x-6">
            <Link to="/" className="hover:text-gray-300 text-white">Главная</Link>
            <Link to="/catalog" className="hover:text-gray-300 text-white">Каталог</Link>
            <Link to="/terminal" className="hover:text-gray-300 text-white">Терминал</Link>
            <Link to="/about" className="hover:text-gray-300 text-white">О нас</Link>
            <Link to="/cart" className="hover:text-gray-300 text-white relative">
              Корзина
              {cartCount > 0 && (
                <span className="absolute top-0 right-[-10px] bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/contact" className="hover:text-gray-300 text-white">Контакты</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <label className="text-white">Фон:</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="p-1 rounded"
              />
              <label className="text-white">Акцент:</label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="p-1 rounded"
              />
            </div>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-10 h-10 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center hover:bg-opacity-80 transition duration-300"
                  title={user.name || 'Профиль'}
                >
                  👤
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 p-2 rounded text-white hover:bg-red-700"
                >
                  Выйти
                </button>
              </>
            ) : (
              <LoginButton />
            )}
            <div className="sm:hidden">
              <button className="text-white focus:outline-none">☰</button>
            </div>
          </div>
        </div>
        {(cartError || cartLoading) && (
          <div className="text-center text-sm text-red-500 mt-2">
            {cartError || (cartLoading && 'Загрузка корзины...')}
          </div>
        )}
      </header>
    </ErrorBoundary>
  );
}

export default Header;