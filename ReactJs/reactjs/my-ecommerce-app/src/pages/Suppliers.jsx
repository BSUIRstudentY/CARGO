import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider'; // Добавляем для аутентификации
import api from '../api/axiosInstance';
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/solid'; // Добавляем UserPlusIcon
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [sortBy, setSortBy] = useState('rating_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [subscriptions, setSubscriptions] = useState(new Map()); // Map<supplierId, boolean>
  const [subscribing, setSubscribing] = useState(new Map()); // Map<supplierId, boolean> для загрузки
  const { isAuthenticated, user } = useAuth(); // Получаем аутентификацию
  const navigate = useNavigate();
  const suppliersPerPage = 20;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchSuppliers();
    if (isAuthenticated && user) {
      fetchSubscriptions();
    }
  }, [currentPage, sortBy]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: suppliersPerPage,
        searchTerm: searchTerm || undefined,
        minRating: minRating > 0 ? minRating : undefined,
        maxRating: maxRating < 5 ? maxRating : undefined,
        sortBy: sortBy || undefined,
      };
      const response = await api.get('/suppliers', { params });
      const { content, totalPages } = response.data;
      setSuppliers(content || []);
      setTotalPages(totalPages || 1);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setSuppliers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get(`/users/${user.id}/subscriptions`);
      const subMap = new Map();
      response.data.forEach(sub => subMap.set(sub.supplierId, true));
      setSubscriptions(subMap);
    } catch (error) {
      console.error('Ошибка загрузки подписок:', error);
    }
  };

  const handleSubscribe = async (supplierId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubscribing(prev => new Map(prev).set(supplierId, true));
    try {
      if (subscriptions.get(supplierId)) {
        await api.delete(`/users/${user.id}/subscriptions/suppliers/${supplierId}`);
        setSubscriptions(prev => {
          const newMap = new Map(prev);
          newMap.delete(supplierId);
          return newMap;
        });
      } else {
        await api.post(`/users/${user.id}/subscriptions/suppliers/${supplierId}`);
        setSubscriptions(prev => new Map(prev).set(supplierId, true));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка подписки');
    } finally {
      setSubscribing(prev => {
        const newMap = new Map(prev);
        newMap.delete(supplierId);
        return newMap;
      });
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setCurrentPage(1);
      fetchSuppliers();
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleViewSupplier = (supplierId) => {
    if (supplierId) {
      navigate(`/supplier/${supplierId}`);
    } else {
      setError('Неверный ID поставщика');
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, null, totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, null, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages);
    }
    return pages;
  };

  const mobileLayout = (
    <section id="suppliers" className="mobile-suppliers">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mobile-suppliers-header"
      >
        <h2>Каталог поставщиков</h2>
        <p>Поставщики грузов из Китая</p>
      </motion.header>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mobile-suppliers-controls"
      >
        <div className="mobile-search-container">
          <MagnifyingGlassIcon className="mobile-search-icon" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            className="mobile-search-input"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="mobile-search-button"
          >
            Искать
          </motion.button>
        </div>
        <div className="mobile-rating-filter">
          <label>Рейтинг</label>
          <Slider
            range
            value={[minRating, maxRating]}
            onChange={([min, max]) => {
              setMinRating(min);
              setMaxRating(max);
              setCurrentPage(1);
              fetchSuppliers();
            }}
            min={0}
            max={5}
            step={0.5}
            className="custom-slider"
          />
          <div className="mobile-rating-range">
            <span>{minRating}</span>
            <span>{maxRating}</span>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="mobile-sort-select"
        >
          <option value="rating_asc">Рейтинг: по возрастанию</option>
          <option value="rating_desc">Рейтинг: по убыванию</option>
          <option value="review_count_desc">Отзывы: по убыванию</option>
        </select>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="mobile-error"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      {loading && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mobile-loading"
        >
          <div className="mobile-loading-spinner" />
          Загрузка...
        </motion.div>
      )}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mobile-supplier-grid"
      >
        {suppliers.length > 0 ? (
          suppliers.map((supplier, index) => {
            const isSubscribed = subscriptions.get(supplier.id);
            const isSubLoading = subscribing.get(supplier.id);
            return (
              <motion.div
                key={supplier.id || `supplier-${index}`}
                className="mobile-supplier-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                {supplier.imageUrl ? (
                  <img
                    src={supplier.imageUrl}
                    alt={supplier.companyName}
                    className="mobile-supplier-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото';
                    }}
                  />
                ) : (
                  <div className="mobile-supplier-placeholder">
                    Нет фото
                  </div>
                )}
                <div className="mobile-supplier-details">
                  <h4 className="mobile-supplier-name">{supplier.companyName}</h4>
                  <span className="mobile-supplier-subscribers">Подписчиков: {supplier.subscriberCount || 0}</span>
                  <span className="mobile-supplier-rating">Рейтинг: {supplier.rating?.toFixed(1) || '0.0'}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSubscribe(supplier.id)}
                    disabled={isSubLoading}
                    className={`mobile-subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
                  >
                    <UserPlusIcon className="mobile-subscribe-icon" />
                    {isSubscribed ? 'Подписан' : 'Подписаться'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewSupplier(supplier.id)}
                    className="mobile-view-details"
                  >
                    Подробнее
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-no-suppliers"
          >
            Поставщики не найдены
          </motion.div>
        )}
      </motion.section>
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mobile-pagination"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage - 1)}
            className={`mobile-pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
            disabled={currentPage === 1 || loading}
          >
            Назад
          </motion.button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = currentPage === pageNum;
            return (
              <motion.button
                key={pageNum}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(pageNum)}
                className={`mobile-pagination-button ${isActive ? 'active' : ''}`}
                disabled={loading}
              >
                {pageNum}
              </motion.button>
            );
          })}
          {totalPages > 5 && <span className="mobile-pagination-ellipsis">...</span>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage + 1)}
            className={`mobile-pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
            disabled={currentPage === totalPages || loading}
          >
            Вперед
          </motion.button>
        </motion.div>
      )}
    </section>
  );

  const desktopLayout = (
    <section id="suppliers" className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 container mx-auto px-4 py-8">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-white tracking-tight">Каталог поставщиков</h2>
        <p className="text-lg text-gray-300 mt-2">Выберите поставщиков грузов из Китая</p>
      </motion.header>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="w-full md:w-1/4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-500" />
            <input
              type="text"
              placeholder="Поиск по названию компании..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="mt-2 w-full py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold shadow-md"
          >
            Искать
          </motion.button>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Рейтинг</label>
          <Slider
            range
            value={[minRating, maxRating]}
            onChange={([min, max]) => {
              setMinRating(min);
              setMaxRating(max);
              setCurrentPage(1);
              fetchSuppliers();
            }}
            min={0}
            max={5}
            step={0.5}
            className="custom-slider"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-300">
            <span>Min: {minRating}</span>
            <span>Max: {maxRating}</span>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full md:w-1/6 p-3 rounded-lg bg-gray-800/80 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 appearance-none bg-no-repeat bg-right"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d1d5db' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          }}
        >
          <option value="rating_asc">Рейтинг: по возрастанию</option>
          <option value="rating_desc">Рейтинг: по убыванию</option>
          <option value="review_count_desc">Отзывы: по убыванию</option>
        </select>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-center text-base font-medium shadow-md"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      {loading && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-white text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-cyan-500 mx-auto" />
          Загрузка...
        </motion.div>
      )}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {suppliers.length > 0 ? (
            suppliers.map((supplier, index) => {
              const isSubscribed = subscriptions.get(supplier.id);
              const isSubLoading = subscribing.get(supplier.id);
              return (
                <Tilt key={supplier.id || `supplier-${index}`} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-4 border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 transition-shadow duration-300 relative overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                        backgroundRepeat: 'repeat',
                      }}
                    ></div>
                    <div className="relative">
                      {supplier.imageUrl ? (
                        <img
                          src={supplier.imageUrl}
                          alt={supplier.companyName}
                          className="w-full h-48 object-cover rounded-lg border border-gray-600/20"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-300 text-sm border border-gray-600/20">
                          Изображение отсутствует
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{supplier.companyName}</h4>
                      <div className="mb-2">
                        <span className="text-gray-300 text-sm">Подписчиков: {supplier.subscriberCount || 0}</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-yellow-400 font-semibold text-base">Рейтинг: {supplier.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                     
                      {supplier.isVerified && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-full mb-4">
                          Verified
                        </span>
                      )}
                      <div className="flex gap-2 mb-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubscribe(supplier.id)}
                          disabled={isSubLoading}
                          className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm ${isSubscribed ? 'bg-green-500 text-white' : 'bg-cyan-500 text-white'} hover:opacity-80 disabled:opacity-50`}
                        >
                          <UserPlusIcon className="w-4 h-4" />
                          {isSubscribed ? 'Подписан' : 'Подписаться'}
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewSupplier(supplier.id)}
                        className="w-full py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold shadow-sm"
                      >
                        Подробнее
                      </motion.button>
                    </div>
                  </motion.div>
                </Tilt>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-300 col-span-full text-lg bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
            >
              Поставщики не найдены
            </motion.div>
          )}
        </div>
      </motion.section>
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 flex justify-center gap-3 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage - 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1 ? 'bg-gray-600/80 cursor-not-allowed' : 'bg-gray-700/80 hover:bg-gray-600/80'
            } text-white text-sm font-semibold shadow-sm`}
            disabled={currentPage === 1 || loading}
          >
            Назад
          </motion.button>
          {getVisiblePages().map((pageNum, index) => {
            if (pageNum === null) {
              return (
                <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-300 text-sm self-center">
                  ...
                </span>
              );
            }
            const isActive = currentPage === pageNum;
            return (
              <motion.button
                key={pageNum}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  isActive ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-gray-700/80 hover:bg-gray-600/80'
                } text-white text-sm font-semibold shadow-sm`}
                disabled={loading}
              >
                {pageNum}
              </motion.button>
            );
          })}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages ? 'bg-gray-600/80 cursor-not-allowed' : 'bg-gray-700/80 hover:bg-gray-600/80'
            } text-white text-sm font-semibold shadow-sm`}
            disabled={currentPage === totalPages || loading}
          >
            Вперед
          </motion.button>
        </motion.div>
      )}
    </section>
  );

  return (
    <>
      {isMobile ? mobileLayout : desktopLayout}
    </>
  );
}

const styles = `
  /* Mobile Styles for Suppliers - обновлены для новых элементов */
  .mobile-suppliers {
    min-height: 100vh;
    background: linear-gradient(to bottom, #111827, #1f2937);
    padding: 16px 8px;
  }
  .mobile-suppliers-header {
    text-align: center;
    margin-bottom: 16px;
  }
  .mobile-suppliers-header h2 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffffff;
  }
  .mobile-suppliers-header p {
    font-size: 0.875rem;
    color: #d1d5db;
    margin-top: 4px;
  }
  .mobile-suppliers-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }
  .mobile-search-container {
    position: relative;
  }
  .mobile-search-icon {
    position: absolute;
    top: 10px;
    left: 8px;
    width: 18px;
    height: 18px;
    color: #06b6d4;
  }
  .mobile-search-input {
    width: 100%;
    padding: 8px 16px 8px 32px;
    background-color: rgba(31, 41, 55, 0.8);
    color: #ffffff;
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 6px;
    font-size: 0.875rem;
    outline: none;
  }
  .mobile-search-input:focus {
    border-color: #06b6d4;
    box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.5);
  }
  .mobile-search-button {
    width: 100%;
    padding: 8px;
    background-color: #06b6d4;
    color: #ffffff;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 8px;
  }
  .mobile-rating-filter {
    margin-top: 8px;
  }
  .mobile-rating-filter label {
    display: block;
    font-size: 0.75rem;
    color: #d1d5db;
    margin-bottom: 4px;
  }
  .custom-slider .rc-slider-track {
    background-color: #06b6d4;
  }
  .custom-slider .rc-slider-handle {
    background-color: #06b6d4;
    border-color: #06b6d4;
    box-shadow: 0 0 4px rgba(6, 182, 212, 0.5);
  }
  .custom-slider .rc-slider-handle:hover {
    box-shadow: 0 0 6px rgba(6, 182, 212, 0.8);
  }
  .mobile-rating-range {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 0.75rem;
    color: #d1d5db;
  }
  .mobile-sort-select {
    width: 100%;
    padding: 8px;
    background-color: rgba(31, 41, 55, 0.8);
    color: #ffffff;
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 6px;
    font-size: 0.875rem;
    outline: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d1d5db' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 8px center;
    background-size: 18px 18px;
    background-repeat: no-repeat;
    appearance: none;
  }
  .mobile-sort-select:focus {
    border-color: #06b6d4;
    box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.5);
  }
  .mobile-error {
    margin-bottom: 16px;
    padding: 8px;
    background-color: rgba(239, 68, 68, 0.3);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 6px;
    color: #f87171;
    text-align: center;
    font-size: 0.875rem;
  }
  .mobile-loading {
    margin-bottom: 16px;
    text-align: center;
    color: #ffffff;
    font-size: 1rem;
    background-color: rgba(31, 41, 55, 0.8);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid rgba(6, 182, 212, 0.3);
  }
  .mobile-loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 2px solid #06b6d4;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 8px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .mobile-supplier-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }
  @media (max-width: 480px) {
    .mobile-supplier-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 320px) {
    .mobile-supplier-grid {
      grid-template-columns: 1fr;
    }
  }
  .mobile-supplier-card {
    background: linear-gradient(to bottom right, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9));
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 8px;
    padding: 8px;
    overflow: hidden;
  }
  .mobile-supplier-image {
    width: 100%;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid rgba(75, 85, 99, 0.2);
  }
  .mobile-supplier-placeholder {
    width: 100%;
    height: 80px;
    background-color: rgba(75, 85, 99, 0.5);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d1d5db;
    font-size: 0.75rem;
    border: 1px solid rgba(75, 85, 99, 0.2);
  }
  .mobile-supplier-details {
    padding: 8px;
  }
  .mobile-supplier-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .mobile-supplier-subscribers {
    display: block;
    font-size: 0.75rem;
    color: #d1d5db;
    margin-bottom: 4px;
  }
  .mobile-supplier-rating {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: #facc15;
    margin-bottom: 4px;
  }
  .mobile-supplier-reviews {
    display: block;
    font-size: 0.75rem;
    color: #d1d5db;
    margin-bottom: 8px;
  }
  .mobile-subscribe-button {
    width: 100%;
    padding: 4px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 500;
    text-align: center;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .mobile-subscribe-button.subscribed {
    background-color: #10b981;
    color: #ffffff;
  }
  .mobile-subscribe-button:not(.subscribed) {
    background-color: #06b6d4;
    color: #ffffff;
  }
  .mobile-subscribe-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .mobile-subscribe-icon {
    width: 12px;
    height: 12px;
  }
  .mobile-view-details {
    width: 100%;
    padding: 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: rgba(75, 85, 99, 0.8);
    color: #ffffff;
  }
  .mobile-no-suppliers {
    grid-column: 1 / -1;
    text-align: center;
    color: #d1d5db;
    font-size: 0.875rem;
    background-color: rgba(31, 41, 55, 0.8);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid rgba(6, 182, 212, 0.3);
  }
  .mobile-pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .mobile-pagination-button {
    padding: 6px 12px;
    background-color: rgba(75, 85, 99, 0.8);
    color: #ffffff;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  .mobile-pagination-button.active {
    background-color: #06b6d4;
  }
  .mobile-pagination-button.disabled {
    background-color: rgba(75, 85, 99, 0.5);
    cursor: not-allowed;
  }
  .mobile-pagination-ellipsis {
    padding: 6px 12px;
    color: #d1d5db;
    font-size: 0.75rem;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Suppliers;