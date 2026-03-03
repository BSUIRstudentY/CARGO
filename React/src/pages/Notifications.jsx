import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { createStompClient } from '../api/stompClient';
import { StyledSelect } from '../components/ui/StyledSelect';

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
    order: { icon: '📦', accentClasses: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', titleClass: 'text-emerald-400' },
    support: { icon: '🛠️', accentClasses: 'bg-[var(--ev-gold)]/15 border-[var(--ev-gold)]/30 text-[var(--ev-gold)]', titleClass: 'text-[var(--ev-gold)]' },
    promotion: { icon: '🎉', accentClasses: 'bg-purple-500/15 border-purple-500/30 text-purple-300', titleClass: 'text-purple-300' },
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

  // Helper function to safely format date
  const safeFormatDate = (timestamp) => {
    if (!timestamp) return 'Дата не указана';
    
    let date;
    
    // Если timestamp - это массив (LocalDateTime сериализованный как массив [год, месяц, день, час, минута, секунда, наносекунды])
    if (Array.isArray(timestamp)) {
      if (timestamp.length >= 6) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = timestamp;
        date = new Date(year, month - 1, day, hour, minute, second);
        
        if (isNaN(date.getTime())) {
          return 'Неверная дата';
        }
      } else {
        return 'Неверная дата';
      }
    }
    // Если timestamp - это строка или число
    else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      // Если это число (Unix timestamp в миллисекундах или секундах)
      if (typeof timestamp === 'number') {
        // Если число меньше определенного порога, считаем это секундами
        const msTimestamp = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
        date = new Date(msTimestamp);
      } else {
        // Если это строка, пробуем создать Date
        const cleaned = timestamp.trim().replace(/['"]/g, '');
        date = new Date(cleaned);
      }
      
      // Проверка на валидность даты
      if (isNaN(date.getTime())) {
        return 'Неверная дата';
      }
    } 
    // Если уже Date объект
    else if (timestamp instanceof Date) {
      date = timestamp;
      if (isNaN(date.getTime())) {
        return 'Неверная дата';
      }
    } 
    // Если объект с полями даты (редкий случай)
    else if (typeof timestamp === 'object' && timestamp !== null) {
      // Пробуем найти стандартные поля
      if (timestamp.year && timestamp.month !== undefined) {
        date = new Date(
          timestamp.year,
          timestamp.month - 1,
          timestamp.day || 1,
          timestamp.hour || 0,
          timestamp.minute || 0,
          timestamp.second || 0
        );
      } else {
        return 'Неверная дата';
      }
      
      if (isNaN(date.getTime())) {
        return 'Неверная дата';
      }
    } else {
      return 'Неверная дата';
    }
    
    // Проверка на разумность даты (не слишком далеко в будущем и не слишком далеко в прошлом)
    const now = new Date();
    const yearDiff = Math.abs(now.getFullYear() - date.getFullYear());
    if (yearDiff > 100) {
      return 'Неверная дата';
    }
    
    try {
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
    } catch (error) {
      console.error('Error formatting date:', error, 'timestamp:', timestamp);
      // Fallback на простое форматирование
      try {
        return date.toLocaleString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (fallbackError) {
        console.error('Error in fallback date formatting:', fallbackError);
        return 'Неверная дата';
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--ev-text)] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-[var(--ev-text)] tracking-tight">
            Уведомления
          </h1>
          <p className="text-sm sm:text-lg text-[var(--ev-text-muted)] mt-1.5 sm:mt-2">
            Будьте в курсе всех событий: заказы, поддержка, акции
          </p>
        </motion.header>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 p-4 sm:p-6 relative overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <StyledSelect
                label="Фильтр по типу"
                value={filter}
                onChange={setFilter}
                options={filterOptions}
                placeholder="Все"
                className="text-sm sm:text-base"
              />
            </div>
            <div>
              <StyledSelect
                label="Фильтр по статусу"
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Все"
                className="text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-[var(--ev-text-muted)] mb-1.5 sm:mb-2 text-xs sm:text-sm">Поиск</label>
              <input
                type="text"
                placeholder="Поиск по уведомлениям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-[var(--ev-gold)]/5 text-[var(--ev-text)] border border-[var(--ev-gold)]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/30 focus:border-[var(--ev-gold)]/50 transition duration-300 placeholder-[var(--ev-text-muted)]"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllAsRead}
              className="bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base hover:bg-[var(--ev-gold)]/25 transition duration-300"
            >
              Отметить все как прочитанные
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearReadNotifications}
              className="bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base hover:bg-[var(--ev-gold)]/25 transition duration-300"
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
                  className="text-red-300 text-center mb-4 bg-red-500/10 p-4 rounded-xl border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}
              {notifications.length === 0 && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-[var(--ev-text-muted)] text-center p-8"
                >
                  Нет уведомлений
                </motion.div>
              )}
              {notifications.map((notification, index) => {
                const style = notificationStyles[notification.type] || { icon: '🔔', accentClasses: 'bg-[var(--ev-gold)]/15 border-[var(--ev-gold)]/30 text-[var(--ev-gold)]', titleClass: 'text-[var(--ev-gold)]' };
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    className={`p-3 sm:p-4 rounded-xl flex items-center justify-between transition-all duration-300 bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 cursor-pointer ${
                      notification.isRead ? 'opacity-70' : 'opacity-100'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center">
                      <span
                        className={`rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-base sm:text-xl border ${style.accentClasses}`}
                      >
                        {style.icon}
                      </span>
                      <div>
                        <h4 className={`text-base sm:text-lg font-semibold ${style.titleClass}`}>{notification.title}</h4>
                        <p className="text-[var(--ev-text-muted)] text-xs sm:text-base">{notification.message}</p>
                        <p className="text-[var(--ev-text-muted)] text-xs">
                          {safeFormatDate(notification.createdAt)}
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
                        className="text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)] transition-colors text-sm"
                      >
                        {notification.isRead ? 'Отметить непрочитанным' : 'Отметить прочитанным'}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMore}
                disabled={loading}
                className="bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base hover:bg-[var(--ev-gold)]/25 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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