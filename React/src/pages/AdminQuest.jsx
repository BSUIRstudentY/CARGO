import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';

function AdminQuest() {
  const [quests, setQuests] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    questConditionType: 'INVITE',
    targetValue: '',
    rewardType: 'PERMANENT',
    reward: '',
    telegramChannelLink: '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch all quests
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const response = await api.get('/admin/crm/quests');
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

  // === ДИНАМИЧЕСКОЕ ОПИСАНИЕ — ВСЕГДА ПЕРЕЗАПИСЫВАЕТСЯ ===
  const getDefaultDescription = () => {
    const type = formData.questConditionType;
    const target = formData.targetValue || 'X';
    const link = formData.telegramChannelLink || 'https://t.me/yourchannel';

    switch (type) {
      case 'INVITE':
        return `Пригласите ${target} ${target === '1' ? 'друга' : 'друзей'} по вашей реферальной ссылке. Каждый успешно приглашенный друг, который зарегистрируется и совершит первую покупку, будет засчитан в прогресс квеста. Награда начисляется автоматически после выполнения.`;
      case 'PURCHASE':
        return `Совершите ${target} ${target === '1' ? 'покупку' : 'покупок'} на любую сумму в нашем магазине. Каждая завершенная покупка (оплаченный заказ) автоматически добавит 1 к прогрессу. Награда начисляется сразу по завершении квеста.`;
      case 'REVIEW':
        return `Оставьте ${target} ${target === '1' ? 'отзыв' : 'отзывов'} на успешно выполненные заказы. Отзыв должен быть опубликован в личном кабинете после получения заказа. Каждый подтвержденный отзыв добавит 1 к прогрессу. Награда активируется автоматически.`;
      case 'SPENT':
        return `Потратьте не менее ${target} бонусов на покупки в магазине. Бонусы тратятся при оплате заказов, и сумма расходов будет отслеживаться автоматически. По достижении цели награда начислится мгновенно.`;
      case 'QUANTITY_ORDER':
        return `Совершите ${target} ${target === '1' ? 'заказ' : 'заказов'} в нашем сервисе. Каждый новый оплаченный и доставленный заказ засчитывается как 1. Квест завершается автоматически, и вы получите награду без дополнительных действий.`;
      case 'TELEGRAM':
        return `Подпишитесь на наш официальный Telegram-канал (${link}). Подтверждение подписки происходит автоматически при загрузке страницы канала. Это разовый квест — выполните один раз, чтобы получить награду сразу!`;
      default:
        return 'Опишите, как пользователь может выполнить этот квест...';
    }
  };

  // ПЕРЕЗАПИСЫВАЕМ description ПРИ ЛЮБОЙ СМЕНЕ: типа, значения, ссылки
  useEffect(() => {
    setFormData(prev => ({ ...prev, description: getDefaultDescription() }));
  }, [formData.questConditionType, formData.targetValue, formData.telegramChannelLink]);

  // === КОНЕЦ ===

  // Create new quest
  const handleCreateQuest = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const finalDescription = formData.description.trim() || getDefaultDescription();

      const questData = {
        name: formData.name,
        description: finalDescription,
        questConditionType: formData.questConditionType,
        targetValue: parseInt(formData.targetValue),
        rewardType: formData.rewardType,
        reward: parseFloat(formData.reward),
      };

      const response = await api.post('/admin/crm/quests', questData);
      setQuests([...quests, { id: response.data.id || Date.now(), ...questData }]);
      setFormData({
        name: '',
        description: '',
        questConditionType: 'INVITE',
        targetValue: '',
        rewardType: 'PERMANENT',
        reward: '',
        telegramChannelLink: '',
      });
    } catch (err) {
      setError(err.response?.data || 'Ошибка при создании квеста');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const isTelegramQuest = formData.questConditionType === 'TELEGRAM';

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
              className="select-dark w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Тип условия</label>
            <select
              name="questConditionType"
              value={formData.questConditionType}
              onChange={handleInputChange}
              className="select-dark w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="INVITE">Пригласи друга</option>
              <option value="PURCHASE">Соверши покупку</option>
              <option value="REVIEW">Оставь отзыв</option>
              <option value="SPENT">Потратить бонусы</option>
              <option value="QUANTITY_ORDER">Количество заказов</option>
              <option value="TELEGRAM">Подписка на Telegram</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Целевое значение</label>
            <input
              type="number"
              name="targetValue"
              value={formData.targetValue}
              onChange={handleInputChange}
              placeholder="Например, 5 (для TELEGRAM — обычно 1)"
              required
              min="1"
              className="select-dark w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>

          {isTelegramQuest && (
            <div>
              <label className="text-sm font-medium text-gray-300">Ссылка на Telegram-канал</label>
              <input
                type="url"
                name="telegramChannelLink"
                value={formData.telegramChannelLink}
                onChange={handleInputChange}
                placeholder="https://t.me/yourchannel"
                required={isTelegramQuest}
                className="select-dark w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-300">Описание (как выполнять квест)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Описание обновляется автоматически при смене типа, значения или ссылки"
              required
              rows="5"
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] resize-none placeholder:text-gray-500"
            />
            <p className="text-xs text-yellow-400 mt-1">
              Внимание: Описание перезаписывается при любом изменении типа, значения или ссылки!
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Тип награды</label>
            <select
              name="rewardType"
              value={formData.rewardType}
              onChange={handleInputChange}
              className="select-dark w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="PERMANENT">Постоянная скидка</option>
              <option value="TEMPORARY">Временная скидка</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Награда (%)</label>
            <input
              type="number"
              name="reward"
              value={formData.reward}
              onChange={handleInputChange}
              placeholder="Например, 5"
              required
              step="0.01"
              min="0"
              className="select-dark w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

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
                  <th className="p-3 max-w-xs">Описание</th>
                  <th className="p-3">Тип награды</th>
                  <th className="p-3">Награда (%)</th>
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
                       quest.questConditionType === 'QUANTITY_ORDER' ? 'Количество заказов' :
                       quest.questConditionType === 'TELEGRAM' ? 'Подписка на Telegram' : 'Неизвестно'}
                    </td>
                    <td className="p-3">{quest.targetValue}</td>
                    <td className="p-3 max-w-xs truncate" title={quest.description}>{quest.description || '-'}</td>
                    <td className="p-3">{quest.rewardType === 'PERMANENT' ? 'Постоянная скидка' : 'Временная скидка'}</td>
                    <td className="p-3">{quest.reward}%</td>
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