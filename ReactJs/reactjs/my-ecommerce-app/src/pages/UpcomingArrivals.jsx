import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

function UpcomingArrivals() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/batch-cargos/finished')
      .then((response) => {
        setBatches(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Ошибка загрузки прибытий');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Ближайшие прибытия</h2>
      <div className="grid grid-cols-1 gap-4">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="bg-gray-700 p-4 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold text-[var(--accent-color)]">
              Сборный груз #{batch.id} - Дата выкупа: {new Date(batch.purchaseDate).toLocaleDateString()}
            </h3>
            <p className="text-sm text-gray-400">Статус: {batch.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingArrivals;