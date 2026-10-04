import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { Loading } from '../components/ui/Loading';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  UserIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

const AdminCRMUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userFullData, setUserFullData] = useState(null);
  const [loadingFullData, setLoadingFullData] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' });
  const [_editingOrder, _setEditingOrder] = useState(null);
  const [_editingTicket, _setEditingTicket] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20'
      });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const response = await api.get(`/admin/crm/users?${params}`);
      setUsers(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      company: user.company || '',
      role: user.role || '',
      discountPercent: user.discountPercent || 0,
      temporaryDiscountPercent: user.temporaryDiscountPercent || 0,
      notificationsEnabled: user.notificationsEnabled || false,
      emailVerified: user.emailVerified || false
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/crm/users/${selectedUser.email}`, editForm);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (email) => {
    try {
      await api.delete(`/admin/crm/users/${email}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };


  const handleResetPassword = async () => {
    try {
      await api.put(`/admin/crm/users/${selectedUser.email}/password`, passwordForm);
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    setLoadingFullData(true);
    setActiveTab('overview');
    setEditMode(false);
    try {
      const response = await api.get(`/admin/crm/users/${user.email}/full`);
      setUserFullData(response.data);
      setEditForm({
        username: response.data.user?.username || '',
        company: response.data.user?.company || '',
        role: response.data.user?.role || '',
        discountPercent: response.data.user?.discountPercent || 0,
        temporaryDiscountPercent: response.data.user?.temporaryDiscountPercent || 0,
        notificationsEnabled: response.data.user?.notificationsEnabled || false,
        twoFactorEnabled: response.data.user?.twoFactorEnabled || false,
        emailVerified: response.data.user?.emailVerified || false,
        telegramUserId: response.data.user?.telegramUserId || '',
        telegramVerified: response.data.user?.telegramVerified || false
      });
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err);
    } finally {
      setLoadingFullData(false);
    }
  };

  const handleSaveUserEdit = async () => {
    try {
      await api.put(`/admin/crm/users/${selectedUser.email}`, editForm);
      setEditMode(false);
      // Перезагружаем данные
      const response = await api.get(`/admin/crm/users/${selectedUser.email}/full`);
      setUserFullData(response.data);
      fetchUsers(); // Обновляем список пользователей
    } catch (err) {
      console.error('Ошибка обновления пользователя:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/crm/orders/${orderId}/status`, { status });
      const response = await api.get(`/admin/crm/users/${selectedUser.email}/full`);
      setUserFullData(response.data);
    } catch (err) {
      console.error('Ошибка обновления заказа:', err);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      await api.put(`/admin/crm/tickets/${ticketId}/status`, { status });
      const response = await api.get(`/admin/crm/users/${selectedUser.email}/full`);
      setUserFullData(response.data);
    } catch (err) {
      console.error('Ошибка обновления тикета:', err);
    }
  };

  if (loading && users.length === 0) {
    return <Loading message="Загрузка пользователей..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Управление пользователями</h1>
        <p className="text-gray-400">Просмотр и редактирование пользователей системы</p>
      </motion.div>

      {/* Фильтры */}
      <Card className="bg-[#1a1a1a] border border-[#333333] p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по email, имени, компании, роли, Telegram..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#333333] text-white"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-dark px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white"
          >
            <option value="">Все роли</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </Card>

      {/* Таблица пользователей */}
      <Card className="bg-[#1a1a1a] border border-[#333333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Имя</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Роль</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Скидка</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <motion.tr
                  key={user.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#333333] hover:bg-[#0a0a0a]"
                >
                  <td className="px-4 py-3 text-white">{user.email}</td>
                  <td className="px-4 py-3 text-gray-300">{user.username || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{user.discountPercent || 0}%</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="p-2 text-purple-400 hover:bg-purple-500/20 rounded transition"
                        title="Детальный просмотр"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPasswordModal(true);
                        }}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded transition"
                      >
                        <KeyIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.email)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-[#333333]">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-[#0a0a0a] border border-[#333333] rounded text-white disabled:opacity-50"
            >
              Назад
            </button>
            <span className="text-gray-400">
              Страница {page + 1} из {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-[#0a0a0a] border border-[#333333] rounded text-white disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        )}
      </Card>

      {/* Модальное окно редактирования */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">Редактировать пользователя</h2>
            <div className="space-y-4">
              <Input
                label="Имя пользователя"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
              <Input
                label="Компания"
                value={editForm.company}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              />
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded text-white"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">Сохранить</Button>
                <Button onClick={() => setShowEditModal(false)} variant="secondary" className="flex-1">
                  Отмена
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Модальное окно смены пароля */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">Сброс пароля</h2>
            <div className="space-y-4">
              <Input
                type="password"
                label="Новый пароль"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleResetPassword} className="flex-1">Изменить</Button>
                <Button onClick={() => setShowPasswordModal(false)} variant="secondary" className="flex-1">
                  Отмена
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Модальное окно детального просмотра */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Заголовок */}
            <div className="p-6 border-b border-[#333333] flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editMode ? 'Редактирование пользователя' : 'Детальный просмотр пользователя'}
                </h2>
                <p className="text-gray-400 mt-1">{selectedUser.email}</p>
              </div>
              <div className="flex gap-2">
                {activeTab === 'overview' && (
                  <>
                    {!editMode ? (
                      <Button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Редактировать
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleSaveUserEdit}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Сохранить
                        </Button>
                        <Button
                          onClick={() => {
                            setEditMode(false);
                            // Восстанавливаем форму из userFullData
                            if (userFullData?.user) {
                              setEditForm({
                                username: userFullData.user.username || '',
                                phone: userFullData.user.phone || '',
                                company: userFullData.user.company || '',
                                role: userFullData.user.role || '',
                                discountPercent: userFullData.user.discountPercent || 0,
                                temporaryDiscountPercent: userFullData.user.temporaryDiscountPercent || 0,
                                notificationsEnabled: userFullData.user.notificationsEnabled || false,
                                twoFactorEnabled: userFullData.user.twoFactorEnabled || false,
                                emailVerified: userFullData.user.emailVerified || false,
                                telegramUserId: userFullData.user.telegramUserId || '',
                                telegramVerified: userFullData.user.telegramVerified || false
                              });
                            }
                          }}
                          variant="secondary"
                        >
                          Отмена
                        </Button>
                      </>
                    )}
                  </>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setEditMode(false);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#0a0a0a] rounded transition"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Табы */}
            <div className="flex border-b border-[#333333] overflow-x-auto">
              {['overview', 'orders', 'quests', 'tickets', 'transactions', 'notifications', 'reviews', 'referrals'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'text-[#e81e2d] border-b-2 border-[#e81e2d]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'overview' && 'Обзор'}
                  {tab === 'orders' && `Заказы (${userFullData?.orders?.length || 0})`}
                  {tab === 'quests' && `Квесты (${userFullData?.questProgress?.length || 0})`}
                  {tab === 'tickets' && `Тикеты (${userFullData?.tickets?.length || 0})`}
                  {tab === 'transactions' && `Транзакции (${userFullData?.transactions?.length || 0})`}
                  {tab === 'notifications' && `Уведомления (${userFullData?.notifications?.length || 0})`}
                  {tab === 'reviews' && `Отзывы (${(userFullData?.reviews?.length || 0) + (userFullData?.productReviews?.length || 0)})`}
                  {tab === 'referrals' && `Рефералы (${userFullData?.referrals?.length || 0})`}
                </button>
              ))}
            </div>

            {/* Контент табов */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingFullData ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-400">Загрузка данных...</div>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && userFullData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-[#0a0a0a] border border-[#333333] p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Основная информация</h3>
                        {editMode ? (
                          <div className="space-y-4">
                            <div>
                              <label className="text-gray-400 text-sm">Email (не изменяется)</label>
                              <Input
                                value={userFullData.user?.email || ''}
                                disabled
                                className="bg-[#1a1a1a] border-[#333333] text-gray-500"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400 text-sm">Имя пользователя</label>
                              <Input
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                className="bg-[#1a1a1a] border-[#333333] text-white"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400 text-sm">Компания</label>
                              <Input
                                value={editForm.company}
                                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                className="bg-[#1a1a1a] border-[#333333] text-white"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400 text-sm">Роль</label>
                              <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded text-white"
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setShowPasswordModal(true);
                                  setPasswordForm({ newPassword: '' });
                                }}
                                className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center justify-center gap-2"
                              >
                                <KeyIcon className="w-4 h-4" />
                                Изменить пароль
                              </button>
                            </div>
                            <div>
                              <label className="text-gray-400 text-sm">Постоянная скидка (%)</label>
                              <Input
                                type="number"
                                step="0.1"
                                value={editForm.discountPercent}
                                onChange={(e) => setEditForm({ ...editForm, discountPercent: parseFloat(e.target.value) || 0 })}
                                className="bg-[#1a1a1a] border-[#333333] text-white"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400 text-sm">Временная скидка (%)</label>
                              <Input
                                type="number"
                                step="0.1"
                                value={editForm.temporaryDiscountPercent}
                                onChange={(e) => setEditForm({ ...editForm, temporaryDiscountPercent: parseFloat(e.target.value) || 0 })}
                                className="bg-[#1a1a1a] border-[#333333] text-white"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.notificationsEnabled}
                                onChange={(e) => setEditForm({ ...editForm, notificationsEnabled: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <label className="text-gray-400 text-sm">Уведомления включены</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.twoFactorEnabled}
                                onChange={(e) => setEditForm({ ...editForm, twoFactorEnabled: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <label className="text-gray-400 text-sm">Двухфакторная аутентификация</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.emailVerified}
                                onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <label className="text-gray-400 text-sm">Email подтвержден</label>
                            </div>
                            <div>
                              <label className="text-gray-400 text-sm">Telegram ID</label>
                              <Input
                                value={editForm.telegramUserId || ''}
                                onChange={(e) => setEditForm({ ...editForm, telegramUserId: e.target.value })}
                                className="bg-[#1a1a1a] border-[#333333] text-white"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.telegramVerified}
                                onChange={(e) => setEditForm({ ...editForm, telegramVerified: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <label className="text-gray-400 text-sm">Telegram подтвержден</label>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Email:</span>
                              <span className="text-white">{userFullData.user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Имя:</span>
                              <span className="text-white">{userFullData.user?.username || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Роль:</span>
                              <span className="text-white">{userFullData.user?.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Постоянная скидка:</span>
                              <span className="text-white">{userFullData.user?.discountPercent || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Временная скидка:</span>
                              <span className="text-white">{userFullData.user?.temporaryDiscountPercent || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Потрачено:</span>
                              <span className="text-white">${userFullData.user?.moneySpent?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        )}
                      </Card>
                      <Card className="bg-[#0a0a0a] border border-[#333333] p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Статистика</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Всего заказов:</span>
                            <span className="text-white">{userFullData.orders?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Активных квестов:</span>
                            <span className="text-white">{userFullData.questProgress?.filter(q => !q.completed).length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Завершенных квестов:</span>
                            <span className="text-white">{userFullData.questProgress?.filter(q => q.completed).length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Открытых тикетов:</span>
                            <span className="text-white">{userFullData.tickets?.filter(t => t.status === 'OPEN').length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Рефералов:</span>
                            <span className="text-white">{userFullData.referrals?.length || 0}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="space-y-4">
                      {userFullData?.orders?.length > 0 ? (
                        userFullData.orders.map((order) => (
                          <Card key={order.id} className="bg-[#0a0a0a] border border-[#333333] p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold">Заказ #{order.orderNumber}</h4>
                                <p className="text-gray-400 text-sm">Статус: {order.status}</p>
                                <p className="text-gray-400 text-sm">Сумма: ${order.totalClientPrice?.toFixed(2)}</p>
                                <p className="text-gray-400 text-sm">Дата: {new Date(order.dateCreated).toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className="select-dark px-3 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-white text-sm"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="PAID">PAID</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="PROCESSED">PROCESSED</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="VERIFIED">VERIFIED</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                  order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">Нет заказов</div>
                      )}
                    </div>
                  )}

                  {activeTab === 'quests' && (
                    <div className="space-y-4">
                      {userFullData?.questProgress?.length > 0 ? (
                        userFullData.questProgress.map((progress) => (
                          <Card key={progress.id} className="bg-[#0a0a0a] border border-[#333333] p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-white font-semibold">{progress.quest?.name || 'Квест'}</h4>
                                <p className="text-gray-400 text-sm">Прогресс: {progress.currentValue} / {progress.quest?.targetValue || 0}</p>
                                <p className="text-gray-400 text-sm">Награда: {progress.quest?.reward}% ({progress.quest?.rewardType})</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                progress.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {progress.completed ? 'Завершен' : 'В процессе'}
                              </span>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">Нет квестов</div>
                      )}
                    </div>
                  )}

                  {activeTab === 'tickets' && (
                    <div className="space-y-4">
                      {userFullData?.tickets?.length > 0 ? (
                        userFullData.tickets.map((ticket) => (
                          <Card key={ticket.id} className="bg-[#0a0a0a] border border-[#333333] p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold">{ticket.title}</h4>
                                <p className="text-gray-400 text-sm">{ticket.description}</p>
                                <p className="text-gray-400 text-xs mt-1">
                                  Создан: {new Date(ticket.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={ticket.status}
                                  onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                                  className="select-dark px-3 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-white text-sm"
                                >
                                  <option value="OPEN">OPEN</option>
                                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  ticket.status === 'OPEN' ? 'bg-green-500/20 text-green-400' :
                                  ticket.status === 'CLOSED' ? 'bg-gray-500/20 text-gray-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {ticket.status}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">Нет тикетов</div>
                      )}
                    </div>
                  )}

                  {activeTab === 'transactions' && (
                    <div className="space-y-4">
                      {userFullData?.transactions?.length > 0 ? (
                        userFullData.transactions.map((transaction) => (
                          <Card key={transaction.id} className="bg-[#0a0a0a] border border-[#333333] p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-white font-semibold">Транзакция #{transaction.id}</h4>
                                <p className="text-gray-400 text-sm">Тип: {transaction.type}</p>
                                <p className="text-gray-400 text-sm">Сумма: ${transaction.amount?.toFixed(2)}</p>
                              </div>
                              <span className="text-gray-400 text-sm">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">Нет транзакций</div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-4">
                      {userFullData?.notifications?.length > 0 ? (
                        userFullData.notifications.map((notification) => (
                          <Card key={notification.id} className="bg-[#0a0a0a] border border-[#333333] p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-white font-semibold">{notification.title}</h4>
                                <p className="text-gray-400 text-sm">{notification.message}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                notification.isRead ? 'bg-gray-500/20 text-gray-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {notification.isRead ? 'Прочитано' : 'Новое'}
                              </span>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">Нет уведомлений</div>
                      )}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-4">
                      {((userFullData?.reviews?.length > 0) || (userFullData?.productReviews?.length > 0)) ? (
                        <>
                          {userFullData.reviews?.map((review) => (
                            <Card key={review.id} className="bg-[#0a0a0a] border border-[#333333] p-4">
                              <div>
                                <h4 className="text-white font-semibold">{review.name}</h4>
                                <p className="text-gray-400 text-sm">Рейтинг: {review.rating}/5</p>
                                <p className="text-gray-400 text-sm mt-2">{review.text}</p>
                              </div>
                            </Card>
                          ))}
                          {userFullData.productReviews?.map((review) => (
                            <Card key={review.id} className="bg-[#0a0a0a] border border-[#333333] p-4">
                              <div>
                                <h4 className="text-white font-semibold">Отзыв на товар</h4>
                                <p className="text-gray-400 text-sm">Рейтинг: {review.rating}/5</p>
                                <p className="text-gray-400 text-sm mt-2">{review.comment}</p>
                              </div>
                            </Card>
                          ))}
                        </>
                      ) : (
                        <div className="text-center text-gray-400 py-8">Нет отзывов</div>
                      )}
                    </div>
                  )}

                  {activeTab === 'referrals' && (
                    <div className="space-y-4">
                      {userFullData?.referrals?.length > 0 ? (
                        userFullData.referrals.map((referral) => (
                          <Card key={referral.email} className="bg-[#0a0a0a] border border-[#333333] p-4">
                            <div>
                              <h4 className="text-white font-semibold">{referral.email}</h4>
                              <p className="text-gray-400 text-sm">Имя: {referral.username || '-'}</p>
                              <p className="text-gray-400 text-sm">Дата регистрации: {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : '-'}</p>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">Нет рефералов</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCRMUsers;

