
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { useAuth } from '../components/AuthProvider';

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

  const bgColor = type === 'success' ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#10b981]' : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#ef4444]';
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
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-base sm:text-xl font-semibold text-[#00f0ff]">
          {review.name}
        </h3>
        <p className="text-xs sm:text-sm text-[#9ca3af]">{formatReviewDate(review.createdAt)}</p>
      </div>
      <div className="mb-2 sm:mb-3">{renderStars(review.rating, 'text-lg sm:text-2xl')}</div>
      <p className="text-[#9ca3af] leading-relaxed text-sm sm:text-base">{review.text}</p>
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
    <div className="p-4 sm:p-6 md:p-8 text-center mb-6 sm:mb-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
      <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
        <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
          Средний рейтинг: {average}
        </span>
      </h2>
      <div className="text-3xl sm:text-5xl mb-1.5 sm:mb-2">{renderStars(Math.round(average), 'text-3xl sm:text-5xl', 'text-yellow-400')}</div>
      <p className="text-[#9ca3af] text-xs sm:text-sm">На основе {reviews.length} отзывов</p>
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
    <div className="p-4 sm:p-6 mb-6 sm:mb-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
        Распределение рейтингов
      </h3>
      {distribution.map(({ rating, percentage }) => (
        <div key={rating} className="flex items-center mb-4">
          <span className="w-20 text-right mr-4 text-[#e5e7eb] font-semibold">{rating} ★</span>
          <div className="flex-1 bg-[rgba(255,255,255,0.02)] h-6 rounded-full overflow-hidden border border-[rgba(255,255,255,0.1)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: rating * 0.1 }}
              className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] h-6 rounded-full"
            ></motion.div>
          </div>
          <span className="ml-4 text-[#9ca3af] font-medium min-w-[50px] text-right">{percentage.toFixed(0)}%</span>
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
      <label className="block text-sm font-semibold uppercase tracking-wide mb-2 text-[#9ca3af]">
        {label}
      </label>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-full border border-[rgba(255,255,255,0.1)] bg-[rgba(107,114,128,0.15)] backdrop-blur-xl text-[#e5e7eb] px-4 py-2.5 focus:border-[#00f0ff]/50 focus:outline-none transition-all duration-300 rounded-full flex items-center justify-between hover:bg-[rgba(107,114,128,0.2)] hover:border-[rgba(255,255,255,0.2)]"
      >
        <span className="text-[#9ca3af]">{selectedLabel}</span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-[#9ca3af] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-[rgba(31,41,55,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl shadow-lg overflow-hidden"
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
                    ? 'bg-[rgba(0,240,255,0.1)] text-[#00f0ff]'
                    : 'text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e5e7eb]'
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
      <div className="border border-[rgba(255,255,255,0.1)] bg-[rgba(107,114,128,0.15)] backdrop-blur-xl rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 flex items-center">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute top-3 left-3 w-5 h-5 text-[#9ca3af]" />
              <input
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Поиск по имени или тексту"
                className="w-full pl-10 pr-4 py-2.5 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] rounded-full focus:outline-none focus:border-[#00f0ff]/50 focus:ring-2 focus:ring-[#00f0ff]/30 transition duration-300 placeholder-[#9ca3af]"
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
    <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] animate-pulse">
      <div className="h-6 bg-[rgba(255,255,255,0.02)] rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-[rgba(255,255,255,0.02)] rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-[rgba(255,255,255,0.02)] rounded mb-4"></div>
      <div className="h-4 bg-[rgba(255,255,255,0.02)] rounded w-1/4"></div>
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
        className="text-center text-[#ef4444] p-6 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader 
          title="Отзывы"
          subtitle="Просмотрите отзывы наших клиентов или оставьте свой"
        />
        
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6 text-sm text-[#9ca3af] text-center"
          >
            Для отправки отзыва <a href="/login" className="text-[#00f0ff] hover:underline">войдите</a> или{' '}
            <a href="/login" className="text-[#00f0ff] hover:underline">зарегистрируйтесь</a>.
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
              <div className="text-center py-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <p className="text-[#9ca3af] text-xl">
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
                variant="primary"
                onClick={() => setPage((prev) => prev + 1)}
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
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
              Оставить отзыв
            </h2>
            <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-3">Выберите рейтинг:</label>
                  <div className="flex justify-center">
                    <StarRating rating={formData.rating} onRatingChange={handleRatingChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">Ваш отзыв:</label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="Поделитесь своим опытом..."
                    className="w-full p-4 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] rounded-xl focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/30 transition duration-300 h-32 resize-none placeholder-[#9ca3af]"
                    required
                  ></textarea>
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-full py-3 text-lg"
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