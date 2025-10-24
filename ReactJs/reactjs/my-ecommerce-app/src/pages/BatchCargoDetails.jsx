import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../components/AuthProvider';
import Tilt from 'react-parallax-tilt';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-cyan-400 text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-cyan-500 mx-auto mb-4" />
          Загрузка...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-300 text-2xl bg-red-500/30 p-6 rounded-lg border border-red-500/50 shadow-lg"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  if (!batchCargo || batchCargo.orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-cyan-400 text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          Нет заказов для этого груза
        </motion.div>
      </div>
    );
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'UNFINISHED':
        return { text: 'В процессе', color: 'text-yellow-300' };
      case 'FINISHED':
        return { text: 'Завершён', color: 'text-emerald-300' };
      case 'ARRIVED_IN_MINSK':
        return { text: 'Груз в Минске', color: 'text-blue-300' };
      case 'COMPLETED':
        return { text: 'Груз доставлен', color: 'text-green-300' };
      default:
        return { text: status, color: 'text-cyan-400' };
    }
  };

  const statusDisplay = getStatusDisplay(batchCargo.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight">
            Груз #{batchCargo.id} ({statusDisplay.text})
          </h2>
          <p className="text-lg text-gray-300 mt-2">Просмотрите информацию о вашем грузе</p>
        </motion.header>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-center text-base font-medium shadow-md"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 mb-12 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold text-cyan-400 mb-4">Информация о грузе</h3>
          <p className="text-gray-300 mb-4">
            Дата создания: {new Date(batchCargo.creationDate).toLocaleDateString()}
          </p>
          <p className="text-gray-300 mb-4">
            Дата закупки: {new Date(batchCargo.purchaseDate).toLocaleDateString()}
          </p>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 mb-12 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold text-cyan-400 mb-6">Заказы в грузе</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {batchCargo.orders.map((order, index) => (
              <Tilt key={order.id} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 p-4 transition-all duration-300 cursor-pointer text-gray-300"
                  onClick={() => navigate(`/batch-cargos/${batchId}/order/${order.id}`)}
                >
                  <h3 className="text-xl font-semibold text-white">Заказ #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-300 mt-2">
                    Статус: <span className={statusDisplay.color}>{order.status}</span>
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    Общая стоимость: {order.totalClientPrice} ₽
                  </p>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Назад к профилю
          </motion.button>
        </motion.section>
      </div>
    </div>
  );
};

export default BatchCargoDetails;