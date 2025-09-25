import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import { ShoppingCartIcon, ArrowLeftIcon, LinkIcon, StarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartLoading, cartError } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 0 });
  const observer = useRef();
  const reviewsContainerRef = useRef(null);

  const debounce = useCallback((func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  const lastReviewElementRef = useCallback(
    (node) => {
      if (loadingReviews || !node) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            debounce(() => setPage((prevPage) => prevPage + 1), 300)();
          }
        },
        {
          root: reviewsContainerRef.current,
          rootMargin: '100px',
          threshold: 0.1,
        }
      );
      observer.current.observe(node);
    },
    [loadingReviews, hasMore, debounce]
  );

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [page, activeTab]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      fetchSimilarProducts();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const response = await api.get(`/products/similar/${id}`);
      setSimilarProducts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки похожих товаров:', error);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await api.get(`/product-reviews/product/${id}?page=${page}&size=5`);
      const { content, last } = response.data;
      setReviews((prevReviews) => (page === 0 ? content : [...prevReviews, ...content]));
      setHasMore(!last);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
      setError('Ошибка загрузки отзывов: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleAddToCart = async (productToAdd) => {
    if (!productToAdd || !productToAdd.id) {
      setError('Недействительный товар: отсутствует ID');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await addToCart({ ...productToAdd, quantity: productToAdd === product ? quantity : 1 });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#0ea5e9', '#38bdf8'],
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/login');
      } else {
        setError('Ошибка добавления в корзину: ' + (error.message || 'Неизвестная ошибка'));
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setError('Рейтинг должен быть от 1 до 5');
      return;
    }
    if (!reviewForm.comment.trim()) {
      setError('Комментарий не может быть пустым');
      return;
    }
    try {
      const response = await api.post('/product-reviews', {
        productId: id,
        comment: reviewForm.comment,
        rating: reviewForm.rating,
      });
      setReviews([response.data, ...reviews]);
      setReviewForm({ comment: '', rating: 0 });
      setError(null);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#0ea5e9'],
      });
      fetchProduct();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/login');
      } else {
        setError('Ошибка добавления отзыва: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const maskedMarketplaceLink = (url) => {
    return url ? (
      <span className="flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-cyan-400" />
        Зашифрованная ссылка на маркетплейс
      </span>
    ) : (
      'Ссылка недоступна'
    );
  };

  const renderDescription = (description) => {
    if (!description) return <p className="text-gray-300 text-base">Детали товара будут здесь.</p>;
    const lines = description.split('\n').filter((line) => line.trim() !== '');
    return (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        {lines.map((line, index) => {
          if (line.match(/^(•|\*|-|#)\s+/)) {
            const cleanedLine = line.replace(/^(•|\*|-|#)\s+/, '');
            return (
              <div key={index} className="flex items-start gap-2 pl-4">
                <span className="text-cyan-400 mt-1 flex-shrink-0">•</span>
                <span className="text-base">{cleanedLine}</span>
              </div>
            );
          }
          const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
          const boldMatches = [...line.matchAll(boldRegex)];
          if (boldMatches.length > 0) {
            const parts = line.split(boldRegex);
            return (
              <p key={index} className="text-base">
                {parts.map((part, i) =>
                  i % 2 === 1 && (part.includes('**') || part.includes('__')) ? (
                    <span key={i} className="font-bold text-white">
                      {part.slice(2, -2)}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </p>
            );
          }
          const italicRegex = /\*(.*?)\*|_(.*?)_/g;
          const italicMatches = [...line.matchAll(italicRegex)];
          if (italicMatches.length > 0) {
            const parts = line.split(italicRegex);
            return (
              <p key={index} className="text-base">
                {parts.map((part, i) =>
                  i % 2 === 1 && (part.includes('*') || part.includes('_')) ? (
                    <span key={i} className="italic text-gray-200">
                      {part.slice(2, -2)}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </p>
            );
          }
          return <p key={index} className="text-base">{line}</p>;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-cyan-500 mx-auto mb-4" />
          Загрузка...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-300 text-2xl bg-red-500/30 p-6 rounded-lg border border-red-500/50 shadow-lg"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-gray-300 text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          Товар не найден
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight">
            Подробности товара: {product.name}
          </h2>
          <p className="text-lg text-gray-300 mt-2">Ознакомьтесь с деталями и добавьте товар в корзину</p>
        </motion.header>

        {/* Error Message */}
        <AnimatePresence>
          {(cartError || error) && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-center text-base font-medium shadow-md"
            >
              {cartError || error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Layout */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-8 mb-12"
        >
          {/* Product Image */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="w-full lg:w-1/2 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 transition-shadow duration-300 hover:shadow-cyan-500/40 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg border border-gray-600/20 transform hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/384x384?text=Изображение+не+доступно';
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-300 text-base border border-gray-600/20">
                  Изображение отсутствует
                </div>
              )}
            </motion.div>
          </Tilt>

          {/* Product Information */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="w-full lg:w-1/2 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 transition-shadow duration-300 hover:shadow-cyan-500/40 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">{product.name}</h3>
              <div className="flex justify-between mb-4">
                <span className="text-green-400 font-semibold text-xl">¥{product.price?.toFixed(2)}</span>
                <span className="text-yellow-400 font-semibold text-xl">BYN {(product.price * 3.5)?.toFixed(2)}</span>
              </div>
              {/* Average Rating Display */}
              {product.reviewQuantity > 0 ? (
                <div className="flex items-center mb-4">
                  <span className="text-gray-300 font-medium mr-2">Средний рейтинг:</span>
                  <span className="text-yellow-400 font-bold">
                    {(product.totalReviewSumm / product.reviewQuantity).toFixed(1)}
                  </span>
                  <div className="ml-2 flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(product.totalReviewSumm / product.reviewQuantity)
                            ? 'text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-300 ml-2">({product.reviewQuantity} отзывов)</span>
                </div>
              ) : (
                <div className="mb-4">
                  <span className="text-gray-300">Отзывов пока нет</span>
                </div>
              )}
              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">Количество:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
                  min="1"
                />
              </div>
              {/* Action Buttons */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddToCart(product)}
                className="w-full px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm mb-2"
                disabled={cartLoading}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Добавить в корзину
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="w-full px-6 py-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Назад
              </motion.button>
              {/* Marketplace Link */}
              <div className="mt-4">
                <p className="text-sm text-gray-200 mb-2">Куплено на:</p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Открывается: ${product.url}`);
                  }}
                >
                  {maskedMarketplaceLink(product.url)}
                </a>
              </div>
            </motion.div>
          </Tilt>
        </motion.section>

        {/* Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex border-b border-cyan-500/30 mb-6">
            {['details', 'reviews'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 text-lg font-semibold ${
                  activeTab === tab
                    ? 'border-b-2 border-cyan-500 text-cyan-400'
                    : 'text-gray-300 hover:text-gray-200'
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'reviews') {
                    setPage(0);
                    setReviews([]);
                    setHasMore(true);
                  }
                }}
              >
                {tab === 'details' ? 'Детали' : 'Отзывы'}
              </motion.button>
            ))}
          </div>
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
            />
            {activeTab === 'details' && (
              <div>
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-cyan-400 mb-4">Описание</h4>
                  {renderDescription(product.description)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-cyan-400 mb-4">Информация о товаре</h4>
                  <p className="text-gray-300 text-base mb-2">Продано: {product.salesCount || 0} раз</p>
                  <p className="text-gray-300 text-base mb-2">Кластер: {product.cluster !== undefined ? product.cluster : 'Не определен'}</p>
                  <p className="text-gray-300 text-base">Последнее обновление: {new Date(product.lastUpdated).toLocaleString('ru-RU')}</p>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {/* Reviews List */}
                <div ref={reviewsContainerRef} className="max-h-[50vh] overflow-y-auto no-scrollbar">
                  <style jsx>{`
                    .no-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                    .no-scrollbar {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}
                  </style>
                  <h4 className="text-xl font-bold text-cyan-400 mb-4">Отзывы</h4>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <div
                          key={review.id}
                          ref={index === reviews.length - 1 ? lastReviewElementRef : null}
                          className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-lg p-4 border border-cyan-500/30 shadow-md hover:shadow-cyan-500/30 transition-shadow duration-300"
                        >
                          <div className="flex items-center mb-2">
                            <p className="text-gray-200 font-semibold">{review.username}</p>
                            <div className="ml-2 flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm">{new Date(review.createdAt).toLocaleString('ru-RU')}</p>
                          <p className="text-gray-300 text-base mt-2">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-300 text-base">Отзывов пока нет. Будьте первым!</p>
                  )}
                  {loadingReviews && (
                    <div className="text-center text-gray-300 mt-4">
                      <ClockIcon className="w-6 h-6 animate-spin mx-auto text-cyan-500" />
                      <p className="text-base">Загрузка...</p>
                    </div>
                  )}
                </div>
                {/* Review Form */}
                <div className="mt-6 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                      backgroundRepeat: 'repeat',
                    }}
                  />
                  <form onSubmit={handleReviewSubmit}>
                    <h5 className="text-lg font-semibold text-gray-200 mb-2">Оставить отзыв</h5>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">Рейтинг:</label>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                          >
                            <StarIcon className="w-full h-full" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">Комментарий:</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full p-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
                        rows="4"
                        placeholder="Ваш отзыв о товаре..."
                      />
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold shadow-sm"
                      disabled={cartLoading || loadingReviews}
                    >
                      Отправить отзыв
                    </motion.button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Similar Products */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Похожие товары</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.length > 0 ? (
              similarProducts.map((similar, index) => (
                <Tilt key={similar.id} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
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
                    />
                    <div className="w-full h-48 overflow-hidden rounded-lg">
                      {similar.imageUrl ? (
                        <img
                          src={similar.imageUrl}
                          alt={similar.name}
                          className="w-full h-full object-cover transform hover:scale-105 transition duration-300 border border-gray-600/20"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/192x192?text=Изображение+не+доступно';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700/50 flex items-center justify-center text-gray-300 text-base border border-gray-600/20">
                          Изображение отсутствует
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{similar.name}</h4>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(similar)}
                        className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm mb-2"
                        disabled={cartLoading}
                      >
                        <ShoppingCartIcon className="w-5 h-5" />
                        Добавить в корзину
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/product/${similar.id}`)}
                        className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold shadow-sm"
                      >
                        Подробнее
                      </motion.button>
                    </div>
                  </motion.div>
                </Tilt>
              ))
            ) : (
              <p className="text-gray-300 text-base text-center col-span-full bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30">
                Похожие товары не найдены
              </p>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default ProductDetail;