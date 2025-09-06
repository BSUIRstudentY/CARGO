import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/batch-cargos/${id}`)
      .then((response) => {
        setBatch(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Ошибка загрузки сборного груза');
        setLoading(false);
      });
  }, [id]);

  const handleProcessOrder = (orderId) => {
    navigate(`/admin/upcoming-purchases/${id}/order/${orderId}`);
  };

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!batch) return <p className="text-center text-gray-400">Сборный груз не найден</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">
        Сборный груз #{batch.id} - Дата выкупа: {new Date(batch.purchaseDate).toLocaleDateString()}
      </h2>
      <p className="text-lg mb-4">Статус: {batch.status}</p>
      <div className="grid grid-cols-1 gap-4">
        {batch.orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => handleProcessOrder(order.id)}
          >
            <h3 className="text-lg font-semibold text-[var(--accent-color)]">
              Заказ #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-400">Статус: {order.status}</p>
            <p className="text-sm text-gray-400">Сумма: ¥{order.totalClientPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Клиент: {order.userEmail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BatchDetail;