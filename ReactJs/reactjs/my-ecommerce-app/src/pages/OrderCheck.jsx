import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function OrderCheck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/orders/${id}`);
      if (response.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
      } else {
        setError('Данные заказа не найдены');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Ошибка загрузки заказа: ' + (error.response?.status === 403 ? 'Доступ запрещён (403). Убедитесь, что вы авторизованы как ADMIN и токен валиден.' : error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedOrder.deliveryAddress || !editedOrder.totalClientPrice) {
      setError('Укажите адрес доставки и общую цену');
      return;
    }
    try {
      console.log('Sending order:', JSON.stringify(editedOrder, null, 2));
      const response = await api.put(`/orders/${id}`, editedOrder);
      alert('Заказ обновлён!');
      setOrder(response.data);
      setEditedOrder(response.data);
      navigate('/admin/orders');
    } catch (error) {
      console.error('Error saving order:', error);
      setError('Ошибка сохранения заказа: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [name]: value,
      };
      return { ...prev, items: newItems };
    });
  };

  const handleItemEdit = (item) => {
    setSelectedItem({ ...item }); // Открываем модальное окно с копией элемента
  };

  const handleItemSave = () => {
    if (selectedItem) {
      setEditedOrder((prev) => {
        const newItems = [...prev.items];
        const itemIndex = newItems.findIndex((item) => item.productId === selectedItem.productId);
        if (itemIndex !== -1) {
          newItems[itemIndex] = { ...selectedItem }; // Обновляем элемент в списке
        }
        return { ...prev, items: newItems };
      });
      setSelectedItem(null); // Закрываем модальное окно
    }
  };

  const handleItemCancel = () => {
    setSelectedItem(null); // Закрываем модальное окно без сохранения
  };

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!order) return <p className="text-center text-gray-400">Заказ не найден</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Проверка заказа #{editedOrder.orderNumber}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Основная информация о заказе */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Дата создания</label>
            <input
              type="text"
              name="dateCreated"
              value={editedOrder.dateCreated ? new Date(editedOrder.dateCreated).toLocaleString() : ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Статус</label>
            <input
              type="text"
              name="status"
              value={editedOrder.status || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Общая цена для клиента (¥)</label>
            <input
              type="number"
              name="totalClientPrice"
              value={editedOrder.totalClientPrice || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Адрес доставки</label>
            <input
              type="text"
              name="deliveryAddress"
              value={editedOrder.deliveryAddress || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Трек-номер</label>
            <input
              type="text"
              name="trackingNumber"
              value={editedOrder.trackingNumber || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email клиента</label>
            <input
              type="text"
              name="userEmail"
              value={editedOrder.userEmail || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
        </div>

        {/* Сетка товаров */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Товары в заказе</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {editedOrder.items.map((item, index) => (
              <div
                key={index}
                className="bg-gray-600 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleItemEdit(item)}
              >
                <div className="w-full h-32 overflow-hidden rounded-md mb-2">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName || 'Товар'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-500 flex items-center justify-center text-sm text-gray-300">
                      Нет фото
                    </div>
                  )}
                </div>
                <h4 className="text-md font-medium">{item.productName || 'Без названия'}</h4>
                <p className="text-sm text-gray-400">¥{(typeof item.priceAtTime === 'number' ? item.priceAtTime : 0).toFixed(2)} x {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно для редактирования товара */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Редактирование товара</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">ID товара</label>
                <input
                  type="text"
                  name="productId"
                  value={selectedItem.productId || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Название товара</label>
                <input
                  type="text"
                  name="productName"
                  value={selectedItem.productName || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL товара</label>
                <input
                  type="text"
                  name="url"
                  value={selectedItem.url || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL изображения</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={selectedItem.imageUrl || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Цена на момент заказа (¥)</label>
                <input
                  type="number"
                  name="priceAtTime"
                  value={selectedItem.priceAtTime || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, priceAtTime: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Количество</label>
                <input
                  type="number"
                  name="quantity"
                  value={selectedItem.quantity || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Описание</label>
                <input
                  type="text"
                  name="description"
                  value={selectedItem.description || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleItemSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleItemCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          disabled={!editedOrder.deliveryAddress || !editedOrder.totalClientPrice}
        >
          Сохранить изменения
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Назад
        </button>
      </div>
      {error && <p className="text-center text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default OrderCheck;