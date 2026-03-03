import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import confetti from 'canvas-confetti';
import LoyaltyTab from '../components/LoyaltyTab';
import PersonalDataTab from '../components/PersonalDataTab';
import ShipmentsTab from '../components/ShipmentsTab';
import ReferralTab from '../components/ReferralTab';
import BatchCargosTab from '../components/BatchCargosTab';
import { UserIcon, ArrowLeftOnRectangleIcon, TruckIcon } from '@heroicons/react/24/solid';
import { Alert } from '../components/ui/Alert';

const tabIcons = {
  'personal-data': <UserIcon className="w-5 h-5" />,
  'shipments': (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16.755 5.932h-1.99a2.56 2.56 0 0 0 .455-1.394 2.767 2.767 0 0 0-.822-2.054 2.812 2.812 0 0 0-2.07-.815 2.584 2.584 0 0 0-1.866.857 4.16 4.16 0 0 0-.46.631 4.165 4.165 0 0 0-.461-.631 2.565 2.565 0 0 0-1.866-.857 2.831 2.831 0 0 0-2.07.815 2.786 2.786 0 0 0-.823 2.054c.013.499.171.983.456 1.394h-1.99c-.408 0-1.004-.096-1.292.19-.287.285-.243.928-.243 1.332V9.89c0 .35-.143.907.081 1.179.224.272.962.242 1.309.313l-.162 4.597c0 .404.028.907.316 1.193.287.285.811.33 1.218.33h11.052c.407 0 .931-.045 1.22-.33.287-.286.315-.79.315-1.193l-.163-4.597c.347-.07 1.086-.041 1.31-.313.223-.272.081-.828.081-1.18V7.455c0-.404.044-1.047-.244-1.333-.288-.285-.884-.19-1.291-.19Z" /></svg>
  ),
  'batch-cargos': <TruckIcon className="w-5 h-5" />,
  'loyalty': (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v2h-2zm0 4h2v6h-2z" /></svg>
  ),
  'referrals': (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 4a8 8 0 0 0-8 8c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm2-6h-2v2h-2v-2H8v-2h2V8h2v2h2v2z" /></svg>
  ),
};

function Profile() {
  const { user, logout } = useAuth();
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [activeTab, setActiveTab] = useState('personal-data');
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    }
  }, [user?.role]);

  const handleViewOrderDetails = useCallback(
    (orderId) => {
      navigate(`/order-details/${orderId}`);
    },
    [navigate]
  );


  const handlePay = async (orderId) => {
    try {
      // Получаем данные заказа для расчета суммы
      const orderResponse = await api.get(`/orders/${orderId}`);
      const order = orderResponse.data;

      const totalItemsPrice = order.items?.reduce((sum, item) => {
        return sum + (item.priceAtTime || 0) * (item.quantity || 1);
      }, 0) || 0;

      const totalChinaDeliveryPrice = order.items?.reduce((sum, item) => {
        return sum + (item.chinaDeliveryPrice || 0);
      }, 0) || 0;

      const amount = order.totalClientPrice + totalChinaDeliveryPrice;

      // Создаем платеж через правильный API
      const response = await api.post('/payment/create', {
        orderId: parseInt(orderId),
        amount,
      });

      if (response.data.success && response.data.formUrl) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#a78bfa', '#10b981'],
        });
        window.location.href = response.data.formUrl;
      } else {
        throw new Error('Invalid response from payment API');
      }
    } catch (error) {
      console.error('Ошибка при оплате заказа:', error);
      setError('Ошибка инициации оплаты: ' + (error.response?.data?.error || error.message));
    }
  };

  const tabs = [
    { id: 'personal-data', label: 'Личные данные' },
    { id: 'shipments', label: 'Заказы' },
    { id: 'batch-cargos', label: 'Сборные грузы' },
    { id: 'loyalty', label: 'Система лояльности' },
    { id: 'referrals', label: 'Рефералы' },
  ];

  return (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] font-[var(--ev-font-body)]">
      <Helmet>
        <title>Личный кабинет | Fluvion</title>
        <meta name="description" content="Управление данными и заказами." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28">
        {/* Заголовок */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex items-center justify-center shrink-0">
              <UserIcon className="w-7 h-7 text-[var(--ev-gold)]" />
            </div>
            <div>
              <h1 className="font-[var(--ev-font-display)] text-2xl sm:text-3xl font-light text-[var(--ev-text)]">
                Личный кабинет
              </h1>
              <p className="text-sm text-[var(--ev-text-muted)] mt-0.5">
                Управление данными и заказами
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Мобильные табы */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border transition-colors ${
                tab.id === activeTab
                  ? 'bg-[var(--ev-gold)]/20 border-[var(--ev-gold)]/40 text-[var(--ev-gold)]'
                  : 'border-[var(--ev-gold)]/15 text-[var(--ev-text-muted)] hover:border-[var(--ev-gold)]/30 hover:text-[var(--ev-gold)]'
              }`}
            >
              {tabIcons[tab.id]}
            </button>
          ))}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Десктоп: сайдбар */}
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hidden lg:block w-full lg:w-72 shrink-0"
          >
            <div className="rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 p-5 hover:border-[var(--ev-gold)]/25 transition-colors">
              <h2 className="ev-label text-[var(--ev-gold)] text-xs font-semibold uppercase tracking-wider mb-4">
                Навигация
              </h2>
              <nav>
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                          tab.id === activeTab
                            ? 'bg-[var(--ev-gold)]/15 text-[var(--ev-gold)] border border-[var(--ev-gold)]/25'
                            : 'text-[var(--ev-text-muted)] hover:text-[var(--ev-text)] hover:bg-[var(--ev-gold)]/5 border border-transparent'
                        }`}
                      >
                        <span className="text-[var(--ev-gold)]">{tabIcons[tab.id]}</span>
                        {tab.label}
                      </button>
                    </li>
                  ))}
                  <li className="mt-4 pt-4 border-t border-[var(--ev-gold)]/10">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--ev-gold)] bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/20 transition-colors"
                    >
                      <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                      Выйти
                    </button>
                  </li>
                </ul>
              </nav>
              {userRole === 'ADMIN' && (
                <div className="mt-4 pt-4 border-t border-[var(--ev-gold)]/10">
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[var(--ev-text)] border border-[var(--ev-gold)]/20 hover:bg-[var(--ev-gold)]/10 hover:border-[var(--ev-gold)]/30 transition-colors"
                  >
                    Админ-панель
                  </button>
                </div>
              )}
            </div>
          </motion.aside>

          {/* Контент */}
          <motion.main
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex-1 min-w-0"
          >
            <div className="rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 p-5 sm:p-6 hover:border-[var(--ev-gold)]/25 transition-colors">
              {activeTab === 'personal-data' && <PersonalDataTab setError={setError} />}
              {activeTab === 'shipments' && (
                <ShipmentsTab
                  handleViewOrderDetails={handleViewOrderDetails}
                  handlePay={handlePay}
                  refresh={refreshTrigger}
                />
              )}
              {activeTab === 'batch-cargos' && (
                <BatchCargosTab
                  userEmail={user?.email}
                  handleViewOrderDetails={handleViewOrderDetails}
                  refresh={refreshTrigger}
                />
              )}
              {activeTab === 'loyalty' && <LoyaltyTab />}
              {activeTab === 'referrals' && <ReferralTab />}
            </div>
          </motion.main>
        </div>

        {/* Мобильная кнопка выхода */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="fixed bottom-24 right-6 lg:hidden z-50"
        >
          <button
            onClick={logout}
            className="w-14 h-14 rounded-full bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] flex items-center justify-center shadow-lg hover:bg-[var(--ev-gold)]/30 transition-colors"
            aria-label="Выйти"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;