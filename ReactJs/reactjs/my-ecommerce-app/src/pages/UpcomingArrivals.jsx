import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function UpcomingArrivals() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showArrivedMinskModal, setShowArrivedMinskModal] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ photoUrl: '', description: '' });
  const [sortOrder, setSortOrder] = useState('default'); // Sorting state
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/batch-cargos/finished')
      .then((response) => {
        console.log('Fetched batches:', response.data);
        setBatches(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching batches:', error);
        setError('Ошибка загрузки прибытий: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      });
  }, []);

  // Sorting function
  const sortBatches = (batches, order) => {
    if (order === 'default') return batches;
    const statusPriority = {
      FINISHED: 1,
      ARRIVED_IN_MINSK: 2,
      COMPLETED: 3,
    };
    return [...batches].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 0;
      const priorityB = statusPriority[b.status] || 0;
      return order === 'asc' ? priorityA - priorityB : priorityB - priorityA;
    });
  };

  const handleViewBatch = async (batchId) => {
    try {
      setLoading(true);
      const response = await api.get(`/batch-cargos/${batchId}`);
      console.log('Batch details:', response.data);
      setSelectedBatch(response.data);
      setUpdateForm({
        photoUrl: response.data.photoUrl || '',
        description: response.data.description || ''
      });
    } catch (error) {
      console.error('Error fetching batch details:', error);
      setError('Ошибка загрузки деталей сборного груза: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBatch = async (batchId) => {
    try {
      const payload = {
        photoUrl: updateForm.photoUrl.trim() || null,
        description: updateForm.description.trim() || null,
        status: selectedBatch.status,
        reasonRefusal: selectedBatch.reasonRefusal
      };
      console.log('Sending update to /batch-cargos:', payload);
      const response = await api.put(`/batch-cargos/${batchId}`, payload);
      console.log('Update response:', response.data);
      alert('Сборный груз обновлён');
      setShowUpdateModal(false);
      const batchListResponse = await api.get('/batch-cargos/finished');
      setBatches(batchListResponse.data);
      const batchResponse = await api.get(`/batch-cargos/${batchId}`);
      setSelectedBatch(batchResponse.data);
      setUpdateForm({
        photoUrl: batchResponse.data.photoUrl || '',
        description: batchResponse.data.description || ''
      });
    } catch (error) {
      console.error('Error updating batch:', {
        message: error.message,
        code: error.code,
        response: error.response ? error.response.data : 'No response from server',
        status: error.response ? error.response.status : 'No status'
      });
      const errorMessage = error.response?.status === 403
        ? 'Доступ запрещён: проверьте авторизацию или права доступа'
        : error.response?.data?.message || error.message || 'Неизвестная ошибка';
      setError('Ошибка обновления сборного груза: ' + errorMessage);
    }
  };

  const handleArrivedInMinsk = async (batchId) => {
    setLoading(true);
    try {
      const response = await api.put(`/batch-cargos/${batchId}/arrived-minsk`);
      if (response?.data) {
        setSelectedBatch(response.data);
        const batchListResponse = await api.get('/batch-cargos/finished');
        setBatches(batchListResponse.data);
        alert('Сборный груз помечен как прибыл в Минск!');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Error marking batch as arrived in Minsk:', error);
      let errorMessage = 'Ошибка пометки сборного груза как прибыл в Минск';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте права доступа или токен авторизации.';
        } else if (error.response.status === 400) {
          errorMessage = 'Недопустимый статус груза для этой операции';
        } else if (error.response.status === 404) {
          errorMessage = 'Сборный груз не найден';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
        }
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowArrivedMinskModal(false);
    }
  };

  const handleDelivered = async (batchId) => {
    setLoading(true);
    try {
      const response = await api.put(`/batch-cargos/${batchId}/delivered`);
      if (response?.data) {
        setSelectedBatch(response.data);
        const batchListResponse = await api.get('/batch-cargos/finished');
        setBatches(batchListResponse.data);
        alert('Сборный груз помечен как доставлен покупателю!');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Error marking batch as delivered:', error);
      let errorMessage = 'Ошибка пометки сборного груза как доставлен покупателю';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте права доступа или токен авторизации.';
        } else if (error.response.status === 400) {
          errorMessage = 'Недопустимый статус груза для этой операции';
        } else if (error.response.status === 404) {
          errorMessage = 'Сборный груз не найден';

        } else {
          errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
        }
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowDeliveredModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setUpdateForm({ photoUrl: selectedBatch?.photoUrl || '', description: selectedBatch?.description || '' });
  };

  // Status-based styling
  const getStatusStyles = (status) => {
    switch (status) {
      case 'FINISHED':
        return 'border-l-4 border-yellow-500';
      case 'ARRIVED_IN_MINSK':
        return 'border-l-4 border-blue-500';
      case 'COMPLETED':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Ближайшие прибытия</h2>
      <div className="mb-4">
        <label className="mr-2 text-gray-300">Сортировка по статусу:</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg"
        >
          <option value="default">По умолчанию</option>
          <option value="asc">По возрастанию (FINISHED → COMPLETED)</option>
          <option value="desc">По убыванию (COMPLETED → FINISHED)</option>
        </select>
      </div>
      {!selectedBatch ? (
        <div className="grid grid-cols-1 gap-4">
          {sortBatches(batches, sortOrder).map((batch) => (
            <div key={batch.id} className={`bg-gray-700 p-4 rounded-lg shadow-md ${getStatusStyles(batch.status)}`}>
              <h3
                className="text-lg font-semibold text-[var(--accent-color)] cursor-pointer"
                onClick={() => handleViewBatch(batch.id)}
              >
                Сборный груз #{batch.id} - Дата выкупа: {new Date(batch.purchaseDate).toLocaleDateString()}
              </h3>
              <p className="text-sm text-gray-400">Статус: {batch.status}</p>
              <div className="flex flex-row gap-4 mt-2">
                <div className="w-1/3">
                  {batch.photoUrl ? (
                    <img
                      src={batch.photoUrl}
                      alt={`Сборный груз #${batch.id}`}
                      className="w-full max-w-xs rounded-md"
                    />
                  ) : (
                    <div className="w-full max-w-xs h-32 bg-gray-600 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">Нет фото</span>
                    </div>
                  )}
                </div>
                <div className="w-2/3">
                  {batch.description ? (
                    <p className="text-sm text-gray-300">Описание: {batch.description}</p>
                  ) : (
                    <p className="text-sm text-gray-400">Описание отсутствует</p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBatch(batch);
                    setUpdateForm({ photoUrl: batch.photoUrl || '', description: batch.description || '' });
                    setShowUpdateModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Обновить фото и описание
                </button>
                <button
                  onClick={() => {
                    setSelectedBatch(batch);
                    setShowArrivedMinskModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                  disabled={batch.status !== 'FINISHED'}
                >
                  Груз прибыл в Минск
                </button>
                <button
                  onClick={() => {
                    setSelectedBatch(batch);
                    setShowDeliveredModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200"
                  disabled={batch.status !== 'ARRIVED_IN_MINSK'}
                >
                  Груз доставлен покупателю
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`bg-gray-700 p-6 rounded-lg shadow-md ${getStatusStyles(selectedBatch.status)}`}>
          <button
            onClick={() => setSelectedBatch(null)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Назад к списку
          </button>
          <h3 className="text-2xl font-semibold text-[var(--accent-color)]">
            Сборный груз #{selectedBatch.id}
          </h3>
          <p className="text-sm text-gray-400">Дата создания: {new Date(selectedBatch.creationDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-400">Дата выкупа: {new Date(selectedBatch.purchaseDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-400">Статус: {selectedBatch.status}</p>
          {selectedBatch.reasonRefusal && (
            <p className="text-sm text-red-400">Причина отказа: {selectedBatch.reasonRefusal}</p>
          )}
          <div className="flex flex-row gap-4 mt-2">
            <div className="w-1/3">
              {selectedBatch.photoUrl ? (
                <img
                  src={selectedBatch.photoUrl}
                  alt={`Сборный груз #${selectedBatch.id}`}
                  className="w-full max-w-sm rounded-md"
                />
              ) : (
                <div className="w-full max-w-sm h-48 bg-gray-600 rounded-md flex items-center justify-center">
                  <span className="text-gray-400">Нет фото</span>
                </div>
              )}
            </div>
            <div className="w-2/3">
              {selectedBatch.description ? (
                <p className="text-sm text-gray-300">Описание: {selectedBatch.description}</p>
              ) : (
                <p className="text-sm text-gray-400">Описание отсутствует</p>
              )}
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Обновить фото и описание
            </button>
            <button
              onClick={() => setShowArrivedMinskModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              disabled={selectedBatch.status !== 'FINISHED'}
            >
              Груз прибыл в Минск
            </button>
            <button
              onClick={() => setShowDeliveredModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200"
              disabled={selectedBatch.status !== 'ARRIVED_IN_MINSK'}
            >
              Груз доставлен покупателю
            </button>
          </div>
          <h4 className="mt-4 text-xl font-semibold text-[var(--accent-color)]">Заказы</h4>
          <div className="grid grid-cols-1 gap-4 mt-2">
            {selectedBatch.orders && selectedBatch.orders.length > 0 ? (
              selectedBatch.orders.map((order) => (
                <div key={order.id} className="bg-gray-600 p-3 rounded-md">
                  <h5 className="text-md font-medium text-[var(--accent-color)]">
                    Заказ #{order.orderNumber}
                  </h5>
                  <p className="text-sm text-gray-400">Статус: {order.status}</p>
                  <p className="text-sm text-gray-400">Сумма: ¥{order.totalClientPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">Клиент: {order.userEmail}</p>
                  <p className="text-sm text-gray-400">Адрес доставки: {order.deliveryAddress}</p>
                  {order.reasonRefusal && (
                    <p className="text-sm text-red-400">Причина отказа: {order.reasonRefusal}</p>
                  )}
                  <h6 className="mt-2 text-sm font-medium text-[var(--accent-color)]">Товары</h6>
                  <div className="grid grid-cols-1 gap-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="bg-gray-500 p-2 rounded-md">
                        <h6 className="text-sm font-medium">{item.productName}</h6>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="mt-1 w-full max-w-xs rounded-md"
                          />
                        )}
                        <p className="text-xs text-gray-400">Количество: {item.quantity}</p>
                        <p className="text-xs text-gray-400">Цена: ¥{item.priceAtTime.toFixed(2)}</p>
                        {item.trackingNumber && (
                          <p className="text-xs text-gray-400">Трек-номер: {item.trackingNumber}</p>
                        )}
                        <p className="text-xs text-gray-400">Статус закупки: {item.purchaseStatus || 'PENDING'}</p>
                        {item.purchaseRefusalReason && (
                          <p className="text-xs text-red-400">Причина отказа: {item.purchaseRefusalReason}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-300">Описание: {item.description}</p>
                        )}
                        {item.url && (
                      <p className="text-sm text-gray-300 mb-1">Ссылка: {item.url}</p>
                    )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">Нет заказов</p>
            )}
          </div>
        </div>
      )}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">
              Обновить сборный груз #{selectedBatch.id}
            </h3>
            <label className="block text-sm font-medium text-gray-300">URL фото</label>
            <input
              type="text"
              value={updateForm.photoUrl}
              onChange={(e) => setUpdateForm({ ...updateForm, photoUrl: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg mb-4"
              placeholder="Введите URL фото"
            />
            <label className="block text-sm font-medium text-gray-300">Описание</label>
            <textarea
              value={updateForm.description}
              onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
              placeholder="Введите описание"
              rows="4"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleUpdateBatch(selectedBatch.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Сохранить
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {showArrivedMinskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Подтверждение</h3>
            <p className="text-sm text-gray-300 mb-4">Уверены ли вы, что груз прибыл в Минск?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleArrivedInMinsk(selectedBatch.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Да
              </button>
              <button
                onClick={() => setShowArrivedMinskModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeliveredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Подтверждение</h3>
            <p className="text-sm text-gray-300 mb-4">Точно ли груз доставлен покупателю?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleDelivered(selectedBatch.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Да
              </button>
              <button
                onClick={() => setShowDeliveredModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingArrivals;