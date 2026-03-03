import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import { ShoppingCartIcon, ArrowLeftIcon, LinkIcon, StarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../components/AuthProvider';

// Стили для скрытия скроллбара
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  if (!document.head.querySelector('style[data-product-detail]')) {
    styleSheet.setAttribute('data-product-detail', 'true');
    document.head.appendChild(styleSheet);
  }
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, loading: cartLoading, error: cartError } = useCart();
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const qty = productToAdd === product ? quantity : 1;
      await addToCart([{ ...productToAdd, quantity: qty }]);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A97A', '#D4AF37', '#F5F5F5'],
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
    if (!isAuthenticated) {
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
        colors: ['#C9A97A', '#D4AF37', '#F5F5F5'],
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
      <span className="flex items-center gap-2 break-words">
        <LinkIcon className="w-5 h-5 text-[var(--ev-gold)]" />
        <span className="text-[var(--ev-gold)]">Зашифрованная ссылка на маркетплейс</span>
      </span>
    ) : (
      <span className="break-words text-[var(--ev-text-muted)]">Ссылка недоступна</span>
    );
  };

  const renderDescription = (description) => {
    if (!description) return <p className="text-[var(--ev-text-muted)] text-base">Детали товара будут здесь.</p>;
    const lines = description.split('\n').filter((line) => line.trim() !== '');
    return (
      <div className="space-y-4 text-[var(--ev-text-muted)] leading-relaxed">
        {lines.map((line, index) => {
          if (line.match(/^(•|\*|-|#)\s+/)) {
            const cleanedLine = line.replace(/^(•|\*|-|#)\s+/, '');
            return (
              <div key={index} className="flex items-start gap-2 pl-4">
                <span className="text-[var(--ev-gold)] mt-1 flex-shrink-0">•</span>
                <span className="text-base sm:text-sm break-words">{cleanedLine}</span>
              </div>
            );
          }
          const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
          const boldMatches = [...line.matchAll(boldRegex)];
          if (boldMatches.length > 0) {
            const parts = line.split(boldRegex);
            return (
              <p key={index} className="text-base break-words">
                {parts.map((part, i) =>
                  i % 2 === 1 && (part.includes('**') || part.includes('__')) ? (
                    <span key={i} className="font-bold text-[var(--ev-text)]">
                      {part.slice(2, -2)}
                    </span>
                  ) : (
                    <span key={i} className="break-words">{part}</span>
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
              <p key={index} className="text-base break-words">
                {parts.map((part, i) =>
                  i % 2 === 1 && (part.includes('*') || part.includes('_')) ? (
                    <span key={i} className="italic text-[var(--ev-gold)]">
                      {part.slice(2, -2)}
                    </span>
                  ) : (
                    <span key={i} className="break-words">{part}</span>
                  )
                )}
              </p>
            );
          }
          return <p key={index} className="text-base break-words">{line}</p>;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-[var(--ev-gold)] bg-[var(--ev-glass)] p-8 rounded-2xl border border-[var(--ev-gold)]/20"
        >
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] mx-auto mb-3" />
          <p className="text-[var(--ev-text-muted)] text-sm">Загрузка товара...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <div className="max-w-md w-full p-8 bg-[var(--ev-glass)] rounded-2xl border border-[var(--ev-gold)]/15">
          <Alert type="error" message={error} />
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4 w-full border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <div className="max-w-md w-full p-8 text-center bg-[var(--ev-glass)] rounded-2xl border border-[var(--ev-gold)]/15">
          <p className="text-xl text-[var(--ev-text-muted)] mb-4">Товар не найден</p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  const location = useLocation();
  const productImage = product?.images && product.images.length > 0 
    ? product.images[0].startsWith('http') 
      ? product.images[0] 
      : `https://fluvion.by${product.images[0]}`
    : 'https://fluvion.by/logo.png';
  
  const productTitle = product ? `${product.name} | Fluvion` : 'Товар | Fluvion';
  const productDescription = product 
    ? `${product.description || product.name}. Доставка из Китая в Беларусь за 18-35 дней. Цена: $${product.price || 'N/A'}. Заказывайте на Fluvion.`
    : 'Товар из Китая с доставкой в Беларусь на Fluvion';
  
  const structuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || product.name,
    "image": productImage,
    "offers": {
      "@type": "Offer",
      "url": `https://fluvion.by/product/${product.id}`,
      "priceCurrency": "USD",
      "price": product.price?.toString() || "0",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Fluvion"
      }
    },
    "brand": {
      "@type": "Brand",
      "name": product.supplierName || "Fluvion"
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toString(),
      "reviewCount": product.reviewCount?.toString() || "0"
    } : undefined
  } : null;

  return (
    <div className="min-h-screen bg-transparent text-[var(--ev-text)] py-4 px-3 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden pb-20 sm:pb-12">
      {product && (
        <Helmet>
          <title>{productTitle}</title>
          <meta name="description" content={productDescription} />
          <meta name="keywords" content={`${product.name}, товар из Китая, доставка из Китая, ${product.category || 'китайские товары'}, Fluvion`} />
          <meta property="og:title" content={productTitle} />
          <meta property="og:description" content={productDescription} />
          <meta property="og:image" content={productImage} />
          <meta property="og:url" content={`https://fluvion.by${location.pathname}`} />
          <meta property="og:type" content="product" />
          <meta property="product:price:amount" content={product.price?.toString() || "0"} />
          <meta property="product:price:currency" content="USD" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content={productTitle} />
          <meta property="twitter:description" content={productDescription} />
          <meta property="twitter:image" content={productImage} />
          <link rel="canonical" href={`https://fluvion.by${location.pathname}`} />
          {structuredData && (
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
          )}
        </Helmet>
      )}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-4 sm:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-2 sm:mb-4 text-sm sm:text-base py-1.5 sm:py-2 -ml-1 border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            Назад
          </Button>
          <h1 className="text-xl sm:text-3xl font-semibold text-[var(--ev-text)] break-words line-clamp-3">
            {product.name}
          </h1>
          <p className="text-[var(--ev-text-muted)] text-sm sm:text-base mt-1">Детали и добавление в корзину</p>
        </div>
        
        {/* Error Message */}
        <AnimatePresence>
          {(cartError || error) && (
            <Alert
              type="error"
              message={cartError || error}
              onClose={() => {}}
              className="mb-8"
            />
          )}
        </AnimatePresence>
        {/* Main Layout */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 sm:gap-8 mb-6 sm:mb-12"
        >
          {/* Product Image */}
          <div className="w-full lg:w-1/2">
            <div className="p-2 sm:p-6 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/15 transition-all duration-300">
              {product.imageUrl ? (
                <div className="w-full rounded-lg sm:rounded-xl border border-[var(--ev-gold)]/20 overflow-hidden bg-[var(--ev-gold)]/5 flex items-center justify-center p-2 sm:p-8">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-auto max-w-full max-h-[50vh] sm:max-h-[70vh] object-contain"
                    style={{ imageRendering: 'auto' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/384x384?text=Нет+фото';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full min-h-[240px] sm:min-h-[500px] bg-[var(--ev-gold)]/5 rounded-xl flex items-center justify-center text-[var(--ev-text-muted)] text-xs sm:text-base border border-[var(--ev-gold)]/15">
                  Нет фото
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="w-full lg:w-1/2">
            <div className="p-3 sm:p-6 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
              <h3 className="text-base sm:text-2xl font-semibold mb-2 sm:mb-4 text-[var(--ev-text)] break-words line-clamp-3">
                {product.name}
              </h3>
              <div className="mb-3 sm:mb-4">
                <span className="text-[var(--ev-gold)] font-semibold text-lg sm:text-2xl break-words">¥{product.price?.toFixed(2)}</span>
              </div>
              {/* Average Rating Display */}
              {product.reviewQuantity > 0 ? (
                <div className="mb-3 sm:mb-4">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[var(--ev-text-muted)] text-xs sm:text-base font-medium break-words">Рейтинг:</span>
                    <span className="text-[var(--ev-gold)] font-bold text-sm sm:text-base">
                      {(product.totalReviewSumm / product.reviewQuantity).toFixed(1)}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${
                            i < Math.round(product.totalReviewSumm / product.reviewQuantity)
                              ? 'text-[var(--ev-gold)]'
                              : 'text-[var(--ev-text-muted)]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[var(--ev-text-muted)] text-xs sm:text-sm">({product.reviewQuantity})</span>
                </div>
              ) : (
                <div className="mb-3 sm:mb-4">
                  <span className="text-[var(--ev-text-muted)] text-xs sm:text-base">Нет отзывов</span>
                </div>
              )}
              {/* Quantity */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[var(--ev-text-muted)] mb-1 sm:mb-2">Количество:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2 sm:p-3 text-sm sm:text-base bg-[var(--ev-gold)]/5 text-[var(--ev-text)] border border-[var(--ev-gold)]/20 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/30 focus:border-[var(--ev-gold)]/50 transition duration-300"
                  min="1"
                />
              </div>
              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                <Button
                  variant="primary"
                  onClick={() => handleAddToCart(product)}
                  disabled={cartLoading}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base py-2.5 sm:py-3 bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
                >
                  <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  В корзину
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base py-2 sm:py-3 border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
                >
                  <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Назад
                </Button>
              </div>
              {/* Marketplace Link */}
              {product.url && (
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--ev-gold)]/15">
                  <p className="text-xs sm:text-sm text-[var(--ev-text-muted)] mb-1 sm:mb-2">Куплено на:</p>
                  <a
                    href={product.url.startsWith('http://') || product.url.startsWith('https://') ? product.url : `https://${product.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ev-gold)] hover:opacity-80 hover:underline flex items-center gap-2 break-words transition-colors"
                  >
                    {maskedMarketplaceLink(product.url)}
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.section>
        {/* Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 sm:mb-12"
        >
          <div className="flex border-b border-[var(--ev-gold)]/20 mb-4 sm:mb-6">
            {['details', 'reviews'].map((tab) => (
              <button
                key={tab}
                className={`px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-lg font-semibold transition-colors relative ${
                  activeTab === tab
                    ? 'text-[var(--ev-gold)]'
                    : 'text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)]/80'
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
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ev-gold)]"
                    layoutId="activeTab"
                  />
                )}
              </button>
            ))}
          </div>
          <div className="p-3 sm:p-6 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/15 transition-all duration-300">
            {activeTab === 'details' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-[var(--ev-text)]">
                    Описание
                  </h4>
                  {renderDescription(product.description)}
                </div>
                <div className="pt-4 sm:pt-6 border-t border-[var(--ev-gold)]/15">
                  <h4 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-[var(--ev-text)]">
                    О товаре
                  </h4>
                  <div className="space-y-1 sm:space-y-2 text-sm sm:text-base text-[var(--ev-text-muted)]">
                    <p><span className="text-[var(--ev-text)] font-medium">Продано:</span> {product.salesCount || 0}</p>
                    <p><span className="text-[var(--ev-text)] font-medium">Обновлено:</span> {new Date(product.lastUpdated).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-[var(--ev-text)]">
                    Отзывы
                  </h4>
                  <div ref={reviewsContainerRef} className="max-h-[40vh] sm:max-h-[50vh] overflow-y-auto no-scrollbar space-y-2 sm:space-y-4 pr-1 sm:pr-2">
                    {reviews.length > 0 ? (
                      reviews.map((review, index) => (
                        <div
                          key={review.id}
                          ref={index === reviews.length - 1 ? lastReviewElementRef : null}
                          className="p-3 sm:p-4 bg-[var(--ev-gold)]/5 rounded-lg sm:rounded-xl border border-[var(--ev-gold)]/15 transition-all duration-300"
                        >
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <p className="text-[var(--ev-text)] font-semibold text-sm sm:text-base">{review.username}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${i < review.rating ? 'text-[var(--ev-gold)]' : 'text-[var(--ev-text-muted)]'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[var(--ev-text-muted)] text-[10px] sm:text-sm mb-1 sm:mb-2">
                            {new Date(review.createdAt).toLocaleString('ru-RU')}
                          </p>
                          <p className="text-[var(--ev-text-muted)] text-xs sm:text-base break-words">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[var(--ev-text-muted)] text-sm sm:text-base">Нет отзывов. Будьте первым!</p>
                    )}
                    {loadingReviews && (
                      <div className="text-center text-[var(--ev-text-muted)] mt-3 sm:mt-4">
                        <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto text-[var(--ev-gold)] mb-1 sm:mb-2" />
                        <p className="text-sm sm:text-base">Загрузка...</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 sm:pt-6 border-t border-[var(--ev-gold)]/15">
                  <form onSubmit={handleReviewSubmit} className="space-y-3 sm:space-y-4">
                    <h5 className="text-sm sm:text-lg font-semibold text-[var(--ev-text)] mb-2 sm:mb-4">Оставить отзыв</h5>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[var(--ev-text-muted)] mb-1 sm:mb-2">Рейтинг:</label>
                      <div className="flex gap-1 sm:gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`w-7 h-7 sm:w-10 sm:h-10 transition-colors ${
                              star <= reviewForm.rating ? 'text-[var(--ev-gold)]' : 'text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)]/50'
                            }`}
                          >
                            <StarIcon className="w-full h-full" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[var(--ev-text-muted)] mb-1 sm:mb-2">Комментарий:</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full p-2 sm:p-3 text-sm sm:text-base bg-[var(--ev-gold)]/5 text-[var(--ev-text)] border border-[var(--ev-gold)]/20 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/30 focus:border-[var(--ev-gold)]/50 transition duration-300 resize-none min-h-[80px] placeholder-[var(--ev-text-muted)]"
                        rows="3"
                        placeholder="Ваш отзыв..."
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={cartLoading || loadingReviews || reviewForm.rating === 0 || !reviewForm.comment.trim()}
                      className="w-full text-sm sm:text-base py-2.5 sm:py-3 bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
                    >
                      Отправить
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </motion.section>
        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-6 sm:mb-12"
          >
            <h3 className="text-lg sm:text-2xl font-semibold mb-4 sm:mb-6 text-[var(--ev-text)]">
              Похожие
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
              {similarProducts.map((similar, index) => (
                <motion.div
                  key={similar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="p-2 sm:p-4 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/30 transition-all duration-300 flex flex-col"
                >
                  <div className="w-full aspect-square overflow-hidden rounded-lg sm:rounded-xl mb-2 sm:mb-4 bg-[var(--ev-gold)]/5 border border-[var(--ev-gold)]/15 flex items-center justify-center">
                    {similar.imageUrl ? (
                      <img
                        src={similar.imageUrl}
                        alt={similar.name}
                        className="w-full h-full object-contain p-1 sm:p-2"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/192x192?text=Нет+фото';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--ev-text-muted)] text-xs sm:text-sm">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow min-w-0">
                    <h4 className="text-xs sm:text-lg font-semibold mb-2 sm:mb-3 line-clamp-2 text-[var(--ev-text)] break-words">
                      {similar.name}
                    </h4>
                    <div className="mt-auto space-y-1 sm:space-y-2">
                      <Button
                        variant="primary"
                        onClick={() => handleAddToCart(similar)}
                        disabled={cartLoading}
                        className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm py-2 sm:py-2.5 bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
                      >
                        <ShoppingCartIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        В корзину
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/product/${similar.id}`)}
                        className="w-full text-xs sm:text-sm py-1.5 sm:py-2 border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
                      >
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;