
import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import AdminPanel from './AdminPanel';
import OrderCheck from './OrderCheck';
import AdminCatalog from './AdminCatalog';
import AdminSupportPage from './AdminSupportPage';
import TicketChatPage from './TicketChatPage';
import OrderHistoryList from './OrderHistoryList';
import OrderHistory from './OrderHistory';
import UpcomingPurchases from './UpcomingPurchases';
import BatchDetail from './BatchDetail';
import OrderProcessing from './OrderProcessing';
import AdminPromocode from './AdminPromocode';
import AdminQuest from './AdminQuest'; // New import
import AdminStats from './AdminStats';
import AdminNews from './AdminNews';
import OrderManagementCRM from './OrderManagementCRM';
import AdminCRMDashboard from './AdminCRMDashboard';
import AdminCRMUsers from './AdminCRMUsers';
import AdminOrderBoard from './AdminOrderBoard';
import AdminCRMProducts from './AdminCRMProducts';
import AdminCRMTickets from './AdminCRMTickets';
import AdminCRMBatchCargos from './AdminCRMBatchCargos';
import OrderDetails from './OrderDetails';

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin/crm/orders', label: 'Заказы' },
    { path: '/admin/crm/users', label: 'Пользователи' },
    { path: '/admin/crm/products', label: 'Товары' },
    { path: '/admin/crm/quests', label: 'Квесты' },
    { path: '/admin/crm/promocodes', label: 'Промокоды' },
    { path: '/admin/crm/news', label: 'Новости' },
    { path: '/admin/crm/tickets', label: 'Тикеты' },
    { path: '/admin/crm/batch-cargos', label: 'Батч-карго' },
    { path: '/admin/orderHistory', label: 'CRM' },
    { path: '/admin/orders', label: 'Заказы, архив' },
    { path: '/admin/upcoming-purchases', label: 'Выкупы' },
    { path: '/admin/support', label: 'Поддержка' },
    { path: '/admin/statistics', label: 'Статистика' },
    { path: '/admin/catalog', label: 'Каталог' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#eceef2] text-[#111]">
      <header className="nav glass">
        <button type="button" className="nav-icon" aria-label={isSidebarOpen ? 'Закрыть меню' : 'Меню'} onClick={toggleSidebar}>
          {isSidebarOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
        <button type="button" className="nav-brand" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="" />
          <span>Fluvion</span>
        </button>
        <span className="ml-auto pr-2 text-[12px] text-black/45">Админ</span>
      </header>

      {isSidebarOpen ? (
        <button type="button" className="fixed inset-0 z-20 bg-[#111]/10" aria-label="Закрыть меню" onClick={closeSidebar} />
      ) : null}
      {isSidebarOpen ? (
        <aside className="glass sheet fixed left-3 top-[72px] z-30 flex max-h-[calc(100vh-88px)] w-64 flex-col overflow-auto p-3 sm:left-[max(12px,calc(50%-490px))]">
          <p className="kicker mb-2 px-2">Разделы</p>
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                    className="flex w-full items-center whitespace-nowrap rounded-full px-3 py-2 text-left text-[13px] text-[#111] hover:bg-white/70"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button type="button" className="btn btn-light btn-sm mt-3" onClick={logout}>Выйти</button>
        </aside>
      ) : null}

      <main className="relative z-10 mx-auto w-full max-w-[980px] px-3 pb-16 pt-6 sm:px-5">
        <Routes>
          {/* CRM Routes */}
          <Route path="/admin/crm/dashboard" element={<AdminCRMDashboard />} />
          <Route path="/admin/crm/users" element={<AdminCRMUsers />} />
          <Route path="/admin/crm/orders" element={<AdminOrderBoard />} />
          <Route path="/admin/crm/products" element={<AdminCRMProducts />} />
          <Route path="/admin/crm/quests" element={<AdminQuest />} />
          <Route path="/admin/crm/promocodes" element={<AdminPromocode />} />
          <Route path="/admin/crm/news" element={<AdminNews />} />
          <Route path="/admin/crm/tickets" element={<AdminCRMTickets />} />
          <Route path="/admin/crm/batch-cargos" element={<AdminCRMBatchCargos />} />
          
          {/* Legacy Routes */}
          <Route path="/admin" element={<AdminPanel section="orders" />} />
          <Route path="/admin/orders" element={<AdminPanel section="orders" />} />
          <Route path="/admin/orders/check/:id" element={<OrderCheck />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
          <Route path="/admin/support/ticket/:ticketId/chat" element={<TicketChatPage />} />
          
          <Route path="/admin/suppliers" element={<AdminPanel section="suppliers" />} />
          <Route path="/admin/commission" element={<AdminPanel section="commission" />} />
          <Route path="/admin/catalog/*" element={<AdminCatalog />} />
          <Route path="/admin/promocodes" element={<AdminPromocode />} />
          <Route path="/admin/quests" element={<AdminQuest />} />
          <Route path="/admin/orderHistory" element={<OrderManagementCRM />} />
          <Route path="/admin/orderHistory/:id" element={<OrderHistory />} />
          <Route path="/admin/crm" element={<OrderManagementCRM />} />
          <Route path="/admin/upcoming-purchases" element={<UpcomingPurchases />} />
          <Route path="/admin/upcoming-purchases/:id" element={<BatchDetail />} />
          <Route path="/admin/upcoming-purchases/:batchId/order/:orderId" element={<OrderProcessing />} />
          <Route path="/admin/statistics" element={<AdminStats/>} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />
          
        </Routes>
      </main>
    </div>
  );
}

export default AdminLayout;