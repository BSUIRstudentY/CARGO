import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import api from '../api/axiosInstance';
import LoyaltyTab from '../components/LoyaltyTab';
import PersonalDataTab from '../components/PersonalDataTab';
import ShipmentsTab from '../components/ShipmentsTab';
import OrderHistoryTab from '../components/OrderHistoryTab';
import PaymentMethodsTab from '../components/PaymentMethodsTab';
import ReferralTab from '../components/ReferralTab';
import BatchCargosTab from '../components/BatchCargosTab'; // New component

function Profile() {
  const { user, logout } = useAuth();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [activeTab, setActiveTab] = useState('personal-data');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const role = extractRoleFromToken(token);
      setUserRole(role);
    }

    const fetchData = async () => {
      try {
        const ordersResponse = await api.get('/orders');
        setCurrentOrders(ordersResponse.data);
        const historyResponse = await api.get('/order-history');
        setOrderHistory(historyResponse.data);
      } catch (error) {
        setError('Ошибка загрузки данных: ' + (error.response?.data?.message || error.message));
        console.error('Error fetching data:', error);
      }
    };

    if (user?.email) {
      fetchData();
    }
  }, [user?.email]);

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

  const handleViewOrderDetails = useCallback((orderId) => {
    navigate(`/order-details/${orderId}`);
  }, [navigate]);

  const handlePay = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}`, { status: 'PAID' });
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'PAID' } : order
        )
      );
      alert('Заказ оплачен!');
    } catch (error) {
      console.error('Error paying order:', error);
      alert('Ошибка при оплате заказа');
    }
  };

  const tabs = [
    {
      id: 'personal-data',
      label: 'Личные данные',
      icon: 'M12.039 13.609c5.835.009 9.56 2.262 9.56 6.325 0 .464.148 1.936-.214 2.01-.182.036-1.073.052-1.688.056h-.26a87.22 87.22 0 0 1-3.065-.08 76.271 76.271 0 0 0-2.958-.08c-2.232-.003-6.137.17-8.067.07-1.438-.075-2.555.045-2.86-.361-.162-.216-.107-1.717-.106-2.106.006-4.43 5.278-5.841 9.658-5.834Zm5.414-6.285c-1.668 9.175-15.994 2.889-8.96-3.961a8.15 8.15 0 0 1 1.388-.908c3.112-1.637 8.2 1.414 7.572 4.87Z',
    },
    {
      id: 'shipments',
      label: 'Заказы', // Renamed from Отправления
      icon: 'M16.755 5.932h-1.99a2.56 2.56 0 0 0 .455-1.394 2.767 2.767 0 0 0-.822-2.054 2.812 2.812 0 0 0-2.07-.815 2.584 2.584 0 0 0-1.866.857 4.16 4.16 0 0 0-.46.631 4.165 4.165 0 0 0-.461-.631 2.565 2.565 0 0 0-1.866-.857 2.831 2.831 0 0 0-2.07.815 2.786 2.786 0 0 0-.823 2.054c.013.499.171.983.456 1.394h-1.99c-.408 0-1.004-.096-1.292.19-.287.285-.243.928-.243 1.332V9.89c0 .35-.143.907.081 1.179.224.272.962.242 1.309.313l-.162 4.597c0 .404.028.907.316 1.193.287.285.811.33 1.218.33h11.052c.407 0 .931-.045 1.22-.33.287-.286.315-.79.315-1.193l-.163-4.597c.347-.07 1.086-.041 1.31-.313.223-.272.081-.828.081-1.18V7.455c0-.404.044-1.047-.244-1.333-.288-.285-.884-.19-1.291-.19Zm-4.912-2.195a.736.736 0 0 1 .537-.241h.027a.976.976 0 0 1 .697.29.958.958 0 0 1 .274.7.726.726 0 0 1-.243.532c-.53.466-1.4.705-2.12.82.114-.712.355-1.576.828-2.1Zm-4.935.04a.986.986 0 0 1 .684-.281h.03a.741.741 0 0 1 .537.241c.47.525.711 1.389.825 2.102-.713-.115-1.592-.354-2.116-.82a.73.73 0 0 1-.244-.534.961.961 0 0 1 .284-.707Z',
    },
    {
      id: 'batch-cargos',
      label: 'Отправления', // New tab
      icon: 'M12 4a8 8 0 0 0-8 8c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm2-6h-2v2h-2v-2H8v-2h2V8h2v2h2v2z', // Reused icon (replace if needed)
    },
    {
      id: 'history',
      label: 'История отправлений',
      icon: 'M13.5 3H12v-3h-2v3H7.5v3H13.5V3zm-5 2H3v1h5V5zm5 7h-3v3h-2v-3H7.5v-3h6v3zM19 21H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2z',
    },
    {
      id: 'payment-methods',
      label: 'Способы оплаты',
      icon: 'M21 4.875 3 4.5c-.397 0-.779.159-1.06.44s-.815.875-.815 1.272v3.07c0 .003 0-.004 0 0V9.09 13.5L1.5 18A1.502 1.502 0 0 0 3 19.5c7.072.364 11.019.393 18 0a1.502 1.502 0 0 0 1.5-1.5c.324-4.501.361-7.042 0-11.625 0-.398-.158-.844-.44-1.125-.28-.281-.662-.375-1.06-.375ZM12.75 16.5c-.13.054-1.175.064-1.44.019-.041-.007-.082-.023-.122-.033-.115-.029-.363-.1-.469-.206a.75.75 0 0 1-.22-.53.577.577 0 0 1 .2-.53.795.795 0 0 1 .535-.22c.01 0 .021 0 .031-.002.535-.084.875-.06 1.485.002a.75.75 0 0 1 .53 1.28c-.14.141-.383.16-.53.22Zm6 0c-1.27.055-1.93.05-3 0-.199 0-.375 0-.53-.22-.157-.22-.22-.331-.22-.53s.115-.39.256-.53c.14-.141.295-.22.494-.22 1.706-.093 2.307-.085 2.993-.001l.015.003c.054.011.393.088.522.218a.75.75 0 0 1-.53 1.28ZM3.824 8.254a.827.827 0 1 1 .012-1.656c2.365.029 9.107.098 11.914-.01 1.44-.057 3.185-.128 4.257-.172a.954.954 0 1 1 .034 1.91L3.824 8.254Z',
    },
    {
      id: 'loyalty',
      label: 'Система лояльности',
      icon: 'M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v2h-2zm0 4h2v6h-2z',
    },
    {
      id: 'referrals',
      label: 'Рефералы',
      icon: 'M12 4a8 8 0 0 0-8 8c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm2-6h-2v2h-2v-2H8v-2h2V8h2v2h2v2z',
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4 bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Личный кабинет</h2>
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full p-3 rounded-lg transition duration-300 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24">
                      <path d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={logout}
                  className="flex items-center w-full p-3 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-300 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2 fill-current text-gray-300" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M9.707 2.408C9 3.035 9 4.182 9 6.475v11.048c0 2.293 0 3.44.707 4.067.707.627 1.788.439 3.95.062l2.33-.406c2.394-.418 3.591-.627 4.302-1.505.711-.879.711-2.149.711-4.69V8.947c0-2.54 0-3.81-.71-4.689-.712-.878-1.91-1.087-4.304-1.504l-2.328-.407c-2.162-.377-3.243-.565-3.95.062l-.001-.001ZM12 10.168c.414 0 .75.351.75.784v2.094c0 .433-.336.784-.75.784s-.75-.351-.75-.784v-2.094c0-.433.336-.784.75-.784Z" />
                    <path d="M7.547 4.5c-2.058.003-3.131.048-3.815.732C3 5.964 3 7.142 3 9.5v5c0 2.357 0 3.535.732 4.268.684.683 1.757.729 3.815.732-.047-.624-.047-1.344-.047-2.123V6.623c0-.78 0-1.5.047-2.123Z" />
                  </svg>
                  Выйти
                </button>
              </li>
            </ul>
            {userRole === 'ADMIN' && (
              <button
                onClick={() => alert('Функция админ-панели пока не реализована')}
                className="mt-6 w-full p-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
              >
                Админ-панель
              </button>
            )}
            <button
              onClick={() => alert('Функция удаления аккаунта пока не реализована')}
              className="mt-2 w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105"
            >
              Удалить аккаунт
            </button>
          </div>
          <div className="w-full lg:w-3/4">
            {activeTab === 'personal-data' && <PersonalDataTab setError={setError} />}
            {activeTab === 'shipments' && (
              <ShipmentsTab
                currentOrders={currentOrders}
                handleViewOrderDetails={handleViewOrderDetails}
                handlePay={handlePay}
              />
            )}
            {activeTab === 'batch-cargos' && (
              <BatchCargosTab
                userEmail={user?.email}
                handleViewOrderDetails={handleViewOrderDetails}
              />
            )}
            {activeTab === 'history' && (
              <OrderHistoryTab
                orderHistory={orderHistory}
                handleViewOrderDetails={handleViewOrderDetails}
              />
            )}
            {activeTab === 'payment-methods' && <PaymentMethodsTab />}
            {activeTab === 'loyalty' && <LoyaltyTab />}
            {activeTab === 'referrals' && <ReferralTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;