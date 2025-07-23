import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import Header from './Header';
import Footer from './Footer';
import Catalog from './Catalog';
import MultiTerminal from './MultiTerminal';
import CartPage from './CartPage';
import Profile from './Profile';

function AppLayout() {
  const [backgroundColor, setBackgroundColor] = useState(() => localStorage.getItem('backgroundColor') || '#2F2F2F');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#FF5722');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    localStorage.setItem('accentColor', accentColor);
  }, [backgroundColor, accentColor]);

  const navItems = [
    { path: '/', label: 'Главная' },
    { path: '/catalog', label: 'Каталог' },
    { path: '/terminal', label: 'Терминал' },
    { path: '/cart', label: 'Корзина' },
    { path: '/profile', label: 'Профиль' },
    { path: '/about', label: 'О нас' },
    { path: '/contact', label: 'Контакты' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Боковая панель */}
      <aside className="w-64 bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out fixed h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-6">ChinaShopBY</h2>
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 text-green-300 hover:text-green-100"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {isAuthenticated && (
            <button
              onClick={logout}
              className="w-full mt-6 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-200"
            >
              Выйти
            </button>
          )}
        </div>
      </aside>

      {/* Основное содержимое с маршрутами */}
      <main className="ml-64 p-6 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={
            <section id="home" className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">
                Добро пожаловать в ChinaShopBY
              </h2>
              <p className="text-center text-lg sm:text-xl mb-6 text-gray-300">
                Лучший выбор товаров из Китая по доступным ценам! Исследуйте каталог и используйте наш уникальный терминал.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">Популярный товар 1</div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">Популярный товар 2</div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">Популярный товар 3</div>
              </div>
            </section>
          } />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/terminal" element={<MultiTerminal />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={
            <section id="about" className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">О нас</h2>
              <p className="text-center text-lg sm:text-xl text-gray-300">
                ChinaShopBY — ваш надежный партнер для покупок из Китая. Мы предлагаем лучшие цены и удобный сервис.
              </p>
            </section>
          } />
          <Route path="/contact" element={
            <section id="contact">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Контакты</h2>
              <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center text-white">
                <p>Email: info@chinashopby.com</p>
                <p>Телефон: +375 29 123-45-67</p>
                <p>Адрес: Минск, ул. Примерная, 1</p>
              </div>
            </section>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default AppLayout;