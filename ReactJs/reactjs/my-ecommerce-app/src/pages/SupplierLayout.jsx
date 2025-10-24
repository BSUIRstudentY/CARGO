
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import {
  HomeIcon,
  ShoppingBagIcon,
  ComputerDesktopIcon,
  ShoppingCartIcon,
  CalculatorIcon,
  UserIcon,
  BellIcon,
  TruckIcon,
  ClipboardDocumentListIcon, // Corrected import
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  PhoneIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/solid';
import Footer from './Footer';

// Placeholder components (to be replaced with actual implementations)
const SupplierDashboard = () => (
  <section id="supplier-dashboard" className="mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Панель управления поставщика</h2>
    <p className="text-center text-lg sm:text-xl text-gray-300">
      Добро пожаловать в вашу панель управления. Здесь вы можете управлять грузами, заказами и отзывами.
    </p>
  </section>
);

const SupplierCargos = () => (
  <section id="supplier-cargos" className="mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Грузы</h2>
    <p className="text-center text-lg sm:text-xl text-gray-300">
      Управляйте вашими грузами здесь.
    </p>
  </section>
);

const SupplierOrders = () => (
  <section id="supplier-orders" className="mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Заказы</h2>
    <p className="text-center text-lg sm:text-xl text-gray-300">
      Просматривайте и управляйте заказами.
    </p>
  </section>
);

const SupplierProfile = () => (
  <section id="supplier-profile" className="mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Профиль</h2>
    <p className="text-center text-lg sm:text-xl text-gray-300">
      Обновите информацию о вашем профиле поставщика.
    </p>
  </section>
);

const SupplierNotifications = () => (
  <section id="supplier-notifications" className="mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Уведомления</h2>
    <p className="text-center text-lg sm:text-xl text-gray-300">
      Просматривайте ваши уведомления.
    </p>
  </section>
);

const SupplierSupport = () => (
  <section id="supplier-support" className="mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Поддержка</h2>
    <p className="text-center text-lg sm:text-xl text-gray-300">
      Свяжитесь с нашей службой поддержки.
    </p>
  </section>
);

const SupplierReviews = () => (
  <section id="supplier-reviews" className="mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Отзывы</h2>
    <p className="text-center text-lg sm:text-xl text-gray-300">
      Просматривайте отзывы о ваших услугах.
    </p>
  </section>
);

function SupplierLayout() {
  const [backgroundColor, setBackgroundColor] = useState(() => localStorage.getItem('backgroundColor') || '#2F2F2F');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#FF5722');
  const { logout } = useAuth();
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
      }, 300); // Match the sidebar's transition duration of 300ms
    } else {
      setIsSidebarFullyClosed(false);
    }
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  const navItems = [
    { path: '/supplier-dashboard', label: 'Дашборд', icon: <HomeIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/supplier-cargos', label: 'Грузы', icon: <TruckIcon className="w-5 h-5 text-orange-400" />, highlight: true },
    { path: '/supplier-orders', label: 'Заказы', icon: <ShoppingBagIcon className="w-5 h-5 text-orange-400" />, highlight: true },
    { path: '/supplier-profile', label: 'Профиль', icon: <UserIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/supplier-notifications', label: 'Уведомления', icon: <BellIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/supplier-support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/supplier-reviews', label: 'Отзывы', icon: <StarIcon className="w-5 h-5 text-cyan-400" /> },
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
          </div>
        </div>
      </aside>
      <main className="main-content flex-1 pt-16 p-6 relative z-10">
        <Routes>
          <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier-cargos" element={<SupplierCargos />} />
          <Route path="/supplier-orders" element={<SupplierOrders />} />
          <Route path="/supplier-profile" element={<SupplierProfile />} />
          <Route path="/supplier-notifications" element={<SupplierNotifications />} />
          <Route path="/supplier-support" element={<SupplierSupport />} />
          <Route path="/supplier-reviews" element={<SupplierReviews />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default SupplierLayout;