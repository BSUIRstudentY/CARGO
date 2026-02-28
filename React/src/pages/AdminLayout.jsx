
import React, { useState } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/solid';
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
import AdminCRMOrders from './AdminCRMOrders';
import AdminCRMProducts from './AdminCRMProducts';
import AdminCRMTickets from './AdminCRMTickets';
import AdminCRMBatchCargos from './AdminCRMBatchCargos';
import OrderDetails from './OrderDetails';

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin/orderHistory', label: 'CRM Dashboard', icon: '📊' },
    { path: '/admin/crm/users', label: 'Пользователи', icon: '👥' },
    { path: '/admin/crm/orders', label: 'Заказы', icon: '📋' },
    { path: '/admin/crm/products', label: 'Товары', icon: '📦' },
    { path: '/admin/crm/quests', label: 'Квесты', icon: '🏆' },
    { path: '/admin/crm/promocodes', label: 'Промокоды', icon: '🎟️' },
    { path: '/admin/crm/news', label: 'Новости', icon: '📰' },
    { path: '/admin/crm/tickets', label: 'Тикеты', icon: '🎫' },
    { path: '/admin/crm/batch-cargos', label: 'Батч-карго', icon: '🚚' },
    { path: '/admin/orders', label: 'Заказы (старая)', icon: '📋' },
    { path: '/admin/upcoming-purchases', label: 'Выкупы', icon: '🛒' },
    { path: '/admin/support', label: 'Тех. поддержка', icon: '🛠️' },
    { path: '/admin/statistics', label: 'Статистика', icon: '📈' },
    { path: '/admin/catalog', label: 'Каталог', icon: '📦' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-[#e5e7eb] relative overflow-hidden">
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-[#1a1a1a] border-2 border-[#e81e2d] p-3 rounded-lg text-[#e81e2d] hover:bg-[#e81e2d] hover:text-white transition-all duration-300 shadow-lg shadow-[#e81e2d]/30"
      >
        {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </motion.button>
      
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-64 bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] fixed top-0 left-0 h-screen z-40 overflow-hidden border-r border-[#333333] shadow-2xl"
          >
            <div className="p-6 h-full flex flex-col justify-between relative z-10">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex justify-between items-center mb-6"
                >
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#e81e2d] to-[#ff4757] bg-clip-text text-transparent flex items-center gap-2">
                    <span>⚙️</span>
                    Админ-панель
                  </h2>
                </motion.div>
                <nav>
                  <ul className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        <motion.button
                          whileHover={{ x: 6 }}
                          onClick={() => {
                            navigate(item.path);
                            closeSidebar();
                          }}
                          className="w-full text-left px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333333] hover:border-[#e81e2d] hover:bg-[#e81e2d]/10 transition-all duration-300 text-[#cdcdcd] hover:text-white flex items-center gap-3 group"
                        >
                          <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </motion.button>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <div className="car-animation w-24 h-12 absolute -bottom-4 left-2 opacity-90">
                  <img
                    src="/car.png"
                    alt="Cargo Truck"
                    className="w-full h-full object-contain filter brightness-150 drop-shadow-lg"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="w-full mt-8 px-4 py-3 rounded-lg bg-gradient-to-r from-[#e81e2d] to-[#ff4757] text-white hover:from-[#ff4757] hover:to-[#e81e2d] transition-all duration-300 text-base font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#e81e2d]/30"
                >
                  <span>Выйти</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <main className="flex-1 p-6 relative z-10 overflow-y-auto">
        <Routes>
          {/* CRM Routes */}
          <Route path="/admin/crm/dashboard" element={<AdminCRMDashboard />} />
          <Route path="/admin/crm/users" element={<AdminCRMUsers />} />
          <Route path="/admin/crm/orders" element={<AdminCRMOrders />} />
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