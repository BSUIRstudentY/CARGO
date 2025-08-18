import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  OPEN: { label: 'Ожидает ответа', color: 'yellow' },
  IN_PROGRESS: { label: 'В процессе', color: 'blue' },
  CLOSED: { label: 'Решено', color: 'green' },
};

// Ticket Row Component: Clickable for preview, with actions
const TicketRow = ({ ticket, onOpenChat, onEdit, onPreview }) => {
  const { title, createdAt, admin, status, id } = ticket;
  const { label, color } = statusMap[status] || { label: 'Неизвестно', color: 'gray' };

  return (
    <tr 
      className="border-b border-gray-700/50 hover:bg-gray-700/50 transition duration-200 cursor-pointer"
      onClick={() => onPreview(ticket)}
    >
      <td className="px-6 py-4 text-gray-200 font-medium">{title}</td>
      <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(createdAt)}</td>
      <td className="px-6 py-4 text-gray-500 text-sm">{admin ? admin.username : 'Не назначен'}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${color}-500/20 text-${color}-300`}
        >
          {label}
        </span>
      </td>
      <td className="px-6 py-4 flex space-x-3" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenChat(id)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
        >
          Открыть чат
        </button>
        {status !== 'CLOSED' && (
          <button
            onClick={() => onEdit(ticket)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
          >
            Редактировать
          </button>
        )}
      </td>
    </tr>
  );
};

// Pagination Component: Simple numbered pages with navigation
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center space-x-2 mt-8">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`px-4 py-2 rounded-lg transition duration-200 font-medium ${
            currentPage === index + 1 ? 'bg-[var(--accent-color)] text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};

// Loading Skeleton: For better UX during data fetch
const LoadingSkeleton = () => (
  <table className="w-full table-auto animate-pulse">
    <tbody>
      {Array.from({ length: 8 }).map((_, index) => (
        <tr key={index} className="border-b border-gray-700/50">
          <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-3/4"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-1/3"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-1/4"></div></td>
          <td className="px-6 py-4"><div className="h-8 bg-gray-700 rounded w-32"></div></td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Error Message Component
const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center min-h-[400px] text-red-400 text-xl font-semibold bg-red-900/20 rounded-2xl p-8">
    {message}
  </div>
);

// No Tickets Message
const NoTicketsMessage = () => (
  <tr>
    <td colSpan="5" className="text-center py-16 text-gray-400 text-lg font-medium">
      Нет запросов. Обновите страницу или измените фильтры.
    </td>
  </tr>
);

// Search and Filters Component: Enhanced with debounce for search
const SearchAndFilters = ({ searchTerm, onSearchChange, sortBy, onSortByChange, sortOrder, onSortOrderChange }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
    <input
      type="text"
      placeholder="Поиск по заголовку, админу или статусу..."
      value={searchTerm}
      onChange={onSearchChange}
      className="w-full md:w-96 p-4 bg-gray-800 text-white border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-200 shadow-sm"
    />
    <div className="flex space-x-4 w-full md:w-auto">
      <select
        value={sortBy}
        onChange={onSortByChange}
        className="p-4 bg-gray-800 text-white border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-200 shadow-sm"
      >
        <option value="createdAt">По дате</option>
        <option value="title">По заголовку</option>
        <option value="status">По статусу</option>
        <option value="admin.username">По админу</option>
      </select>
      <select
        value={sortOrder}
        onChange={onSortOrderChange}
        className="p-4 bg-gray-800 text-white border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-200 shadow-sm"
      >
        <option value="desc">Убывание</option>
        <option value="asc">Возрастание</option>
      </select>
    </div>
  </div>
);

// Tabs Component: Adapted for user statuses
const Tabs = ({ activeTab, onTabChange, openCount, inProgressCount, closedCount }) => (
  <div className="flex space-x-4 mb-8 animate-fade-in">
    <button
      onClick={() => onTabChange('ALL')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-md ${activeTab === 'ALL' ? 'bg-[var(--accent-color)] text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      Все ({openCount + inProgressCount + closedCount})
    </button>
    <button
      onClick={() => onTabChange('OPEN')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-md ${activeTab === 'OPEN' ? 'bg-[var(--accent-color)] text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      Открытые ({openCount})
    </button>
    <button
      onClick={() => onTabChange('IN_PROGRESS')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-md ${activeTab === 'IN_PROGRESS' ? 'bg-[var(--accent-color)] text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      В процессе ({inProgressCount})
    </button>
    <button
      onClick={() => onTabChange('CLOSED')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-md ${activeTab === 'CLOSED' ? 'bg-[var(--accent-color)] text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      Закрытые ({closedCount})
    </button>
  </div>
);

// Stats Dashboard Component: Adapted for user
const StatsDashboard = ({ openCount, inProgressCount, closedCount }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h3 className="text-3xl font-bold text-yellow-300">{openCount}</h3>
      <p className="text-gray-400">Открытые</p>
    </div>
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h3 className="text-3xl font-bold text-blue-300">{inProgressCount}</h3>
      <p className="text-gray-400">В процессе</p>
    </div>
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h3 className="text-3xl font-bold text-green-300">{closedCount}</h3>
      <p className="text-gray-400">Закрытые</p>
    </div>
  </div>
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
    <button 
      onClick={handleExport}
      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-medium mb-8"
    >
      Экспорт в CSV
    </button>
  );
};

// Ticket Form Modal Component (for creation)
const TicketFormModal = ({ formVisible, setFormVisible, ticketForm, handleInputChange, formErrors, handleSubmitTicket }) => {
  if (!formVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-[var(--accent-color)]/30">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Создать новый запрос</h2>
        <form onSubmit={handleSubmitTicket} className="space-y-6">
          <div>
            <label className="block text-md font-medium text-gray-300 mb-2">Тема *</label>
            <input
              type="text"
              name="title"
              value={ticketForm.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
                formErrors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Краткое описание проблемы"
            />
            {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
          </div>
          <div>
            <label className="block text-md font-medium text-gray-300 mb-2">Описание *</label>
            <textarea
              name="description"
              value={ticketForm.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
                formErrors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              rows="4"
              placeholder="Подробно опишите вашу проблему"
            />
            {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setFormVisible(false)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-[var(--accent-color)] text-gray-900 px-6 py-3 rounded-lg hover:opacity-90 transition font-medium"
            >
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Ticket Modal Component
const EditTicketModal = ({ formVisible, setFormVisible, ticketForm, handleInputChange, formErrors, handleUpdateTicket }) => {
  if (!formVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-[var(--accent-color)]/30">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Редактировать запрос</h2>
        <form onSubmit={handleUpdateTicket} className="space-y-6">
          <div>
            <label className="block text-md font-medium text-gray-300 mb-2">Тема *</label>
            <input
              type="text"
              name="title"
              value={ticketForm.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
                formErrors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Краткое описание проблемы"
            />
            {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
          </div>
          <div>
            <label className="block text-md font-medium text-gray-300 mb-2">Описание *</label>
            <textarea
              name="description"
              value={ticketForm.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
                formErrors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              rows="4"
              placeholder="Подробно опишите проблему"
            />
            {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setFormVisible(false)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-[var(--accent-color)] text-gray-900 px-6 py-3 rounded-lg hover:opacity-90 transition font-medium"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <div className=" mx-auto max-w-7xl min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background pattern */}
      

      <header className="py-6 border-b border-gray-700/30 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-4xl font-extrabold text-[var(--accent-color)] tracking-tight">Поддержка</h1>
          <div className="flex space-x-4">
            <button onClick={() => setCreateVisible(true)} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition shadow-sm font-medium">
              Создать запрос
            </button>
            <button onClick={loadTickets} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition shadow-sm font-medium">
              Обновить
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <StatsDashboard 
          openCount={openCount} 
          inProgressCount={inProgressCount} 
          closedCount={closedCount} 
        />

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

        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700/30 overflow-hidden animate-fade-in">
          <table className="w-full table-auto">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-4 text-left text-[var(--accent-color)] font-bold text-lg">Заголовок</th>
                <th className="px-6 py-4 text-left text-[var(--accent-color)] font-bold text-lg">Дата</th>
                <th className="px-6 py-4 text-left text-[var(--accent-color)] font-bold text-lg">Админ</th>
                <th className="px-6 py-4 text-left text-[var(--accent-color)] font-bold text-lg">Статус</th>
                <th className="px-6 py-4 text-left text-[var(--accent-color)] font-bold text-lg">Действия</th>
              </tr>
            </thead>
            {isLoading ? (
              <LoadingSkeleton />
            ) : loadError ? (
              <ErrorMessage message={loadError} />
            ) : paginated.length > 0 ? (
              <tbody>
                {paginated.map(ticket => (
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
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Modal Preview */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-[var(--accent-color)]/30">
              <h3 className="text-3xl font-bold text-[var(--accent-color)] mb-6">{selectedTicket.title}</h3>
              <p className="text-gray-300 mb-3"><strong>Дата создания:</strong> {formatDate(selectedTicket.createdAt)}</p>
              <p className="text-gray-300 mb-3"><strong>Администратор:</strong> {selectedTicket.admin ? selectedTicket.admin.username : 'Не назначен'}</p>
              <p className="text-gray-300 mb-3"><strong>Статус:</strong> {statusMap[selectedTicket.status].label}</p>
              <p className="text-gray-400 mb-6 line-clamp-4">Описание: {selectedTicket.description || 'Нет описания'}</p>
              <div className="flex justify-end space-x-4">
                <button onClick={closeModal} className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium">
                  Закрыть
                </button>
                <button onClick={() => openChat(selectedTicket.id)} className="bg-[var(--accent-color)] text-gray-900 px-6 py-3 rounded-lg hover:opacity-90 transition font-medium">
                  Открыть чат
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-gray-700/30 mt-12 text-center text-gray-500 text-sm">
        <p>© 2025 ChinaShopBY. Все права защищены.</p>
        <p className="mt-1 text-[var(--accent-color)] animate-pulse">Обновлено: 12.08.2025</p>
      </footer>

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
  );
}

// Styles: Adapted from admin
const styles = `
/* Root vars */
:root {
  --accent-color: #f97316; /* Orange accent matching site theme */
}

/* Gradients and backgrounds */
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #111827, #1f2937, #374151);
}

/* Table headers */
.table-auto th {
  background-color: #374151;
  color: var(--accent-color);
}

/* Hover effects */
.hover\\:bg-gray-700\\/50:hover {
  background-color: rgba(55, 65, 81, 0.5);
}

/* Pulse animation for loading */
.animate-pulse div {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Fade-in animation */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Shadows */
.shadow-xl {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Transitions */
.transition {
  transition: all 0.2s ease-in-out;
}

/* Focus rings */
.focus\\:ring-2:focus {
  box-shadow: 0 0 0 2px var(--accent-color);
}

/* Rounded corners */
.rounded-2xl {
  border-radius: 1rem;
}
.rounded-xl {
  border-radius: 0.75rem;
}

/* Fonts */
.font-extrabold {
  font-weight: 800;
}
.font-bold {
  font-weight: 700;
}
.font-medium {
  font-weight: 500;
}
.text-lg {
  font-size: 1.125rem;
}
.text-xl {
  font-size: 1.25rem;
}
.text-2xl {
  font-size: 1.5rem;
}
.text-3xl {
  font-size: 1.875rem;
}
.text-4xl {
  font-size: 2.25rem;
}

/* Status colors */
.bg-yellow-500\\/20 { background-color: rgba(234, 179, 8, 0.2); }
.text-yellow-300 { color: #fde68a; }
.bg-blue-500\\/20 { background-color: rgba(59, 130, 246, 0.2); }
.text-blue-300 { color: #93c5fd; }
.bg-green-500\\/20 { background-color: rgba(34, 197, 94, 0.2); }
.text-green-300 { color: #86efac; }
.bg-purple-600 { background-color: #7c3aed; }
.hover\\:bg-purple-700:hover { background-color: #6d28d9; }

/* Modal */
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.bg-black\\/70 { background-color: rgba(0, 0, 0, 0.7); }
.z-50 { z-index: 50; }
.max-w-lg { max-width: 32rem; }
.w-full { width: 100%; }
.line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

/* Responsive grids */
@media (min-width: 768px) {
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:flex-row { flex-direction: row; }
  .md\\:items-center { align-items: center; }
  .md\\:w-96 { width: 24rem; }
  .md\\:w-auto { width: auto; }
}

/* Spacing utilities */
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mt-8 { margin-top: 2rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
.space-x-3 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.75rem; }
.space-x-4 > :not([hidden]) ~ :not([hidden]) { margin-left: 1rem; }
.justify-between { justify-content: space-between; }
.items-start { align-items: flex-start; }

/* Cursor */
.cursor-pointer { cursor: pointer; }

/* Overflow */
.overflow-hidden { overflow: hidden; }

/* Footer */
.border-t { border-top-width: 1px; }
.mt-12 { margin-top: 3rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.text-center { text-align: center; }
.text-sm { font-size: 0.875rem; }
.mt-1 { margin-bottom: 0.25rem; }
.animate-pulse { animation: pulse 1.5s infinite; }
`;

// Append styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default SupportPage;