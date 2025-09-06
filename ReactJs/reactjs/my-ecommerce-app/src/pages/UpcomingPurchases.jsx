import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function UpcomingPurchases() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/batch-cargos/unfinished')
      .then((response) => {
        setBatches(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Ошибка загрузки выкупов');
        setLoading(false);
      });
  }, []);

  const handleCreateBatch = async () => {
    if (!purchaseDate) {
      alert('Выберите дату выкупа');
      return;
    }
    try {
      const response = await api.post('/batch-cargos', { purchaseDate: new Date(purchaseDate) });
      alert('Сборный груз создан');
      setShowCreateModal(false);
      navigate(`/admin/upcoming-purchases/${response.data.id}`);
    } catch (error) {
      setError('Ошибка создания сборного груза');
    }
  };

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Ближайшие выкупы</h2>
      <button
        onClick={() => setShowCreateModal(true)}
        className="mb-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 text-xl font-bold"
      >
        Создать сборный груз
      </button>
      <div className="grid grid-cols-1 gap-4">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => navigate(`/admin/upcoming-purchases/${batch.id}`)}
          >
            <h3 className="text-lg font-semibold text-[var(--accent-color)]">
              Сборный груз #{batch.id} - Дата выкупа: {new Date(batch.purchaseDate).toLocaleDateString()}
            </h3>
            <p className="text-sm text-gray-400">Статус: {batch.status}</p>
          </div>
        ))}
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Создать сборный груз</h3>
            <label className="block text-sm font-medium text-gray-300">Дата выкупа</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCreateBatch}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Создать
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingPurchases;