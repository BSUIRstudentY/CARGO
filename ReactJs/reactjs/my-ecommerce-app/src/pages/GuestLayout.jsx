import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Route, Routes, Navigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
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
import { HomeIcon, ShoppingBagIcon, CalculatorIcon, TruckIcon, QuestionMarkCircleIcon, WrenchScrewdriverIcon, StarIcon, LockClosedIcon } from '@heroicons/react/24/solid';

function GuestLayout() {
  const [backgroundColor, setBackgroundColor] = useState(() => localStorage.getItem('backgroundColor') || '#2F2F2F');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#FF5722');
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    localStorage.setItem('accentColor', accentColor);
  }, [backgroundColor, accentColor]);

  const navItems = [
    { path: '/', label: 'Главная', icon: <HomeIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/catalog', label: 'Каталог', icon: <ShoppingBagIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/calculator', label: 'Калькулятор стоимости', icon: <CalculatorIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/reviews', label: 'Отзывы', icon: <StarIcon className="w-5 h-5 text-cyan-400" /> },
    { path: '/login', label: 'Вход/Регистрация', icon: <LockClosedIcon className="w-5 h-5 text-cyan-400" />, highlight: true },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    if (isSidebarOpen) setOpenDropdown(null);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
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
                {navItems.map((item, index) => (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        toggleDropdown(index);
                        if (!item.subItems) {
                          navigate(item.path);
                          closeSidebar();
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg bg-gray-700/40 hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-between ${
                        item.highlight ? 'bg-green-500/20 text-green-300 hover:text-green-100' : 'text-cyan-400 hover:text-cyan-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.subItems && (
                        <span>
                          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      )}
                    </button>
                    {openDropdown === index && item.subItems && (
                      <ul className="ml-6 space-y-1 mt-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <button
                              onClick={() => {
                                navigate(subItem.path);
                                closeSidebar();
                              }}
                              className="w-full text-left px-4 py-2 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-2 text-cyan-400 hover:text-cyan-200 text-sm"
                            >
                              {subItem.icon}
                              {subItem.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-6 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
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
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default GuestLayout;