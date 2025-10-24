import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';
import Tilt from 'react-parallax-tilt';

const BatchCargoProcessing = () => {
  const { batchId, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('ru');

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

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'zh' : 'ru');
  };

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
          {language === 'ru' ? 'Загрузка...' : '加载中...'}
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-cyan-400 text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          {language === 'ru' ? 'Заказ не найден' : '未找到订单'}
        </motion.div>
      </div>
    );
  }

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
            {language === 'ru' ? `Обработка заказа #${order.orderNumber}` : `处理订单 #${order.orderNumber}`}
          </h2>
          <p className="text-lg text-gray-300 mt-2">
            {language === 'ru' ? 'Просмотрите информацию о вашем заказе' : '查看您的订单信息'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="mt-4 px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold shadow-sm"
          >
            {language === 'ru' ? '中文' : 'Русский'}
          </motion.button>
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
          <h3 className="text-2xl font-bold text-cyan-400 mb-6">
            {language === 'ru' ? 'Товары в заказе' : '订单中的商品'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {order.items.map((item, index) => (
              <Tilt key={item.id || `item-${index}`} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 p-4 transition-all duration-300 text-gray-300"
                >
                  {order.totalClientPrice > 0 ? (
                    <>
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/150'}
                        alt={item.productName || (language === 'ru' ? 'Товар' : '商品')}
                        className="w-full h-48 rounded-lg border border-cyan-500/30 shadow-lg object-cover transform hover:scale-105 transition duration-300"
                      />
                      <div className="mt-4">
                        <h3 className="text-xl font-semibold text-cyan-400">
                          {item.productName || (language === 'ru' ? 'Без названия' : '无名称')}
                        </h3>
                        <p className="text-sm text-gray-300 mt-2">
                          <span className="font-medium">{language === 'ru' ? 'Товар: ' : '商品: '}</span>
                          {item.productName || (language === 'ru' ? 'Неизвестно' : '未知')}
                        </p>
                        {item.trackingNumber && (
                          <p className="text-sm text-gray-300">
                            <span className="font-medium">{language === 'ru' ? 'Трек-номер: ' : '追踪号码: '}</span>
                            {item.trackingNumber}
                          </p>
                        )}
                        <p className="text-sm text-gray-300">
                          <span className="font-medium">{language === 'ru' ? 'Цена: ' : '价格: '}</span>
                          ¥{(item.priceAtTime || 0).toFixed(2)} x {item.quantity || 1}
                        </p>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium">{language === 'ru' ? 'Статус: ' : '状态: '}</span>
                          <span
                            className={
                              item.purchaseStatus === 'PURCHASED'
                                ? 'text-emerald-300'
                                : item.purchaseStatus === 'NOT_PURCHASED'
                                ? 'text-red-300'
                                : 'text-yellow-300'
                            }
                          >
                            {item.purchaseStatus === 'PURCHASED'
                              ? (language === 'ru' ? 'Выкуплен' : '已购买')
                              : item.purchaseStatus === 'NOT_PURCHASED'
                              ? (language === 'ru' ? 'Не выкуплен' : '未购买')
                              : (language === 'ru' ? 'Ожидает' : '待处理')}
                          </span>
                        </p>
                        {item.purchaseStatus === 'NOT_PURCHASED' && item.purchaseRefusalReason && (
                          <p className="text-sm text-red-300">
                            <span className="font-medium">{language === 'ru' ? 'Причина отказа: ' : '拒绝原因: '}</span>
                            {item.purchaseRefusalReason}
                          </p>
                        )}
                        <p className="text-sm text-gray-300">
                          <span className="font-medium">{language === 'ru' ? 'ID товара: ' : '商品ID: '}</span>
                          {item.id || (language === 'ru' ? 'Не определён' : '未定义')}
                        </p>
                        <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
                          <motion.div
                            className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      {item.trackingNumber && (
                        <p className="text-sm text-gray-300">
                          <span className="font-medium">{language === 'ru' ? 'Трек-номер: ' : '追踪号码: '}</span>
                          {item.trackingNumber}
                        </p>
                      )}
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">{language === 'ru' ? 'Статус: ' : '状态: '}</span>
                        <span
                          className={
                            item.purchaseStatus === 'PURCHASED'
                              ? 'text-emerald-300'
                              : item.purchaseStatus === 'NOT_PURCHASED'
                              ? 'text-red-300'
                              : 'text-yellow-300'
                          }
                        >
                          {item.purchaseStatus === 'PURCHASED'
                            ? (language === 'ru' ? 'Выкуплен' : '已购买')
                            : item.purchaseStatus === 'NOT_PURCHASED'
                            ? (language === 'ru' ? 'Не выкуплен' : '未购买')
                            : (language === 'ru' ? 'Ожидает' : '待处理')}
                        </span>
                      </p>
                      {item.purchaseStatus === 'NOT_PURCHASED' && item.purchaseRefusalReason && (
                        <p className="text-sm text-red-300">
                          <span className="font-medium">{language === 'ru' ? 'Причина отказа: ' : '拒绝原因: '}</span>
                          {item.purchaseRefusalReason}
                        </p>
                      )}
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
                        <motion.div
                          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </Tilt>
            ))}
          </div>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/batch-cargo-details/${batchId}`)}
            className="px-6 py-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {language === 'ru' ? 'Назад к сборному грузу' : '返回批量货物'}
          </motion.button>
        </motion.section>
      </div>
    </div>
  );
};

export default BatchCargoProcessing;