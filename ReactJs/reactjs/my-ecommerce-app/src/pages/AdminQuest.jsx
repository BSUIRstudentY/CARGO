
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';

function AdminQuest() {
  const [quests, setQuests] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    questConditionType: 'INVITE',
    targetValue: '',
    rewardType: 'PERMANENT',
    reward: '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch all quests
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const response = await api.get('/quest');
        setQuests(response.data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить квесты');
        console.log(err);
      }
    };
    fetchQuests();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create new quest
  const handleCreateQuest = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const questData = {
        name: formData.name,
        questConditionType: formData.questConditionType,
        targetValue: parseInt(formData.targetValue),
        rewardType: formData.rewardType,
        reward: parseFloat(formData.reward),
      };

      const response = await api.post('/quest', questData);
      setQuests([...quests, { id: response.data.id || Date.now(), ...questData }]);
      setFormData({
        name: '',
        questConditionType: 'INVITE',
        targetValue: '',
        rewardType: 'PERMANENT',
        reward: '',
      });
      alert(response.data); // "Квест создан успешно"
    } catch (err) {
      setError(err.response?.data || 'Ошибка при создании квеста');
      console.log(err);
    } finally {
      setLoading(false);
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
          Управление квестами
        </h2>
      </motion.header>

      {/* Create Quest Form */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-xl border border-gray-700/50 backdrop-blur-sm mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Создать квест</h3>
        <form onSubmit={handleCreateQuest} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Название квеста</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Введите название"
              required
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Тип условия</label>
            <select
              name="questConditionType"
              value={formData.questConditionType}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="INVITE">Пригласи друга</option>
              <option value="PURCHASE">Соверши покупку</option>
              <option value="REVIEW">Оставь отзыв</option>
              <option value="SPENT">Потратить бонусы</option>
              <option value="QUANTITY_ORDER">Количество заказов</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Целевое значение</label>
            <input
              type="number"
              name="targetValue"
              value={formData.targetValue}
              onChange={handleInputChange}
              placeholder="Например, 5"
              required
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Тип награды</label>
            <select
              name="rewardType"
              value={formData.rewardType}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="PERMANENT">Постоянная скидка</option>
              <option value="TEMPORARY">Временная скидка</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Награда</label>
            <input
              type="number"
              name="reward"
              value={formData.reward}
              onChange={handleInputChange}
              placeholder="Процент или сумма"
              required
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
            {loading ? 'Создание...' : 'Создать квест'}
          </motion.button>
        </form>
      </motion.div>

      {/* Quest List */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-xl border border-gray-700/50 backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Список квестов</h3>
        {quests.length === 0 ? (
          <p className="text-gray-400">Квесты отсутствуют</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3">Название</th>
                  <th className="p-3">Тип условия</th>
                  <th className="p-3">Целевое значение</th>
                  <th className="p-3">Тип награды</th>
                  <th className="p-3">Награда</th>
                </tr>
              </thead>
              <tbody>
                {quests.map((quest) => (
                  <tr key={quest.id} className="border-b border-gray-700">
                    <td className="p-3">{quest.name}</td>
                    <td className="p-3">
                      {quest.questConditionType === 'INVITE' ? 'Пригласи друга' :
                       quest.questConditionType === 'PURCHASE' ? 'Соверши покупку' :
                       quest.questConditionType === 'REVIEW' ? 'Оставь отзыв' :
                       quest.questConditionType === 'SPENT' ? 'Потратить бонусы' :
                       'Количество заказов'}
                    </td>
                    <td className="p-3">{quest.targetValue}</td>
                    <td className="p-3">{quest.rewardType === 'PERMANENT' ? 'Постоянная скидка' : 'Временная скидка'}</td>
                    <td className="p-3">{quest.reward}</td>
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

export default AdminQuest;