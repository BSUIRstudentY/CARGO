import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const getUserUsername = () => localStorage.getItem("userEmail"); // Если username != email, храните username в localStorage

  const mapCategoryToType = (category) => {
    if (category === 'ORDER_UPDATE') return 'order';
    if (category === 'NEW_MESSAGE') return 'support';
    if (category === 'PROMOTION') return 'promotion';
    return 'promotion';
  };

  const notificationStyles = {
    order: { icon: '📦', color: 'bg-blue-600' },
    support: { icon: '🛠️', color: 'bg-green-600' },
    promotion: { icon: '🎉', color: 'bg-yellow-600' },
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
        // Изменено: Подписка на кастомный топик для персональных уведомлений
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
    <section className="max-w-7xl mx-auto px-4 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="section-frame overflow-hidden">
        <div
          className="wrapper bg-soft-primary mask-bg"
          style={{
            backgroundImage: "url('https://via.placeholder.com/1920x600?text=Notifications+Background')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: '50% 50%',
          }}
        >
          <div className="container py-12 py-md-16 text-center">
            <div className="row">
              <div className="col-md-7 col-lg-6 col-xl-5 mx-auto">
                <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-white">Уведомления</h1>
                <div className="lead px-4 sm:px-10 mb-4 text-white text-lg sm:text-xl">
                  <p>Будьте в курсе всех событий: заказы, поддержка, акции</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <div className="container py-6 py-md-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-300 mb-2">Фильтр по типу</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
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
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
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
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={markAllAsRead}
            className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300"
          >
            Отметить все как прочитанные
          </button>
          <button
            onClick={clearReadNotifications}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Очистить прочитанные
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-md">
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          {notifications.length === 0 && !loading && !error && (
            <div className="text-gray-300 text-center">Нет уведомлений</div>
          )}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-700 ${
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
                    <h4 className="text-lg font-semibold">{notification.title}</h4>
                    <p className="text-gray-300">{notification.message}</p>
                    <p className="text-gray-400 text-sm">
                      {/*{notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ru }) : 'Дата не указана'}*/}
                    </p>
                  </div>
                </div>
                {!notification.isGlobal && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReadStatus(notification.id, notification.isRead);
                    }}
                    className="text-gray-300 hover:text-[var(--accent-color)]"
                  >
                    {notification.isRead ? 'Отметить непрочитанным' : 'Отметить прочитанным'}
                  </button>
                )}
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300"
              >
                {loading ? 'Загрузка...' : 'Загрузить еще'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Notifications;