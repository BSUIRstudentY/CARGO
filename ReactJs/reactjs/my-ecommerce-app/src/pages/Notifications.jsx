import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import api from '../api/axiosInstance';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { createStompClient } from '../api/stompClient';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stompClient, setStompClient] = useState(null);

  const getUserUsername = () => localStorage.getItem("userEmail");

  const mapCategoryToType = (category) => {
    if (category === 'ORDER_UPDATE') return 'order';
    if (category === 'NEW_MESSAGE') return 'support';
    if (category === 'PROMOTION') return 'promotion';
    return 'promotion';
  };

  const notificationStyles = {
    order: { icon: '📦', color: 'bg-cyan-500' },
    support: { icon: '🛠️', color: 'bg-emerald-500' },
    promotion: { icon: '🎉', color: 'bg-yellow-300' },
  };

  const getTitleFromCategory = (category) => {
    if (category === 'ORDER_UPDATE') return 'Обновление заказа';
    if (category === 'NEW_MESSAGE') return 'Новое сообщение в поддержке';
    if (category === 'PROMOTION') return 'Акция';
    return 'Уведомление';
  };

  const mapToClientFormat = (notif) => ({
    ...notif,
    type: mapCategoryToType(notif.category),
    title: getTitleFromCategory(notif.category),
    createdAt: notif.timestamp,
    isRead: notif.read,
    isGlobal: notif.user === null,
    orderId: notif.category === 'ORDER_UPDATE' ? notif.relatedId : undefined,
    ticketId: notif.category === 'NEW_MESSAGE' ? notif.relatedId : undefined,
  });

  const fetchNotifications = async (pageNum) => {
    setLoading(true);
    try {
      const response = await api.get('/notifications', {
        params: { page: pageNum, size: 10, filter, status: statusFilter, search: searchQuery },
      });
      console.log('Fetched notifications response:', response.data);
      const newNotifications = (response.data.content || []).map(mapToClientFormat);
      setNotifications((prev) => (pageNum === 0 ? newNotifications : [...prev, ...newNotifications]));
      setHasMore(!response.data.last);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить уведомления. Попробуйте позже.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchNotifications(0);
  }, [filter, statusFilter, searchQuery]);

  useEffect(() => {
    const client = createStompClient();
    client.brokerURL = 'ws://localhost:8080/ws-notifications';
    client.onConnect = () => {
      console.log('Connected to WebSocket for notifications!');
      const username = getUserUsername();
      if (username) {
        client.subscribe('/topic/personal/' + username, (msg) => {
          console.log('Received personal notification:', msg.body);
          const notif = JSON.parse(msg.body);
          const mappedNotif = mapToClientFormat(notif);
          setNotifications((prev) => [mappedNotif, ...prev]);
        });
      }
      client.subscribe('/topic/global-notifications', (msg) => {
        console.log('Received global notification:', msg.body);
        const notif = JSON.parse(msg.body);
        const mappedNotif = mapToClientFormat(notif);
        setNotifications((prev) => [mappedNotif, ...prev]);
      });
    };
    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
    client.activate();
    setStompClient(client);
    return () => {
      if (client) client.deactivate();
    };
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const toggleReadStatus = async (id, isRead) => {
    try {
      await api.put(`/notifications/${id}`, { isRead: !isRead });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: !isRead } : notif
        )
      );
    } catch (err) {
      setError('Не удалось обновить статус уведомления.');
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((notif) => (notif.isGlobal ? notif : { ...notif, isRead: true }))
      );
    } catch (err) {
      setError('Не удалось отметить все уведомления как прочитанные.');
      console.error(err);
    }
  };

  const clearReadNotifications = async () => {
    try {
      await api.delete('/notifications/clear-read');
      setNotifications((prev) => prev.filter((notif) => notif.isGlobal || !notif.isRead));
    } catch (err) {
      setError('Не удалось удалить прочитанные уведомления.');
      console.error(err);
    }
  };

  const sendOrderStatusNotification = async (orderId, newStatus) => {
    try {
      const email = getUserUsername();
      if (!email) return console.error("Email пользователя не найден в localStorage");
      await api.post('/notifications/order-status', { email, orderId, newStatus });
      console.log("Уведомление об изменении заказа отправлено");
    } catch (err) {
      console.error("Ошибка при отправке уведомления об изменении заказа:", err);
    }
  };

  const sendSupportMessageNotification = async (ticketId, senderName) => {
    try {
      const email = getUserUsername();
      if (!email) return console.error("Email пользователя не найден в localStorage");
      await api.post('/notifications/support-message', { email, ticketId, senderName });
      console.log("Уведомление о новом сообщении в поддержке отправлено");
    } catch (err) {
      console.error("Ошибка при отправке уведомления о сообщении поддержки:", err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'order') {
      navigate(`/order-details/${notification.orderId}`);
    } else if (notification.type === 'support') {
      navigate(`/ticket/${notification.ticketId}/chat`);
    } else if (notification.type === 'promotion') {
      navigate('/catalog');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Все' },
    { value: 'order', label: 'Заказы' },
    { value: 'support', label: 'Поддержка' },
    { value: 'promotion', label: 'Акции' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Все' },
    { value: 'read', label: 'Прочитанные' },
    { value: 'unread', label: 'Непрочитанные' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight">
            Уведомления
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            Будьте в курсе всех событий: заказы, поддержка, акции
          </p>
        </motion.header>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl shadow-lg border border-cyan-500/30 p-6 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-gray-300 mb-2">Фильтр по типу</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Фильтр по статусу</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Поиск</label>
              <input
                type="text"
                placeholder="Поиск по уведомлениям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-sm"
            >
              Отметить все как прочитанные
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearReadNotifications}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300 shadow-sm"
            >
              Очистить прочитанные
            </motion.button>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-300 text-center mb-4 bg-red-500/30 p-4 rounded-lg border border-red-500/50"
                >
                  {error}
                </motion.div>
              )}
              {notifications.length === 0 && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-gray-300 text-center p-4"
                >
                  Нет уведомлений
                </motion.div>
              )}
              {notifications.map((notification, index) => (
                <Tilt key={notification.id} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                    className={`p-4 rounded-lg flex items-center justify-between transition-all duration-300 bg-gradient-to-br from-gray-800/90 to-gray-700/90 border border-cyan-500/30 hover:shadow-cyan-500/40 ${
                      notification.isRead ? 'opacity-70' : 'opacity-100'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center">
                      <span
                        className={`${notificationStyles[notification.type]?.color || 'bg-gray-600'} text-white rounded-full p-3 mr-4`}
                      >
                        {notificationStyles[notification.type]?.icon || '🔔'}
                      </span>
                      <div>
                        <h4 className="text-lg font-semibold text-cyan-400">{notification.title}</h4>
                        <p className="text-gray-300">{notification.message}</p>
                        <p className="text-gray-300 text-sm">
                          {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ru }) : 'Дата не указана'}
                        </p>
                      </div>
                    </div>
                    {!notification.isGlobal && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReadStatus(notification.id, notification.isRead);
                        }}
                        className="text-gray-300 hover:text-cyan-400"
                      >
                        {notification.isRead ? 'Отметить непрочитанным' : 'Отметить прочитанным'}
                      </motion.button>
                    )}
                  </motion.div>
                </Tilt>
              ))}
            </AnimatePresence>
          </div>
          {hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMore}
                disabled={loading}
                className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-sm"
              >
                {loading ? 'Загрузка...' : 'Загрузить еще'}
              </motion.button>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default Notifications;