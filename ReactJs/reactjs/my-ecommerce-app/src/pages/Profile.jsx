import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import api from '../api/axiosInstance';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [editMode, setEditMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', phone: '', company: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
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
        const invoicesResponse = await api.get('/invoices');
        setInvoices(invoicesResponse.data);
        const ticketsResponse = await api.get('/support-tickets');
        setSupportTickets(ticketsResponse.data);
      } catch (error) {
        setError('Ошибка загрузки данных: ' + (error.response?.data?.message || error.message));
        console.error('Error fetching data:', error);
      }
    };
    if (user.email) {
      fetchData();
      setEditForm({ 
        username: user.username || '', 
        email: user.email || '', 
        phone: user.phone || '', 
        company: user.company || '' 
      });
      setNotificationsEnabled(user.notificationsEnabled || false);
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
  }, [user.email, user.username, user.phone, user.company, user.notificationsEnabled, user.twoFactorEnabled]);

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

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setEditForm({ 
        username: user.username || '', 
        email: user.email || '', 
        phone: user.phone || '', 
        company: user.company || '' 
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser({ 
        username: editForm.username, 
        email: editForm.email, 
        phone: editForm.phone, 
        company: editForm.company, 
        notificationsEnabled 
      });
      setEditMode(false);
      alert('Профиль успешно обновлён!');
    } catch (error) {
      setError('Ошибка обновления профиля: ' + (error.response?.data?.message || error.message));
      console.error('Error updating profile:', error);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Все поля обязательны');
      return;
    }
    try {
      await api.put('/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
      alert('Пароль успешно изменён!');
    } catch (error) {
      setPasswordError('Ошибка смены пароля: ' + (error.response?.data?.message || error.message));
      console.error('Error changing password:', error);
    }
  };

  const handleNotificationToggle = async () => {
    try {
      const newValue = !notificationsEnabled;
      await updateUser({ notificationsEnabled: newValue });
      setNotificationsEnabled(newValue);
      alert('Настройки уведомлений обновлены!');
    } catch (error) {
      setError('Ошибка обновления уведомлений: ' + (error.response?.data?.message || error.message));
      console.error('Error updating notifications:', error);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      const newValue = !twoFactorEnabled;
      await updateUser({ twoFactorEnabled: newValue });
      setTwoFactorEnabled(newValue);
      alert('Настройки двухфакторной аутентификации обновлены!');
    } catch (error) {
      setError('Ошибка обновления двухфакторной аутентификации: ' + (error.response?.data?.message || error.message));
      console.error('Error updating two-factor:', error);
    }
  };

  const handleCreateTicket = async () => {
    try {
      await api.post('/support-tickets', { subject: 'Новый запрос', message: 'Описание проблемы' });
      const ticketsResponse = await api.get('/support-tickets');
      setSupportTickets(ticketsResponse.data);
      alert('Запрос в поддержку создан!');
    } catch (error) {
      setError('Ошибка создания запроса: ' + (error.response?.data?.message || error.message));
      console.error('Error creating ticket:', error);
    }
  };

  const pendingOrders = currentOrders.filter((order) => order.status === 'PENDING');
  const verifiedOrders = currentOrders.filter((order) => order.status === 'VERIFIED');

  const tabs = [
    { id: 'personal-data', label: 'Личные данные', icon: 'M12.039 13.609c5.835.009 9.56 2.262 9.56 6.325 0 .464.148 1.936-.214 2.01-.182.036-1.073.052-1.688.056h-.26a87.22 87.22 0 0 1-3.065-.08 76.271 76.271 0 0 0-2.958-.08c-2.232-.003-6.137.17-8.067.07-1.438-.075-2.555.045-2.86-.361-.162-.216-.107-1.717-.106-2.106.006-4.43 5.278-5.841 9.658-5.834Zm5.414-6.285c-1.668 9.175-15.994 2.889-8.96-3.961a8.15 8.15 0 0 1 1.388-.908c3.112-1.637 8.2 1.414 7.572 4.87Z' },
    { id: 'shipments', label: 'Отправления', icon: 'M16.755 5.932h-1.99a2.56 2.56 0 0 0 .455-1.394 2.767 2.767 0 0 0-.822-2.054 2.812 2.812 0 0 0-2.07-.815 2.584 2.584 0 0 0-1.866.857 4.16 4.16 0 0 0-.46.631 4.165 4.165 0 0 0-.461-.631 2.565 2.565 0 0 0-1.866-.857 2.831 2.831 0 0 0-2.07.815 2.786 2.786 0 0 0-.823 2.054c.013.499.171.983.456 1.394h-1.99c-.408 0-1.004-.096-1.292.19-.287.285-.243.928-.243 1.332V9.89c0 .35-.143.907.081 1.179.224.272.962.242 1.309.313l-.162 4.597c0 .404.028.907.316 1.193.287.285.811.33 1.218.33h11.052c.407 0 .931-.045 1.22-.33.287-.286.315-.79.315-1.193l-.163-4.597c.347-.07 1.086-.041 1.31-.313.223-.272.081-.828.081-1.18V7.455c0-.404.044-1.047-.244-1.333-.288-.285-.884-.19-1.291-.19Zm-4.912-2.195a.736.736 0 0 1 .537-.241h.027a.976.976 0 0 1 .697.29.958.958 0 0 1 .274.7.726.726 0 0 1-.243.532c-.53.466-1.4.705-2.12.82.114-.712.355-1.576.828-2.1Zm-4.935.04a.986.986 0 0 1 .684-.281h.03a.741.741 0 0 1 .537.241c.47.525.711 1.389.825 2.102-.713-.115-1.592-.354-2.116-.82a.73.73 0 0 1-.244-.534.961.961 0 0 1 .284-.707Z' },
    { id: 'addresses', label: 'Адреса', icon: 'M9.816 19.537h-.01c-.52-.014-.88-.5-1.332-1.122l-.005-.006-.007-.009a12.104 12.104 0 0 0-.781-.983 14.068 14.068 0 0 1-1.628-2.275c-.196-.318-.416-.673-.696-1.107-.2-.312-.401-.639-.583-.926a7.908 7.908 0 0 1-1.608-2.759.236.236 0 0 1-.016-.026h.004a22.036 22.036 0 0 1-.216-.635l-.011-.016a5.816 5.816 0 0 1-.222-1.63 6.954 6.954 0 0 1 .975-4.037c.233-.515.58-.97 1.013-1.333l.006-.005c.083-.078.192-.174.322-.296a5.19 5.19 0 0 1 2.02-1.192c.098-.035.176-.067.243-.09l.066-.024c.254-.104.519-.178.79-.218.148-.027.345-.067.644-.13a9.136 9.136 0 0 1 2.03-.262c.285 0 .601.015.991.034a4.735 4.735 0 0 1 2.91.956c.114.07.22.131.313.187l.067.04c.91.539.925.55 1.814 2.07a7.34 7.34 0 0 1 1.213 4.387 6.686 6.686 0 0 1-.396 1.973h.022a8.474 8.474 0 0 1-1.533 2.687 26.11 26.11 0 0 1-2.917 3.444c-.446.47-.858.938-1.221 1.351l-.034.04c-.968 1.111-1.67 1.912-2.227 1.912Zm.07-15.005c-.208 0-.416.013-.623.04A2.421 2.421 0 0 0 7.69 5.69a3.54 3.54 0 0 0-.61 1.735c-.078.69.1 1.384.499 1.952.422.583.461.601.682.718l.015.01c.073.039.168.088.29.167a2.01 2.01 0 0 0 1.25.464l.107.005H10.03c.083 0 .147.006.21.006.299-.005.595-.044.886-.115l.245-.05c.125-.018.248-.05.367-.095.024-.012.053-.02.09-.036l.054-.20c.328-.103.629-.28.878-.517l.042-.04c.037-.035.072-.064.102-.092l.007-.008c.183-.154.33-.348.428-.566a3.019 3.019 0 0 0 .422-1.75 2.413 2.413 0 0 0-.1-.708v-.007a2.65 2.65 0 0 0-1.315-1.832 3.654 3.654 0 0 0-1.93-.392h-.274l-.257.013Z' },
    { id: 'payment-methods', label: 'Способы оплаты', icon: 'M21 4.875 3 4.5c-.397 0-.779.159-1.06.44s-.815.875-.815 1.272v3.07c0 .003 0-.004 0 0V9.09 13.5L1.5 18A1.502 1.502 0 0 0 3 19.5c7.072.364 11.019.393 18 0a1.502 1.502 0 0 0 1.5-1.5c.324-4.501.361-7.042 0-11.625 0-.398-.158-.844-.44-1.125-.28-.281-.662-.375-1.06-.375ZM12.75 16.5c-.13.054-1.175.064-1.44.019-.041-.007-.082-.023-.122-.033-.115-.029-.363-.1-.469-.206a.75.75 0 0 1-.22-.53.577.577 0 0 1 .2-.53.795.795 0 0 1 .535-.22c.01 0 .021 0 .031-.002.535-.084.875-.06 1.485.002a.75.75 0 0 1 .53 1.28c-.14.141-.383.16-.53.22Zm6 0c-1.27.055-1.93.05-3 0-.199 0-.375 0-.53-.22-.157-.22-.22-.331-.22-.53s.115-.39.256-.53c.14-.141.295-.22.494-.22 1.706-.093 2.307-.085 2.993-.001l.015.003c.054.011.393.088.522.218a.75.75 0 0 1-.53 1.28ZM3.824 8.254a.827.827 0 1 1 .012-1.656c2.365.029 9.107.098 11.914-.01 1.44-.057 3.185-.128 4.257-.172a.954.954 0 1 1 .034 1.91L3.824 8.254Z' },
    { id: 'invoices', label: 'Счета', icon: 'M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6Zm7 1.5L18.5 9H13V3.5Zm-1 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-.01a.75.75 0 0 0-.75-.75h-3.5Z' },
    { id: 'support-tickets', label: 'Поддержка', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm0-12.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5Z' },
    { id: 'security', label: 'Безопасность', icon: 'M12 2a10 10 0 0 0-10 10c0 4.44 2.88 8.2 6.84 9.54.48.15.96.15 1.44 0C14.12 20.2 17 16.44 17 12A10 10 0 0 0 12 2Zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6Zm0-9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3Z' },
    { id: 'notifications', label: 'Уведомления', icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z' },
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
            
            {activeTab === 'personal-data' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 mr-2 fill-current text-[var(--accent-color)]" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.039 13.609c5.835.009 9.56 2.262 9.56 6.325 0 .464.148 1.936-.214 2.01-.182.036-1.073.052-1.688.056h-.26a87.22 87.22 0 0 1-3.065-.08 76.271 76.271 0 0 0-2.958-.08c-2.232-.003-6.137.17-8.067.07-1.438-.075-2.555.045-2.86-.361-.162-.216-.107-1.717-.106-2.106.006-4.43 5.278-5.841 9.658-5.834Zm5.414-6.285c-1.668 9.175-15.994 2.889-8.96-3.961a8.15 8.15 0 0 1 1.388-.908c3.112-1.637 8.2 1.414 7.572 4.87Z" />
                    </svg>
                    <h2 className="text-3xl font-bold text-[var(--accent-color)]">Личные данные</h2>
                  </div>
                  <button
                    onClick={handleEditToggle}
                    className="text-[var(--accent-color)] hover:text-opacity-90 transition duration-300 transform hover:scale-110"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 16 16">
                      <path fillRule="evenodd" clipRule="evenodd" d="M13.42 2.107a2 2 0 0 0-2.827 0l-.472.472 3.3 3.3.471-.471a1.999 1.999 0 0 0 0-2.829l-.471-.472Zm-.942 4.715-3.3-3.3-6.06 6.06a1 1 0 0 0-.267.483l-.686 2.97a.667.667 0 0 0 .8.8l2.97-.685a1 1 0 0 0 .482-.268l6.061-6.06Z" />
                    </svg>
                  </button>
                </div>
                {!editMode ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Имя</label>
                      <p className="text-xl text-white">{user.username || 'Гость'}</p>
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Компания</label>
                      <p className="text-xl text-white">{user.company || 'Не указана'}</p>
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Телефон</label>
                      <p className="text-xl text-white">{user.phone || 'Не указан'}</p>
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Email</label>
                      <p className="text-xl text-white">{user.email || 'user@example.com'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Имя</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                        placeholder="Имя *"
                        maxLength="255"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Компания</label>
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                        className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                        placeholder="Компания"
                        maxLength="255"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Телефон</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                        placeholder="Телефон *"
                        maxLength="255"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                        placeholder="Email *"
                        maxLength="255"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'shipments' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Мои отправления</h2>
                {pendingOrders.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-[var(--accent-color)] mb-4">Ожидающие подтверждения</h3>
                    <table className="w-full mt-2 border-collapse">
                      <thead>
                        <tr className="bg-gray-700">
                          <th className="p-3 text-left text-gray-300">Дата</th>
                          <th className="p-3 text-left text-gray-300">Номер отправления</th>
                          <th className="p-3 text-left text-gray-300">Статус</th>
                          <th className="p-3 text-left text-gray-300">Стоимость</th>
                          <th className="p-3 text-left text-gray-300">Детали</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700 transition duration-300">
                            <td className="p-3 text-white">{new Date(order.dateCreated).toLocaleDateString()}</td>
                            <td className="p-3 text-white">{order.orderNumber}</td>
                            <td className="p-3 text-yellow-300">Ожидает подтверждения</td>
                            <td className="p-3 text-white">¥{order.totalClientPrice.toFixed(2)}</td>
                            <td className="p-3">
                              <button
                                onClick={() => handleViewOrderDetails(order.id)}
                                className="text-[var(--accent-color)] hover:text-opacity-90 transition duration-300 transform hover:scale-110"
                              >
                                🔍
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {verifiedOrders.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-2xl font-semibold text-[var(--accent-color)] mb-4">Подтверждённые отправления</h3>
                    <table className="w-full mt-2 border-collapse">
                      <thead>
                        <tr className="bg-gray-700">
                          <th className="p-3 text-left text-gray-300">Дата</th>
                          <th className="p-3 text-left text-gray-300">Номер отправления</th>
                          <th className="p-3 text-left text-gray-300">Статус</th>
                          <th className="p-3 text-left text-gray-300">Стоимость</th>
                          <th className="p-3 text-left text-gray-300">Действия</th>
                          <th className="p-3 text-left text-gray-300">Детали</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifiedOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700 transition duration-300">
                            <td className="p-3 text-white">{new Date(order.dateCreated).toLocaleDateString()}</td>
                            <td className="p-3 text-white">{order.orderNumber}</td>
                            <td className="p-3 text-[var(--accent-color)]">Подтверждён</td>
                            <td className="p-3 text-white">¥{order.totalClientPrice.toFixed(2)}</td>
                            <td className="p-3">
                              <button
                                onClick={() => handlePay(order.id)}
                                className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
                                disabled={order.status === 'PAID'}
                              >
                                {order.status === 'PAID' ? 'Оплачено' : 'Оплатить'}
                              </button>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleViewOrderDetails(order.id)}
                                className="text-[var(--accent-color)] hover:text-opacity-90 transition duration-300 transform hover:scale-110"
                              >
                                🔍
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {pendingOrders.length === 0 && verifiedOrders.length === 0 && (
                  <p className="text-center mt-4 text-gray-300 text-lg">У вас пока нет текущих отправлений.</p>
                )}
              </div>
            )}
            {activeTab === 'addresses' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Мои адреса</h2>
                <p className="text-gray-300 text-lg">Список адресов для доставки (функция пока не реализована).</p>
                <button
                  onClick={() => alert('Функция добавления адреса пока не реализована')}
                  className="mt-4 px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
                >
                  Добавить адрес
                </button>
              </div>
            )}
            {activeTab === 'payment-methods' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Способы оплаты</h2>
                <p className="text-gray-300 text-lg">Список способов оплаты (функция пока не реализована).</p>
                <button
                  onClick={() => alert('Функция добавления способа оплаты пока не реализована')}
                  className="mt-4 px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
                >
                  Добавить способ оплаты
                </button>
              </div>
            )}
            {activeTab === 'invoices' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Счета</h2>
                {invoices.length > 0 ? (
                  <table className="w-full mt-2 border-collapse">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="p-3 text-left text-gray-300">Номер счета</th>
                        <th className="p-3 text-left text-gray-300">Дата</th>
                        <th className="p-3 text-left text-gray-300">Сумма</th>
                        <th className="p-3 text-left text-gray-300">Статус</th>
                        <th className="p-3 text-left text-gray-300">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-700 hover:bg-gray-700 transition duration-300">
                          <td className="p-3 text-white">{invoice.invoiceNumber}</td>
                          <td className="p-3 text-white">{new Date(invoice.dateCreated).toLocaleDateString()}</td>
                          <td className="p-3 text-white">¥{invoice.amount.toFixed(2)}</td>
                          <td className="p-3 text-[var(--accent-color)]">{invoice.status}</td>
                          <td className="p-3">
                            <button
                              onClick={() => alert('Просмотр счета пока не реализован')}
                              className="text-[var(--accent-color)] hover:text-opacity-90 transition duration-300 transform hover:scale-110"
                            >
                              🔍
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center mt-4 text-gray-300 text-lg">Счета отсутствуют.</p>
                )}
              </div>
            )}
            {activeTab === 'support-tickets' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Поддержка</h2>
                <button
                  onClick={handleCreateTicket}
                  className="mb-4 px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
                >
                  Создать запрос
                </button>
                {supportTickets.length > 0 ? (
                  <table className="w-full mt-2 border-collapse">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="p-3 text-left text-gray-300">Номер запроса</th>
                        <th className="p-3 text-left text-gray-300">Тема</th>
                        <th className="p-3 text-left text-gray-300">Дата</th>
                        <th className="p-3 text-left text-gray-300">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportTickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b border-gray-700 hover:bg-gray-700 transition duration-300">
                          <td className="p-3 text-white">{ticket.ticketNumber}</td>
                          <td className="p-3 text-white">{ticket.subject}</td>
                          <td className="p-3 text-white">{new Date(ticket.dateCreated).toLocaleDateString()}</td>
                          <td className="p-3 text-[var(--accent-color)]">{ticket.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center mt-4 text-gray-300 text-lg">Запросы в поддержку отсутствуют.</p>
                )}
              </div>
            )}
            {activeTab === 'security' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Безопасность</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-300">Текущий пароль</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                      placeholder="Текущий пароль"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-300">Новый пароль</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                      placeholder="Новый пароль"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-300">Подтвердите новый пароль</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                      placeholder="Подтвердите новый пароль"
                    />
                  </div>
                  {passwordError && <p className="text-red-500 text-lg">{passwordError}</p>}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleChangePassword}
                      className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
                    >
                      Сохранить пароль
                    </button>
                    <button
                      onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105"
                    >
                      Очистить
                    </button>
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={handleTwoFactorToggle}
                      className="mr-2 accent-[var(--accent-color)]"
                    />
                    <label className="text-lg text-gray-300">Включить двухфакторную аутентификацию</label>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'notifications' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Уведомления</h2>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={handleNotificationToggle}
                    className="mr-2 accent-[var(--accent-color)]"
                  />
                  <label className="text-lg text-gray-300">Включить уведомления по email</label>
                </div>
              </div>
            )}
            {activeTab === 'history' && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">История отправлений</h2>
                {orderHistory.length > 0 ? (
                  <table className="w-full mt-2 border-collapse">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="p-3 text-left text-gray-300">Дата</th>
                        <th className="p-3 text-left text-gray-300">Номер отправления</th>
                        <th className="p-3 text-left text-gray-300">Статус</th>
                        <th className="p-3 text-left text-gray-300">Стоимость</th>
                        <th className="p-3 text-left text-gray-300">Детали</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order) => (
                        <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700 transition duration-300">
                          <td className="p-3 text-white">{new Date(order.dateCreated).toLocaleDateString()}</td>
                          <td className="p-3 text-white">{order.orderNumber}</td>
                          <td className="p-3 text-gray-300">{order.status}</td>
                          <td className="p-3 text-white">¥{order.totalClientPrice.toFixed(2)}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleViewOrderDetails(order.id)}
                              className="text-[var(--accent-color)] hover:text-opacity-90 transition duration-300 transform hover:scale-110"
                            >
                              🔍
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center mt-4 text-gray-300 text-lg">История отправлений пуста.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;