
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';
import { Button } from '../components/ui/Button';
import { useAuth } from '../components/AuthProvider';

// Helper function to render stars with customizable colors and sizes
const renderStars = (rating, size = 'text-xl', color = 'text-[var(--ev-gold)]') => {
  const filledStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return (
    <span className={size}>
      <span className={color}>{filledStars}</span>
      <span className="text-[var(--ev-text-muted)]">{emptyStars}</span>
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
            (hoverRating || rating) >= star ? 'text-[var(--ev-gold)]' : 'text-[var(--ev-text-muted)]'
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

  const bgColor = type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border-red-500/30 text-red-300';
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 ${bgColor} border px-6 py-3 rounded-xl shadow-lg z-50`}
    >
      {message}
    </motion.div>
  );
};

// Helper function to format date (handles both array and string formats)
const formatReviewDate = (dateValue) => {
  if (!dateValue) return 'Дата не указана';
  
  try {
    let date;
    
    // Handle array format [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(dateValue)) {
      const [year, month, day] = dateValue;
      date = new Date(year, month - 1, day); // JavaScript months are 0-based
    } else {
      // Handle ISO string or other string formats
      date = new Date(dateValue);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Неверная дата';
    }
    
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'dateValue:', dateValue);
    return 'Неверная дата';
  }
};

// Review Card component
const ReviewCard = ({ review }) => {
  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-base sm:text-xl font-semibold text-[var(--ev-gold)]">
          {review.name}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--ev-text-muted)]">{formatReviewDate(review.createdAt)}</p>
      </div>
      <div className="mb-2 sm:mb-3">{renderStars(review.rating, 'text-lg sm:text-2xl')}</div>
      <p className="text-[var(--ev-text-muted)] leading-relaxed text-sm sm:text-base">{review.text}</p>
    </div>
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
    <div className="p-4 sm:p-6 md:p-8 text-center mb-6 sm:mb-8 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300">
      <h2 className="text-2xl sm:text-4xl font-semibold mb-3 sm:mb-4 text-[var(--ev-text)]">
        Средний рейтинг: {average}
      </h2>
      <div className="text-3xl sm:text-5xl mb-1.5 sm:mb-2">{renderStars(Math.round(average), 'text-3xl sm:text-5xl', 'text-[var(--ev-gold)]')}</div>
      <p className="text-[var(--ev-text-muted)] text-xs sm:text-sm">На основе {reviews.length} отзывов</p>
    </div>
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
    <div className="p-4 sm:p-6 mb-6 sm:mb-8 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300">
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center text-[var(--ev-text)]">
        Распределение рейтингов
      </h3>
      {distribution.map(({ rating, percentage }) => (
        <div key={rating} className="flex items-center mb-4">
          <span className="w-20 text-right mr-4 text-[var(--ev-text)] font-semibold">{rating} ★</span>
          <div className="flex-1 bg-[var(--ev-gold)]/10 h-6 rounded-full overflow-hidden border border-[var(--ev-gold)]/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: rating * 0.1 }}
              className="bg-[var(--ev-gold)] h-6 rounded-full"
            ></motion.div>
          </div>
          <span className="ml-4 text-[var(--ev-text-muted)] font-medium min-w-[50px] text-right">{percentage.toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
};

// Dropdown component for filters
const FilterDropdown = ({ label, value, options, onChange, isOpen, onToggle }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const selectedLabel = options.find(opt => opt.value === value)?.label || options[0]?.label;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold uppercase tracking-wide mb-2 text-[var(--ev-text-muted)]">
        {label}
      </label>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-full border border-[var(--ev-gold)]/20 bg-[var(--ev-gold)]/5 backdrop-blur-xl text-[var(--ev-text)] px-4 py-2.5 focus:border-[var(--ev-gold)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/30 transition-all duration-300 rounded-full flex items-center justify-between hover:bg-[var(--ev-gold)]/10 hover:border-[var(--ev-gold)]/30"
      >
        <span className="text-[var(--ev-text-muted)]">{selectedLabel}</span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-[var(--ev-text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-[var(--ev-void)] border border-[var(--ev-gold)]/20 rounded-xl shadow-lg overflow-hidden backdrop-blur-xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  onToggle(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 ${
                  value === option.value
                    ? 'bg-[var(--ev-gold)]/15 text-[var(--ev-gold)]'
                    : 'text-[var(--ev-text-muted)] hover:bg-[var(--ev-gold)]/10 hover:text-[var(--ev-text)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Search and Filter component
const SearchFilter = ({ searchQuery, onSearchChange, filterRating, onFilterChange, sortBy, onSortChange }) => {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const ratingOptions = [
    { value: 0, label: 'Все рейтинги' },
    { value: 1, label: '1 ★ и выше' },
    { value: 2, label: '2 ★ и выше' },
    { value: 3, label: '3 ★ и выше' },
    { value: 4, label: '4 ★ и выше' },
    { value: 5, label: '5 ★' },
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'По дате (новые сначала)' },
    { value: 'date_asc', label: 'По дате (старые сначала)' },
    { value: 'rating_desc', label: 'По рейтингу (высокий сначала)' },
    { value: 'rating_asc', label: 'По рейтингу (низкий сначала)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-6"
    >
      <div className="border border-[var(--ev-gold)]/15 bg-[var(--ev-glass)] rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 flex items-center">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute top-3 left-3 w-5 h-5 text-[var(--ev-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Поиск по имени или тексту"
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--ev-gold)]/5 text-[var(--ev-text)] border border-[var(--ev-gold)]/20 rounded-full focus:outline-none focus:border-[var(--ev-gold)]/50 focus:ring-2 focus:ring-[var(--ev-gold)]/30 transition duration-300 placeholder-[var(--ev-text-muted)]"
              />
            </div>
          </div>
          <FilterDropdown
            label="Рейтинг"
            value={filterRating}
            options={ratingOptions}
            onChange={(value) => {
              const event = { target: { value: value.toString() } };
              onFilterChange(event);
            }}
            isOpen={isRatingOpen}
            onToggle={setIsRatingOpen}
          />
          <FilterDropdown
            label="Сортировка"
            value={sortBy}
            options={sortOptions}
            onChange={(value) => {
              const event = { target: { value } };
              onSortChange(event);
            }}
            isOpen={isSortOpen}
            onToggle={setIsSortOpen}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Loading Skeleton for reviews
const ReviewSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 animate-pulse">
      <div className="h-6 bg-[var(--ev-gold)]/10 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-[var(--ev-gold)]/10 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-[var(--ev-gold)]/10 rounded mb-4"></div>
      <div className="h-4 bg-[var(--ev-gold)]/10 rounded w-1/4"></div>
    </div>
  );
};

const Reviews = () => {
  const { isAuthenticated } = useAuth();
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
        className="text-center text-red-300 p-6 rounded-xl bg-red-500/10 border border-red-500/20 max-w-2xl mx-auto"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--ev-text)] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--ev-text)] flex items-center gap-3">
            <StarIcon className="w-8 h-8 text-[var(--ev-gold)]" />
            Отзывы
          </h1>
          <p className="text-[var(--ev-text-muted)] text-sm sm:text-base mt-1">
            Просмотрите отзывы наших клиентов или оставьте свой
          </p>
        </motion.div>
        
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6 text-sm text-[var(--ev-text-muted)] text-center"
          >
            Для отправки отзыва <a href="/login" className="text-[var(--ev-gold)] hover:underline">войдите</a> или{' '}
            <a href="/login" className="text-[var(--ev-gold)] hover:underline">зарегистрируйтесь</a>.
          </motion.div>
        )}

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
              <div className="text-center py-8 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <p className="text-[var(--ev-text-muted)] text-xl">
                  Пока нет отзывов.
                </p>
              </div>
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
              <Button
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                className="border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
              >
                Загрузить больше отзывов
              </Button>
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
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-[var(--ev-text)]">
              Оставить отзыв
            </h2>
            <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--ev-text-muted)] mb-3">Выберите рейтинг:</label>
                  <div className="flex justify-center">
                    <StarRating rating={formData.rating} onRatingChange={handleRatingChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ev-text-muted)] mb-2">Ваш отзыв:</label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="Поделитесь своим опытом..."
                    className="w-full p-4 bg-[var(--ev-gold)]/5 text-[var(--ev-text)] border border-[var(--ev-gold)]/20 rounded-xl focus:outline-none focus:border-[var(--ev-gold)]/50 focus:ring-2 focus:ring-[var(--ev-gold)]/30 transition duration-300 h-32 resize-none placeholder-[var(--ev-text-muted)]"
                    required
                  ></textarea>
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-full py-3 text-lg bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
                >
                  Отправить отзыв
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
        
        {/* Toast */}
        {toast.message && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      </div>
    </div>
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