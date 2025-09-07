
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';

const BatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('ru'); // Поддержка русского и китайского

  useEffect(() => {
    setLoading(true);
    api.get(`/batch-cargos/${id}`)
      .then((response) => {
        setBatch(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(language === 'ru' ? 'Ошибка загрузки сборного груза' : '加载批量货物失败');
        setLoading(false);
        console.error('Error fetching batch:', error);
      });
  }, [id, language]);

  const handleProcessOrder = (orderId) => {
    navigate(`/admin/upcoming-purchases/${id}/order/${orderId}`);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'zh' : 'ru');
  };

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

  if (!batch) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center text-gray-400 p-8"
      >
        {language === 'ru' ? 'Сборный груз не найден' : '未找到批量货物'}
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-2xl p-8 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative">
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--accent-color)]">
            {language === 'ru'
              ? `Сборный груз #${batch.id} - Дата выкупа: ${new Date(batch.purchaseDate).toLocaleDateString('ru-RU')}`
              : `批量货物 #${batch.id} - 购买日期: ${new Date(batch.purchaseDate).toLocaleDateString('zh-CN')}`}
          </h2>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105"
          >
            {language === 'ru' ? '中文' : 'Русский'}
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {batch.orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-xl border border-gray-700/50 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleProcessOrder(order.id)}
            >
              <h3 className="text-xl font-semibold text-[var(--accent-color)]">
                {language === 'ru' ? `Заказ #${order.orderNumber}` : `订单 #${order.orderNumber}`}
              </h3>
              <p className="text-sm text-gray-400">
                {language === 'ru' ? 'Статус: ' : '状态: '} {order.status}
              </p>
              <p className="text-sm text-gray-400">
                {language === 'ru' ? 'Сумма: ' : '金额: '} ¥{order.totalClientPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">
                {language === 'ru' ? 'Клиент: ' : '客户: '} {order.userEmail || (language === 'ru' ? 'Не указан' : '未指定')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;