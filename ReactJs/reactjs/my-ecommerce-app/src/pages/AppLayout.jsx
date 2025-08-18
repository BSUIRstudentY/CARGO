import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import Header from './Header';
import Footer from './Footer';
import Catalog from './Catalog';
import MultiTerminal from './MultiTerminal';
import CartPage from './CartPage';
import Profile from './Profile';
import ProductDetail from './ProductDetail';
import OrderDetails from './OrderDetails';
import Home from './Home';
import DeliveryPayment from './DeliveryPayment';
import OrderInstructions from './OrderInstructions';
import SelfPickupCargo from './SelfPickupCargo';
import FAQSection from './FAQSection';
import SupportPage from './SupportPage';
import TicketChatPage from './TicketChatPage';
import Notifications from './Notifications'; // Import the new Notifications component

function AppLayout() {
  const [backgroundColor, setBackgroundColor] = useState(() => localStorage.getItem('backgroundColor') || '#2F2F2F');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#FF5722');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    localStorage.setItem('accentColor', accentColor);
  }, [backgroundColor, accentColor]);

  const navItems = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/catalog', label: 'Каталог', icon: '📦' },
    { path: '/terminal', label: 'Терминал', icon: '💻' },
    { path: '/cart', label: 'Корзина', icon: '🛒' },
    { path: '/profile', label: 'Профиль', icon: '👤' },
    { path: '/notifications', label: 'Уведомления', icon: '🔔' }, // Added Notifications tab
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: '🚚' },
    { path: '/order-instructions', label: 'Инструкции по заказу', icon: '📋' },
    { path: '/self-pickup', label: 'Самовыкуп', icon: '📦' },
    { path: '/faq', label: 'FAQ', icon: '❓' },
    { path: '/support', label: 'Поддержка', icon: '🛠️' },
    { path: '/about', label: 'О нас', icon: 'ℹ️' },
    { path: '/contact', label: 'Контакты', icon: '📞' },
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
                ChinaShopBY
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
            {isAuthenticated && (
              <button
                onClick={logout}
                className="w-full mt-6 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200 hover:scale-105"
              >
                Выйти
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Основное содержимое с маршрутами */}
      <main className="flex-1 p-6 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/terminal" element={<MultiTerminal />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} /> {/* Added Notifications route */}
          <Route path="/delivery-payment" element={<DeliveryPayment />} />
          <Route path="/order-instructions" element={<OrderInstructions />} />
          <Route path="/self-pickup" element={<SelfPickupCargo />} />
          <Route path="/faq" element={<FAQSection />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/ticket/:ticketId/chat" element={<TicketChatPage />} />
          <Route path="/about" element={
            <section id="about" className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">О нас</h2>
              <p className="text-center text-lg sm:text-xl text-gray-300">
                ChinaShopBY — ваш надежный партнер для покупок из Китая. Мы предлагаем лучшие цены и удобный сервис.
              </p>
              {Array.from({ length: 50 }).map((_, i) => (
                <p key={i} className="my-4">Пример текста для прокрутки {i + 1}</p>
              ))}
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
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;