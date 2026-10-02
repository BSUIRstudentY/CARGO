import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Footer from './Footer';
import { Loading } from '../components/ui/Loading';
import StoreChrome from '../components/StoreChrome';
import {
  HomeIcon, ShoppingBagIcon, ComputerDesktopIcon, CalculatorIcon, TruckIcon, QuestionMarkCircleIcon,
  WrenchScrewdriverIcon, StarIcon, LockClosedIcon, CurrencyDollarIcon, MegaphoneIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const MultiTerminal = lazy(() => import('./MultiTerminal'));
const Catalog = lazy(() => import('./Catalog'));
const Home = lazy(() => import('./Home'));
const DeliveryPayment = lazy(() => import('./DeliveryPayment'));
const FAQSection = lazy(() => import('./FAQSection'));
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
const SelfPickupCargo = lazy(() => import('./SelfPickupCargo'));

const icon = 'w-5 h-5';

function GuestLayout() {
  const navItems = [
    { path: '/', label: 'Главная', tabLabel: 'Главная', icon: <HomeIcon className={icon} /> },
    { path: '/calculator', label: 'Калькулятор', tabLabel: 'Калькулятор', icon: <CalculatorIcon className={icon} /> },
    { path: '/catalog', label: 'Примеры товаров', tabLabel: 'Примеры', icon: <ShoppingBagIcon className={icon} /> },
    { path: '/terminal', label: 'Заказать товар', tabLabel: 'Заказать', icon: <ComputerDesktopIcon className={icon} />, special: true },
    { path: '/self-pickup', label: 'Самовыкуп', icon: <ShoppingBagIcon className={icon} /> },
    { path: '/rates', label: 'Курс', icon: <CurrencyDollarIcon className={icon} /> },
    { path: '/news', label: 'Новости', icon: <MegaphoneIcon className={icon} /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className={icon} /> },
    { path: '/order-instructions', label: 'Инструкции', icon: <ClipboardDocumentListIcon className={icon} /> },
    { path: '/faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className={icon} /> },
    { path: '/support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className={icon} /> },
    { path: '/reviews', label: 'Отзывы', icon: <StarIcon className={icon} /> },
    { path: '/login', label: 'Вход/Регистрация', icon: <LockClosedIcon className={icon} />, special: true },
  ];

  const groups = [
    { title: 'Основное', paths: ['/', '/calculator'] },
    { title: 'Покупки', paths: ['/catalog', '/terminal', '/self-pickup', '/rates', '/news'] },
    { title: 'Информация', paths: ['/delivery-payment', '/order-instructions', '/faq', '/support', '/reviews'] },
    { title: 'Аккаунт', paths: ['/login'] },
  ];

  return (
    <StoreChrome
      navItems={navItems}
      groups={groups}
      mobileTabs={['/', '/calculator', '/terminal', '/catalog']}
      headerRight={null}
    >
      <Suspense fallback={<Loading message="Загрузка страницы..." />}>
        <Routes>
          <Route path="/profile" element={<Navigate to="/login" replace />} />
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/terminal" element={<MultiTerminal />} />
          <Route path="/calculator" element={<CostCalculator />} />
          <Route path="/delivery-payment" element={<DeliveryPayment />} />
          <Route path="/order-instructions" element={<OrderInstructions />} />
          <Route path="/self-pickup" element={<SelfPickupCargo />} />
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
      <Footer id="contact" />
    </StoreChrome>
  );
}

export default GuestLayout;
