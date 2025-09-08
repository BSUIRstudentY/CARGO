import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { TruckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';

const BatchCargosTab = ({ userEmail }) => {
  const [batchCargos, setBatchCargos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBatchCargos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/batch-cargos/departure');
      // Ensure orders array exists for each batch cargo
      const sanitizedData = response.data.map((batch) => ({
        ...batch,
        orders: Array.isArray(batch.orders) ? batch.orders : [],
      }));
      setBatchCargos(sanitizedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching batch cargos:', error);
      let errorMessage = 'Ошибка загрузки грузов';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте интернет-соединение.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Доступ запрещён (403). Проверьте токен.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchBatchCargos();
    }
  }, [userEmail]);

  const handleViewBatchCargoDetails = (batchId) => {
    navigate(`/batch-cargo-details/${batchId}`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[var(--accent-color)]" />
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 shadow-xl border border-gray-700/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6 relative z-10">Отправления</h2>
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center relative z-10"
        >
          {error}
          <button
            onClick={fetchBatchCargos}
            className="ml-4 px-3 py-1 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300"
          >
            <ArrowPathIcon className="w-5 h-5 inline mr-1" />
            Повторить
          </button>
        </motion.div>
      )}
      {!loading && batchCargos.length === 0 && !error ? (
        <p className="text-center text-gray-400 text-lg relative z-10">
          Нет заказов, включённых в сборные грузы.
        </p>
      ) : (
        <div className="grid gap-4">
          {batchCargos.map((batch) => (
            <Tilt key={batch.id} tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleViewBatchCargoDetails(batch.id)}
                className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border border-gray-600 p-4 transition-all duration-300 hover:shadow-[0_0_15px_#10b981] cursor-pointer relative z-10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-6 h-6 text-[var(--accent-color)]" />
                    <h3 className="text-xl font-semibold text-white">
                      Груз #{batch.id}
                    </h3>
                  </div>
                  
                </div>
                <p className="text-gray-300 mt-2">
                  <strong>Дата создания:</strong> {new Date(batch.creationDate).toLocaleDateString()}
                </p>
                <p className="text-gray-300">
                  <strong>Дата закупки:</strong> {new Date(batch.purchaseDate).toLocaleDateString()}
                </p>
                <p className="text-gray-300">
                  <strong>Статус:</strong>{' '}
                  <span
                    className={
                      batch.status === 'UNFINISHED' ? 'text-yellow-300' : 'text-emerald-300'
                    }
                  >
                    {batch.status === 'UNFINISHED' ? 'В процессе' : 'Завершён'}
                  </span>
                </p>
                <p className="text-gray-300">
                  <strong>Заказов:</strong> {(batch.orders || []).length}
                </p>
              </motion.div>
            </Tilt>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchCargosTab;