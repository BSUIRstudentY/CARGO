import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useCart } from '../components/CartContext';
import Footer from './Footer';
import { Loading } from '../components/ui/Loading';

// Lazy load all pages for better code splitting and performance
const Catalog = lazy(() => import('./Catalog'));
const MultiTerminal = lazy(() => import('./MultiTerminal'));
const CartPage = lazy(() => import('./CartPage'));
const Profile = lazy(() => import('./Profile'));
const ProductDetail = lazy(() => import('./ProductDetail'));
const OrderDetails = lazy(() => import('./OrderDetails'));
const Home = lazy(() => import('./Home'));
const DeliveryPayment = lazy(() => import('./DeliveryPayment'));
const OrderInstructions = lazy(() => import('./OrderInstructions'));
const SelfPickupCargo = lazy(() => import('./SelfPickupCargo'));
const FAQSection = lazy(() => import('./FAQSection'));
const SupportPage = lazy(() => import('./SupportPage'));
const TicketChatPage = lazy(() => import('./TicketChatPage'));
const Notifications = lazy(() => import('./Notifications'));
const Reviews = lazy(() => import('./Reviews'));
const CostCalculator = lazy(() => import('./CostCalculator'));
const BatchCargoDetails = lazy(() => import('./BatchCargoDetails'));
const PublicOffer = lazy(() => import('./PublicOffer'));
const PrivacyPolicy = lazy(() => import('../components/PrivacyPolicy'));
const UserAgreement = lazy(() => import('../components/UserAgreement'));
const BatchCargoProcessing = lazy(() => import('./BatchCargoProcessing'));
const Rate = lazy(() => import('./Rate'));
const Thanks = lazy(() => import('./Thanks'));
const BadResponse = lazy(() => import('./BadResponse'));
const News = lazy(() => import('./News'));
const BatchCargoList = lazy(() => import('./BatchCargoList'));
import {
  HomeIcon, ShoppingBagIcon, ComputerDesktopIcon, ShoppingCartIcon, CalculatorIcon, UserIcon, BellIcon,
  TruckIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon, WrenchScrewdriverIcon, InformationCircleIcon,
  PhoneIcon, StarIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, CurrencyDollarIcon, MegaphoneIcon
} from '@heroicons/react/24/solid';
import {
  BellIcon as BellOutlineIcon,
  ShoppingCartIcon as CartOutlineIcon,
  UserIcon as UserOutlineIcon
} from '@heroicons/react/24/outline';

function AppLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarFullyClosed, setIsSidebarFullyClosed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const navContainerRef = useRef(null);
  const canvasRef = useRef(null);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  /* ---------- Снежная анимация фона ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    ctx.imageSmoothingEnabled = false;
    
    let animationFrameId;
    let snowflakes = [];

    const getSnowflakeCount = () => {
      const area = window.innerWidth * window.innerHeight;
      const baseCount = 100;
      const maxCount = 150;
      const count = Math.min(maxCount, Math.floor((area / 1500000) * baseCount));
      return Math.max(50, count);
    };

    class Snowflake {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
      }

      reset(startFromTop = false) {
        this.x = Math.random() * canvas.width;
        this.y = startFromTop ? -10 : Math.random() * canvas.height;
        this.vy = Math.random() * 0.3 + 0.2;
        this.vx = Math.random() * 0.3 - 0.15;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.015 + 0.008;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
      }

      update(deltaTime) {
        const timeFactor = deltaTime * 0.0625;
        this.wobble += this.wobbleSpeed * timeFactor;
        const wobbleOffset = Math.sin(this.wobble) * 0.15;
        const currentVX = this.vx + wobbleOffset;
        
        this.x += currentVX * timeFactor;
        this.y += this.vy * timeFactor;

        if (this.y > canvas.height + 10) {
          this.reset(true);
        } else if (this.x < -10) {
          this.x = canvas.width + 10;
        } else if (this.x > canvas.width + 10) {
          this.x = -10;
        }
      }

      draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const initSnowflakes = () => {
      const count = getSnowflakeCount();
      snowflakes = [];
      for (let i = 0; i < count; i++) {
        const flake = new Snowflake();
        flake.y = Math.random() * canvas.height;
        snowflakes.push(flake);
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initSnowflakes();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastFrameTime = performance.now();
    const animate = (currentTime) => {
      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgb(255, 255, 255)';
      
      for (let i = 0; i < snowflakes.length; i++) {
        const snowflake = snowflakes[i];
        snowflake.update(deltaTime);
        
        ctx.globalAlpha = snowflake.opacity;
        ctx.beginPath();
        ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate(performance.now());

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  /* ---------- Navigation items ---------- */
  const navItems = [
    { path: '/', label: 'Главная', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/calculator', label: 'Калькулятор', icon: <CalculatorIcon className="w-5 h-5" /> },
    { path: '/catalog', label: 'Примеры товаров', icon: <ShoppingBagIcon className="w-5 h-5" /> },
    { path: '/terminal', label: 'Заказать товар', icon: <ComputerDesktopIcon className="w-5 h-5" />, special: true },
    { path: '/self-pickup', label: 'Самовыкуп', icon: <ShoppingBagIcon className="w-5 h-5" /> },
    { path: '/rates', label: 'Курс', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
    { path: '/news', label: 'Новости', icon: <MegaphoneIcon className="w-5 h-5" /> },
    { path: '/batch-cargo-list', label: 'Сборные грузы', icon: <TruckIcon className="w-5 h-5" /> },
    { path: '/cart', label: 'Корзина', icon: <ShoppingCartIcon className="w-5 h-5" /> },
    { path: '/profile', label: 'Профиль', icon: <UserIcon className="w-5 h-5" /> },
    { path: '/notifications', label: 'Уведомления', icon: <BellIcon className="w-5 h-5" /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className="w-5 h-5" /> },
    { path: '/order-instructions', label: 'Инструкции', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
    { path: '/faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
    { path: '/support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
    { path: '/reviews', label: 'Отзывы', icon: <StarIcon className="w-5 h-5" /> },
  ];

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  /* ---------- Unified click handler ---------- */
  const handleNavClick = (path) => {
    navigate(path);
    closeSidebar();
  };

  /* Активная вкладка = текущая страница (отдельно от special = «Заказать товар») */
  const isNavActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  /* ---------- NavItem: special = CTA «Заказать товар», isActive = текущая страница ---------- */
  const NavItem = ({ item, delay, isMobile = false }) => {
    const isSpecial = item.special;
    const isActive = isNavActive(item.path);

    const content = (
      <button
        onClick={() => handleNavClick(item.path)}
        className={`w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium flex items-center gap-2 sm:gap-3 active:scale-95
          ${isActive ? 'ring-2 ring-white/50 ring-inset' : ''}
          ${isSpecial
            ? 'font-bold bg-[rgba(0,240,255,0.1)] hover:bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] hover:border-[rgba(0,240,255,0.5)] text-base text-[#00f0ff]'
            : 'text-[#9ca3af] hover:text-[#e5e7eb] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)]'
          }`}
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        aria-current={isActive ? 'page' : undefined}
      >
        {/* Иконка */}
        <span className={`transition-transform ${isMobile ? '' : 'group-hover:scale-110'}`}>
          {React.cloneElement(item.icon, {
            className: `w-5 h-5 ${isSpecial ? 'w-6 h-6' : ''}`,
            style: { color: isSpecial ? '#00f0ff' : (isActive ? '#e5e7eb' : '#9ca3af') }
          })}
        </span>

        {/* Текст */}
        <span className="flex-1">{item.label}</span>
        {isActive && !isSpecial && (
          <span className="flex-shrink-0 text-[10px] uppercase tracking-wider text-white/60" aria-hidden>Сейчас</span>
        )}
        {isSpecial && (
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" aria-hidden />
        )}
      </button>
    );

    if (isMobile) {
      return <li className="group">{content}</li>;
    }

    return (
      <motion.li
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay }}
        whileHover={{ x: 6 }}
        className="group"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      >
        {content}
      </motion.li>
    );
  };

  const HeaderActions = () => (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Notifications Icon */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/notifications')}
        className="relative p-1.5 sm:p-2 text-[#9ca3af] hover:text-[#00f0ff] transition-all duration-200 rounded-full hover:bg-[rgba(0,240,255,0.1)] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20"
        aria-label="Уведомления"
      >
        <BellOutlineIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>

      {/* Cart Icon with Badge */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/cart')}
        className="relative p-1.5 sm:p-2 text-[#9ca3af] hover:text-[#00f0ff] transition-all duration-200 rounded-full hover:bg-[rgba(0,240,255,0.1)] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20"
        aria-label="Корзина"
      >
        <CartOutlineIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        {cart && cart.length > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#00f0ff] text-xs font-bold text-[#0a0d14] shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {cart.length > 99 ? '99+' : cart.length}
          </motion.span>
        )}
      </motion.button>

      {/* Profile Icon */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/profile')}
        className="p-1.5 sm:p-2 text-[#9ca3af] hover:text-[#00f0ff] transition-all duration-200 rounded-full hover:bg-[rgba(0,240,255,0.1)] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/20"
        aria-label="Профиль"
      >
        <UserOutlineIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen text-text-primary relative overflow-x-hidden bg-[#0a0d14]">
      {/* Canvas для снежной анимации - фон на всех страницах */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[5]"
        style={{ background: 'transparent' }}
      />

      {/* Статичные световые акценты */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .mobile-header { position: fixed; top: 0; left: 0; width: 100%; background: rgba(10, 13, 20, 0.95);
            backdrop-filter: blur(12px); padding: 12px 16px; padding-top: max(12px, env(safe-area-inset-top)); display: flex; align-items: center; justify-content: space-between;
            z-index: 9998; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            -webkit-backface-visibility: hidden; backface-visibility: hidden; transform: translateZ(0); }
          .mobile-sidebar-wrap { min-height: 100dvh; height: 100dvh; min-height: -webkit-fill-available; }
          .mobile-sidebar-nav { padding-bottom: calc(2rem + env(safe-area-inset-bottom)); }
          .mobile-sidebar-inner { padding-top: env(safe-area-inset-top); }
          .mobile-hamburger { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: transparent;
            border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px; cursor: pointer;
            transition: all 0.2s ease; color: #e5e7eb; -webkit-tap-highlight-color: transparent;
            will-change: transform; transform: translateZ(0); }
          .mobile-hamburger:active { transform: scale(0.95) translateZ(0); }
          .mobile-logo-text { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #e5e7eb; }
          .desktop-header { display: none; }
          .main-content { padding-top: calc(64px + env(safe-area-inset-top)); padding-bottom: 0; }
          
          /* Оптимизация сайдбара для мобильных */
          aside[class*="w-64"] {
            will-change: transform;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
          }
        }
        @media (min-width: 641px) {
          .mobile-header { display: none; }
          .main-content { padding-top: 64px; padding-bottom: 0; }
          .mobile-sidebar-wrap { min-height: 100vh; height: 100vh; }
          .mobile-sidebar-nav { padding-bottom: 2rem; }
          .mobile-sidebar-inner { padding-top: 0; }
        }

        .scrollbar-custom { 
          scrollbar-width: thin; 
          scrollbar-color: #00f0ff transparent; 
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .scrollbar-custom::-webkit-scrollbar { width: 6px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; border-radius: 3px; }
        .scrollbar-custom::-webkit-scrollbar-thumb { 
          background: #00f0ff;
          border-radius: 3px; 
          box-shadow: 0 0 6px rgba(0, 240, 255, 0.5); 
        }
        .scrollbar-custom:hover::-webkit-scrollbar-thumb { background: #00d9ff; }
        
        /* Обеспечиваем прокрутку на всех устройствах */
        aside[class*="w-64"] {
          display: flex;
          flex-direction: column;
        }
        aside[class*="w-64"] > div {
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1;
        }

        .car-animation { animation: float-left-right 4s ease-in-out infinite; }
        @keyframes float-left-right { 0%, 100% { transform: translateX(-10px); } 50% { transform: translateX(10px); } }

        #scroll-indicator { position: absolute; right: 3px; top: 0; bottom: 0; width: 2px;
          background: #00f0ff; border-radius: 1px; opacity: 0; transition: opacity 0.3s ease;
          pointer-events: none; box-shadow: 0 0 8px #00f0ff; }

        .nav-group-title { font-family: var(--font-display); font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
      `}</style>

      {/* ---------- Fixed Header (desktop) — скрыт на главной (Black Void свой хедер) ---------- */}
      {location.pathname !== '/' && (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0d14]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.1)]">
        <div className="container-xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Hamburger (desktop) - внутри хедера слева */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] transition-all duration-300 text-[#e5e7eb] hover:text-[#00f0ff]"
            aria-label="Меню"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Header Actions - справа */}
          <HeaderActions />
        </div>
      </header>
      )}

      {/* ---------- Mobile Header — скрыт на главной ---------- */}
      {location.pathname !== '/' && (
      <header className="mobile-header flex sm:hidden">
        <button onClick={toggleSidebar} className="mobile-hamburger">
          {isSidebarOpen ? <XMarkIcon /> : <Bars3Icon />}
        </button>
        <div className="flex items-center gap-2">
          <span className="mobile-logo-text">FLUVION</span>
        </div>
        {/* Mobile Header Actions */}
        <HeaderActions />
      </header>
      )}

      {/* ---------- Sidebar Overlay для мобильных ---------- */}
      {isMobile && (
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/60 z-[99998]"
              style={{
                willChange: 'opacity',
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* ---------- Sidebar ---------- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={isMobile 
              ? { type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }
              : { type: 'spring', damping: 25, stiffness: 200 }
            }
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="w-64 bg-[#0a0d14] fixed top-0 left-0 h-screen min-h-[100dvh] z-[99999] overflow-hidden border-r border-[rgba(255,255,255,0.1)] shadow-2xl flex flex-col mobile-sidebar-wrap"
          >
            {/* Статичные световые акценты - упрощены для мобильных */}
            {!isMobile && (
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                  className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)',
                  }}
                />
                <div
                  className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
                  }}
                />
              </div>
            )}
            
            <div className="p-4 sm:p-6 h-full flex flex-col relative z-10 min-h-0 mobile-sidebar-inner">
              {/* Logo + Close */}
              <motion.div
                initial={isMobile ? false : { opacity: 0, y: -20 }}
                animate={isMobile ? false : { opacity: 1, y: 0 }}
                transition={isMobile ? {} : { delay: 0.1 }}
                className="flex justify-between items-center mb-4 sm:mb-6"
              >
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Fluvion Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-md" />
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                    Fluvion
                  </span>
                </div>
                <motion.button
                  whileHover={isMobile ? {} : { scale: 1.1, rotate: 90 }}
                  whileTap={isMobile ? {} : { scale: 0.9 }}
                  onClick={closeSidebar}
                  className="p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] transition-all duration-300 text-[#9ca3af] hover:text-[#00f0ff] active:scale-95"
                >
                  <XMarkIcon className="w-6 h-6" />
                </motion.button>
              </motion.div>

              {/* Scrollable Nav */}
              <div ref={navContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden pr-3 -mr-3 scrollbar-custom min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                <nav className="space-y-4 sm:space-y-6 pb-8 mobile-sidebar-nav">
                  {/* Основное */}
                  <motion.div
                    initial={isMobile ? false : { opacity: 0, x: -20 }}
                    animate={isMobile ? false : { opacity: 1, x: 0 }}
                    transition={isMobile ? {} : { delay: 0.2 }}
                  >
                    <h3 className="text-[10px] sm:text-xs font-semibold text-[#9ca3af] mb-2 sm:mb-3 uppercase tracking-wider">Основное</h3>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {navItems.filter(i => ['/', '/calculator'].includes(i.path))
                        .map((item, i) => <NavItem key={item.path} item={item} delay={isMobile ? 0 : 0.2 + i * 0.05} isMobile={isMobile} />)}
                    </ul>
                  </motion.div>

                  {/* Покупки */}
                  <motion.div
                    initial={isMobile ? false : { opacity: 0, x: -20 }}
                    animate={isMobile ? false : { opacity: 1, x: 0 }}
                    transition={isMobile ? {} : { delay: 0.3 }}
                  >
                    <h3 className="text-[10px] sm:text-xs font-semibold text-[#808080] mb-2 sm:mb-3 uppercase tracking-wider">Покупки</h3>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {navItems.filter(i => ['/catalog', '/terminal', '/self-pickup', '/rates', '/news', '/batch-cargo-list', '/cart'].includes(i.path))
                        .map((item, i) => <NavItem key={item.path} item={item} delay={isMobile ? 0 : 0.3 + i * 0.05} isMobile={isMobile} />)}
                    </ul>
                  </motion.div>

                  {/* Аккаунт */}
                  <motion.div
                    initial={isMobile ? false : { opacity: 0, x: -20 }}
                    animate={isMobile ? false : { opacity: 1, x: 0 }}
                    transition={isMobile ? {} : { delay: 0.4 }}
                  >
                    <h3 className="text-[10px] sm:text-xs font-semibold text-[#808080] mb-2 sm:mb-3 uppercase tracking-wider">Аккаунт</h3>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {navItems.filter(i => ['/profile', '/notifications'].includes(i.path))
                        .map((item, i) => <NavItem key={item.path} item={item} delay={isMobile ? 0 : 0.4 + i * 0.05} isMobile={isMobile} />)}
                    </ul>
                  </motion.div>

                  {/* Информация */}
                  <motion.div
                    initial={isMobile ? false : { opacity: 0, x: -20 }}
                    animate={isMobile ? false : { opacity: 1, x: 0 }}
                    transition={isMobile ? {} : { delay: 0.5 }}
                  >
                    <h3 className="text-[10px] sm:text-xs font-semibold text-[#808080] mb-2 sm:mb-3 uppercase tracking-wider">Информация</h3>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {navItems.filter(i => !['/', '/calculator', '/catalog', '/terminal', '/self-pickup', '/rates', '/news', '/batch-cargo-list', '/cart', '/profile', '/notifications'].includes(i.path))
                        .map((item, i) => <NavItem key={item.path} item={item} delay={isMobile ? 0 : 0.5 + i * 0.05} isMobile={isMobile} />)}
                    </ul>
                  </motion.div>

                  {/* Кнопка Выйти - внутри прокручиваемой области */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)]"
                  >
                    <div className="car-animation w-24 h-12 absolute -bottom-4 left-2 opacity-90 pointer-events-none">
                      <img src="/car.png" alt="Cargo Truck" className="w-full h-full object-contain filter brightness-150 drop-shadow-lg" />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="w-full mt-8 px-4 py-3 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 text-base font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Выйти</span>
                    </motion.button>
                  </motion.div>
                </nav>

                <div id="scroll-indicator" className="absolute right-1 top-0 bottom-0 w-1 bg-[#00f0ff] opacity-30 rounded-full" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ---------- Main Content ---------- */}
      <main className={`main-content flex-1 relative z-10 w-full p-0 pb-safe sm:pb-16 ${location.pathname === '/' ? 'pt-0' : 'pt-16'}`}>
        <Suspense fallback={<Loading message="Загрузка страницы..." />}>
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
            <Route path="/batch-cargo-list" element={<BatchCargoList />} />
            <Route path="/batch-cargo-details/:batchId" element={<BatchCargoDetails />} />
            <Route path="/public-offer" element={<PublicOffer />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/user-agreement" element={<UserAgreement />} />
            <Route path="/batch-cargos/:batchId/order/:orderId" element={<BatchCargoProcessing />} />
            <Route path="/rates" element={<Rate />} />
            <Route path="/news" element={<News />} />
            <Route path="/thanks" element={<Thanks />} />
            <Route path="/badResponse" element={<BadResponse />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {location.pathname !== '/' && <Footer id="contact" />}

      {/* Telegram Button - Fixed bottom right */}
      <a
        href="https://t.me/FLUVIONN"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 z-50 bg-[#0088cc] text-white p-4 rounded-full shadow-lg hover:bg-[#00a0e0] transition-all duration-300 hover:scale-110 active:scale-95 bottom-safe sm:bottom-6"
        aria-label="Telegram канал FLUVION"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.169 1.858-.896 6.375-1.268 8.451-.162.894-.479 1.192-.787 1.222-.69.062-1.214-.456-1.883-.893-1.046-.692-1.638-1.123-2.654-1.799-1.251-.844-.44-1.309.274-2.067.186-.193 3.405-3.123 3.471-3.391.008-.031.015-.147-.057-.208-.072-.061-.178-.038-.256-.023-.109.019-1.843 1.175-5.202 3.45-.493.348-.939.517-1.34.509-.443-.01-1.295-.25-1.927-.458-.776-.257-1.392-.392-1.338-.828.027-.218.405-.442 1.113-.671 4.318-1.874 7.205-3.11 8.659-3.708 4.078-1.668 4.921-1.959 5.474-1.977.122-.004.396-.029.573.216.138.192.096.44.056.606z"/>
        </svg>
      </a>
    </div>
  );
}

export default AppLayout;
