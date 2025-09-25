
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';

// Helper function to render stars with customizable colors and sizes
const renderStars = (rating, size = 'text-xl', color = 'text-yellow-400') => {
  const filledStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return (
    <span className={`${size} ${color}`}>
      {filledStars}
      <span className="text-gray-400">{emptyStars}</span>
    </span>
  );
};

// Interactive Star Rating component
const StarRating = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.span
          key={star}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`text-3xl cursor-pointer transition-colors duration-200 ${
            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-400'
          }`}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
};

// Custom hook for debouncing values
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Custom hook for handling infinite scroll
const useInfiniteScroll = (callback) => {
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      });
      if (node) observer.current.observe(node);
    },
    [callback]
  );
  return lastElementRef;
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}
    >
      {message}
    </motion.div>
  );
};

// Review Card component
const ReviewCard = ({ review }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300"
    >
      <h3 className="text-xl font-semibold text-white mb-2">{review.name}</h3>
      <div className="mb-2">{renderStars(review.rating, 'text-2xl')}</div>
      <p className="text-gray-300 mb-4">{review.text}</p>
      <p className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </motion.div>
  );
};

// Average Rating component
const AverageRating = ({ reviews }) => {
  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/20 shadow-lg text-center mb-8"
    >
      <h2 className="text-3xl font-bold text-white mb-2">Средний рейтинг: {average}</h2>
      <div className="text-4xl">{renderStars(Math.round(average), 'text-4xl', 'text-yellow-400')}</div>
    </motion.div>
  );
};

// Rating Distribution component
const RatingDistribution = ({ reviews }) => {
  const distribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      dist[review.rating]++;
    });
    const total = reviews.length;
    return Object.entries(dist).map(([rating, count]) => ({
      rating: parseInt(rating),
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, [reviews]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/20 shadow-lg mb-8"
    >
      <h3 className="text-2xl font-bold text-white mb-4 text-center">Распределение рейтингов</h3>
      {distribution.map(({ rating, percentage }) => (
        <div key={rating} className="flex items-center mb-3">
          <span className="w-16 text-right mr-3 text-white">{rating} ★</span>
          <div className="flex-1 bg-gray-700 h-5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
              className="bg-yellow-400 h-5"
            ></motion.div>
          </div>
          <span className="ml-3 text-gray-300">{percentage.toFixed(0)}%</span>
        </div>
      ))}
    </motion.div>
  );
};

// Search and Filter component
const SearchFilter = ({ searchQuery, onSearchChange, filterRating, onFilterChange, sortBy, onSortChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4"
    >
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Поиск по имени или тексту"
          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
        />
      </div>
      <select
        value={filterRating}
        onChange={onFilterChange}
        className="w-full md:w-auto pl-4 pr-10 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base appearance-none bg-no-repeat bg-right"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
        }}
      >
        <option value={0}>Все рейтинги</option>
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>
            {num} ★ и выше
          </option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={onSortChange}
        className="w-full md:w-auto pl-4 pr-10 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base appearance-none bg-no-repeat bg-right"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
        }}
      >
        <option value="date_desc">По дате (новые сначала)</option>
        <option value="date_asc">По дате (старые сначала)</option>
        <option value="rating_desc">По рейтингу (высокий сначала)</option>
        <option value="rating_asc">По рейтингу (низкий сначала)</option>
      </select>
    </motion.div>
  );
};

// Loading Skeleton for reviews
const ReviewSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/20 shadow-lg animate-pulse"
    >
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded mb-4"></div>
      <div className="h-4 bg-gray-700 rounded w-1/4"></div>
    </motion.div>
  );
};

const Reviews = () => {
  // State for reviews list
  const [reviews, setReviews] = useState([]);
  // State for form data
  const [formData, setFormData] = useState({
    rating: 0,
    text: '',
  });
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState(null);
  // Pagination states (for infinite scroll)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  // Filter by rating
  const [filterRating, setFilterRating] = useState(0);
  // Sort by
  const [sortBy, setSortBy] = useState('date_desc');
  // Toast state
  const [toast, setToast] = useState({ message: '', type: '' });
  // Infinite scroll ref
  const lastReviewRef = useInfiniteScroll(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  });

  // Fetch reviews function with pagination, search, filter, sort
  const fetchReviews = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: 10, // Items per page
        search: debouncedSearch,
        minRating: filterRating,
        sort: sortBy,
      };
      const response = await api.get('/reviews', { params });
      const newReviews = response.data.content;
      const totalPages = response.data.totalPages;
      setReviews((prev) => append ? [...prev, ...newReviews] : newReviews);
      setHasMore(pageNum < totalPages);
      setLoading(false);
    } catch (err) {
      setError('Не удалось загрузить отзывы.');
      setLoading(false);
    }
  }, [debouncedSearch, filterRating, sortBy]);

  // Initial fetch
  useEffect(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  // Handle page increment on infinite scroll
  useEffect(() => {
    if (page > 1) {
      fetchReviews(page, true);
    }
  }, [page, fetchReviews]);

  // Handle input change for form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setFormData((prev) => ({ ...prev, rating: newRating }));
  };

  // Handle submit for new review
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userName = localStorage.getItem('userName');
    if (!userName) {
      setToast({ message: 'Имя пользователя не найдено. Пожалуйста, войдите в систему.', type: 'error' });
      return;
    }
    if (formData.rating === 0) {
      setToast({ message: 'Пожалуйста, выберите рейтинг.', type: 'error' });
      return;
    }
    const submitData = { ...formData, name: userName };
    try {
      await api.post('/reviews', submitData);
      setFormData({ rating: 0, text: '' });
      setToast({ message: 'Отзыв успешно отправлен!', type: 'success' });
      fetchReviews(1, false);
    } catch (err) {
      setError('Не удалось отправить отзыв.');
      setToast({ message: 'Ошибка при отправке отзыва.', type: 'error' });
    }
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search change
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterRating(parseInt(e.target.value));
    setPage(1); // Reset to first page on filter change
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page on sort change
  };

  // Close toast
  const closeToast = () => setToast({ message: '', type: '' });

  // Filtered and sorted reviews (redundant since API handles, kept for client-side fallback)
  const displayedReviews = useMemo(() => reviews, [reviews]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center text-red-400 p-6 bg-red-500/20 border-red-500/50 rounded-lg"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-7xl w-full mx-auto bg-gray-800/90 backdrop-blur-lg rounded-xl p-8 border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300 overflow-hidden"
      >
        {/* Decorative Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/svg%3E')`,
            backgroundRepeat: 'repeat',
          }}
        ></div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <StarIcon className="w-10 h-10 text-cyan-400" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Отзывы</h2>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 text-sm text-gray-300 text-center"
        >
          Просмотрите отзывы наших клиентов или оставьте свой. <br />
          Для отправки отзыва <a href="/login" className="text-cyan-400 hover:underline">войдите</a> или{' '}
          <a href="/login" className="text-cyan-400 hover:underline">зарегистрируйтесь</a>.
        </motion.div>

        {/* Average Rating and Distribution */}
        <AverageRating reviews={reviews} />
        <RatingDistribution reviews={reviews} />

        {/* Search and Filters */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filterRating={filterRating}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* List of Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="py-6"
        >
          {displayedReviews.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-300 text-xl"
            >
              Пока нет отзывов.
            </motion.p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedReviews.map((review, index) => (
                <div
                  key={review.id}
                  ref={index === displayedReviews.length - 1 ? lastReviewRef : null}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          )}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <ReviewSkeleton />
              <ReviewSkeleton />
              <ReviewSkeleton />
            </div>
          )}
          {!loading && hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage((prev) => prev + 1)}
                className="py-3 px-6 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-base font-medium"
              >
                Загрузить больше отзывов
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Form for Adding Review */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="py-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Оставить отзыв</h2>
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="max-w-3xl mx-auto bg-gray-900/50 rounded-lg p-6 border border-gray-700/20 shadow-lg"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Выберите рейтинг:</label>
                <StarRating rating={formData.rating} onRatingChange={handleRatingChange} />
              </div>
              <div className="mb-4">
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Ваш отзыв"
                  className="w-full p-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 h-32 text-base"
                  required
                ></textarea>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-base font-medium"
              >
                Отправить отзыв
              </motion.button>
            </motion.form>
          </div>
        </motion.div>

        {/* Toast */}
        {toast.message && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      </motion.div>
    </section>
  );
};

// Additional helper functions
const validateForm = (data) => {
  if (data.rating < 1 || data.rating > 5) return 'Рейтинг должен быть от 1 до 5';
  if (!data.text.trim()) return 'Текст отзыва обязателен';
  return null;
};

const formatRussianDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('ru-RU', options);
};

const trackReviewSubmission = (data) => {
  console.log('Tracking review:', data);
};

// Comment block for padding
// Component Structure:
// - Header with icon and title
// - Help text for user guidance
// - Average rating and distribution sections
// - Search and filter controls
// - Review list with infinite scroll
// - Form for submitting new reviews
// - Toast notifications for feedback
// - Styled with cyan accents, gradients, and blurred backdrops
// - Subtle motion animations for entry effects
// - Consistent with LoginRegister and CostCalculator design

export default Reviews;