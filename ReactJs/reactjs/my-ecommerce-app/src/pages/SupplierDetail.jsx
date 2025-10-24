import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../components/AuthProvider'; // Предполагаем, что есть AuthProvider с isAuthenticated и user
import { ArrowLeftIcon, StarIcon, EnvelopeIcon, GlobeAltIcon, MapPinIcon, DocumentTextIcon, CurrencyYenIcon, CalendarIcon, UserIcon, CodeBracketIcon, CurrencyDollarIcon, ChatBubbleLeftIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import SupplierChat from './SupplierChat'; // Новый компонент для чата, создадим ниже

function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth(); // Получаем аутентификацию
  const [supplier, setSupplier] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false); // Состояние подписки
  const [subscribing, setSubscribing] = useState(false); // Загрузка подписки
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const reviewsPerPage = 5;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      fetchSupplier();
      if (isAuthenticated) {
        checkSubscription();
      }
      fetchReviews();
    }
  }, [id, currentReviewPage]);

  const fetchSupplier = async () => {
    try {
      const response = await api.get(`/suppliers/${id}`);
      setSupplier(response.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setSupplier(null);
    }
  };

  const checkSubscription = async () => {
    try {
      const response = await api.get(`/users/${user.id}/subscriptions/suppliers/${id}`);
      setIsSubscribed(response.data.subscribed);
    } catch (error) {
      console.error('Ошибка проверки подписки:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubscribing(true);
    try {
      if (isSubscribed) {
        await api.delete(`/users/${user.id}/subscriptions/suppliers/${id}`);
        setIsSubscribed(false);
      } else {
        await api.post(`/users/${user.id}/subscriptions/suppliers/${id}`);
        setIsSubscribed(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка подписки');
    } finally {
      setSubscribing(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const params = {
        page: currentReviewPage - 1,
        size: reviewsPerPage,
      };
      const response = await api.get(`/supplier-reviews/supplier/${id}`, { params });
      const { content, totalPages } = response.data;
      setReviews(content || []);
      setTotalReviewPages(totalPages || 1);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setReviews([]);
      setTotalReviewPages(1);
    } finally {
      setLoading(false);
    }
  };

  const paginateReviews = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalReviewPages) {
      setCurrentReviewPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={isMobile ? 'mobile-loading-detail' : 'desktop-loading-detail'}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500" />
        Загрузка...
      </motion.div>
    );
  }

  if (error || !supplier) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={isMobile ? 'mobile-error-detail' : 'desktop-error-detail'}
      >
        {error || 'Поставщик не найден'}
      </motion.div>
    );
  }

  const mobileLayout = (
    <section className="mobile-supplier-detail">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mobile-supplier-header"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/suppliers')}
          className="mobile-back-button"
        >
          <ArrowLeftIcon className="mobile-back-icon" />
          Назад
        </motion.button>
        <h1 className="mobile-supplier-title">{supplier.companyName}</h1>
      </motion.header>

      {/* Hero Section с кнопкой подписки */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mobile-hero-section"
      >
        <div className="mobile-supplier-placeholder-large">
          Нет фото
        </div>
        <div className="mobile-hero-meta">
          <div className="mobile-rating-section">
            <span className="mobile-rating-value">{supplier.rating?.toFixed(1) || '0.0'}</span>
            <div className="mobile-stars">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`mobile-star ${i < Math.floor(supplier.rating || 0) ? 'filled' : ''}`}
                />
              ))}
            </div>
            <span className="mobile-review-count">({supplier.reviewCount || 0} отзывов)</span>
          </div>
          {supplier.isVerified && (
            <span className="mobile-verified-badge">✓ Verified</span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubscribe}
            disabled={subscribing}
            className={`mobile-subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
          >
            <UserPlusIcon className="mobile-subscribe-icon" />
            {isSubscribed ? 'Отписаться' : 'Подписаться'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/supplier-chat/${id}`)}
            className="mobile-chat-button"
          >
            <ChatBubbleLeftIcon className="mobile-chat-icon" />
            Написать
          </motion.button>
        </div>
      </motion.div>

      {/* Основная информация */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mobile-info-section"
      >
        <h2 className="mobile-section-title">Информация о компании</h2>
        {supplier.description && (
          <div className="mobile-info-card">
            <p className="mobile-supplier-description">{supplier.description}</p>
          </div>
        )}
        <div className="mobile-info-grid">
          {supplier.username && (
            <div className="mobile-info-item">
              <UserIcon className="mobile-info-icon" />
              <span>Контактное лицо: {supplier.username}</span>
            </div>
          )}
          {supplier.email && (
            <div className="mobile-info-item">
              <EnvelopeIcon className="mobile-info-icon" />
              <span>Email: {supplier.email}</span>
            </div>
          )}
          {supplier.websiteUrl && (
            <div className="mobile-info-item">
              <GlobeAltIcon className="mobile-info-icon" />
              <a href={supplier.websiteUrl} target="_blank" rel="noopener noreferrer" className="mobile-supplier-link">
                Сайт
              </a>
            </div>
          )}
          {supplier.address && (
            <div className="mobile-info-item">
              <MapPinIcon className="mobile-info-icon" />
              <span>Адрес: {supplier.address}</span>
            </div>
          )}
          {supplier.licenseNumber && (
            <div className="mobile-info-item">
              <DocumentTextIcon className="mobile-info-icon" />
              <span>Лицензия: {supplier.licenseNumber}</span>
            </div>
          )}
        </div>
      </motion.section>

      {/* Доставка и статистика */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mobile-delivery-section"
      >
        <h2 className="mobile-section-title">Доставка и статистика</h2>
        <div className="mobile-stats-grid">
          {supplier.baseShippingCost && (
            <div className="mobile-stat-item">
              <CurrencyYenIcon className="mobile-stat-icon" />
              <span>Базовая стоимость: ¥{supplier.baseShippingCost}</span>
            </div>
          )}
          {supplier.estimatedDeliveryDays && (
            <div className="mobile-stat-item">
              <CalendarIcon className="mobile-stat-icon" />
              <span>Дни доставки: {supplier.estimatedDeliveryDays}</span>
            </div>
          )}
          {supplier.createdAt && (
            <div className="mobile-stat-item">
              <CalendarIcon className="mobile-stat-icon" />
              <span>Создан: {new Date(supplier.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {supplier.lastActivity && (
            <div className="mobile-stat-item">
              <CalendarIcon className="mobile-stat-icon" />
              <span>Последняя активность: {new Date(supplier.lastActivity).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {supplier.referralCode && (
            <div className="mobile-stat-item">
              <CodeBracketIcon className="mobile-stat-icon" />
              <span>Реферальный код: {supplier.referralCode}</span>
            </div>
          )}
          {supplier.referralCount > 0 && (
            <div className="mobile-stat-item">
              <UserIcon className="mobile-stat-icon" />
              <span>Рефералов: {supplier.referralCount}</span>
            </div>
          )}
          {supplier.moneySpent && (
            <div className="mobile-stat-item">
              <CurrencyDollarIcon className="mobile-stat-icon" />
              <span>Общий оборот: ¥{supplier.moneySpent?.toFixed(2)}</span>
            </div>
          )}
        </div>
      </motion.section>

      {/* Отзывы */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mobile-reviews-section"
      >
        <h2 className="mobile-reviews-title">Отзывы ({supplier.reviewCount || 0})</h2>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id || `review-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mobile-review-card"
            >
              <div className="mobile-review-header">
                <span className="mobile-review-rating">{review.rating?.toFixed(1)}</span>
                <div className="mobile-review-stars">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`mobile-review-star ${i < Math.floor(review.rating || 0) ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && <p className="mobile-review-text">{review.comment}</p>}
              <span className="mobile-review-date">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
            </motion.div>
          ))
        ) : (
          <p className="mobile-no-reviews">Отзывы отсутствуют</p>
        )}
        {totalReviewPages > 1 && (
          <div className="mobile-review-pagination">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginateReviews(currentReviewPage - 1)}
              disabled={currentReviewPage === 1}
              className="mobile-pagination-button"
            >
              Назад
            </motion.button>
            <span>{currentReviewPage} / {totalReviewPages}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginateReviews(currentReviewPage + 1)}
              disabled={currentReviewPage === totalReviewPages}
              className="mobile-pagination-button"
            >
              Вперед
            </motion.button>
          </div>
        )}
      </motion.section>
    </section>
  );

  const desktopLayout = (
    <section className="desktop-supplier-detail min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/suppliers')}
          className="mb-8 inline-flex items-center text-cyan-400 hover:text-cyan-300 text-lg font-semibold"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Назад к каталогу
        </motion.button>

        {/* Hero Section с кнопками */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-gray-800/90 rounded-2xl p-6 border border-cyan-500/30">
            <div className="w-full h-64 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-300 text-lg mb-6 border border-gray-600/20">
              Изображение отсутствует
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{supplier.companyName}</h1>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-yellow-400 mr-2">{supplier.rating?.toFixed(1) || '0.0'}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-6 h-6 ${i < Math.floor(supplier.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
                  />
                ))}
              </div>
              <span className="text-gray-300 ml-2">({supplier.reviewCount || 0} отзывов)</span>
            </div>
            {supplier.isVerified && (
              <span className="inline-block px-3 py-1 text-sm font-semibold bg-green-500 text-white rounded-full mb-4">
                Verified
              </span>
            )}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubscribe}
                disabled={subscribing}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${isSubscribed ? 'bg-green-600 text-white' : 'bg-cyan-500 text-white'} hover:opacity-80 disabled:opacity-50`}
              >
                <UserPlusIcon className="w-5 h-5" />
                {isSubscribed ? 'Отписаться' : 'Подписаться'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/supplier-chat/${id}`)}
                className="px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 font-semibold flex items-center gap-2"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
                Написать
              </motion.button>
            </div>
          </div>

          {/* Основная информация */}
          <div className="bg-gray-800/90 rounded-2xl p-6 border border-cyan-500/30 space-y-4">
            <h2 className="text-xl font-bold text-white">Информация о компании</h2>
            {supplier.description && (
              <p className="text-gray-300 leading-relaxed">{supplier.description}</p>
            )}
            <div className="space-y-2 text-sm text-gray-300">
              {supplier.username && (
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>Контактное лицо: {supplier.username}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>Email: {supplier.email}</span>
                </div>
              )}
              {supplier.websiteUrl && (
                <a href={supplier.websiteUrl} className="flex items-center text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  Сайт
                </a>
              )}
              {supplier.address && (
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>Адрес: {supplier.address}</span>
                </div>
              )}
              {supplier.licenseNumber && (
                <div className="flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>Лицензия: {supplier.licenseNumber}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Доставка и статистика */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-gray-800/90 rounded-2xl p-6 border border-cyan-500/30">
            <h2 className="text-xl font-bold text-white mb-4">Доставка</h2>
            <div className="space-y-3 text-sm text-gray-300">
              {supplier.baseShippingCost && (
                <div className="flex items-center">
                  <CurrencyYenIcon className="w-5 h-5 mr-2 text-green-400" />
                  <span>Базовая стоимость: ¥{supplier.baseShippingCost}</span>
                </div>
              )}
              {supplier.estimatedDeliveryDays && (
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
                  <span>Примерные дни доставки: {supplier.estimatedDeliveryDays}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/90 rounded-2xl p-6 border border-cyan-500/30">
            <h2 className="text-xl font-bold text-white mb-4">Статистика</h2>
            <div className="space-y-3 text-sm text-gray-300">
              {supplier.createdAt && (
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-purple-400" />
                  <span>Дата создания: {new Date(supplier.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
              {supplier.lastActivity && (
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-purple-400" />
                  <span>Последняя активность: {new Date(supplier.lastActivity).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
              {supplier.referralCode && (
                <div className="flex items-center">
                  <CodeBracketIcon className="w-5 h-5 mr-2 text-indigo-400" />
                  <span>Реферальный код: {supplier.referralCode}</span>
                </div>
              )}
              {supplier.referralCount > 0 && (
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-orange-400" />
                  <span>Количество рефералов: {supplier.referralCount}</span>
                </div>
              )}
              {supplier.moneySpent && (
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-emerald-400" />
                  <span>Общий оборот: ¥{supplier.moneySpent?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Отзывы */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/90 rounded-2xl p-6 border border-cyan-500/30"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Отзывы ({supplier.reviewCount || 0})</h2>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <motion.div
                key={review.id || `review-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-6 p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center mb-2">
                  <span className="text-xl font-bold text-yellow-400 mr-2">{review.rating?.toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-gray-300 mb-2">{review.comment}</p>}
                <span className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-300 text-center py-8">Отзывы отсутствуют</p>
          )}
          {totalReviewPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginateReviews(currentReviewPage - 1)}
                disabled={currentReviewPage === 1}
                className="px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 disabled:opacity-50"
              >
                Назад
              </motion.button>
              <span className="text-gray-300 self-center">{currentReviewPage} / {totalReviewPages}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginateReviews(currentReviewPage + 1)}
                disabled={currentReviewPage === totalReviewPages}
                className="px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 disabled:opacity-50"
              >
                Вперед
              </motion.button>
            </div>
          )}
        </motion.section>
      </div>
    </section>
  );

  return (
    <>
      {isMobile ? mobileLayout : desktopLayout}
      <style>{`
        /* Mobile Detail Styles - добавлены стили для кнопок */
        .mobile-supplier-detail {
          min-height: 100vh;
          background: linear-gradient(to bottom, #111827, #1f2937);
          padding: 16px 8px;
        }
        .mobile-supplier-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .mobile-back-button {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #06b6d4;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          margin-right: 12px;
        }
        .mobile-back-icon {
          width: 16px;
          height: 16px;
        }
        .mobile-supplier-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #ffffff;
          flex: 1;
        }
        .mobile-hero-section {
          background: linear-gradient(to bottom right, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9));
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .mobile-supplier-placeholder-large {
          width: 100%;
          height: 120px;
          background-color: rgba(75, 85, 99, 0.5);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
          font-size: 0.875rem;
          border: 1px solid rgba(75, 85, 99, 0.2);
          margin-bottom: 12px;
        }
        .mobile-hero-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mobile-rating-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mobile-rating-value {
          font-size: 1.25rem;
          font-weight: bold;
          color: #facc15;
        }
        .mobile-stars {
          display: flex;
          gap: 2px;
        }
        .mobile-star {
          width: 16px;
          height: 16px;
          color: #d1d5db;
        }
        .mobile-star.filled {
          color: #facc15;
          fill: currentColor;
        }
        .mobile-review-count {
          font-size: 0.875rem;
          color: #d1d5db;
        }
        .mobile-verified-badge {
          align-self: flex-start;
          padding: 4px 8px;
          background-color: #10b981;
          color: #ffffff;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .mobile-subscribe-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          justify-content: center;
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
          width: 16px;
          height: 16px;
        }
        .mobile-chat-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background-color: #8b5cf6;
          color: #ffffff;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          justify-content: center;
          text-decoration: none;
        }
        .mobile-chat-icon {
          width: 16px;
          height: 16px;
        }
        .mobile-info-section, .mobile-delivery-section {
          margin-bottom: 16px;
        }
        .mobile-section-title {
          font-size: 1.125rem;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .mobile-info-card {
          background-color: rgba(75, 85, 99, 0.3);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .mobile-supplier-description {
          color: #d1d5db;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        .mobile-info-grid, .mobile-stats-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mobile-info-item, .mobile-stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d1d5db;
          font-size: 0.875rem;
        }
        .mobile-info-icon, .mobile-stat-icon {
          width: 16px;
          height: 16px;
          color: #06b6d4;
          flex-shrink: 0;
        }
        .mobile-supplier-link {
          color: #06b6d4;
          text-decoration: underline;
        }
        .mobile-reviews-section {
          background: linear-gradient(to bottom right, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9));
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 8px;
          padding: 16px;
        }
        .mobile-reviews-title {
          font-size: 1.125rem;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .mobile-review-card {
          background-color: rgba(75, 85, 99, 0.5);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .mobile-review-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .mobile-review-rating {
          font-size: 1rem;
          font-weight: bold;
          color: #facc15;
        }
        .mobile-review-stars {
          display: flex;
          gap: 2px;
        }
        .mobile-review-star {
          width: 14px;
          height: 14px;
          color: #d1d5db;
        }
        .mobile-review-star.filled {
          color: #facc15;
          fill: currentColor;
        }
        .mobile-review-text {
          color: #d1d5db;
          font-size: 0.875rem;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .mobile-review-date {
          color: #9ca3af;
          font-size: 0.75rem;
        }
        .mobile-no-reviews {
          text-align: center;
          color: #d1d5db;
          font-size: 0.875rem;
          padding: 20px;
        }
        .mobile-review-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }
        .mobile-pagination-button {
          padding: 6px 12px;
          background-color: rgba(6, 182, 212, 0.8);
          color: #ffffff;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }
        .mobile-pagination-button:disabled {
          background-color: rgba(75, 85, 99, 0.5);
          cursor: not-allowed;
        }
        .mobile-loading-detail {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #ffffff;
          font-size: 1rem;
          background-color: rgba(31, 41, 55, 0.8);
          padding: 20px;
          border-radius: 8px;
        }
        .mobile-error-detail {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #f87171;
          font-size: 1rem;
          background-color: rgba(239, 68, 68, 0.3);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        /* Desktop Detail Styles */
        .desktop-supplier-detail {
          color: #ffffff;
        }
        .desktop-loading-detail {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 1.5rem;
          background-color: rgba(31, 41, 55, 0.8);
          padding: 40px;
          border-radius: 12px;
        }
        .desktop-error-detail {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #f87171;
          font-size: 1.5rem;
          background-color: rgba(239, 68, 68, 0.3);
          padding: 40px;
          border-radius: 12px;
          text-align: center;
        }
      `}</style>
    </>
  );
}

export default SupplierDetail;