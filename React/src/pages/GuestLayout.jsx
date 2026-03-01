// GuestLayout.jsx
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Footer from './Footer';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Loading } from '../components/ui/Loading';

// Lazy load all pages for better code splitting and performance
const MultiTerminal = lazy(() => import('./MultiTerminal'));
const Catalog = lazy(() => import('./Catalog'));
const Home = lazy(() => import('./Home'));
const DeliveryPayment = lazy(() => import('./DeliveryPayment'));
const FAQSection = lazy(() => import('./FAQSection'));
const SupportPage = lazy(() => import('./SupportPage'));
const TicketChatPage = lazy(() => import('./TicketChatPage'));
const Reviews = lazy(() => import('./Reviews'));
const CostCalculator = lazy(() => import('./CostCalculator'));
const PublicOffer = lazy(() => import('./PublicOffer'));
const PrivacyPolicy = lazy(() => import('../components/PrivacyPolicy'));
const UserAgreement = lazy(() => import('../components/UserAgreement'));
const LoginRegister = lazy(() => import('./LoginRegister'));
const Rate = lazy(() => import('./Rate'));
const Thanks = lazy(() => import('./Thanks'));
const BadResponse = lazy(() => import('./BadResponse'));
const News = lazy(() => import('./News'));
const OrderInstructions = lazy(() => import('./OrderInstructions'));
import {
  HomeIcon, ShoppingBagIcon, ComputerDesktopIcon, CalculatorIcon, TruckIcon, QuestionMarkCircleIcon,
  WrenchScrewdriverIcon, StarIcon, LockClosedIcon, CurrencyDollarIcon, MegaphoneIcon,
  ClipboardDocumentListIcon, ChevronDownIcon
} from '@heroicons/react/24/solid';

function GuestLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ---------- Menu dropdown click outside ---------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  /* ---------- Lenis: плавный скролл на всех страницах ---------- */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    return () => lenis.destroy();
  }, []);

  /* ---------- Navigation items ---------- */
  const navItems = [
    { path: '/', label: 'Главная', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/calculator', label: 'Калькулятор', icon: <CalculatorIcon className="w-5 h-5" /> },
    { path: '/catalog', label: 'Примеры товаров', icon: <ShoppingBagIcon className="w-5 h-5" /> },
    { path: '/terminal', label: 'Заказать товар', icon: <ComputerDesktopIcon className="w-5 h-5" />, special: true },
    { path: '/rates', label: 'Курс', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
    { path: '/news', label: 'Новости', icon: <MegaphoneIcon className="w-5 h-5" /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className="w-5 h-5" /> },
    { path: '/order-instructions', label: 'Инструкции', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
    { path: '/faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
    { path: '/support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
    { path: '/reviews', label: 'Отзывы', icon: <StarIcon className="w-5 h-5" /> },
    { path: '/login', label: 'Вход/Регистрация', icon: <LockClosedIcon className="w-5 h-5" />, special: true },
  ];

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const handleNavClick = (path) => {
    navigate(path);
    closeMenu();
  };

  /* Активная вкладка = текущая страница (отдельно от special = «Заказать товар» / «Вход») */
  const isNavActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex flex-col min-h-screen text-text-primary relative overflow-x-hidden bg-[var(--ev-void)] font-ev-body antialiased">
      {/* Grain оверлей только на странице каталога — рендер в body поверх всего */}
      {location.pathname === '/catalog' && createPortal(
        <div
          className="grain-overlay"
          style={{ zIndex: 2147483647 }}
          aria-hidden="true"
        />,
        document.body
      )}
      {/* Фон Ethereal Void — мягкие золотые акценты */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-60"
          style={{
            background: 'radial-gradient(circle, var(--ev-gold-glow) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(201, 169, 122, 0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      <style>{`
        .main-content { padding-top: calc(56px + env(safe-area-inset-top)); padding-bottom: 0; }
      `}</style>

      {/* ---------- Fixed Header (Ethereal Void) ---------- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--ev-glass)] backdrop-blur-[32px] border-b border-[var(--ev-gold-soft)] pt-safe [&_button]:outline-none [&_button]:ring-0 [&_button]:ring-offset-0">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <button onClick={() => handleNavClick('/')} className="flex items-center gap-2 shrink-0">
            <span className="ev-logo-tint block h-6 w-6 md:h-7 md:w-7 shrink-0" style={{ maskImage: 'url(/logo.png)', WebkitMaskImage: 'url(/logo.png)' }} aria-hidden />
            <span className="font-[var(--ev-font-display)] font-light text-lg text-[var(--ev-text)]">Fluvion</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { path: '/', label: 'Главная' },
              { path: '/calculator', label: 'Калькулятор' },
              { path: '/terminal', label: 'Заказать товар', cta: true },
              { path: '/catalog', label: 'Каталог' },
            ].map(({ path, label, cta }) => (
              <button
                key={path}
                onClick={() => handleNavClick(path)}
                className={
                  cta
                    ? 'px-4 py-2 rounded-full text-sm font-normal bg-[var(--ev-gold)]/60 text-[#faf8f5] hover:bg-[var(--ev-gold)]/80 hover:text-white transition-colors shadow-[0_0_20px_var(--ev-gold-glow)]'
                    : `px-3 py-2 rounded-lg text-sm font-normal transition-colors ${isNavActive(path)
                      ? 'text-[var(--ev-gold)]'
                      : 'text-[var(--ev-text-muted)] hover:text-[var(--ev-text)]'
                    }`
                }
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="relative flex items-center gap-2 md:ml-auto" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-normal text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10 transition-all"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              {isMobile ? 'Меню' : 'Ещё'}
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute left-4 right-4 md:left-auto md:right-auto md:min-w-[220px] top-full mt-1 py-2 rounded-xl bg-[var(--ev-glass)] backdrop-blur-[24px] border border-[var(--ev-gold)]/20 shadow-xl z-[100] max-h-[min(70vh,400px)] overflow-y-auto">
                {isMobile ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="ev-label text-[var(--ev-gold)]/80 mb-2">Основное</p>
                      {navItems.filter(i => ['/', '/calculator'].includes(i.path)).map((item) => (
                        <button key={item.path} onClick={() => handleNavClick(item.path)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--ev-text)] hover:bg-[var(--ev-gold)]/10">
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2">
                      <p className="ev-label text-[var(--ev-gold)]/80 mb-2">Покупки</p>
                      {navItems.filter(i => ['/catalog', '/terminal', '/rates', '/news'].includes(i.path)).map((item) => (
                        <button key={item.path} onClick={() => handleNavClick(item.path)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--ev-text)] hover:bg-[var(--ev-gold)]/10">
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2">
                      <p className="ev-label text-[var(--ev-gold)]/80 mb-2">Информация</p>
                      {navItems.filter(i => ['/delivery-payment', '/order-instructions', '/faq', '/support', '/reviews'].includes(i.path)).map((item) => (
                        <button key={item.path} onClick={() => handleNavClick(item.path)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--ev-text)] hover:bg-[var(--ev-gold)]/10">
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2">
                      <p className="ev-label text-[var(--ev-gold)]/80 mb-2">Аккаунт</p>
                      {navItems.filter(i => ['/login'].includes(i.path)).map((item) => (
                        <button key={item.path} onClick={() => handleNavClick(item.path)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10 font-normal">
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      { path: '/delivery-payment', label: 'Доставка и оплата' },
                      { path: '/order-instructions', label: 'Инструкции' },
                      { path: '/faq', label: 'FAQ' },
                      { path: '/support', label: 'Поддержка' },
                      { path: '/reviews', label: 'Отзывы' },
                    ].map(({ path, label }) => (
                      <button key={path} onClick={() => handleNavClick(path)} className="w-full text-left px-4 py-2 text-sm text-[var(--ev-text)] hover:bg-[var(--ev-gold)]/10">
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-[var(--ev-gold)]/10 mt-2 pt-2">
                      <button onClick={() => handleNavClick('/login')} className="w-full text-left px-4 py-2 text-sm text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10 font-normal">
                        Вход / Регистрация
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavClick('/login')}
            className="px-4 py-2 rounded-xl bg-[var(--ev-gold)] text-[var(--ev-void)] text-sm font-normal hover:opacity-90 transition-opacity"
          >
            Войти
          </button>
        </div>
      </header>

      {/* ---------- Main Content ---------- */}
      <main className="main-content flex-1 relative z-10 w-full p-0 pt-16 pb-16 sm:pb-16 pb-safe">
        <Suspense fallback={<Loading message="Загрузка страницы..." />}>
          <Routes>
            <Route path="/profile" element={<Navigate to="/login" replace />} />
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/terminal" element={<MultiTerminal />} />
            <Route path="/calculator" element={<CostCalculator />} />
            <Route path="/delivery-payment" element={<DeliveryPayment />} />
            <Route path="/order-instructions" element={<OrderInstructions />} />
            <Route path="/faq" element={<FAQSection />} />
            <Route path="/support" element={<Navigate to="/login" replace />} />
            <Route path="/ticket/:ticketId/chat" element={<TicketChatPage />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/register" element={<LoginRegister />} />
            <Route path="/public-offer" element={<PublicOffer />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/user-agreement" element={<UserAgreement />} />
            <Route path="/rates" element={<Rate />} />
            <Route path="/news" element={<News />} />
            <Route path="/thanks" element={<Thanks />} />
            <Route path="/badResponse" element={<BadResponse />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {location.pathname !== '/catalog' && <Footer id="contact" />}

      {/* Telegram Button - Fixed bottom right */}
      <a
        href="https://t.me/FLUVIONN"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 z-50 bg-[var(--ev-gold)] text-[var(--ev-void)] p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 bottom-safe sm:bottom-6"
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

export default GuestLayout;

