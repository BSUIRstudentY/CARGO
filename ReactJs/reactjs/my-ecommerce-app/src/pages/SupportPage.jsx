import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import api from '../api/axiosInstance';

// Utility: Format date in Russian locale
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Status mapping with colors and labels for consistent UI
const statusMap = {
  OPEN: { label: 'Ожидает ответа', color: 'yellow-300' },
  IN_PROGRESS: { label: 'В процессе', color: 'cyan-300' },
  CLOSED: { label: 'Решено', color: 'emerald-300' },
};

// Ticket Row Component: Clickable for preview, with actions
const TicketRow = ({ ticket, onOpenChat, onEdit, onPreview }) => {
  const { title, createdAt, admin, status, id } = ticket;
  const { label, color } = statusMap[status] || { label: 'Неизвестно', color: 'gray-300' };

  return (
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
      <motion.tr
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ backgroundColor: 'rgba(31, 41, 55, 0.5)', scale: 1.01 }}
        className="border-b border-gray-700/30 cursor-pointer"
        onClick={() => onPreview(ticket)}
      >
        <td className="px-6 py-4 text-gray-200 font-medium">{title}</td>
        <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(createdAt)}</td>
        <td className="px-6 py-4 text-gray-300 text-sm">{admin ? admin.username : 'Не назначен'}</td>
        <td className="px-6 py-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${color}/20 text-${color}`}>
            {label}
          </span>
        </td>
        <td className="px-6 py-4 flex space-x-3" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenChat(id)}
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition duration-300 font-medium shadow-sm"
          >
            Открыть чат
          </motion.button>
          {status !== 'CLOSED' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(ticket)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-300 font-medium shadow-sm"
            >
              Редактировать
            </motion.button>
          )}
        </td>
      </motion.tr>
    </Tilt>
  );
};

// Pagination Component: Simple numbered pages with navigation
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex justify-center space-x-2 mt-8"
    >
      {Array.from({ length: totalPages }, (_, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(index + 1)}
          className={`px-4 py-2 rounded-lg transition duration-200 font-medium ${
            currentPage === index + 1 ? 'bg-cyan-500 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'
          }`}
        >
          {index + 1}
        </motion.button>
      ))}
    </motion.div>
  );
};

// Loading Skeleton: For better UX during data fetch
const LoadingSkeleton = () => (
  <table className="w-full table-auto animate-pulse">
    <tbody>
      {Array.from({ length: 8 }).map((_, index) => (
        <tr key={index} className="border-b border-gray-700/30">
          <td className="px-6 py-4"><div className="h-4 bg-gray-700/80 rounded w-3/4"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-700/80 rounded w-1/2"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-700/80 rounded w-1/3"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-700/80 rounded w-1/4"></div></td>
          <td className="px-6 py-4"><div className="h-8 bg-gray-700/80 rounded w-32"></div></td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Error Message Component
const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-center items-center min-h-[400px] text-red-300 text-xl font-semibold bg-red-500/30 rounded-2xl p-8 border border-red-500/50"
  >
    {message}
  </motion.div>
);

// No Tickets Message
const NoTicketsMessage = () => (
  <tr>
    <td colSpan="5" className="text-center py-16 text-gray-300 text-lg font-medium">
      Нет запросов. Обновите страницу или измените фильтры.
    </td>
  </tr>
);

// Search and Filters Component: Enhanced with debounce for search
const SearchAndFilters = ({ searchTerm, onSearchChange, sortBy, onSortByChange, sortOrder, onSortOrderChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
  >
    <input
      type="text"
      placeholder="Поиск по заголовку, админу или статусу..."
      value={searchTerm}
      onChange={onSearchChange}
      className="w-full md:w-96 p-4 bg-gray-800/80 text-white border border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 shadow-sm"
    />
    <div className="flex space-x-4 w-full md:w-auto">
      <select
        value={sortBy}
        onChange={onSortByChange}
        className="p-4 bg-gray-800/80 text-white border border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 shadow-sm"
      >
        <option value="createdAt">По дате</option>
        <option value="title">По заголовку</option>
        <option value="status">По статусу</option>
        <option value="admin.username">По админу</option>
      </select>
      <select
        value={sortOrder}
        onChange={onSortOrderChange}
        className="p-4 bg-gray-800/80 text-white border border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 shadow-sm"
      >
        <option value="desc">Убывание</option>
        <option value="asc">Возрастание</option>
      </select>
    </div>
  </motion.div>
);

// Tabs Component: Adapted for user statuses
const Tabs = ({ activeTab, onTabChange, openCount, inProgressCount, closedCount }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="flex space-x-4 mb-8"
  >
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onTabChange('ALL')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-sm ${
        activeTab === 'ALL' ? 'bg-cyan-500 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'
      }`}
    >
      Все ({openCount + inProgressCount + closedCount})
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onTabChange('OPEN')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-sm ${
        activeTab === 'OPEN' ? 'bg-cyan-500 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'
      }`}
    >
      Открытые ({openCount})
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onTabChange('IN_PROGRESS')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-sm ${
        activeTab === 'IN_PROGRESS' ? 'bg-cyan-500 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'
      }`}
    >
      В процессе ({inProgressCount})
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onTabChange('CLOSED')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-sm ${
        activeTab === 'CLOSED' ? 'bg-cyan-500 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'
      }`}
    >
      Закрытые ({closedCount})
    </motion.button>
  </motion.div>
);

// Stats Dashboard Component: Adapted for user
const StatsDashboard = ({ openCount, inProgressCount, closedCount }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
  >
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
      <motion.div
        whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg text-center border border-cyan-500/30 hover:shadow-cyan-500/40 transition-all duration-300"
      >
        <h3 className="text-3xl font-bold text-yellow-300">{openCount}</h3>
        <p className="text-gray-300">Открытые</p>
      </motion.div>
    </Tilt>
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
      <motion.div
        whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg text-center border border-cyan-500/30 hover:shadow-cyan-500/40 transition-all duration-300"
      >
        <h3 className="text-3xl font-bold text-cyan-300">{inProgressCount}</h3>
        <p className="text-gray-300">В процессе</p>
      </motion.div>
    </Tilt>
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
      <motion.div
        whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg text-center border border-cyan-500/30 hover:shadow-cyan-500/40 transition-all duration-300"
      >
        <h3 className="text-3xl font-bold text-emerald-300">{closedCount}</h3>
        <p className="text-gray-300">Закрытые</p>
      </motion.div>
    </Tilt>
  </motion.div>
);

// Export CSV Feature
const ExportCSV = ({ data }) => {
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      data.map(row => Object.values(row).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tickets.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleExport}
      className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition duration-300 font-medium mb-8 shadow-sm"
    >
      Экспорт в CSV
    </motion.button>
  );
};

// Ticket Form Modal Component (for creation)
const TicketFormModal = ({ formVisible, setFormVisible, ticketForm, handleInputChange, formErrors, handleSubmitTicket }) => {
  if (!formVisible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
    >
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-cyan-500/30">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Создать новый запрос</h2>
        <form onSubmit={handleSubmitTicket} className="space-y-6">
          <div>
            <label className="block text-md font-medium text-gray-300 mb-2">Тема *</label>
            <input
              type="text"
              name="title"
              value={ticketForm.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-800/80 rounded-lg text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 ${
                formErrors.title ? 'border-red-500' : 'border-cyan-500/30'
              }`}
              placeholder="Краткое описание проблемы"
            />
            {formErrors.title && <p className="text-red-300 text-xs mt-1">{formErrors.title}</p>}
          </div>
          <div>
            <label className="block text-md font-medium text-gray-300 mb-2">Описание *</label>
            <textarea
              name="description"
              value={ticketForm.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-800/80 rounded-lg text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 ${
                formErrors.description ? 'border-red-500' : 'border-cyan-500/30'
              }`}
              rows="4"
              placeholder="Подробно опишите вашу проблему"
            />
            {formErrors.description && <p className="text-red-300 text-xs mt-1">{formErrors.description}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setFormVisible(false)}
              className="bg-gray-700/80 text-white px-6 py-3 rounded-lg hover:bg-gray-600/80 transition font-medium shadow-sm"
            >
              Отмена
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition font-medium shadow-sm"
            >
              Отправить
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// Edit Ticket Modal Component
const EditTicketModal = ({ formVisible, setFormVisible, ticketForm, handleInputChange, formErrors, handleUpdateTicket }) => {
  if (!formVisible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
    >
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-cyan-500/30">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Редактировать запрос</h2>
        <form onSubmit={handleUpdateTicket} className="space-y-6">
          <div>
            <label className="block text-md font-medium text-gray-300 mb-2">Тема *</label>
            <input
              type="text"
              name="title"
              value={ticketForm.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-800/80 rounded-lg text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 ${
                formErrors.title ? 'border-red-500' : 'border-cyan-500/30'
              }`}
              placeholder="Краткое описание проблемы"
            />
            {formErrors.title && <p className="text-red-300 text-xs mt-1">{formErrors.title}</p>}
          </div>
          <div>
            <label className="block text-md font-medium text-gray-300 mb-2">Описание *</label>
            <textarea
              name="description"
              value={ticketForm.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-800/80 rounded-lg text-white border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 ${
                formErrors.description ? 'border-red-500' : 'border-cyan-500/30'
              }`}
              rows="4"
              placeholder="Подробно опишите проблему"
            />
            {formErrors.description && <p className="text-red-300 text-xs mt-1">{formErrors.description}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setFormVisible(false)}
              className="bg-gray-700/80 text-white px-6 py-3 rounded-lg hover:bg-gray-600/80 transition font-medium shadow-sm"
            >
              Отмена
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition font-medium shadow-sm"
            >
              Сохранить
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// Main SupportPage Component
function SupportPage() {
  const [ticketForm, setTicketForm] = useState({ id: '', title: '', description: '' });
  const [editVisible, setEditVisible] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const email = localStorage.getItem('userEmail');
      if (email) {
        const response = await api.post('/tickets/user', { userId: email });
        setTickets(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        alert('Пожалуйста, войдите в систему для просмотра запросов.');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error.response ? error.response.data : error.message);
      setLoadError('Ошибка загрузки запросов. Попробуйте снова.');
      if (error.response?.status === 403 || error.response?.status === 401) {
        alert('Доступ запрещен. Пожалуйста, войдите в систему.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const closedCount = tickets.filter(t => t.status === 'CLOSED').length;

  // Filter tickets
  const filtered = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return tickets.filter(ticket => {
      if (activeTab !== 'ALL' && ticket.status !== activeTab) return false;
      return (
        ticket.title.toLowerCase().includes(lowerSearch) ||
        (ticket.admin && ticket.admin.username.toLowerCase().includes(lowerSearch)) ||
        statusMap[ticket.status]?.label.toLowerCase().includes(lowerSearch)
      );
    });
  }, [tickets, activeTab, searchTerm]);

  // Sort tickets
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = sortBy.includes('.') ? sortBy.split('.').reduce((o, i) => o ? o[i] : '', a) : a[sortBy];
      let valB = sortBy.includes('.') ? sortBy.split('.').reduce((o, i) => o ? o[i] : '', b) : b[sortBy];
      valA = typeof valA === 'string' ? valA.toLowerCase() : valA;
      valB = typeof valB === 'string' ? valB.toLowerCase() : valB;
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [filtered, sortBy, sortOrder]);

  // Paginate
  const paginated = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, page, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!ticketForm.title.trim()) newErrors.title = 'Тема обязательна';
    if (!ticketForm.description.trim()) newErrors.description = 'Описание обязательно';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newTicket = {
        title: ticketForm.title,
        description: ticketForm.description,
      };
      try {
        const response = await api.post('/tickets', newTicket);
        const savedTicket = response.data;
        setTickets((prev) => [savedTicket, ...prev]);
        setTicketForm({ id: '', title: '', description: '' });
        setCreateVisible(false);
        alert('Ваш запрос отправлен! Мы ответим в ближайшее время.');
      } catch (error) {
        console.error('Error submitting ticket:', error.response ? error.response.data : error.message);
        if (error.response?.status === 403 || error.response?.status === 401) {
          alert('Ошибка: Пожалуйста, войдите в систему для создания запроса.');
        } else {
          alert('Ошибка при отправке запроса: ' + (error.response?.data?.message || 'Попробуйте снова.'));
        }
      }
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await api.put(`/tickets/${ticketForm.id}`, ticketForm);
        loadTickets();
        setTicketForm({ id: '', title: '', description: '' });
        setEditVisible(false);
        alert('Запрос обновлен успешно!');
      } catch (error) {
        console.error('Error updating ticket:', error);
        alert('Ошибка при обновлении запроса.');
      }
    }
  };

  const openChat = useCallback((ticketId) => {
    navigate(`/ticket/${ticketId}/chat`);
  }, [navigate]);

  const openEdit = useCallback((ticket) => {
    setTicketForm({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description || '',
    });
    setEditVisible(true);
  }, []);

  const openPreview = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedTicket(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6 border-b border-gray-700/30 shadow-md"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight">
              Поддержка
            </h1>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreateVisible(true)}
                className="bg-cyan-500 text-white px-6 py-3 rounded-xl hover:bg-cyan-600 transition shadow-sm font-medium"
              >
                Создать запрос
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadTickets}
                className="bg-cyan-500 text-white px-6 py-3 rounded-xl hover:bg-cyan-600 transition shadow-sm font-medium"
              >
                Обновить
              </motion.button>
            </div>
          </div>
        </motion.header>
        <main className="py-12">
          <StatsDashboard openCount={openCount} inProgressCount={inProgressCount} closedCount={closedCount} />
          <Tabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            openCount={openCount}
            inProgressCount={inProgressCount}
            closedCount={closedCount}
          />
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            sortBy={sortBy}
            onSortByChange={(e) => setSortBy(e.target.value)}
            sortOrder={sortOrder}
            onSortOrderChange={(e) => setSortOrder(e.target.value)}
          />
          <ExportCSV data={sorted} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl shadow-xl border border-cyan-500/30 overflow-hidden"
          >
            <table className="w-full table-auto">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="px-6 py-4 text-left text-cyan-400 font-bold text-lg">Заголовок</th>
                  <th className="px-6 py-4 text-left text-cyan-400 font-bold text-lg">Дата</th>
                  <th className="px-6 py-4 text-left text-cyan-400 font-bold text-lg">Админ</th>
                  <th className="px-6 py-4 text-left text-cyan-400 font-bold text-lg">Статус</th>
                  <th className="px-6 py-4 text-left text-cyan-400 font-bold text-lg">Действия</th>
                </tr>
              </thead>
              {isLoading ? (
                <LoadingSkeleton />
              ) : loadError ? (
                <ErrorMessage message={loadError} />
              ) : paginated.length > 0 ? (
                <tbody>
                  {paginated.map((ticket, index) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onOpenChat={openChat}
                      onEdit={openEdit}
                      onPreview={openPreview}
                    />
                  ))}
                </tbody>
              ) : (
                <NoTicketsMessage />
              )}
            </table>
          </motion.div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <AnimatePresence>
            {showModal && selectedTicket && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              >
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-cyan-500/30">
                  <h3 className="text-3xl font-bold text-cyan-400 mb-6">{selectedTicket.title}</h3>
                  <p className="text-gray-300 mb-3"><strong>Дата создания:</strong> {formatDate(selectedTicket.createdAt)}</p>
                  <p className="text-gray-300 mb-3"><strong>Администратор:</strong> {selectedTicket.admin ? selectedTicket.admin.username : 'Не назначен'}</p>
                  <p className="text-gray-300 mb-3"><strong>Статус:</strong> {statusMap[selectedTicket.status].label}</p>
                  <p className="text-gray-300 mb-6 line-clamp-4">Описание: {selectedTicket.description || 'Нет описания'}</p>
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeModal}
                      className="bg-gray-700/80 text-white px-6 py-3 rounded-lg hover:bg-gray-600/80 transition font-medium shadow-sm"
                    >
                      Закрыть
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openChat(selectedTicket.id)}
                      className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition font-medium shadow-sm"
                    >
                      Открыть чат
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="py-6 border-t border-gray-700/30 text-center text-gray-300 text-sm"
        >
          <p>© 2025 ChinaShopBY. Все права защищены.</p>
          <p className="mt-1 text-cyan-400 animate-pulse">Обновлено: 12.08.2025</p>
        </motion.footer>
        <TicketFormModal
          formVisible={createVisible}
          setFormVisible={setCreateVisible}
          ticketForm={ticketForm}
          handleInputChange={handleInputChange}
          formErrors={formErrors}
          handleSubmitTicket={handleSubmitTicket}
        />
        <EditTicketModal
          formVisible={editVisible}
          setFormVisible={setEditVisible}
          ticketForm={ticketForm}
          handleInputChange={handleInputChange}
          formErrors={formErrors}
          handleUpdateTicket={handleUpdateTicket}
        />
      </div>
    </div>
  );
}

export default SupportPage;