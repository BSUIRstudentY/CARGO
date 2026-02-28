import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { Loading } from '../components/ui/Loading';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

const AdminCRMTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/crm/tickets');
      setTickets(response.data || []);
    } catch (err) {
      setError('Ошибка загрузки тикетов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    try {
      await api.put(`/admin/crm/tickets/${selectedTicket.id}/assign`, { adminEmail });
      setShowAssignModal(false);
      setAdminEmail('');
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.put(`/admin/crm/tickets/${ticketId}/status`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      case 'IN_PROGRESS':
        return <CheckCircleIcon className="w-5 h-5 text-blue-400" />;
      case 'CLOSED':
        return <XCircleIcon className="w-5 h-5 text-green-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      CLOSED: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (loading) {
    return <Loading message="Загрузка тикетов..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Управление тикетами</h1>
        <p className="text-gray-400">Просмотр и управление тикетами поддержки</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-[#1a1a1a] border-2 ${getStatusColor(ticket.status)}`}>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <span className="text-white font-semibold">Тикет #{ticket.id}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <UserIcon className="w-4 h-4" />
                    <span>{ticket.user?.email || 'Неизвестный пользователь'}</span>
                  </div>
                  {ticket.admin && (
                    <div className="text-gray-400 text-sm">
                      Админ: {ticket.admin.email}
                    </div>
                  )}
                  <p className="text-white text-sm line-clamp-2">
                    {ticket.subject || ticket.description || 'Без описания'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  {!ticket.admin && (
                    <Button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowAssignModal(true);
                      }}
                      className="flex-1 text-xs"
                    >
                      Назначить админа
                    </Button>
                  )}
                  {ticket.status !== 'CLOSED' && (
                    <Button
                      onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                      variant="secondary"
                      className="flex-1 text-xs"
                    >
                      Закрыть
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Модальное окно назначения админа */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">Назначить админа</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email админа"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#333333] rounded text-white"
              />
              <div className="flex gap-2">
                <Button onClick={handleAssign} className="flex-1">Назначить</Button>
                <Button onClick={() => setShowAssignModal(false)} variant="secondary" className="flex-1">
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

export default AdminCRMTickets;




