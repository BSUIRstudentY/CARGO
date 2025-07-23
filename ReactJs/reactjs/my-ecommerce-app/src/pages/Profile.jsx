import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import api from '../api/axiosInstance';

function Profile() {
  const { user, logout } = useAuth();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userRole, setUserRole] = useState('USER');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const role = extractRoleFromToken(token);
      setUserRole(role);
    }

    const fetchOrders = async () => {
      try {
        const ordersResponse = await api.get('/orders');
        setCurrentOrders(ordersResponse.data);
        const historyResponse = await api.get('/order-history');
        setOrderHistory(historyResponse.data);
      } catch (error) {
        setError('Ошибка загрузки заказов: ' + (error.response?.data?.message || error.message));
        console.error('Error fetching orders:', error);
      }
    };
    if (user.email) fetchOrders();
  }, [user.email]);

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

  const handleViewOrderDetails = (order) => {
    console.log('Selected order data:', order);
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

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

  const pendingOrders = currentOrders.filter((order) => order.status === 'PENDING');
  const verifiedOrders = currentOrders.filter((order) => order.status === 'VERIFIED');

  return (
    <section id="profile" className="mb-12 p-4 sm:p-6">
      <div className="container mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--accent-color)]">Профиль</h2>
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        <div className="max-w-md mx-auto mt-6 bg-gray-800 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-[var(--accent-color)] rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
          </div>
          <p className="text-center text-lg mb-2"><strong>Имя:</strong> {user.username || 'Гость'}</p>
          <p className="text-center text-lg mb-4"><strong>Email:</strong> {user.email || 'user@example.com'}</p>
          {userRole === 'ADMIN' && (
            <button
              onClick={() => alert('Функция админ-панели пока не реализована')}
              className="w-full px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300 mb-2"
            >
              Админ-панель
            </button>
          )}
          <button
            onClick={() => alert('Функция редактирования профиля пока не реализована')}
            className="w-full px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300"
          >
            Редактировать профиль
          </button>
          <button
            onClick={logout}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-300"
          >
            Выйти
          </button>
        </div>
        <div className="mt-6">
          <h3 className="text-2xl font-bold text-center text-[var(--accent-color)]">Текущие заказы</h3>
          {pendingOrders.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold text-yellow-400 mt-4">Не подтверждённые заказы</h4>
              <table className="w-full mt-2 bg-gray-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 text-left">Дата</th>
                    <th className="p-2 text-left">Номер заказа</th>
                    <th className="p-2 text-left">Статус</th>
                    <th className="p-2 text-left">Сумма</th>
                    <th className="p-2 text-left">Детали</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-600">
                      <td className="p-2">{new Date(order.dateCreated).toLocaleDateString()}</td>
                      <td className="p-2">{order.orderNumber}</td>
                      <td className="p-2 text-yellow-400">Ожидает подтверждения</td>
                      <td className="p-2">¥{order.totalClientPrice.toFixed(2)}</td>
                      <td className="p-2">
                        <span
                          role="button"
                          className="text-[var(--accent-color)] hover:text-opacity-80 cursor-pointer"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          🔍
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {verifiedOrders.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold text-green-400 mt-4">Подтверждённые заказы</h4>
              <table className="w-full mt-2 bg-gray-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 text-left">Дата</th>
                    <th className="p-2 text-left">Номер заказа</th>
                    <th className="p-2 text-left">Статус</th>
                    <th className="p-2 text-left">Сумма</th>
                    <th className="p-2 text-left">Действия</th>
                    <th className="p-2 text-left">Детали</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-600">
                      <td className="p-2">{new Date(order.dateCreated).toLocaleDateString()}</td>
                      <td className="p-2">{order.orderNumber}</td>
                      <td className="p-2 text-green-400">Подтверждён</td>
                      <td className="p-2">¥{order.totalClientPrice.toFixed(2)}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handlePay(order.id)}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          disabled={order.status === 'PAID'}
                        >
                          {order.status === 'PAID' ? 'Оплачено' : 'Оплатить'}
                        </button>
                      </td>
                      <td className="p-2">
                        <span
                          role="button"
                          className="text-[var(--accent-color)] hover:text-opacity-80 cursor-pointer"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          🔍
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pendingOrders.length === 0 && verifiedOrders.length === 0 && (
            <p className="text-center mt-4 text-white">У вас пока нет текущих заказов.</p>
          )}
        </div>
        <div className="mt-6">
          <h3 className="text-2xl font-bold text-center text-[var(--accent-color)]">История заказов</h3>
          {orderHistory.length > 0 ? (
            <table className="w-full mt-4 bg-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-2 text-left">Дата</th>
                  <th className="p-2 text-left">Номер заказа</th>
                  <th className="p-2 text-left">Статус</th>
                  <th className="p-2 text-left">Сумма</th>
                  <th className="p-2 text-left">Детали</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((order) => (
                  <tr key={order.id} className="border-t border-gray-600">
                    <td className="p-2">{new Date(order.dateCreated).toLocaleDateString()}</td>
                    <td className="p-2">{order.orderNumber}</td>
                    <td className="p-2">{order.status}</td>
                    <td className="p-2">¥{order.totalClientPrice.toFixed(2)}</td>
                    <td className="p-2">
                      <span
                        role="button"
                        className="text-[var(--accent-color)] hover:text-opacity-80 cursor-pointer"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        🔍
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center mt-4 text-white">История заказов пуста.</p>
          )}
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-md w-full">
              <h4 className="text-xl font-bold mb-4">Детали заказа #{selectedOrder.orderNumber}</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <ul className="list-disc pl-5">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index}>
                      {item.productName || 'Без названия'} (x{item.quantity}, ¥{item.priceAtTime.toFixed(2)})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Нет товаров в заказе.</p>
              )}
              <div className="mt-4 text-right">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-80 transition duration-300"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Profile;