import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../components/AuthProvider';
import api from '../api/axiosInstance';

const BatchCargoDetails = () => {
  const { user } = useAuth();
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batchCargo, setBatchCargo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchCargo = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/batch-cargos/usr/${batchId}`);
        if (response?.data) {
          // Sanitize data to ensure orders and items are arrays
          const sanitizedBatchCargo = {
            ...response.data,
            orders: Array.isArray(response.data.orders)
              ? response.data.orders.map((order) => ({
                  ...order,
                  items: Array.isArray(order.items) ? order.items : [],
                }))
              : [],
          };
          setBatchCargo(sanitizedBatchCargo);
        } else {
          setError('Данные груза не найдены');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching batch cargo:', error);
        let errorMessage = 'Ошибка загрузки груза';
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Не удалось подключиться к серверу.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте токен.';
        } else {
          errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
        }
        setError(errorMessage);
        setLoading(false);
      }
    };
    if (user?.email) {
      fetchBatchCargo();
    }
  }, [batchId, user?.email]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[var(--accent-color)]" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center text-red-500 p-8"
      >
        {error}
      </motion.div>
    );
  }

  if (!batchCargo || batchCargo.orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center text-gray-400 p-8"
      >
        Нет заказов для этого груза
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-2xl p-8 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--accent-color)]">
            Груз #{batchCargo.id} ({batchCargo.status === 'UNFINISHED' ? 'В процессе' : 'Завершён'})
          </h2>
        </div>
        <p className="text-gray-300 mb-4">
          Дата создания: {new Date(batchCargo.creationDate).toLocaleDateString()}
        </p>
        <p className="text-gray-300 mb-8">
          Дата закупки: {new Date(batchCargo.purchaseDate).toLocaleDateString()}
        </p>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-red-500 rounded-lg text-red-500 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        {batchCargo.orders.map((order) => (
          <div key={order.id} className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Заказ #{order.orderNumber}
            </h3>
            <p className="text-gray-300 mb-4">Статус: {order.status}</p>
            <p className="text-gray-300 mb-6">
              Общая стоимость: {order.totalClientPrice} ₽
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl p-3 shadow-md border border-gray-700/50"
                >
                  <div className="flex flex-col gap-2">
                    <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden">
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/150'}
                        alt={item.name || 'Товар'}
                        className="w-full h-full object-cover border border-[var(--accent-color)] shadow-sm"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--accent-color)]">
                        {item.productName || 'Без названия'}
                      </h4>
                      <p className="text-base text-gray-400 mt-1">
                        Цена: ₽{(item.priceAtTime || 0).toFixed(2)} x {item.quantity || 1}
                      </p>
                      <p className="text-base text-gray-400">
                        Статус закупки:{' '}
                        <span
                          className={
                            item.purchaseStatus === 'PURCHASED'
                              ? 'text-green-500'
                              : item.purchaseStatus === 'NOT_PURCHASED'
                              ? 'text-red-500'
                              : 'text-yellow-500'
                          }
                        >
                          {item.purchaseStatus === 'PURCHASED'
                            ? 'Выкуплен'
                            : item.purchaseStatus === 'NOT_PURCHASED'
                            ? 'Не выкуплен'
                            : 'Ожидает'}
                        </span>
                      </p>
                      {item.purchaseStatus === 'NOT_PURCHASED' && item.purchaseRefusalReason && (
                        <p className="text-base text-red-500">
                          Причина отказа: {item.purchaseRefusalReason}
                        </p>
                      )}
                      <p className="text-base text-gray-400">
                        ID товара: {item.id || 'Не определён'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile')}
          className="mt-8 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 flex items-center"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Назад к профилю
        </motion.button>
      </div>
    </div>
  );
};

export default BatchCargoDetails;