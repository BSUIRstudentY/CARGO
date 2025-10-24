import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
import Rate from './Rate';
import Suppliers from './Suppliers'; // Импортируем Suppliers.jsx

import {
  HomeIcon,
  ShoppingBagIcon,
  ComputerDesktopIcon,
  ShoppingCartIcon,
  CalculatorIcon,
  UserIcon,
  BellIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  PhoneIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/solid';
import SupplierDetail from './SupplierDetail';
import SupplierChat from './SupplierChat';

function AppLayout() {
  const [backgroundColor, setBackgroundColor] = useState(() => localStorage.getItem('backgroundColor') || '#2F2F2F');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#FF5722');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarFullyClosed, setIsSidebarFullyClosed] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    localStorage.setItem('accentColor', accentColor);
  }, [backgroundColor, accentColor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    let timer;
    if (!isSidebarOpen) {
      timer = setTimeout(() => {
        setIsSidebarFullyClosed(true);
      }, 300);
    } else {
      setIsSidebarFullyClosed(false);
    }
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  const navItems = [
    { path: '/', label: 'Главная', icon: <HomeIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/suppliers', label: 'Поставщики', icon: <BuildingOfficeIcon className="w-5 h-5 text-orange-400" />, highlight: true },
    { path: '/catalog', label: 'Каталог', icon: <ShoppingBagIcon className="w-5 h-5 text-orange-400" />, highlight: true },
    { path: '/terminal', label: 'Терминал', icon: <ComputerDesktopIcon className="w-5 h-5 text-orange-400" />, highlight: true },
    { path: '/self-pickup', label: 'Самовыкуп', icon: <ShoppingBagIcon className="w-5 h-5 text-orange-400" />, highlight: true },
    { path: '/rates', label: 'Курс', icon: <CurrencyDollarIcon className="w-5 h-5 text-orange-400" />, highlight: true },
    { path: '/cart', label: 'Корзина', icon: <ShoppingCartIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/calculator', label: 'Калькулятор', icon: <CalculatorIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/profile', label: 'Профиль', icon: <UserIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/notifications', label: 'Уведомления', icon: <BellIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/order-instructions', label: 'Инструкции', icon: <ClipboardDocumentListIcon className="w-5 h-5 text-cyan-400" /> },
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
      {/* Background Wires with Ions — UPDATED: 12+ хаотичных путей, cyan, больше ионов */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <svg viewBox="0 0 1200 800" className="w-full h-full">
          {/* Хаотичные прямоугольные пути (L-образные/прямоугольники, 90° углы, больше для разнообразия) */}
          <defs>
            <path id="wire1" d="M100 100 L100 300 L400 300 L400 200" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire2" d="M500 150 L500 400 L800 400 L800 250" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire3" d="M200 500 L200 700 L600 700 L600 550" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire4" d="M900 100 L900 250 L1100 250 L1100 400" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire5" d="M300 200 L300 150 L600 150 L600 350" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire6" d="M700 500 L700 600 L1000 600 L1000 450" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire7" d="M50 350 L50 500 L250 500 L250 400" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire8" d="M450 50 L450 200 L750 200 L750 100" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire9" d="M850 550 L850 700 L1050 700 L1050 600" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire10" d="M150 600 L150 750 L450 750 L450 650" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire11" d="M650 300 L650 450 L950 450 L950 350" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path id="wire12" d="M1050 200 L1050 350 L1150 350 L1150 250" stroke="url(#cyanGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
            {/* Градиент для лучшего вида */}
            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </linearGradient>
            <filter id="wireGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Провода */}
          {Array.from({ length: 12 }).map((_, i) => <use key={i} href={`#wire${i + 1}`} filter="url(#wireGlow)" />)}
          {/* Бегущие ионы (8 на wire, random speed, infinite) */}
          {Array.from({ length: 12 }).map((wireNum) => 
            Array.from({ length: 8 }).map((_, i) => (
              <circle
                key={`${wireNum}-${i}`}
                cx="0" cy="0"
                r="1.2"
                fill="#06b6d4"
                opacity="0.9"
                filter="url(#wireGlow)"
              >
                <animateMotion
                  dur={`${1.5 + Math.random() * 2.5}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                  calcMode="spline"
                  keySplines="0.5 0 0.5 1"
                >
                  <mpath xlinkHref={`#wire${wireNum}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0.7;1;0.7"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="1;1.8;1"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            ))
          )}
          {/* Пульсация всей сети */}
          <animate
            attributeName="opacity"
            values="0.7;0.9;0.7"
            dur="5s"
            repeatCount="indefinite"
          />
        </svg>
      </div>
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="1"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
          zIndex: 0,
        }}
      ></div>
      <style>
        {`
          @media (max-width: 640px) {
            .mobile-header {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              background-color: #1F2937;
              padding: 12px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              z-index: 50;
            }
            .mobile-hamburger {
              padding: 8px;
              background-color: #374151;
              border-radius: 8px;
              cursor: pointer;
            }
            .mobile-hamburger svg {
              width: 24px;
              height: 24px;
              color: #ffffff;
            }
            .mobile-logo-container {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .mobile-logo {
              width: 28px;
              height: 28px;
              object-fit: contain;
            }
            .mobile-logo-text {
              font-size: 20px;
              font-weight: bold;
              color: #FF0000;
              letter-spacing: -0.5px;
            }
            .desktop-header {
              display: none;
            }
            .main-content {
              padding: 16px;
            }
          }
          @media (min-width: 641px) {
            .mobile-header {
              display: none;
            }
          }
          /* Стили для ионов и glow */
          circle { transition: all 0.3s ease; }
          use:hover { stroke-opacity: 1; filter: drop-shadow(0 0 5px #06b6d4); }
        `}
      </style>
      <header
        className="desktop-header hidden sm:flex fixed top-4 left-4 z-50 p-4 bg-gray-800 rounded-lg transition-all duration-300 cursor-pointer"
        style={{
          opacity: isSidebarFullyClosed ? 1 : 0,
          transform: isSidebarFullyClosed ? 'scale(1)' : 'scale(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          visibility: isSidebarFullyClosed ? 'visible' : 'hidden',
        }}
      >
        <img
          src="/logo.png"
          alt="Fluvion Logo"
          className="w-32 h-auto object-contain"
          style={{ transition: 'transform 0.3s ease' }}
          onClick={toggleSidebar}
        />
      </header>
      <header className="mobile-header flex sm:hidden">
        <button onClick={isSidebarOpen ? closeSidebar : toggleSidebar} className="mobile-hamburger">
          {isSidebarOpen ? <XMarkIcon /> : <Bars3Icon />}
        </button>
        <div className="mobile-logo-container">
          <img src="/logo.png" alt="Fluvion Logo" className="mobile-logo" />
          <span className="mobile-logo-text">LUVION</span>
        </div>
        <div>{/* Optional icons, e.g., cart or search */}</div>
      </header>
      <aside
        ref={sidebarRef}
        className="w-64 bg-gray-900 fixed top-0 left-0 h-screen z-40 transition-transform duration-300 ease-in-out"
        style={isSidebarOpen ? { transform: 'translateX(0)' } : { transform: 'translateX(-100%)' }}
      >
        <div className="p-6 h-full flex flex-col justify-between relative">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-bold flex items-center cursor-pointer text-white tracking-tight"
                onClick={closeSidebar}
              >
                <XMarkIcon className="w-6 h-6 mr-2 text-cyan-400" />
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
                {navItems.map((item, index) => (
                  <li key={item.path}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => {
                          navigate(item.path);
                          closeSidebar();
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg ${
                          item.highlight
                            ? 'bg-orange-900/30 backdrop-blur-lg border border-orange-400/20 shadow-lg hover:shadow-orange-400/20 text-orange-400 hover:text-orange-200'
                            : 'bg-gray-900/30 backdrop-blur-lg border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 text-cyan-400 hover:text-cyan-200'
                        } transition-all duration-300 flex items-center`}
                      >
                        <span className="mr-2">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    </motion.div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={logout}
                  className="w-full mt-6 px-4 py-3 rounded-lg bg-red-600 text-white border border-red-400/20 shadow-lg hover:shadow-red-400/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-cyan-400" />
                    <span>Выйти</span>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </aside>
      <main className="main-content flex-1 pt-16 p-6 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/supplier/:id" element={<SupplierDetail />} />
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
              <div className="bg-gray-800/30 p-6 rounded-lg text-center text-white">
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
          <Route path="/rates" element={<Rate />} />
          <Route path="/supplier-chat/:id" element={<SupplierChat />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;