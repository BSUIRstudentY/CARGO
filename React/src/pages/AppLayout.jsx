import React, { Suspense, lazy } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useCart } from '../components/CartContext';
import Footer from './Footer';
import { Loading } from '../components/ui/Loading';
import StoreChrome from '../components/StoreChrome';
import {
  HomeIcon, ShoppingBagIcon, ComputerDesktopIcon, ShoppingCartIcon, CalculatorIcon, UserIcon, BellIcon,
  TruckIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon, WrenchScrewdriverIcon,
  StarIcon, ArrowRightOnRectangleIcon, CurrencyDollarIcon, MegaphoneIcon
} from '@heroicons/react/24/outline';

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

const icon = 'w-5 h-5';

function AppLayout() {
  const { logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Главная', tabLabel: 'Главная', icon: <HomeIcon className={icon} /> },
    { path: '/calculator', label: 'Калькулятор', icon: <CalculatorIcon className={icon} /> },
    { path: '/catalog', label: 'Примеры товаров', icon: <ShoppingBagIcon className={icon} /> },
    { path: '/terminal', label: 'Заказать товар', tabLabel: 'Заказать', icon: <ComputerDesktopIcon className={icon} />, special: true },
    { path: '/self-pickup', label: 'Самовыкуп', icon: <ShoppingBagIcon className={icon} /> },
    { path: '/rates', label: 'Курс', icon: <CurrencyDollarIcon className={icon} /> },
    { path: '/news', label: 'Новости', icon: <MegaphoneIcon className={icon} /> },
    { path: '/batch-cargo-list', label: 'Сборные грузы', icon: <TruckIcon className={icon} /> },
    { path: '/cart', label: 'Корзина', tabLabel: 'Корзина', icon: <ShoppingCartIcon className={icon} /> },
    { path: '/profile', label: 'Профиль', tabLabel: 'Профиль', icon: <UserIcon className={icon} /> },
    { path: '/notifications', label: 'Уведомления', icon: <BellIcon className={icon} /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className={icon} /> },
    { path: '/order-instructions', label: 'Инструкции', icon: <ClipboardDocumentListIcon className={icon} /> },
    { path: '/faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className={icon} /> },
    { path: '/support', label: 'Поддержка', icon: <WrenchScrewdriverIcon className={icon} /> },
    { path: '/reviews', label: 'Отзывы', icon: <StarIcon className={icon} /> },
  ];

  const groups = [
    { title: 'Основное', paths: ['/', '/calculator'] },
    { title: 'Покупки', paths: ['/catalog', '/terminal', '/self-pickup', '/rates', '/news', '/batch-cargo-list', '/cart'] },
    { title: 'Аккаунт', paths: ['/profile', '/notifications'] },
    { title: 'Информация', paths: ['/delivery-payment', '/order-instructions', '/faq', '/support', '/reviews'] },
  ];

  const headerRight = (
    <>
      <button type="button" className="cupertino-icon-btn" aria-label="Уведомления" onClick={() => navigate('/notifications')}>
        <BellIcon className="w-5 h-5" />
      </button>
      <button type="button" className="cupertino-icon-btn" aria-label="Корзина" onClick={() => navigate('/cart')}>
        <ShoppingCartIcon className="w-5 h-5" />
        {cart && cart.length > 0 && (
          <span className="cupertino-badge">{cart.length > 99 ? '99+' : cart.length}</span>
        )}
      </button>
      <button type="button" className="cupertino-icon-btn" aria-label="Профиль" onClick={() => navigate('/profile')}>
        <UserIcon className="w-5 h-5" />
      </button>
    </>
  );

  const sidebarFooter = (
    <button type="button" className="cupertino-btn cupertino-btn-gray cupertino-btn-md w-full" onClick={logout}>
      <ArrowRightOnRectangleIcon className="w-5 h-5" />
      Выйти
    </button>
  );

  return (
    <StoreChrome
      navItems={navItems}
      groups={groups}
      mobileTabs={['/', '/terminal', '/cart', '/profile']}
      headerRight={headerRight}
      sidebarFooter={sidebarFooter}
    >
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
      <Footer id="contact" />
    </StoreChrome>
  );
}

export default AppLayout;
