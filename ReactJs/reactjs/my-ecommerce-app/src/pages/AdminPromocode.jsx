
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance'; // Import the custom api instance

function AdminPromocode() {
  const [promocodes, setPromocodes] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    userEmail: '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch all promocodes
  useEffect(() => {
    const fetchPromocodes = async () => {
      try {
        const response = await api.get('/promocodes');
        setPromocodes(response.data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить промокоды');
        console.log(err);
      }
    };
    fetchPromocodes();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create new promocode
  const handleCreatePromocode = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const promocodeData = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userEmail: formData.userEmail || null,
      };

      const response = await api.post('/promocodes', promocodeData);
      setPromocodes([...promocodes, { id: response.data.id || Date.now(), ...promocodeData }]);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        userEmail: '',
      });
      alert(response.data); // "Промокод создан успешно"
    } catch (err) {
      setError(err.response?.data || 'Ошибка при создании промокода');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle promocode active status
  const handleTogglePromocode = async (id) => {
    try {
      const response = await api.put(`/promocodes/${id}/toggle`);
      setPromocodes(
        promocodes.map((promo) =>
          promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
        )
      );
      alert(response.data); // "Статус промокода изменен на ..."
    } catch (err) {
      setError(err.response?.data || 'Ошибка при изменении статуса промокода');
      console.log(err);
    }
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-emerald-500">
          Управление промокодами
        </h2>
      </motion.header>

      {/* Create Promocode Form */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-xl border border-gray-700/50 backdrop-blur-sm mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Создать промокод</h3>
        <form onSubmit={handleCreatePromocode} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Код промокода</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Введите код"
              required
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Тип скидки</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="PERCENTAGE">Процент</option>
              <option value="FIXED">Фиксированная сумма</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Значение скидки</label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleInputChange}
              placeholder="Процент или сумма"
              required
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Действует с</label>
            <input
              type="datetime-local"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Действует до</label>
            <input
              type="datetime-local"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Лимит использований (опционально)</label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleInputChange}
              placeholder="Оставьте пустым для бесконечного"
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Email пользователя (опционально)</label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              placeholder="Оставьте пустым для общего промокода"
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
          {error && (
            <p className="text-red-500 text-center">{error}</p>
          )}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full p-3 rounded-lg text-white ${loading ? 'bg-gray-600' : 'bg-gradient-to-r from-[var(--accent-color)] to-emerald-500'} hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300`}
          >
            {loading ? 'Создание...' : 'Создать промокод'}
          </motion.button>
        </form>
      </motion.div>

      {/* Promocode List */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-xl border border-gray-700/50 backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Список промокодов</h3>
        {promocodes.length === 0 ? (
          <p className="text-gray-400">Промокоды отсутствуют</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3">Код</th>
                  <th className="p-3">Тип скидки</th>
                  <th className="p-3">Значение</th>
                  <th className="p-3">Действует с</th>
                  <th className="p-3">Действует до</th>
                  <th className="p-3">Лимит</th>
                  <th className="p-3">Использовано</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Статус</th>
                  <th className="p-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {promocodes.map((promo) => (
                  <tr key={promo.id} className="border-b border-gray-700">
                    <td className="p-3">{promo.code}</td>
                    <td className="p-3">{promo.discountType}</td>
                    <td className="p-3">{promo.discountValue}</td>
                    <td className="p-3">{new Date(promo.validFrom).toLocaleString()}</td>
                    <td className="p-3">{new Date(promo.validUntil).toLocaleString()}</td>
                    <td className="p-3">{promo.usageLimit || '∞'}</td>
                    <td className="p-3">{promo.usedCount}</td>
                    <td className="p-3">{promo.userEmail || 'Общий'}</td>
                    <td className="p-3">{promo.isActive ? 'Активен' : 'Неактивен'}</td>
                    <td className="p-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTogglePromocode(promo.id)}
                        className={`p-2 rounded-lg ${promo.isActive ? 'bg-red-600' : 'bg-green-600'} text-white hover:opacity-80 transition-all duration-200`}
                      >
                        {promo.isActive ? 'Деактивировать' : 'Активировать'}
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
}

export default AdminPromocode;