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
      await api.put(`/orders/${id}`, editedOrder);
      alert('Заказ обновлён!');
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
      newItems[index] = { ...newItems[index], [name]: value };
      return { ...prev, items: newItems };
    });
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!order) return <p>Заказ не найден</p>;

  return (
    <div className="p-6 bg-gray-700 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Проверка заказа #{editedOrder.orderNumber}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Номер заказа</label>
          <input
            type="text"
            name="orderNumber"
            value={editedOrder.orderNumber || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Дата создания</label>
          <input
            type="text"
            name="dateCreated"
            value={editedOrder.dateCreated ? new Date(editedOrder.dateCreated).toLocaleString() : ''}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
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
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Общая цена для клиента</label>
          <input
            type="number"
            name="totalClientPrice"
            value={editedOrder.totalClientPrice || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Стоимость у поставщика</label>
          <input
            type="number"
            name="supplierCost"
            value={editedOrder.supplierCost || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Пошлина</label>
          <input
            type="number"
            name="customsDuty"
            value={editedOrder.customsDuty || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Стоимость доставки</label>
          <input
            type="number"
            name="shippingCost"
            value={editedOrder.shippingCost || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Адрес доставки</label>
          <input
            type="text"
            name="deliveryAddress"
            value={editedOrder.deliveryAddress || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
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
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Email клиента</label>
          <input
            type="text"
            name="userEmail"
            value={editedOrder.userEmail || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded"
            disabled
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-2">Товары в заказе</h3>
          {editedOrder.items && editedOrder.items.map((item, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">Название товара</label>
                <input
                  type="text"
                  name="productName"
                  value={item.productName || ''}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL товара</label>
                <input
                  type="text"
                  name="url"
                  value={item.url || ''}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL изображения</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={item.imageUrl || ''}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Цена на момент заказа</label>
                <input
                  type="number"
                  name="priceAtTime"
                  value={item.priceAtTime || ''}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Количество</label>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity || ''}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Описание</label>
                <input
                  type="text"
                  name="description"
                  value={item.description || ''}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={!editedOrder.deliveryAddress || !editedOrder.totalClientPrice}
        >
          Сохранить изменения
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-4 ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Назад
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}

export default OrderCheck;