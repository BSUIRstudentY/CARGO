import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Loading } from '../components/ui/Loading';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  GiftIcon,
  TruckIcon
} from '@heroicons/react/24/solid';

/**
 * Админ-панель для управления новостями
 */
const AdminNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'batch',
    status: 'active',
    imageUrl: ''
  });

  useEffect(() => {
    fetchNews();
  }, []);

  // Шаблоны автозаполнения для разных типов новостей
  const getTypeTemplate = (type) => {
    const templates = {
      batch: {
        title: 'Совместный выкуп - Закупка товаров из Китая',
        description: 'Присоединяйтесь к совместному выкупу! Мы объединяем заказы нескольких клиентов в одну партию, что значительно снижает стоимость доставки для каждого участника. Все заказы обрабатываются быстро и надежно.'
      },
      announcement: {
        title: 'Важное объявление',
        description: 'Уважаемые клиенты! Информируем вас об изменениях в работе нашего сервиса. Следите за обновлениями и новостями на нашем сайте.'
      },
      promotion: {
        title: 'Специальное предложение - Акция!',
        description: 'Не упустите возможность сэкономить! Только сейчас действует специальное предложение. Подробности акции и условия участия уточняйте у наших менеджеров.'
      },
      info: {
        title: 'Полезная информация',
        description: 'Мы подготовили для вас полезную информацию, которая поможет вам лучше использовать наш сервис. Ознакомьтесь с деталями и при необходимости обратитесь в нашу службу поддержки.'
      }
    };
    return templates[type] || templates.info;
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/crm/news?page=0&size=100');
      if (response.data && response.data.content) {
        setNewsList(response.data.content);
      } else if (Array.isArray(response.data)) {
        setNewsList(response.data);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Не удалось загрузить новости');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNews(null);
    const defaultTemplate = getTypeTemplate('batch');
    setFormData({
      title: defaultTemplate.title,
      description: defaultTemplate.description,
      type: 'batch',
      status: 'active',
      imageUrl: ''
    });
    setShowModal(true);
  };

  const handleEdit = (news) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      description: news.description,
      type: news.type,
      status: news.status,
      imageUrl: news.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/crm/news/${id}`);
      fetchNews();
    } catch (err) {
      console.error('Error deleting news:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await api.put(`/admin/crm/news/${editingNews.id}`, formData);
      } else {
        await api.post('/admin/crm/news', formData);
      }
      setShowModal(false);
      fetchNews();
    } catch (err) {
      console.error('Error saving news:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Активна', className: 'bg-green-500/20 text-green-300 border-green-500/50' },
      info: { text: 'Информация', className: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
      promo: { text: 'Акция', className: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
      completed: { text: 'Завершена', className: 'bg-gray-500/20 text-gray-300 border-gray-500/50' },
      draft: { text: 'Черновик', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' }
    };
    return badges[status] || badges.active;
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'batch':
        return <TruckIcon className="w-5 h-5" />;
      case 'announcement':
        return <InformationCircleIcon className="w-5 h-5" />;
      case 'promotion':
        return <GiftIcon className="w-5 h-5" />;
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  // Обработчик изменения типа новости
  const handleTypeChange = (newType) => {
    const template = getTypeTemplate(newType);
    // Всегда применяем шаблон при изменении типа, чтобы пользователь мог его скорректировать
    setFormData({
      ...formData,
      type: newType,
      title: template.title,
      description: template.description
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message="Загрузка новостей..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          kicker="Админ"
          title="Управление новостями"
          subtitle="Создание и редактирование новостей, объявлений и анонсов"
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-red-500/20 border border-red-500/50">
              <p className="text-red-300">{error}</p>
            </Card>
          </motion.div>
        )}

        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-[#e81e2d] to-[#ff4757] hover:from-[#ff4757] hover:to-[#e81e2d] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Создать новость
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {newsList.map((news, index) => {
            const badge = getStatusBadge(news.status);
            return (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-6 bg-[#1a1a1a] border border-[#333] hover:border-[#407CFF]/50 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getTypeIcon(news.type)}
                        <h3 className="text-xl font-bold text-white">{news.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                          {badge.text}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs bg-[#407CFF]/20 text-[#407CFF] border border-[#407CFF]/50">
                          {news.type === 'batch' ? 'Выкуп' : news.type === 'announcement' ? 'Объявление' : news.type === 'promotion' ? 'Акция' : 'Инфо'}
                        </span>
                      </div>
                      <p className="text-[#cdcdcd] mb-3">{news.description}</p>
                      <div className="flex items-center gap-4 text-sm text-[#808080]">
                        <span>Создано: {formatDate(news.createdAt)}</span>
                        {news.publishedAt && (
                          <span>Опубликовано: {formatDate(news.publishedAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleEdit(news)}
                        variant="outline"
                        className="p-2 border-[#333] hover:border-[#407CFF]"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(news.id)}
                        variant="outline"
                        className="p-2 border-[#333] hover:border-red-500 text-red-400"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {newsList.length === 0 && (
          <Card className="p-12 text-center">
            <InformationCircleIcon className="w-16 h-16 text-[#808080] mx-auto mb-4" />
            <p className="text-xl text-[#cdcdcd] mb-2">Новостей пока нет</p>
            <p className="text-[#808080]">Создайте первую новость</p>
          </Card>
        )}

        {/* Модальное окно создания/редактирования */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingNews ? 'Редактировать новость' : 'Создать новость'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-[#808080] hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                      Заголовок *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                      Описание *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                        Тип *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        required
                        className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                      >
                        <option value="batch">Совместный выкуп</option>
                        <option value="announcement">Объявление</option>
                        <option value="promotion">Акция</option>
                        <option value="info">Информация</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                        Статус *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                        className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                      >
                        <option value="active">Активна</option>
                        <option value="info">Информация</option>
                        <option value="promo">Акция</option>
                        <option value="completed">Завершена</option>
                        <option value="draft">Черновик</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                      URL изображения (необязательно)
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                      className="border-[#333] hover:border-[#555]"
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#e81e2d] to-[#ff4757] hover:from-[#ff4757] hover:to-[#e81e2d] text-white"
                    >
                      {editingNews ? 'Сохранить' : 'Создать'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminNews;

