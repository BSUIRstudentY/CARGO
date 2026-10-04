import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  EyeIcon
} from '@heroicons/react/24/solid';

const AdminCRMOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20'
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/crm/orders?${params}`);
      setOrders(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError('Ошибка загрузки заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status || '',
      totalClientPrice: order.totalClientPrice || 0,
      trackingNumber: order.trackingNumber || '',
      deliveryAddress: order.deliveryAddress || '',
      reasonRefusal: order.reasonRefusal || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/crm/orders/${selectedOrder.id}`, editForm);
      setShowEditModal(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const _handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/crm/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await api.delete(`/admin/crm/orders/${orderId}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      PAID: 'bg-green-500/20 text-green-400',
      PROCESSING: 'bg-blue-500/20 text-blue-400',
      PROCESSED: 'bg-blue-500/20 text-blue-400',
      SHIPPED: 'bg-indigo-500/20 text-indigo-400',
      COMPLETED: 'bg-emerald-500/20 text-emerald-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
      VERIFIED: 'bg-purple-500/20 text-purple-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading && orders.length === 0) {
    return <Loading message="Загрузка заказов..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Управление заказами</h1>
        <p className="text-gray-400">Просмотр и управление всеми заказами системы</p>
      </motion.div>

      {/* Фильтры */}
      <Card className="bg-[#1a1a1a] border border-[#333333] p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по ID, номеру заказа, треку, email, адресу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#333333] text-white"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-dark px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white"
          >
            <option value="">Все статусы</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="PROCESSED">PROCESSED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </Card>

      {/* Таблица заказов */}
      <Card className="bg-[#1a1a1a] border border-[#333333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Номер заказа</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Пользователь</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Статус</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Сумма</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Дата</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#333333] hover:bg-[#0a0a0a]"
                >
                  <td className="px-4 py-3 text-white">{order.id}</td>
                  <td className="px-4 py-3 text-white">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-300">{order.user?.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">${order.totalClientPrice?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {order.dateCreated ? new Date(order.dateCreated).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/order-details/${order.id}`)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(order)}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded transition"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
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
            className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-white mb-4">Редактировать заказ</h2>
            <div className="space-y-4">
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded text-white"
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
              <Input
                type="number"
                label="Сумма"
                value={editForm.totalClientPrice}
                onChange={(e) => setEditForm({ ...editForm, totalClientPrice: parseFloat(e.target.value) })}
              />
              <Input
                label="Трек-номер"
                value={editForm.trackingNumber}
                onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
              />
              <Input
                label="Адрес доставки"
                value={editForm.deliveryAddress}
                onChange={(e) => setEditForm({ ...editForm, deliveryAddress: e.target.value })}
              />
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
    </div>
  );
};

export default AdminCRMOrders;




