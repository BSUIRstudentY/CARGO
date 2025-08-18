import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Ticket Row Component: Now clickable for preview, with actions
const TicketRow = ({ ticket, onOpenChat, onAssign, onPreview, activeTab }) => {
  const { title, createdAt, admin, status, id } = ticket;
  const { label, color } = statusMap[status] || { label: 'Неизвестно', color: 'gray' };

  return (
    <tr 
      className="border-b border-gray-700/50 hover:bg-gray-700/50 transition duration-200 cursor-pointer"
      onClick={() => onPreview(ticket)} // Make row clickable for modal preview
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
        {activeTab === 'available' && status === 'OPEN' && (
          <button
            onClick={() => onAssign(id)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
          >
            Принять
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
      {Array.from({ length: 8 }).map((_, index) => ( // Increased for more realism
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

// Tabs Component: With counts and animation
const Tabs = ({ activeTab, onTabChange, assignedCount, availableCount }) => (
  <div className="flex space-x-4 mb-8 animate-fade-in">
    <button
      onClick={() => onTabChange('my')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-md ${activeTab === 'my' ? 'bg-[var(--accent-color)] text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      Мои ({assignedCount})
    </button>
    <button
      onClick={() => onTabChange('available')}
      className={`flex-1 px-6 py-4 rounded-xl transition-colors duration-200 font-bold text-lg shadow-md ${activeTab === 'available' ? 'bg-[var(--accent-color)] text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      Доступные ({availableCount})
    </button>
  </div>
);

// Stats Dashboard Component: New addition for overview
const StatsDashboard = ({ assignedCount, availableCount, totalOpen, totalInProgress, totalClosed }) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h3 className="text-3xl font-bold text-[var(--accent-color)]">{assignedCount}</h3>
      <p className="text-gray-400">Мои запросы</p>
    </div>
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h3 className="text-3xl font-bold text-[var(--accent-color)]">{availableCount}</h3>
      <p className="text-gray-400">Доступные</p>
    </div>
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h3 className="text-3xl font-bold text-yellow-300">{totalOpen}</h3>
      <p className="text-gray-400">Открытые</p>
    </div>
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h3 className="text-3xl font-bold text-blue-300">{totalInProgress}</h3>
      <p className="text-gray-400">В процессе</p>
    </div>
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h3 className="text-3xl font-bold text-green-300">{totalClosed}</h3>
      <p className="text-gray-400">Закрытые</p>
    </div>
  </div>
);

// Export CSV Feature: New button to download data
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

// Theme Toggle: Simple dark/light mode switch (requires CSS vars setup)
const ThemeToggle = ({ theme, onThemeChange }) => (
  <button 
    onClick={onThemeChange}
    className="fixed top-4 right-4 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition"
  >
    {theme === 'dark' ? 'Светлый режим' : 'Темный режим'}
  </button>
);

// Main AdminSupportPage Component
function AdminSupportPage() {
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('my');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10); // Reduced for more pages
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState('dark'); // New theme state
  const navigate = useNavigate();

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const assigned = await api.get('/tickets/assigned');
        const available = await api.get('/tickets');
        setAssignedTickets(assigned.data);
        setAvailableTickets(available.data);
      } catch (err) {
        setError('Ошибка загрузки. Проверьте соединение.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Assign ticket handler
  const handleAssign = useCallback(async (ticketId) => {
    try {
      await api.post('/tickets/assign', { ticketId });
      // Refresh data
      const assigned = await api.get('/tickets/assigned');
      const available = await api.get('/tickets');
      setAssignedTickets(assigned.data);
      setAvailableTickets(available.data);
    } catch (err) {
      console.error('Assign error:', err);
    }
  }, []);

  // Open chat handler
  const openChat = useCallback((ticketId) => {
    navigate(`/admin/support/ticket/${ticketId}/chat`);
  }, [navigate]);

  // Preview handler
  const openPreview = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedTicket(null);
  }, []);

  // Theme change
  const handleThemeChange = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Compute tickets based on tab
  const tickets = useMemo(() => activeTab === 'my' ? assignedTickets : availableTickets, [activeTab, assignedTickets, availableTickets]);

  // Filter tickets
  const filtered = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return tickets.filter(ticket => 
      ticket.title.toLowerCase().includes(lowerSearch) ||
      (ticket.admin && ticket.admin.username.toLowerCase().includes(lowerSearch)) ||
      statusMap[ticket.status]?.label.toLowerCase().includes(lowerSearch)
    );
  }, [tickets, searchTerm]);

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

  // Compute stats for dashboard
  const allTickets = [...assignedTickets, ...availableTickets];
  const totalOpen = allTickets.filter(t => t.status === 'OPEN').length;
  const totalInProgress = allTickets.filter(t => t.status === 'IN_PROGRESS').length;
  const totalClosed = allTickets.filter(t => t.status === 'CLOSED').length;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden ${theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900' : ''}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-repeat" style={{ backgroundImage: `url('data:image/svg+xml,...')` }} /> {/* shortened */}

      <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />

      <header className="py-6 border-b border-gray-700/30 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-4xl font-extrabold text-[var(--accent-color)] tracking-tight">Техподдержка Админ</h1>
          <button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition shadow-sm font-medium">
            Обновить
          </button>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <StatsDashboard 
          assignedCount={assignedTickets.length} 
          availableCount={availableTickets.length} 
          totalOpen={totalOpen}
          totalInProgress={totalInProgress}
          totalClosed={totalClosed}
        />

        <Tabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          assignedCount={assignedTickets.length} 
          availableCount={availableTickets.length} 
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
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : paginated.length > 0 ? (
              <tbody>
                {paginated.map(ticket => (
                  <TicketRow 
                    key={ticket.id} 
                    ticket={ticket} 
                    onOpenChat={openChat} 
                    onAssign={handleAssign} 
                    onPreview={openPreview}
                    activeTab={activeTab} 
                  />
                ))}
              </tbody>
            ) : (
              <NoTicketsMessage />
            )}
          </table>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Modal Preview: Enhanced with more details */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-[var(--accent-color)]/30">
              <h3 className="text-3xl font-bold text-[var(--accent-color)] mb-6">{selectedTicket.title}</h3>
              <p className="text-gray-300 mb-3"><strong>Дата создания:</strong> {formatDate(selectedTicket.createdAt)}</p>
              <p className="text-gray-300 mb-3"><strong>Администратор:</strong> {selectedTicket.admin ? selectedTicket.admin.username : 'Не назначен'}</p>
              <p className="text-gray-300 mb-3"><strong>Статус:</strong> {statusMap[selectedTicket.status].label}</p>
              <p className="text-gray-400 mb-6 line-clamp-4">Описание: {selectedTicket.description || 'Нет описания'}</p> {/* Assume description field */}
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
    </div>
  );
}

// Styles: Extended for new features, animations, and responsiveness
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

/* Light theme overrides */
.light .bg-gradient-to-br { background: linear-gradient(to bottom right, #f3f4f6, #e5e7eb); }
.light .text-white { color: #111827; }
.light .bg-gray-800 { background-color: #f9fafb; }
.light .border-gray-700\\/30 { border-color: rgba(209, 213, 219, 0.3); }
.light .text-gray-300 { color: #4b5563; }
.light .text-gray-400 { color: #6b7280; }
.light .text-gray-500 { color: #9ca3af; }
.light .bg-gray-750 { background-color: #e5e7eb; }
.light .hover\\:bg-gray-700\\/50:hover { background-color: rgba(243, 244, 246, 0.5); }

/* Responsive grids */
@media (min-width: 768px) {
  .md\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .md\\:flex-row { flex-direction: row; }
  .md\\:items-center { align-items: center; }
  .md\\:w-96 { width: 24rem; }
  .md\\:w-auto { width: auto; }
  .md\\:col-span-2 { grid-column: span 2 / span 2; }
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

/* Fixed position for toggle */
.fixed.top-4.right-4 { position: fixed; top: 1rem; right: 1rem; }
.p-2 { padding: 0.5rem; }

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

export default AdminSupportPage;