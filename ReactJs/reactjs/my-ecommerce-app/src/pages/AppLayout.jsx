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
import Notifications from './Notifications';
import Reviews from './Reviews';
import CostCalculator from './CostCalculator';
import BatchCargoDetails from './BatchCargoDetails';
import PublicOffer from './PublicOffer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import UserAgreement from '../components/UserAgreement';
import BatchCargoProcessing from './BatchCargoProcessing';

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
    { path: '/calculator', label: 'Калькулятор стоимости', icon: '🧮' },
    { path: '/profile', label: 'Профиль', icon: '👤' },
    { path: '/notifications', label: 'Уведомления', icon: '🔔' },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: '🚚' },
    { path: '/order-instructions', label: 'Инструкции по заказу', icon: '📋' },
    { path: '/self-pickup', label: 'Самовыкуп', icon: '📦' },
    { path: '/faq', label: 'FAQ', icon: '❓' },
    { path: '/support', label: 'Поддержка', icon: '🛠️' },
    { path: '/about', label: 'О нас', icon: 'ℹ️' },
    { path: '/contact', label: 'Контакты', icon: '📞' },
    { path: '/reviews', label: 'Отзывы', icon: '⭐' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="1"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
          zIndex: 0,
        }}
      ></div>
      {/* Кнопка для открытия/закрытия боковой панели с большим логотипом */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-4 bg-transparent hover:bg-gray-800/50 rounded transition-all duration-500 hover:shadow-lg cursor-pointer ${
          isSidebarOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
        style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      >
        <img
          src="/logo.png"
          alt="Fluvion Logo"
          className="w-32 h-auto object-contain"
          style={{
            filter: 'drop-shadow(0 4px 15px rgba(255, 87, 34, 0.7))',
            transition: 'transform 0.3s ease',
          }}
        />
        {/* Эффект огня, активируется при открытии */}
        <div
          className={`fire-effect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 ${
            isSidebarOpen ? 'fire-active' : ''
          }`}
          style={{ transition: 'opacity 0.5s ease' }}
        >
          <div className="fire-layer base"></div>
          <div className="fire-layer middle"></div>
          <div className="fire-layer top"></div>
        </div>
      </button>
      {/* Боковая панель с анимацией и логотипом в заголовке */}
      <aside
        className={`w-64 bg-gray-800 shadow-lg fixed top-0 left-0 h-screen z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full delay-750'
        }`}
      >
        <div className="p-6 h-full flex flex-col justify-between relative">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-2xl font-bold flex items-center cursor-pointer transition-all duration-500 ${
                  isSidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                onClick={closeSidebar}
                style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
              >
                <img
                  src="/logo.png"
                  alt="Fluvion Logo"
                  className="w-8 h-8 mr-1 object-contain hover:opacity-80 transition-opacity duration-200"
                />
                <span style={{ letterSpacing: '-0.5px', color: '#FF0000' }}>LUVION</span>
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
            <div className={`car-animation ${isSidebarOpen ? 'active' : ''} w-24 h-12 absolute bottom-16 left-2`}>
              <img
                src="/car.png"
                alt="Cargo Truck"
                className="car w-full h-full object-contain filter invert brightness-200 z-50"
              />
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
          <Route path="/calculator" element={<CostCalculator />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
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
                Fluvion - ваш надежный партнер для покупок из Китая. Мы предлагаем лучшие цены и удобный сервис для заказа товаров с доставкой в Беларусь.
              </p>
            </section>
          } />
          <Route path="/contact" element={
            <section id="contact">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Контакты</h2>
              <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center text-white">
                <p>Email: <a href="mailto:support@fluvion.by" className="text-[var(--accent-color)] underline">support@fluvion.by</a></p>
                <p>Телефон: <a href="tel:+375291234567" className="text-[var(--accent-color)] underline">+375 29 123-45-67</a></p>
                <p>Адрес: 223710, Республика Беларусь, г. Солигорск, ул. Железнодорожная 6</p>
              </div>
            </section>
          } />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />
          <Route path="/batch-cargo-details/:batchId" element={<BatchCargoDetails />} />
          <Route path="/public-offer" element={<PublicOffer />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/user-agreement" element={<UserAgreement />} />
          <Route path="/batch-cargos/:batchId/order/:orderId" element={<BatchCargoProcessing />} />
        </Routes>
      </main>
      <Footer />
      <style>
        {`
          .fire-effect {
            display: none;
            position: absolute;
            width: 20px;
            height: 20px;
            pointer-events: none;
          }
          .fire-active {
            display: block;
          }
          .fire-layer {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 165, 0, 0.9) 0%, rgba(255, 69, 0, 0.7) 50%, rgba(255, 0, 0, 0) 70%);
            animation: fireFlicker 0.4s infinite alternate, fireRise 1.2s infinite;
            filter: blur(3px);
          }
          .fire-layer.base {
            animation-delay: 0s;
            opacity: 0.8;
          }
          .fire-layer.middle {
            animation-delay: 0.1s;
            opacity: 0.6;
            transform: scale(0.7);
          }
          .fire-layer.top {
            animation-delay: 0.2s;
            opacity: 0.4;
            transform: scale(0.5);
          }
          @keyframes fireFlicker {
            0% { transform: scale(1); }
            100% { transform: scale(1.3); }
          }
          @keyframes fireRise {
            0% { transform: translateY(0); opacity: 0.9; }
            100% { transform: translateY(-40px); opacity: 0; }
          }
          button:hover img {
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
}

export default AppLayout;