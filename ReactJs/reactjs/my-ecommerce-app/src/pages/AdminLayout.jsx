import React from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import AdminPanel from './AdminPanel';
import OrderCheck from './OrderCheck';
import AdminCatalog from './AdminCatalog';
import AdminSupportPage from './AdminSupportPage';
import TicketChatPage from './TicketChatPage'; // Добавляем TicketChatPage

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin', label: 'Главная' },
    { path: '/admin/orders', label: 'Заказы' },
    { path: '/admin/support', label: 'Тех. поддержка' },
    { path: '/admin/statistics', label: 'Статистика' },
    { path: '/admin/settings', label: 'Настройки' },
    { path: '/admin/suppliers', label: 'Поставщики' },
    { path: '/admin/commission', label: 'Комиссии' },
    { path: '/admin/catalog', label: 'Каталог' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Боковая панель */}
      <aside className="w-64 bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out fixed h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-6">Админ-панель</h2>
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 text-blue-300 hover:text-blue-100"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button
            onClick={logout}
            className="w-full mt-6 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-200"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Основное содержимое */}
      <main className="ml-64 p-6 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/orders" element={<AdminPanel section="orders" />} />
          <Route path="/admin/orders/check/:id" element={<OrderCheck />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
          <Route path="/admin/support/ticket/:ticketId/chat" element={<TicketChatPage />} /> {/* Новый маршрут */}
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