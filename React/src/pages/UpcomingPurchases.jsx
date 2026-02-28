import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Loading } from '../components/ui/Loading';
import { StyledSelect } from '../components/ui/StyledSelect';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TruckIcon,
  CalendarIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

/**
 * Страница управления выкупами для администратора
 * Полностью переработанная версия с расширенным функционалом
 */
function UpcomingPurchases() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('creationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    unfinished: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    refused: 0
  });

  // Данные для создания выкупа
  const [formData, setFormData] = useState({
    purchaseDate: '',
    description: '',
    photoUrl: ''
  });
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    // Применяем фильтры поиска и статуса
    let filtered = batches;
    
    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(batch => batch.status === statusFilter);
    }
    
    // Фильтр поиска
    if (searchQuery.trim()) {
      filtered = filtered.filter(batch => 
        batch.id.toString().includes(searchQuery) ||
        (batch.description && batch.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredBatches(filtered);
  }, [searchQuery, statusFilter, batches]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Используем endpoint /all для получения всех выкупов с пагинацией
      const sortParam = `${sortBy},${sortOrder}`;
      const response = await api.get(`/batch-cargos/all?page=${currentPage}&size=10&sort=${sortParam}`);
      
      if (response.data) {
        const batchesData = response.data.content || [];
        setBatches(batchesData);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Ошибка загрузки выкупов');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Получаем все выкупы для статистики (большой размер страницы)
      const response = await api.get('/batch-cargos/all?page=0&size=1000&sort=creationDate,desc');
      if (response.data && response.data.content) {
        calculateStats(response.data.content);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const calculateStats = (allBatches) => {
    const statsData = {
      total: allBatches.length,
      unfinished: allBatches.filter(b => b.status === 'UNFINISHED').length,
      processing: allBatches.filter(b => ['PURCHASING', 'CHECKING', 'PACKAGING'].includes(b.status)).length,
      shipped: allBatches.filter(b => b.status === 'SHIPPED').length,
      completed: allBatches.filter(b => b.status === 'COMPLETED').length,
      refused: allBatches.filter(b => b.status === 'REFUSED').length
    };
    setStats(statsData);
  };

  const fetchAvailableOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/batch-cargos/available-orders');
      setAvailableOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
      setError('Ошибка загрузки доступных заказов');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formData.purchaseDate) {
      return;
    }
    
    if (selectedOrderIds.length === 0) {
      return;
    }
    
    try {
      const requestData = {
        purchaseDate: new Date(formData.purchaseDate),
        description: formData.description || null,
        photoUrl: formData.photoUrl || null,
        orderIds: selectedOrderIds
      };
      
      const response = await api.post('/batch-cargos', requestData);
      setShowCreateModal(false);
      setFormData({ purchaseDate: '', description: '', photoUrl: '' });
      setSelectedOrderIds([]);
      setAvailableOrders([]);
      fetchBatches();
      navigate(`/admin/upcoming-purchases/${response.data.id}`);
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleToggleOrder = (orderId) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === availableOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(availableOrders.map(order => order.id));
    }
  };

  const getStatusDisplay = (status) => {
    const statuses = {
      UNFINISHED: { 
        text: 'В процессе', 
        color: 'text-yellow-300', 
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      PURCHASING: { 
        text: 'Закупка товаров', 
        color: 'text-blue-300', 
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      CHECKING: { 
        text: 'Проверка товаров', 
        color: 'text-purple-300', 
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      PACKAGING: { 
        text: 'Упаковка', 
        color: 'text-indigo-300', 
        bgColor: 'bg-indigo-500/20',
        borderColor: 'border-indigo-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      SHIPPED: { 
        text: 'Отправлен', 
        color: 'text-emerald-300', 
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/50',
        icon: <TruckIcon className="w-4 h-4" />
      },
      FINISHED: { 
        text: 'Завершён', 
        color: 'text-emerald-300', 
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      ARRIVED_IN_MINSK: { 
        text: 'В Минске', 
        color: 'text-blue-300', 
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50',
        icon: <TruckIcon className="w-4 h-4" />
      },
      COMPLETED: { 
        text: 'Доставлен', 
        color: 'text-green-300', 
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      REFUSED: { 
        text: 'Отклонён', 
        color: 'text-red-300', 
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/50',
        icon: <XCircleIcon className="w-4 h-4" />
      }
    };
    return statuses[status] || { 
      text: status, 
      color: 'text-gray-300', 
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/50',
      icon: <ClockIcon className="w-4 h-4" />
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading && batches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message="Загрузка выкупов..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Выкупы"
          subtitle="Управление совместными выкупами и сборными грузами"
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-red-500/20 border border-red-500/50">
              <p className="text-red-300">{error}</p>
            </Card>
          </motion.div>
        )}

        {/* Статистика */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6"
        >
          <Card className="p-4 bg-[#1a1a1a] border border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#407CFF]/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-[#407CFF]" />
              </div>
              <div>
                <p className="text-xs text-[#808080]">Всего</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#1a1a1a] border border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <p className="text-xs text-[#808080]">В процессе</p>
                <p className="text-xl font-bold text-white">{stats.unfinished}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#1a1a1a] border border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="text-xs text-[#808080]">В обработке</p>
                <p className="text-xl font-bold text-white">{stats.processing}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#1a1a1a] border border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs text-[#808080]">Отправлены</p>
                <p className="text-xl font-bold text-white">{stats.shipped}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#1a1a1a] border border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <p className="text-xs text-[#808080]">Доставлены</p>
                <p className="text-xl font-bold text-white">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#1a1a1a] border border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircleIcon className="w-6 h-6 text-red-300" />
              </div>
              <div>
                <p className="text-xs text-[#808080]">Отклонены</p>
                <p className="text-xl font-bold text-white">{stats.refused}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Панель управления */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4 bg-[#1a1a1a] border border-[#333]">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Поиск */}
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#808080]" />
                  <input
                    type="text"
                    placeholder="Поиск по ID или описанию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-[#808080] focus:border-[#407CFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Фильтр по статусу */}
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-[#808080] shrink-0" />
                <StyledSelect
                  value={statusFilter}
                  onChange={(v) => { setStatusFilter(v); setCurrentPage(0); }}
                  options={[
                    { value: 'all', label: 'Все статусы' },
                    { value: 'UNFINISHED', label: 'В процессе' },
                    { value: 'PURCHASING', label: 'Закупка товаров' },
                    { value: 'CHECKING', label: 'Проверка товаров' },
                    { value: 'PACKAGING', label: 'Упаковка' },
                    { value: 'SHIPPED', label: 'Отправлен' },
                    { value: 'ARRIVED_IN_MINSK', label: 'В Минске' },
                    { value: 'COMPLETED', label: 'Доставлен' },
                    { value: 'REFUSED', label: 'Отклонён' },
                  ]}
                  placeholder="Статус"
                  className="min-w-[180px]"
                />
              </div>

              {/* Сортировка */}
              <div className="flex items-center gap-2">
                <StyledSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'creationDate', label: 'По дате создания' },
                    { value: 'purchaseDate', label: 'По дате выкупа' },
                    { value: 'id', label: 'По ID' },
                  ]}
                  placeholder="Сортировка"
                  className="min-w-[180px]"
                />
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#407CFF] transition-colors"
                >
                  <ArrowPathIcon className={`w-5 h-5 ${sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
                </button>
              </div>

              {/* Кнопка создания */}
              <Button
                onClick={() => {
                  setShowCreateModal(true);
                  fetchAvailableOrders();
                }}
                className="bg-gradient-to-r from-[#e81e2d] to-[#ff4757] hover:from-[#ff4757] hover:to-[#e81e2d] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Создать выкуп
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Список выкупов */}
        <div className="space-y-4">
          {filteredBatches.length === 0 ? (
            <Card className="p-12 text-center">
              <TruckIcon className="w-16 h-16 text-[#808080] mx-auto mb-4" />
              <p className="text-xl text-[#cdcdcd] mb-2">Выкупов не найдено</p>
              <p className="text-[#808080]">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска' 
                  : 'Создайте первый выкуп'}
              </p>
            </Card>
          ) : (
            filteredBatches.map((batch, index) => {
              const statusDisplay = getStatusDisplay(batch.status);
              return (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className="p-6 bg-[#1a1a1a] border border-[#333] hover:border-[#407CFF]/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/admin/upcoming-purchases/${batch.id}`)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#e81e2d] to-[#ff4757] rounded-xl flex items-center justify-center">
                            <TruckIcon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              Выкуп #{batch.id}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color} mt-1`}>
                              {statusDisplay.icon}
                              {statusDisplay.text}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-[#cdcdcd]">
                            <CalendarIcon className="w-4 h-4 text-[#407CFF]" />
                            <span>
                              <span className="text-[#808080]">Дата создания:</span>{' '}
                              <span className="text-white font-medium">{formatDate(batch.creationDate)}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[#cdcdcd]">
                            <ShoppingBagIcon className="w-4 h-4 text-[#407CFF]" />
                            <span>
                              <span className="text-[#808080]">Дата выкупа:</span>{' '}
                              <span className="text-white font-medium">{formatDate(batch.purchaseDate)}</span>
                            </span>
                          </div>
                          {batch.description && (
                            <div className="md:col-span-3 text-[#cdcdcd]">
                              <span className="text-[#808080]">Описание:</span>{' '}
                              <span className="text-white">{batch.description}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {batch.photoUrl && (
                          <div className="hidden md:block w-20 h-20 rounded-lg overflow-hidden border border-[#333]">
                            <img 
                              src={batch.photoUrl} 
                              alt={`Выкуп #${batch.id}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-xs text-[#808080] mb-1">ID выкупа</p>
                          <p className="text-lg font-bold text-[#407CFF]">#{batch.id}</p>
                        </div>
                        <ArrowPathIcon className="w-5 h-5 text-[#407CFF] rotate-90" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              variant="outline"
              className="border-[#333] hover:border-[#407CFF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </Button>
            <span className="text-[#cdcdcd]">
              Страница {currentPage + 1} из {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              variant="outline"
              className="border-[#333] hover:border-[#407CFF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперёд
            </Button>
          </div>
        )}

        {/* Модальное окно создания выкупа */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Создать новый выкуп</h3>
                
                <form onSubmit={handleCreateBatch} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                      Дата выкупа *
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                    />
                  </div>

                  {/* Список доступных заказов */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-[#cdcdcd]">
                        Выберите заказы для включения в выкуп *
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleSelectAll}
                        className="border-[#407CFF] text-[#407CFF] hover:bg-[#407CFF] hover:text-white"
                      >
                        {selectedOrderIds.length === availableOrders.length ? 'Снять все' : 'Выбрать все'}
                      </Button>
                    </div>

                    {loadingOrders ? (
                      <div className="text-center py-8 text-[#808080]">Загрузка заказов...</div>
                    ) : availableOrders.length === 0 ? (
                      <div className="text-center py-8 text-[#808080]">
                        Нет доступных оплаченных заказов для включения в выкуп
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto space-y-2 border border-[#333] rounded-lg p-4 bg-[#0a0a0a]">
                        {availableOrders.map((order) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedOrderIds.includes(order.id)
                                ? 'border-[#407CFF] bg-[#407CFF]/10'
                                : 'border-[#333] bg-[#1a1a1a] hover:border-[#555]'
                            }`}
                            onClick={() => handleToggleOrder(order.id)}
                          >
                            <div className="flex items-start gap-4">
                              <input
                                type="checkbox"
                                checked={selectedOrderIds.includes(order.id)}
                                onChange={() => handleToggleOrder(order.id)}
                                className="mt-1 w-5 h-5 text-[#407CFF] bg-[#0a0a0a] border-[#333] rounded focus:ring-[#407CFF] focus:ring-2"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-white">
                                    Заказ #{order.orderNumber}
                                  </h4>
                                  <span className="text-lg font-bold text-[#407CFF]">
                                    ¥{order.totalClientPrice?.toFixed(2) || '0.00'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-[#cdcdcd]">
                                  <div>
                                    <span className="text-[#808080]">Клиент:</span>{' '}
                                    <span className="text-white">{order.userEmail}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#808080]">Товаров:</span>{' '}
                                    <span className="text-white font-semibold">{order.itemCount}</span>
                                  </div>
                                  {order.dateCreated && (
                                    <div>
                                      <span className="text-[#808080]">Дата:</span>{' '}
                                      <span className="text-white">
                                        {new Date(order.dateCreated).toLocaleDateString('ru-RU')}
                                      </span>
                                    </div>
                                  )}
                                  {order.deliveryAddress && (
                                    <div className="md:col-span-2">
                                      <span className="text-[#808080]">Адрес:</span>{' '}
                                      <span className="text-white text-xs">{order.deliveryAddress}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {selectedOrderIds.length > 0 && (
                      <div className="mt-4 p-3 bg-[#407CFF]/20 border border-[#407CFF]/50 rounded-lg">
                        <p className="text-sm text-[#cdcdcd]">
                          <span className="font-semibold text-white">Выбрано заказов:</span> {selectedOrderIds.length}
                        </p>
                        <p className="text-sm text-[#cdcdcd] mt-1">
                          <span className="font-semibold text-white">Общая сумма:</span>{' '}
                          <span className="text-[#407CFF] font-bold">
                            ¥{availableOrders
                              .filter(o => selectedOrderIds.includes(o.id))
                              .reduce((sum, o) => sum + (o.totalClientPrice || 0), 0)
                              .toFixed(2)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                      Описание (необязательно)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                      placeholder="Дополнительная информация о выкупе..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                      URL фотографии (необязательно)
                    </label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({ purchaseDate: '', description: '', photoUrl: '' });
                        setSelectedOrderIds([]);
                        setAvailableOrders([]);
                      }}
                      className="border-[#333] hover:border-[#555]"
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={selectedOrderIds.length === 0}
                      className="bg-gradient-to-r from-[#e81e2d] to-[#ff4757] hover:from-[#ff4757] hover:to-[#e81e2d] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Создать выкуп
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UpcomingPurchases;
