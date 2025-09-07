
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';

const OrderProcessing = () => {
  const { batchId, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('ru'); // Поддержка русского и китайского

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/${orderId}`)
      .then((response) => {
        if (response?.data) {
          const hasMissingIds = response.data.items.some(item => !item.id);
          if (hasMissingIds) {
            setError(language === 'ru' ? 'Некоторые товары не имеют ID. Проверьте данные заказа.' : '部分商品缺少ID。请检查订单数据。');
          } else {
            setOrder(response.data);
          }
        } else {
          setError(language === 'ru' ? 'Данные заказа не найдены' : '未找到订单数据');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching order:', error);
        let errorMessage = language === 'ru' ? 'Ошибка загрузки заказа' : '加载订单失败';
        if (error.code === 'ERR_NETWORK') {
          errorMessage = language === 'ru' ? 'Не удалось подключиться к серверу.' : '无法连接到服务器。';
        } else if (error.response?.status === 403) {
          errorMessage = language === 'ru' ? 'Доступ запрещён (403). Проверьте токен.' : '访问被拒绝 (403)。请检查授权令牌。';
        } else {
          errorMessage = error.response?.data?.message || error.message || (language === 'ru' ? 'Неизвестная ошибка' : '未知错误');
        }
        setError(errorMessage);
        setLoading(false);
      });
  }, [orderId, language]);

  const handleMarkItem = async (itemId, status) => {
    console.log('Attempting to mark item:', { itemId, status });
    if (!itemId) {
      setError(language === 'ru' ? 'ID товара не определён.' : '商品ID未定义。');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/batch-cargos/items/${itemId}`, { status });
      console.log('Item status updated successfully:', { itemId, status });
      const response = await api.get(`/orders/${orderId}`);
      if (response?.data) {
        setOrder(response.data);
      } else {
        setError(language === 'ru' ? 'Не удалось обновить данные заказа' : '无法更新订单数据');
      }
    } catch (error) {
      console.error('Error marking item:', error);
      let errorMessage = language === 'ru' ? 'Ошибка обновления статуса товара' : '更新商品状态失败';
      if (error.response?.status === 403) {
        errorMessage = language === 'ru' ? 'Доступ запрещён (403). Проверьте токен.' : '访问被拒绝 (403)。请检查授权令牌。';
      } else {
        errorMessage = error.response?.data?.message || error.message || (language === 'ru' ? 'Неизвестная ошибка' : '未知错误');
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center text-gray-400 p-8"
      >
        {language === 'ru' ? 'Заказ не найден' : '未找到订单'}
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-2xl p-8 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative">
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold text-[var(--accent-color)]">
              {language === 'ru' ? `Обработка заказа #${order.orderNumber}` : `处理订单 #${order.orderNumber}`}
            </h2>
          </div>
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

        {/* Order Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
          {order.items.map((item, index) => (
            <motion.div
              key={item.id || `item-${index}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-xl border border-gray-700/50"
            >
              <div className="flex flex-col gap-4">
                {/* Item Image */}
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/150'}
                  alt={item.productName || 'Product'}
                  className="w-full h-48 rounded-lg border-4 border-[var(--accent-color)] shadow-lg object-cover"
                />
                {/* Item Details */}
                <div>
                  <h3 className="text-xl font-semibold text-[var(--accent-color)]">
                    {item.productName || (language === 'ru' ? 'Без названия' : '无名称')}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">
                    {language === 'ru' ? 'Цена: ' : '价格: '} ¥{(item.priceAtTime || 0).toFixed(2)} x {item.quantity || 1}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === 'ru' ? 'Статус: ' : '状态: '}
                    {item.purchaseStatus || (language === 'ru' ? 'Не определён' : '未定义')}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === 'ru' ? 'ID товара: ' : '商品ID: '} {item.id || (language === 'ru' ? 'Не определён' : '未定义')}
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMarkItem(item.id, 'PURCHASED')}
                    className={`px-4 py-2 text-white rounded-lg flex items-center justify-center transition duration-300 ${
                      !item.id || (item.purchaseStatus && item.purchaseStatus !== 'PENDING')
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    disabled={!item.id || (item.purchaseStatus && item.purchaseStatus !== 'PENDING')}
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    {language === 'ru' ? 'Выкуплен' : '已购买'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMarkItem(item.id, 'NOT_PURCHASED')}
                    className={`px-4 py-2 text-white rounded-lg flex items-center justify-center transition duration-300 ${
                      !item.id || (item.purchaseStatus && item.purchaseStatus !== 'PENDING')
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    disabled={!item.id || (item.purchaseStatus && item.purchaseStatus !== 'PENDING')}
                  >
                    <XMarkIcon className="w-5 h-5 mr-2" />
                    {language === 'ru' ? 'Не выкуплен' : '未购买'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/admin/upcoming-purchases/${batchId}`)}
          className="mt-8 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 flex items-center"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          {language === 'ru' ? 'Назад к сборному грузу' : '返回批量货物'}
        </motion.button>
      </div>
    </div>
  );
};

export default OrderProcessing;