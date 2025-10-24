import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useNavigate, Route, Routes, Navigate } from 'react-router-dom';
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
import { HomeIcon, ShoppingBagIcon, ComputerDesktopIcon, ShoppingCartIcon, CalculatorIcon, UserIcon, BellIcon, TruckIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon, WrenchScrewdriverIcon, InformationCircleIcon, PhoneIcon, StarIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import Rate from './Rate';


function AppLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarFullyClosed, setIsSidebarFullyClosed] = useState(true);
  const sidebarRef = useRef(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

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
    { path: '/', label: 'Главная', icon: <HomeIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/catalog', label: 'Каталог', icon: <ShoppingBagIcon className="w-5 h-5 text-text-primary" />, highlight: true },
    { path: '/terminal', label: 'Терминал', icon: <ComputerDesktopIcon className="w-5 h-5 text-text-primary" />, highlight: true },
    { path: '/self-pickup', label: 'Самовыкуп', icon: <ShoppingBagIcon className="w-5 h-5 text-text-primary" />, highlight: true },
    { path: '/rates', label: 'Курс', icon: <CurrencyDollarIcon className="w-5 h-5 text-text-primary" />, highlight: true },
    { path: '/cart', label: 'Корзина', icon: <ShoppingCartIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/calculator', label: 'Калькулятор', icon: <CalculatorIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/profile', label: 'Профиль', icon: <UserIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/notifications', label: 'Уведомления', icon: <BellIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/order-instructions', label: 'Инструкции', icon: <ClipboardDocumentListIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/about', label: 'О нас', icon: <InformationCircleIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/contact', label: 'Контакты', icon: <PhoneIcon className="w-5 h-5 text-text-primary" /> },
    { path: '/reviews', label: 'Отзывы', icon: <StarIcon className="w-5 h-5 text-text-primary" /> },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen text-text-primary relative overflow-x-hidden bg-bg-primary">
      <style>
        {`
          @media (max-width: 640px) {
            .mobile-header {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              background: var(--bg-secondary);
              padding: 12px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              z-index: 50;
              box-shadow: 0 4px 20px var(--shadow-primary);
              border-bottom: 1px solid var(--border-primary);
            }
            .mobile-hamburger {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: transparent;
              border: 2px solid var(--accent-primary);
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.3s ease;
              color: var(--text-primary);
            }
            .mobile-hamburger:hover {
              background: var(--accent-primary);
              color: var(--text-primary);
              box-shadow: 0 4px 15px rgba(232, 30, 45, 0.4);
            }
            .mobile-hamburger svg {
              width: 24px;
              height: 24px;
              color: var(--text-primary);
            }
            .mobile-logo-container {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .mobile-logo-text {
              font-size: 22px;
              font-weight: 800;
              font-family: var(--font-display);
              background: linear-gradient(45deg, var(--accent-primary), var(--accent-muted));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: -0.5px;
              text-shadow: 0 2px 4px rgba(232, 30, 45, 0.3);
            }
            .desktop-header {
              display: none;
            }
            .main-content {
              width: 100%;
              padding: 0;
              padding-top: 64px;
              padding-bottom: 64px;
              margin: 0;
            }
          }
          @media (min-width: 641px) {
            .mobile-header {
              display: none;
            }
            .desktop-header {
              position: absolute;
              left: 20px;
              z-index: 50;
              padding: 12px;
              background: transparent;
              border: 2px solid var(--accent-primary);
              border-radius: 20px;
              transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              cursor: pointer;
              box-shadow: 0 8px 32px var(--shadow-primary);
            }
            .desktop-header:hover {
              background: var(--accent-primary);
              color: var(--text-primary);
              box-shadow: 0 12px 40px rgba(232, 30, 45, 0.2);
            }
            .desktop-hamburger {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px;
              transition: all 0.3s ease;
            }
            .desktop-hamburger svg {
              width: 24px;
              height: 24px;
              color: var(--text-primary);
            }
            .desktop-header:hover .desktop-hamburger svg {
              color: var(--text-primary);
            }
            .main-content {
              width: 100%;
              padding: 0;
              padding-top: 64px;
              padding-bottom: 64px;
              margin: 0;
            }
          }
          .car-animation {
            animation: float-left-right 4s ease-in-out infinite;
          }
          .car-animation.active {
            animation: float-left-right 4s ease-in-out infinite;
          }
          @keyframes float-left-right {
            0%, 100% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
          }
          .shimmer-border {
            position: relative;
            border: 2px solid transparent;
            animation: shimmer 2s infinite linear;
          }
          .shimmer-border::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            background: linear-gradient(45deg, transparent, var(--accent-primary), transparent);
            background-size: 200% 200%;
            animation: shimmer-gradient 2s infinite linear;
            z-index: -1;
            border-radius: inherit;
          }
          @keyframes shimmer {
            0% { border-color: rgba(232, 30, 45, 0.5); }
            50% { border-color: var(--accent-primary); }
            100% { border-color: rgba(232, 30, 45, 0.5); }
          }
          @keyframes shimmer-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-secondary/80 backdrop-blur-md border-b border-border-primary">
        <div className="container-xl mx-auto px-4 py-3 flex items-center justify-between relative">
          <div 
            className="desktop-header hidden sm:flex shimmer-border"
            style={{
              opacity: isSidebarFullyClosed ? 1 : 0,
              transform: isSidebarFullyClosed ? 'scale(1)' : 'scale(0)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              visibility: isSidebarFullyClosed ? 'visible' : 'hidden',
            }}
            onClick={toggleSidebar}
          >
            <div className="desktop-hamburger">
              <Bars3Icon className="w-6 h-6" />
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#about" className="hover:text-accent-primary transition">О нас</a>
            <a href="#history" className="hover:text-accent-primary transition">История</a>
            <a href="#stats" className="hover:text-accent-primary transition">Статистика</a>
            <a href="#form" className="hover:text-accent-primary transition">Контакты</a>
          </nav>
          <button
            onClick={logout}
            className="bg-accent-primary text-text-primary px-6 py-2 rounded-md hover:bg-accent-primary/90 transition duration-300 text-sm font-medium"
          >
            Выйти
          </button>
        </div>
      </header>
      <header className="mobile-header flex sm:hidden">
        <button onClick={isSidebarOpen ? closeSidebar : toggleSidebar} className="mobile-hamburger">
          {isSidebarOpen ? <XMarkIcon className="mr-2" /> : <Bars3Icon className="mr-2" />}
        </button>
        <div className="mobile-logo-container">
          <span className="mobile-logo-text">FLUVION</span>
        </div>
        <div>{/* Optional icons, e.g., cart or search */}</div>
      </header>
      <aside
        ref={sidebarRef}
        className="w-64 bg-bg-primary fixed top-0 left-0 h-screen z-[60] transition-transform duration-300 ease-in-out"
        style={isSidebarOpen ? { transform: 'translateX(0)' } : { transform: 'translateX(-100%)' }}
      >
        <div className="p-6 h-full flex flex-col justify-between relative">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Fluvion Logo" className="w-8 h-8 rounded-md" />
                <span className="text-2xl font-display font-bold text-accent-primary">FLUVION</span>
              </div>
              <button onClick={closeSidebar} className="p-2 rounded-md hover:bg-accent-primary/90 transition duration-300 text-accent-primary hover:text-text-primary">
                <XMarkIcon className="w-6 h-6" />
              </button>
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
                        className={`w-full text-left px-4 py-3 rounded-md transition duration-300 text-base font-medium flex items-center ${
                          item.highlight
                            ? 'bg-accent-primary text-text-primary hover:bg-accent-primary/90'
                            : 'bg-transparent border-2 border-accent-primary text-text-primary hover:bg-accent-primary hover:text-text-primary'
                        }`}
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
                className="car w-full h-full object-contain filter brightness-150 z-50"
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
                  className="w-full mt-6 px-4 py-3 rounded-md bg-accent-primary text-text-primary hover:bg-accent-primary/90 transition duration-300 text-base font-medium flex items-center justify-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Выйти</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </aside>
      <main className="main-content flex-1 relative z-10 transition-all duration-300 w-full p-0 pt-16 pb-16">
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;