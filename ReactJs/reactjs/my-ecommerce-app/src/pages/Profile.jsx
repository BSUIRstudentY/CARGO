import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import LoyaltyTab from '../components/LoyaltyTab';
import PersonalDataTab from '../components/PersonalDataTab';
import ShipmentsTab from '../components/ShipmentsTab';
import OrderHistoryTab from '../components/OrderHistoryTab';
import PaymentMethodsTab from '../components/PaymentMethodsTab';
import ReferralTab from '../components/ReferralTab';
import BatchCargosTab from '../components/BatchCargosTab';
import { UserIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

function Profile() {
  const { user, logout } = useAuth();
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [activeTab, setActiveTab] = useState('personal-data');
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const role = extractRoleFromToken(token);
      setUserRole(role);
    }
  }, []);

  const extractRoleFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.role || 'USER';
    } catch (e) {
      console.error('Ошибка декодирования токена:', e);
      return 'USER';
    }
  };

  const handleViewOrderDetails = useCallback(
    (orderId) => {
      navigate(`/order-details/${orderId}`);
    },
    [navigate]
  );

  const handleOrderDetailsHistory = useCallback(
    (orderId) => {
      navigate(`/order-details-history/${orderId}`);
    },
    [navigate]
  );

  const handlePay = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}`, { status: 'PAID' });
      alert('Заказ оплачен!');
      setRefreshTrigger(Date.now());
    } catch (error) {
      console.error('Ошибка при оплате заказа:', error);
      setError('Ошибка при оплате заказа');
    }
  };

  const tabs = [
    {
      id: 'personal-data',
      label: 'Личные данные',
      icon: <UserIcon className="w-5 h-5" />,
    },
    {
      id: 'shipments',
      label: 'Заказы',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M16.755 5.932h-1.99a2.56 2.56 0 0 0 .455-1.394 2.767 2.767 0 0 0-.822-2.054 2.812 2.812 0 0 0-2.07-.815 2.584 2.584 0 0 0-1.866.857 4.16 4.16 0 0 0-.46.631 4.165 4.165 0 0 0-.461-.631 2.565 2.565 0 0 0-1.866-.857 2.831 2.831 0 0 0-2.07.815 2.786 2.786 0 0 0-.823 2.054c.013.499.171.983.456 1.394h-1.99c-.408 0-1.004-.096-1.292.19-.287.285-.243.928-.243 1.332V9.89c0 .35-.143.907.081 1.179.224.272.962.242 1.309.313l-.162 4.597c0 .404.028.907.316 1.193.287.285.811.33 1.218.33h11.052c.407 0 .931-.045 1.22-.33.287-.286.315-.79.315-1.193l-.163-4.597c.347-.07 1.086-.041 1.31-.313.223-.272.081-.828.081-1.18V7.455c0-.404.044-1.047-.244-1.333-.288-.285-.884-.19-1.291-.19Zm-4.912-2.195a.736.736 0 0 1 .537-.241h.027a.976.976 0 0 1 .697.29.958.958 0 0 1 .274.7.726.726 0 0 1-.243.532c-.53.466-1.4.705-2.12.82.114-.712.355-1.576.828-2.1Zm-4.935.04a.986.986 0 0 1 .684-.281h.03a.741.741 0 0 1 .537.241c.47.525.711 1.389.825 2.102-.713-.115-1.592-.354-2.116-.82a.73.73 0 0 1-.244-.534.961.961 0 0 1 .284-.707Z" />
        </svg>
      ),
    },
    {
      id: 'batch-cargos',
      label: 'Отправления',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 4a8 8 0 0 0-8 8c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm2-6h-2v2h-2v-2H8v-2h2V8h2v2h2v2z" />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'История отправлений',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M13.5 3H12v-3h-2v3H7.5v3H13.5V3zm-5 2H3v1h5V5zm5 7h-3v3h-2v-3H7.5v-3h6v3zM19 21H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2z" />
        </svg>
      ),
    },
    {
      id: 'payment-methods',
      label: 'Способы оплаты',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M21 4.875 3 4.5c-.397 0-.779.159-1.06.44s-.815.875-.815 1.272v3.07c0 .003 0-.004 0 0V9.09 13.5L1.5 18A1.502 1.502 0 0 0 3 19.5c7.072.364 11.019.393 18 0a1.502 1.502 0 0 0 1.5-1.5c.324-4.501.361-7.042 0-11.625 0-.398-.158-.844-.44-1.125-.28-.281-.662-.375-1.06-.375ZM12.75 16.5c-.13.054-1.175.064-1.44.019-.041-.007-.082-.023-.122-.033-.115-.029-.363-.1-.469-.206a.75.75 0 0 1-.22-.53.577.577 0 0 1 .2-.53.795.795 0 0 1 .535-.22c.01 0 .021 0 .031-.002.535-.084.875-.06 1.485.002a.75.75 0 0 1 .53 1.28c-.14.141-.383.16-.53.22Zm6 0c-1.27.055-1.93.05-3 0-.199 0-.375 0-.53-.22-.157-.22-.22-.331-.22-.53s.115-.39.256-.53c.14-.141.295-.22.494-.22 1.706-.093 2.307-.085 2.993-.001l.015.003c.054.011.393.088.522.218a.75.75 0 0 1-.53 1.28ZM3.824 8.254a.827.827 0 1 1 .012-1.656c2.365.029 9.107.098 11.914-.01 1.44-.057 3.185-.128 4.257-.172a.954.954 0 1 1 .034 1.91L3.824 8.254Z" />
        </svg>
      ),
    },
    {
      id: 'loyalty',
      label: 'Система лояльности',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v2h-2zm0 4h2v6h-2z" />
        </svg>
      ),
    },
    {
      id: 'referrals',
      label: 'Рефералы',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 4a8 8 0 0 0-8 8c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm2-6h-2v2h-2v-2H8v-2h2V8h2v2h2v2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-900 to-gray-800">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <UserIcon className="w-10 h-10 text-cyan-600" />
          <h2 className="text-3xl font-bold text-white">Личный кабинет</h2>
        </motion.header>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-base font-medium"
          >
            {error}
          </motion.div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="w-full lg:w-1/4 bg-gray-900/50 rounded-lg p-6 border border-gray-700/20 shadow-lg hover:shadow-cyan-600/20 transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-cyan-600 mb-4">Навигация</h3>
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full p-3 rounded-lg transition duration-300 text-base font-medium ${
                      activeTab === tab.id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </motion.button>
                </li>
              ))}
              <li>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center w-full p-3 text-gray-300 rounded-lg hover:bg-gray-600 transition duration-300 text-base font-medium"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5 text-gray-300" />
                  <span className="ml-2">Выйти</span>
                </motion.button>
              </li>
            </ul>
            {userRole === 'ADMIN' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Функция админ-панели пока не реализована')}
                className="mt-6 w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition duration-300 text-base font-medium"
              >
                Админ-панель
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('Функция удаления аккаунта пока не реализована')}
              className="mt-2 w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-base font-medium"
            >
              Удалить аккаунт
            </motion.button>
          </motion.aside>
          <motion.main
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="w-full lg:w-3/4 h-[70vh] overflow-y-auto bg-gray-900/50 rounded-lg p-6 border border-gray-700/20 shadow-lg hover:shadow-cyan-600/20 transition-shadow duration-300 no-scrollbar"
          >
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
            {activeTab === 'history' && (
              <OrderHistoryTab
                handleOrderDetailsHistory={handleOrderDetailsHistory}
                refresh={refreshTrigger}
              />
            )}
            {activeTab === 'payment-methods' && <PaymentMethodsTab />}
            {activeTab === 'loyalty' && <LoyaltyTab />}
            {activeTab === 'referrals' && <ReferralTab />}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default Profile;