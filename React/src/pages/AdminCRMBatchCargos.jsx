import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { Loading } from '../components/ui/Loading';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  TruckIcon,
  EyeIcon
} from '@heroicons/react/24/solid';

const AdminCRMBatchCargos = () => {
  const navigate = useNavigate();
  const [batchCargos, setBatchCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchBatchCargos();
  }, []);

  const fetchBatchCargos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/crm/batch-cargos');
      setBatchCargos(response.data || []);
    } catch (err) {
      setError('Ошибка загрузки батч-карго');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/admin/crm/batch-cargos/${selectedBatch.id}/status`, { status: newStatus });
      setShowStatusModal(false);
      setNewStatus('');
      fetchBatchCargos();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      UNFINISHED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      FINISHED: 'bg-green-500/20 text-green-400 border-green-500/30',
      IN_TRANSIT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      AT_CUSTOMS: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      REFUSED: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (loading) {
    return <Loading message="Загрузка батч-карго..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Управление батч-карго</h1>
        <p className="text-gray-400">Просмотр и управление батч-карго</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batchCargos.map((batch, index) => (
          <motion.div
            key={batch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-[#1a1a1a] border-2 ${getStatusColor(batch.status)}`}>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-[#e81e2d]" />
                    <span className="text-white font-semibold">Батч #{batch.id}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="text-gray-400">
                    Создан: {batch.creationDate ? new Date(batch.creationDate).toLocaleDateString() : '-'}
                  </div>
                  <div className="text-gray-400">
                    Выкуп: {batch.purchaseDate ? new Date(batch.purchaseDate).toLocaleDateString() : '-'}
                  </div>
                  {batch.batchTrackingNumber && (
                    <div className="text-gray-300">
                      Трек: {batch.batchTrackingNumber}
                    </div>
                  )}
                  {batch.orders && (
                    <div className="text-gray-300">
                      Заказов: {batch.orders.length}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => navigate(`/admin/upcoming-purchases/${batch.id}`)}
                    className="flex-1 text-xs"
                  >
                    <EyeIcon className="w-4 h-4 inline mr-1" />
                    Детали
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedBatch(batch);
                      setNewStatus(batch.status);
                      setShowStatusModal(true);
                    }}
                    variant="secondary"
                    className="flex-1 text-xs"
                  >
                    Статус
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Модальное окно изменения статуса */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">Изменить статус</h2>
            <div className="space-y-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded text-white"
              >
                <option value="UNFINISHED">UNFINISHED</option>
                <option value="FINISHED">FINISHED</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="AT_CUSTOMS">AT_CUSTOMS</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="REFUSED">REFUSED</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleUpdateStatus} className="flex-1">Сохранить</Button>
                <Button onClick={() => setShowStatusModal(false)} variant="secondary" className="flex-1">
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

export default AdminCRMBatchCargos;




