import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Button } from '../components/ui/Button';

// Utility: Format date in Russian locale (handles both array and string formats)
const formatDate = (dateValue) => {
  if (!dateValue) return 'Дата неизвестна';
  
  let date;
  
  // Если это массив (LocalDateTime из Java)
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    date = new Date(year, month - 1, day, hour, minute, second);
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else {
    date = new Date(dateValue);
  }
  
  // Проверяем валидность даты
  if (isNaN(date.getTime())) {
    return 'Дата неизвестна';
  }
  
  return date.toLocaleString('ru-RU', {
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

// Ticket Row Component: Упрощенная версия - только открыть чат
const TicketRow = ({ ticket, onOpenChat }) => {
  const { title, createdAt, admin, status } = ticket;
  const { label, color } = statusMap[status] || { label: 'Неизвестно', color: 'gray-300' };

  return (
    <tr className="border-b border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <td className="px-3 py-2 sm:px-6 sm:py-4 text-[#e5e7eb] font-medium text-sm sm:text-base">{title}</td>
      <td className="px-3 py-2 sm:px-6 sm:py-4 text-[#9ca3af] text-xs sm:text-sm">{formatDate(createdAt)}</td>
      <td className="px-3 py-2 sm:px-6 sm:py-4 text-[#9ca3af] text-xs sm:text-sm">{admin ? admin.username : 'Не назначен'}</td>
      <td className="px-3 py-2 sm:px-6 sm:py-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${color}/20 text-${color}`}>
          {label}
        </span>
      </td>
      <td className="px-3 py-2 sm:px-6 sm:py-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onOpenChat(ticket.id)}
        >
          Открыть чат
        </Button>
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
        <Button
          key={index}
          variant={currentPage === index + 1 ? "primary" : "ghost"}
          size="sm"
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </Button>
      ))}
    </div>
  );
};

// Loading Skeleton: For better UX during data fetch
const LoadingSkeleton = () => (
  <tbody>
    {Array.from({ length: 8 }).map((_, index) => (
      <tr key={index} className="border-b border-[rgba(255,255,255,0.1)]">
        <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-4 bg-[rgba(255,255,255,0.02)] rounded w-3/4 animate-pulse"></div></td>
        <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-4 bg-[rgba(255,255,255,0.02)] rounded w-1/2 animate-pulse"></div></td>
        <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-4 bg-[rgba(255,255,255,0.02)] rounded w-1/3 animate-pulse"></div></td>
        <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-4 bg-[rgba(255,255,255,0.02)] rounded w-1/4 animate-pulse"></div></td>
        <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-8 bg-[rgba(255,255,255,0.02)] rounded w-32 animate-pulse"></div></td>
      </tr>
    ))}
  </tbody>
);

// Error Message Component
const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center min-h-[400px] text-[#ef4444] text-xl font-semibold bg-[rgba(239,68,68,0.1)] rounded-2xl p-8 border border-[rgba(239,68,68,0.3)]">
    {message}
  </div>
);

// No Tickets Message
const NoTicketsMessage = () => (
  <tr>
    <td colSpan="5" className="text-center py-16 text-[#9ca3af] text-lg font-medium">
      Нет запросов. Обновите страницу или измените фильтры.
    </td>
  </tr>
);

// Search Component
const SearchAndFilters = ({ searchTerm, onSearchChange }) => (
  <div className="mb-6">
    <input
      type="text"
      placeholder="Поиск по заголовку, админу или статусу..."
      value={searchTerm}
      onChange={onSearchChange}
      className="w-full md:w-96 px-4 py-3 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] rounded-xl focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/30 transition duration-300 placeholder-[#9ca3af]"
    />
  </div>
);



// Ticket Form Modal Component (for creation) - упрощенная версия
const TicketFormModal = ({ formVisible, setFormVisible, ticketForm, handleInputChange, formErrors, handleSubmitTicket }) => {
  if (!formVisible) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={() => setFormVisible(false)}
    >
      <div
        className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-4 sm:p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-[#e5e7eb] mb-4 sm:mb-6">Создать запрос</h2>
        <form onSubmit={handleSubmitTicket} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#9ca3af] mb-1.5 sm:mb-2">Тема *</label>
            <input
              type="text"
              name="title"
              value={ticketForm.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border rounded-xl focus:outline-none transition duration-300 placeholder-[#9ca3af] ${
                formErrors.title ? 'border-[#ef4444] focus:ring-[#ef4444]/30' : 'border-[rgba(255,255,255,0.1)] focus:border-[#00f0ff] focus:ring-[#00f0ff]/30'
              }`}
              placeholder="Краткое описание проблемы"
            />
            {formErrors.title && <p className="text-[#ef4444] text-xs mt-1">{formErrors.title}</p>}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#9ca3af] mb-1.5 sm:mb-2">Описание *</label>
            <textarea
              name="description"
              value={ticketForm.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border rounded-xl focus:outline-none resize-none transition duration-300 placeholder-[#9ca3af] ${
                formErrors.description ? 'border-[#ef4444] focus:ring-[#ef4444]/30' : 'border-[rgba(255,255,255,0.1)] focus:border-[#00f0ff] focus:ring-[#00f0ff]/30'
              }`}
              rows="5"
              placeholder="Подробно опишите вашу проблему"
            />
            {formErrors.description && <p className="text-[#ef4444] text-xs mt-1">{formErrors.description}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormVisible(false)}
              className="px-4 py-2 sm:px-6 sm:py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] text-sm sm:text-base rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 sm:px-6 sm:py-2 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] text-sm sm:text-base rounded-xl hover:bg-[rgba(0,240,255,0.15)] transition-colors font-semibold"
            >
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main SupportPage Component
function SupportPage() {
  const [ticketForm, setTicketForm] = useState({ title: '', description: '' });
  const [tickets, setTickets] = useState([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const email = localStorage.getItem('userEmail');
      if (email) {
        const response = await api.post('/tickets/user', { userId: email });
        // Helper to normalize date for sorting
        const normalizeDateForSort = (dateValue) => {
          if (!dateValue) return new Date(0);
          if (Array.isArray(dateValue)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
            return new Date(year, month - 1, day, hour, minute, second);
          }
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? new Date(0) : date;
        };
        
        setTickets(response.data.sort((a, b) => {
          const dateA = normalizeDateForSort(a.createdAt);
          const dateB = normalizeDateForSort(b.createdAt);
          return dateB.getTime() - dateA.getTime(); // Свежие выше (desc)
        }));
      }
    } catch (error) {
      console.error('Error fetching tickets:', error.response ? error.response.data : error.message);
      setLoadError('Ошибка загрузки запросов. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Filter tickets
  const filtered = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return tickets.filter(ticket => {
      return (
        ticket.title.toLowerCase().includes(lowerSearch) ||
        (ticket.admin && ticket.admin.username.toLowerCase().includes(lowerSearch)) ||
        statusMap[ticket.status]?.label.toLowerCase().includes(lowerSearch)
      );
    });
  }, [tickets, searchTerm]);

  // Helper function to normalize date (handles both array and string formats)
  const normalizeDate = (dateValue) => {
    if (!dateValue) return new Date(0);
    
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? new Date(0) : date;
  };

  // Sort tickets - всегда по дате, самые свежие выше
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dateA = normalizeDate(a.createdAt);
      const dateB = normalizeDate(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Свежие выше (desc)
    });
  }, [filtered]);

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
        setTicketForm({ title: '', description: '' });
        setCreateVisible(false);
      } catch (error) {
        console.error('Error submitting ticket:', error.response ? error.response.data : error.message);
      }
    }
  };

  const openChat = useCallback((ticketId) => {
    navigate(`/ticket/${ticketId}/chat`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-1.5 sm:mb-2">
              <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                Поддержка
              </span>
            </h1>
            <p className="text-[#9ca3af] text-sm sm:text-lg">Создавайте запросы и отслеживайте их статус</p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="primary"
              onClick={() => setCreateVisible(true)}
              className="flex items-center gap-2"
            >
              Создать запрос
            </Button>
            <Button
              variant="outline"
              onClick={loadTickets}
              className="flex items-center gap-2"
            >
              Обновить
            </Button>
          </div>
        </div>
        <main className="py-8">
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-[rgba(255,255,255,0.02)]">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-[#e5e7eb] font-bold text-sm sm:text-lg border-b border-[rgba(255,255,255,0.1)]">Заголовок</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-[#e5e7eb] font-bold text-sm sm:text-lg border-b border-[rgba(255,255,255,0.1)]">Дата</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-[#e5e7eb] font-bold text-sm sm:text-lg border-b border-[rgba(255,255,255,0.1)]">Админ</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-[#e5e7eb] font-bold text-sm sm:text-lg border-b border-[rgba(255,255,255,0.1)]">Статус</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-4 text-left text-[#e5e7eb] font-bold text-sm sm:text-lg border-b border-[rgba(255,255,255,0.1)]">Действия</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <LoadingSkeleton />
                ) : loadError ? (
                  <tbody>
                    <tr>
                      <td colSpan="5">
                        <ErrorMessage message={loadError} />
                      </td>
                    </tr>
                  </tbody>
                ) : paginated.length > 0 ? (
                  <tbody>
                    {paginated.map((ticket, index) => (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        onOpenChat={openChat}
                      />
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <NoTicketsMessage />
                  </tbody>
                )}
              </table>
            </div>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </main>
        <TicketFormModal
          formVisible={createVisible}
          setFormVisible={setCreateVisible}
          ticketForm={ticketForm}
          handleInputChange={handleInputChange}
          formErrors={formErrors}
          handleSubmitTicket={handleSubmitTicket}
        />
      </div>
    </div>
  );
}

export default SupportPage;