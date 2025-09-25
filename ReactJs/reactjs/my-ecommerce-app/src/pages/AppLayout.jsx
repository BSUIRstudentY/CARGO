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
import OrderDetailsHistory from './OrderDetailsHistory';
import { HomeIcon, ShoppingBagIcon, ComputerDesktopIcon, ShoppingCartIcon, CalculatorIcon, UserIcon, BellIcon, TruckIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon, WrenchScrewdriverIcon, InformationCircleIcon, PhoneIcon, StarIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

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
    { path: '/', label: 'Главная', icon: <HomeIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/catalog', label: 'Каталог', icon: <ShoppingBagIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/terminal', label: 'Терминал', icon: <ComputerDesktopIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/cart', label: 'Корзина', icon: <ShoppingCartIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/calculator', label: 'Калькулятор стоимости', icon: <CalculatorIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/profile', label: 'Профиль', icon: <UserIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/notifications', label: 'Уведомления', icon: <BellIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/order-instructions', label: 'Инструкции по заказу', icon: <ClipboardDocumentListIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/self-pickup', label: 'Самовыкуп', icon: <ShoppingBagIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/about', label: 'О нас', icon: <InformationCircleIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/contact', label: 'Контакты', icon: <PhoneIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/reviews', label: 'Отзывы', icon: <StarIcon className="w-5 h-5 text-cyan-400" /> },
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
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-4 bg-gray-800/50 rounded-lg transition-all duration-300 cursor-pointer ${
          isSidebarOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
        style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      >
        <img
          src="/logo.png"
          alt="Fluvion Logo"
          className="w-32 h-auto object-contain"
          style={{ transition: 'transform 0.3s ease' }}
        />
      </button>
      <aside
        className={`w-64 bg-gray-800/50 fixed top-0 left-0 h-screen z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full delay-750'
        }`}
      >
        <div className="p-6 h-full flex flex-col justify-between relative">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-bold flex items-center cursor-pointer text-white tracking-tight"
                onClick={closeSidebar}
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
                      className="w-full text-left px-4 py-3 rounded-lg bg-gray-700/40 hover:bg-gray-700/50 transition-all duration-300 flex items-center text-cyan-400 hover:text-cyan-200"
                    >
                      <span className="mr-2">{item.icon}</span>
                      <span>{item.label}</span>
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
                className="w-full mt-6 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-cyan-400" />
                  <span>Выйти</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>
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
              <div className="bg-gray-800/50 p-6 rounded-lg text-center text-white">
                <p>Email: <a href="mailto:support@fluvion.by" className="text-[var(--accent-color)] underline">support@fluvion.by</a></p>
                <p>Телефон: <a href="tel:+375291234567" className="text-[var(--accent-color)] underline">+375 29 123-45-67</a></p>
                <p>Адрес: 223710, Республика Беларусь, г. Солигорск, ул. Железнодорожная 6</p>
              </div>
            </section>
          } />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />
          <Route path="/order-details-history/:orderId" element={<OrderDetailsHistory />} />
          <Route path="/batch-cargo-details/:batchId" element={<BatchCargoDetails />} />
          <Route path="/public-offer" element={<PublicOffer />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/user-agreement" element={<UserAgreement />} />
          <Route path="/batch-cargos/:batchId/order/:orderId" element={<BatchCargoProcessing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;