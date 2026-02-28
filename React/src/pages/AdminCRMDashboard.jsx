import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { Loading } from '../components/ui/Loading';
import { Card } from '../components/ui/Card';
import {
  UserGroupIcon,
  ShoppingBagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  TicketIcon,
  TruckIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/solid';

const AdminCRMDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchRevenueStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/crm/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError('Ошибка загрузки статистики');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const response = await api.get('/admin/crm/dashboard/revenue?days=30');
      setRevenueStats(response.data);
    } catch (err) {
      console.error('Ошибка загрузки статистики доходов:', err);
    }
  };

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats?.totalUsers || 0,
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-500',
      path: '/admin/crm/users'
    },
    {
      title: 'Всего заказов',
      value: stats?.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: 'from-green-500 to-emerald-500',
      path: '/admin/crm/orders'
    },
    {
      title: 'Товары',
      value: stats?.totalProducts || 0,
      icon: CubeIcon,
      color: 'from-purple-500 to-pink-500',
      path: '/admin/crm/products'
    },
    {
      title: 'Доходы',
      value: revenueStats ? `$${revenueStats.totalRevenue.toFixed(2)}` : '$0',
      icon: CurrencyDollarIcon,
      color: 'from-yellow-500 to-orange-500',
      path: '/admin/crm/orders'
    },
    {
      title: 'Тикеты',
      value: stats?.totalTickets || 0,
      icon: TicketIcon,
      color: 'from-red-500 to-rose-500',
      path: '/admin/crm/tickets'
    },
    {
      title: 'Батч-карго',
      value: stats?.totalBatchCargos || 0,
      icon: TruckIcon,
      color: 'from-indigo-500 to-blue-500',
      path: '/admin/crm/batch-cargos'
    }
  ];

  const statusCards = [
    {
      title: 'Ожидающие заказы',
      value: stats?.pendingOrders || 0,
      color: 'text-yellow-400'
    },
    {
      title: 'Оплаченные заказы',
      value: stats?.paidOrders || 0,
      color: 'text-green-400'
    },
    {
      title: 'Завершенные заказы',
      value: stats?.completedOrders || 0,
      color: 'text-blue-400'
    },
    {
      title: 'Отмененные заказы',
      value: stats?.cancelledOrders || 0,
      color: 'text-red-400'
    }
  ];

  if (loading) {
    return <Loading message="Загрузка дашборда..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">CRM Панель управления</h1>
        <p className="text-gray-400">Общая статистика и управление системой</p>
      </motion.div>

      {/* Основные статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(card.path)}
            className="cursor-pointer"
          >
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#333333] hover:border-[#e81e2d] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} opacity-80`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Статусы заказов */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-[#1a1a1a] border border-[#333333]">
          <h2 className="text-xl font-bold text-white mb-4">Статусы заказов</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusCards.map((card) => (
              <div key={card.title} className="text-center">
                <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-[#1a1a1a] border border-[#333333]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-[#e81e2d]" />
              Статистика товаров
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Активные товары</span>
                <span className="text-white font-semibold">{stats?.activeProducts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ожидающие товары</span>
                <span className="text-white font-semibold">{stats?.pendingProducts || 0}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-[#1a1a1a] border border-[#333333]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-6 h-6 text-[#e81e2d]" />
              Финансовая статистика
            </h2>
            <div className="space-y-3">
              {revenueStats && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Средний чек</span>
                    <span className="text-white font-semibold">
                      ${revenueStats.averageOrderValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Количество заказов</span>
                    <span className="text-white font-semibold">{revenueStats.orderCount}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCRMDashboard;

