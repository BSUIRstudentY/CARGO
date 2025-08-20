import React, { useState } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import AdminPanel from './AdminPanel';
import OrderCheck from './OrderCheck';
import AdminCatalog from './AdminCatalog';
import AdminSupportPage from './AdminSupportPage';
import TicketChatPage from './TicketChatPage';

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Главная', icon: '🏠' },
    { path: '/admin/orders', label: 'Заказы', icon: '📋' },
    { path: '/admin/support', label: 'Тех. поддержка', icon: '🛠️' },
    { path: '/admin/statistics', label: 'Статистика', icon: '📊' },
    { path: '/admin/settings', label: 'Настройки', icon: '⚙️' },
    { path: '/admin/suppliers', label: 'Поставщики', icon: '🚚' },
    { path: '/admin/commission', label: 'Комиссии', icon: '💰' },
    { path: '/admin/catalog', label: 'Каталог', icon: '📦' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="1"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
        backgroundRepeat: 'repeat',
        zIndex: 0,
      }}></div>
      {/* Кнопка для открытия панели */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-[var(--accent-color)] p-2 rounded-full text-white hover:bg-opacity-80 transition-colors duration-200"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
          />
        </svg>
      </button>

      {/* Боковая панель с анимацией */}
      <aside
        className={`w-64 bg-gray-800 shadow-lg fixed top-0 left-0 h-screen z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full delay-750'
        }`}
      >
        <div className="p-6 h-full flex flex-col justify-between relative">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--accent-color)] flex items-center">
                <svg
                  className="w-8 h-8 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
                Админ-панель
              </h2>
            </div>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        closeSidebar();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 text-green-300 hover:text-green-100 flex items-center group"
                    >
                      <span className="mr-2 transition-transform duration-300 group-hover:translate-x-1">
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="relative">
            {/* Анимация машины и пыли */}
            <div className={`car-animation ${isSidebarOpen ? 'active' : ''} w-24 h-12 absolute bottom-16 left-2`}>
              <img src="/car.png" alt="Cargo Truck" className="car w-full h-full object-contain filter invert brightness-200 z-50" />
              <div className="dust z-40"></div>
            </div>
            <button
              onClick={logout}
              className="w-full mt-6 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200 hover:scale-105"
            >
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Основное содержимое */}
      <main className="flex-1 p-6 relative z-10 overflow-y-auto">
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/orders" element={<AdminPanel section="orders" />} />
          <Route path="/admin/orders/check/:id" element={<OrderCheck />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
          <Route path="/admin/support/ticket/:ticketId/chat" element={<TicketChatPage />} />
          <Route path="/admin/statistics" element={<AdminPanel section="statistics" />} />
          <Route path="/admin/settings" element={<AdminPanel section="settings" />} />
          <Route path="/admin/suppliers" element={<AdminPanel section="suppliers" />} />
          <Route path="/admin/commission" element={<AdminPanel section="commission" />} />
          <Route path="/admin/catalog/*" element={<AdminCatalog />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminLayout;