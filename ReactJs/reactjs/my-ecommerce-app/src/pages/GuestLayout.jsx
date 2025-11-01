// GuestLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MultiTerminal from './MultiTerminal';
import Catalog from './Catalog';
import Home from './Home';
import DeliveryPayment from './DeliveryPayment';
import FAQSection from './FAQSection';
import SupportPage from './SupportPage';
import TicketChatPage from './TicketChatPage';
import Reviews from './Reviews';
import CostCalculator from './CostCalculator';
import PublicOffer from './PublicOffer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import UserAgreement from '../components/UserAgreement';
import LoginRegister from './LoginRegister';
import Rate from './Rate';
import {
  HomeIcon, ShoppingBagIcon, ComputerDesktopIcon, CalculatorIcon, TruckIcon, QuestionMarkCircleIcon,
  WrenchScrewdriverIcon, StarIcon, LockClosedIcon, CurrencyDollarIcon, Bars3Icon, XMarkIcon
} from '@heroicons/react/24/solid';

function GuestLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarFullyClosed, setIsSidebarFullyClosed] = useState(true);
  const sidebarRef = useRef(null);
  const navContainerRef = useRef(null);

  /* ---------- Sidebar handling ---------- */
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
      timer = setTimeout(() => setIsSidebarFullyClosed(true), 300);
    } else {
      setIsSidebarFullyClosed(false);
    }
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  /* ---------- Scroll indicator ---------- */
  useEffect(() => {
    const nav = navContainerRef.current;
    const indicator = document.getElementById('scroll-indicator');
    if (!nav || !indicator) return;

    const updateIndicator = () => {
      const { scrollTop, scrollHeight, clientHeight } = nav;
      const scrollPercent = scrollTop / (scrollHeight - clientHeight);
      const maxTop = clientHeight - 80;
      indicator.style.opacity = scrollPercent > 0.05 && scrollPercent < 0.95 ? '1' : '0.3';
      indicator.style.transform = `translateY(${scrollPercent * maxTop}px)`;
    };

    nav.addEventListener('scroll', updateIndicator);
    updateIndicator();
    return () => nav.removeEventListener('scroll', updateIndicator);
  }, [isSidebarOpen]);

  /* ---------- Navigation items ---------- */
  const navItems = [
    { path: '/', label: 'Главная', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/calculator', label: 'Калькулятор', icon: <CalculatorIcon className="w-5 h-5" /> },
    { path: '/catalog', label: 'Каталог', icon: <ShoppingBagIcon className="w-5 h-5" /> },
    { path: '/terminal', label: 'Заказать товар', icon: <ComputerDesktopIcon className="w-5 h-5" />, special: true },
    { path: '/rates', label: 'Курс', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className="w-5 h-5" /> },
    { path: '/faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
    { path: '/support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
    { path: '/reviews', label: 'Отзывы', icon: <StarIcon className="w-5 h-5" /> },
    { path: '/login', label: 'Вход/Регистрация', icon: <LockClosedIcon className="w-5 h-5" />, special: true },
  ];

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  /* ---------- Scroll to Home sections ---------- */
  const scrollToSection = (sectionId) => {
    navigate('/');
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    closeSidebar();
  };

  /* ---------- Scroll to Footer (Контакты) ---------- */
  const scrollToFooter = () => {
    const footer = document.querySelector('footer');
    if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    closeSidebar();
  };

  /* ---------- Unified click handler ---------- */
  const handleNavClick = (path) => {
    if (path === '/contact') {
      scrollToFooter();
    } else {
      navigate(path);
      closeSidebar();
    }
  };

  /* ---------- NavItem – «Терминал» и «Вход/Регистрация» всегда красные ---------- */
  const NavItem = ({ item, delay }) => {
    const isSpecial = item.special;

    return (
      <motion.li
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ x: 6 }}
        className="group"
      >
        <button
          onClick={() => handleNavClick(item.path)}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium flex items-center gap-3
            ${isSpecial
              ? 'font-bold bg-red-500/20 hover:bg-red-500/30 text-base'
              : 'text-text-secondary hover:text-white hover:bg-bg-secondary/20'
            }`}
        >
          {/* Иконка — всегда красная */}
          <span className="transition-transform group-hover:scale-110">
            {React.cloneElement(item.icon, {
              className: `w-5 h-5 ${isSpecial ? 'w-6 h-6 !text-red-500' : 'text-current'}`
            })}
          </span>

          {/* Текст — всегда красный */}
          <span className={isSpecial ? 'text-red-500' : 'text-white'}>
            {item.label}
          </span>
        </button>
      </motion.li>
    );
  };

  return (
    <div className="flex flex-col min-h-screen text-text-primary relative overflow-x-hidden bg-bg-primary">
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-header { position: fixed; top: 0; left: 0; width: 100%; background: var(--bg-secondary);
            padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;
            z-index: 50; box-shadow: 0 4px 20px var(--shadow-primary); border-bottom: 1px solid var(--border-primary); }
          .mobile-hamburger { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: transparent;
            border: 2px solid var(--accent-primary); border-radius: 12px; cursor: pointer;
            transition: all 0.3s ease; color: var(--text-primary); }
          .mobile-hamburger:hover { background: var(--accent-primary); color: white; box-shadow: 0 4px 15px rgba(232, 30, 45, 0.4); }
          .mobile-logo-text { font-size: 22px; font-weight: 800; font-family: var(--font-display);
            background: linear-gradient(45deg, var(--accent-primary), var(--accent-muted));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(232, 30, 45, 0.3); }
          .desktop-header { display: none; }
          .main-content { padding-top: 64px; padding-bottom: 64px; }
        }
        @media (min-width: 641px) {
          .mobile-header { display: none; }
          .desktop-header { position: fixed; top: 50%; left: 20px; transform: translateY(-50%);
            z-index: 50; padding: 12px; background: transparent; border: 2px solid var(--accent-primary);
            border-radius: 20px; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            cursor: pointer; box-shadow: 0 8px 32px var(--shadow-primary); }
          .desktop-header:hover { background: var(--accent-primary); box-shadow: 0 12px 40px rgba(232, 30, 45, 0.2); }
          .main-content { padding-top: 64px; padding-bottom: 64px; }
        }

        .scrollbar-custom { scrollbar-width: thin; scrollbar-color: var(--accent-primary) transparent; }
        .scrollbar-custom::-webkit-scrollbar { width: 6px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; border-radius: 3px; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: var(--accent-primary);
          border-radius: 3px; box-shadow: 0 0 6px rgba(232, 30, 45, 0.5); }
        .scrollbar-custom:hover::-webkit-scrollbar-thumb { background: #ff1a3a; }

        .shimmer-border { position: relative; border: 2px solid transparent; animation: shimmer 2s infinite linear; }
        .shimmer-border::before { content: ''; position: absolute; top: -2px; left: -2px;
          width: calc(100% + 4px); height: calc(100% + 4px);
          background: linear-gradient(45deg, transparent, var(--accent-primary), transparent);
          background-size: 200% 200%; animation: shimmer-gradient 2s infinite linear;
          z-index: -1; border-radius: inherit; }
        @keyframes shimmer { 0%, 100% { border-color: rgba(232, 30, 45, 0.5); } 50% { border-color: var(--accent-primary); } }
        @keyframes shimmer-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

        #scroll-indicator { position: absolute; right: 3px; top: 0; bottom: 0; width: 2px;
          background: var(--accent-primary); border-radius: 1px; opacity: 0; transition: opacity 0.3s ease;
          pointer-events: none; box-shadow: 0 0 8px var(--accent-primary); }

        .nav-group-title { font-family: var(--font-display); font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
      `}</style>

      {/* ---------- Fixed Header (desktop) ---------- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-secondary/80 backdrop-blur-md border-b border-border-primary">
        <div className="container-xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Hamburger (desktop) */}
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
            <div className="desktop-hamburger"><Bars3Icon className="w-6 h-6" /></div>
          </div>

          {/* Top nav links – О нас, История, Статистика, Контакты */}
          <nav className="hidden md:flex space-x-6">
            <a onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="hover:text-accent-primary transition cursor-pointer">О нас</a>
            <a onClick={(e) => { e.preventDefault(); scrollToSection('history'); }} className="hover:text-accent-primary transition cursor-pointer">История</a>
            <a onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }} className="hover:text-accent-primary transition cursor-pointer">Статистика</a>
            <a onClick={(e) => { e.preventDefault(); scrollToFooter(); }} className="hover:text-accent-primary transition cursor-pointer">Контакты</a>
          </nav>

          <button
            onClick={() => navigate('/login')}
            className="bg-accent-primary text-white px-6 py-2 rounded-md hover:bg-accent-primary/90 transition duration-300 text-sm font-medium"
          >
            Войти
          </button>
        </div>
      </header>

      {/* ---------- Mobile Header ---------- */}
      <header className="mobile-header flex sm:hidden">
        <button onClick={toggleSidebar} className="mobile-hamburger">
          {isSidebarOpen ? <XMarkIcon /> : <Bars3Icon />}
        </button>
        <div className="flex items-center gap-2">
          <span className="mobile-logo-text">FLUVION</span>
        </div>
        <div />
      </header>

      {/* ---------- Sidebar ---------- */}
      <aside
        ref={sidebarRef}
        className="w-64 bg-bg-primary fixed top-0 left-0 h-screen z-[60] transition-transform duration-300 ease-in-out overflow-hidden"
        style={isSidebarOpen ? { transform: 'translateX(0)' } : { transform: 'translateX(-100%)' }}
      >
        <div className="p-6 h-full flex flex-col justify-between relative">
          {/* Logo + Close */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Fluvion Logo" className="w-8 h-8 rounded-md" />
              <span className="text-2xl font-display font-bold text-accent-primary">FLUVION</span>
            </div>
            <button onClick={closeSidebar} className="p-2 rounded-md hover:bg-accent-primary/90 transition text-accent-primary hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Nav */}
          <div ref={navContainerRef} className="flex-1 overflow-y-auto pr-3 -mr-3 scrollbar-custom">
            <nav className="space-y-6 pb-4">
              {/* Основное */}
              <div>
                <h3 className="nav-group-title text-xs text-text-secondary mb-2 opacity-70">Основное</h3>
                <ul className="space-y-1">
                  {navItems.filter(i => ['/', '/calculator'].includes(i.path))
                    .map((item, i) => <NavItem key={item.path} item={item} delay={i * 0.05} />)}
                </ul>
              </div>

              {/* Покупки */}
              <div>
                <h3 className="nav-group-title text-xs text-text-secondary mb-2 opacity-70">Покупки</h3>
                <ul className="space-y-1">
                  {navItems.filter(i => ['/catalog', '/terminal', '/rates'].includes(i.path))
                    .map((item, i) => <NavItem key={item.path} item={item} delay={i * 0.05} />)}
                </ul>
              </div>

              {/* Информация */}
              <div>
                <h3 className="nav-group-title text-xs text-text-secondary mb-2 opacity-70">Информация</h3>
                <ul className="space-y-1">
                  {navItems.filter(i => ['/delivery-payment', '/faq', '/support', '/reviews'].includes(i.path))
                    .map((item, i) => <NavItem key={item.path} item={item} delay={i * 0.05} />)}
                </ul>
              </div>

              {/* Аккаунт */}
              <div>
                <h3 className="nav-group-title text-xs text-text-secondary mb-2 opacity-70">Аккаунт</h3>
                <ul className="space-y-1">
                  {navItems.filter(i => ['/login'].includes(i.path))
                    .map((item, i) => <NavItem key={item.path} item={item} delay={i * 0.05} />)}
                </ul>
              </div>
            </nav>

            <div id="scroll-indicator" className="absolute right-1 top-0 bottom-0 w-1 bg-accent-primary opacity-30" />
          </div>
        </div>
      </aside>

      {/* ---------- Main Content ---------- */}
      <main className="main-content flex-1 relative z-10 w-full p-0 pt-16 pb-16">
        <Routes>
          <Route path="/profile" element={<Navigate to="/login" replace />} />
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/terminal" element={<MultiTerminal />} />
          <Route path="/calculator" element={<CostCalculator />} />
          <Route path="/delivery-payment" element={<DeliveryPayment />} />
          <Route path="/faq" element={<FAQSection />} />
          <Route path="/support" element={<Navigate to="/login" replace />} />
          <Route path="/ticket/:ticketId/chat" element={<TicketChatPage />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/public-offer" element={<PublicOffer />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/user-agreement" element={<UserAgreement />} />
          <Route path="/rates" element={<Rate />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer id="contact" />
    </div>
  );
}

export default GuestLayout;