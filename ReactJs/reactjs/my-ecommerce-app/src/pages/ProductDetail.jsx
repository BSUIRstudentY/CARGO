import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import { ShoppingCartIcon, ArrowLeftIcon, LinkIcon, StarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';

// Append global styles for consistency with DeliveryPayment.jsx
const styles = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.6s ease-out;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

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
        colors: ['#FF2549', '#F87171', '#FECACA'],
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
        colors: ['#FF2549', '#F87171', '#FECACA'],
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
        <LinkIcon className="w-5 h-5 text-accent-primary" />
        Зашифрованная ссылка на маркетплейс
      </span>
    ) : (
      <span className="break-words">Ссылка недоступна</span>
    );
  };

  const renderDescription = (description) => {
    if (!description) return <p className="text-secondary text-base break-words font-sans">Детали товара будут здесь.</p>;
    const lines = description.split('\n').filter((line) => line.trim() !== '');
    return (
      <div className="space-y-4 text-secondary leading-relaxed font-sans">
        {lines.map((line, index) => {
          if (line.match(/^(•|\*|-|#)\s+/)) {
            const cleanedLine = line.replace(/^(•|\*|-|#)\s+/, '');
            return (
              <div key={index} className="flex items-start gap-2 pl-4">
                <span className="text-accent-primary mt-1 flex-shrink-0">•</span>
                <span className="text-base break-words font-sans" style={{
                  '@media (max-width: 640px)': {
                    fontSize: '14px',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}>{cleanedLine}</span>
              </div>
            );
          }
          const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
          const boldMatches = [...line.matchAll(boldRegex)];
          if (boldMatches.length > 0) {
            const parts = line.split(boldRegex);
            return (
              <p key={index} className="text-base break-words font-sans">
                {parts.map((part, i) =>
                  i % 2 === 1 && (part.includes('**') || part.includes('__')) ? (
                    <span key={i} className="font-bold text-primary">
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
              <p key={index} className="text-base break-words font-sans">
                {parts.map((part, i) =>
                  i % 2 === 1 && (part.includes('*') || part.includes('_')) ? (
                    <span key={i} className="italic text-primary">
                      {part.slice(2, -2)}
                    </span>
                  ) : (
                    <span key={i} className="break-words">{part}</span>
                  )
                )}
              </p>
            );
          }
          return <p key={index} className="text-base break-words font-sans">{line}</p>;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary" style={{
        '@media (max-width: 640px)': {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-accent-primary text-2xl bg-tertiary p-6 rounded-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 break-words font-sans"
          style={{
            '@media (max-width: 640px)': {
              fontSize: '18px',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-accent-primary mx-auto mb-4" style={{
            '@media (max-width: 640px)': {
              width: '40px',
              height: '40px',
              borderTopWidth: '3px',
              marginBottom: '16px',
            }
          }} />
          Загрузка...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary" style={{
        '@media (max-width: 640px)': {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-400 text-2xl bg-red-500/20 p-6 rounded-lg border border-red-500/50 shadow-card break-words font-sans"
          style={{
            '@media (max-width: 640px)': {
              fontSize: '18px',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}
        >
          {error}
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary" style={{
        '@media (max-width: 640px)': {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-secondary text-2xl bg-tertiary p-6 rounded-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 break-words font-sans"
          style={{
            '@media (max-width: 640px)': {
              fontSize: '18px',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}
        >
          Товар не найден
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-secondary py-12 px-4 sm:px-6 lg:px-8 relative" style={{
      '@media (max-width: 640px)': {
        minHeight: '100vh',
        padding: '16px',
      }
    }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,37,73,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10" style={{
        '@media (max-width: 640px)': {
          maxWidth: '100%',
          margin: '0 auto',
        }
      }}>
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
          style={{
            '@media (max-width: 640px)': {
              marginBottom: '24px',
              textAlign: 'center',
            }
          }}
        >
          <h2 className="text-4xl font-bold font-display text-accent-primary tracking-tight break-words animate-fade-in-down" style={{
            '@media (max-width: 640px)': {
              fontSize: '24px',
              fontWeight: '700',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}>
            Подробности товара: {product.name}
          </h2>
          <p className="text-lg text-secondary font-sans mt-2 break-words" style={{
            '@media (max-width: 640px)': {
              fontSize: '14px',
              marginTop: '8px',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}>
            Ознакомьтесь с деталями и добавьте товар в корзину
          </p>
        </motion.header>
        {/* Error Message */}
        <AnimatePresence>
          {(cartError || error) && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-base font-medium font-sans shadow-card break-words"
              style={{
                '@media (max-width: 640px)': {
                  marginBottom: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }
              }}
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
          style={{
            '@media (max-width: 640px)': {
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px',
            }
          }}
        >
          {/* Product Image */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="w-full lg:w-1/2 bg-tertiary rounded-2xl p-6 shadow-card border border-primary/50 transition-shadow duration-300 hover:shadow-accent-primary/40 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                '@media (max-width: 640px)': {
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              {product.imageUrl ? (
                <div className="w-full h-96 rounded-lg border border-primary/50 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/384x384?text=Изображение+не+доступно';
                    }}
                    style={{
                      '@media (max-width: 640px)': {
                        height: '256px',
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-tertiary rounded-lg flex items-center justify-center text-secondary text-base border border-primary/50 break-words font-sans" style={{
                  '@media (max-width: 640px)': {
                    height: '256px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}>
                  Изображение отсутствует
                </div>
              )}
            </motion.div>
          </Tilt>
          {/* Product Information */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="w-full lg:w-1/2 bg-tertiary rounded-2xl p-6 shadow-card border border-primary/50 transition-shadow duration-300 hover:shadow-accent-primary/40 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                '@media (max-width: 640px)': {
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h3 className="text-2xl font-bold font-display text-accent-primary mb-4 break-words" style={{
                '@media (max-width: 640px)': {
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }
              }}>{product.name}</h3>
              <div className="mb-4" style={{
                '@media (max-width: 640px)': {
                  marginBottom: '16px',
                }
              }}>
                <span className="text-green-400 font-semibold text-xl break-words font-sans" style={{
                  '@media (max-width: 640px)': {
                    fontSize: '18px',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}>¥{product.price?.toFixed(2)}</span>
              </div>
              {/* Average Rating Display */}
              {product.reviewQuantity > 0 ? (
                <div className="mb-4" style={{
                  '@media (max-width: 640px)': {
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }
                }}>
                  <div className="flex items-center" style={{
                    '@media (max-width: 640px)': {
                      flexDirection: 'row',
                      alignItems: 'center',
                    }
                  }}>
                    <span className="text-secondary font-medium mr-2 break-words font-sans" style={{
                      '@media (max-width: 640px)': {
                        fontSize: '14px',
                        marginRight: '8px',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                      }
                    }}>Средний рейтинг:</span>
                    <span className="text-yellow-400 font-bold break-words font-sans" style={{
                      '@media (max-width: 640px)': {
                        fontSize: '14px',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                      }
                    }}>
                      {(product.totalReviewSumm / product.reviewQuantity).toFixed(1)}
                    </span>
                    <div className="ml-2 flex" style={{
                      '@media (max-width: 640px)': {
                        marginLeft: '8px',
                      }
                    }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(product.totalReviewSumm / product.reviewQuantity)
                              ? 'text-yellow-400'
                              : 'text-primary'
                          }`}
                          style={{
                            '@media (max-width: 640px)': {
                              width: '16px',
                              height: '16px',
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-secondary break-words font-sans" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '14px',
                      marginTop: '4px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}>({product.reviewQuantity} отзывов)</span>
                </div>
              ) : (
                <div className="mb-4" style={{
                  '@media (max-width: 640px)': {
                    marginBottom: '16px',
                  }
                }}>
                  <span className="text-secondary break-words font-sans" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '14px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}>Отзывов пока нет</span>
                </div>
              )}
              {/* Quantity */}
              <div className="mb-4" style={{
                '@media (max-width: 640px)': {
                  marginBottom: '16px',
                }
              }}>
                <label className="block text-sm font-medium text-secondary mb-2 break-words font-sans" style={{
                  '@media (max-width: 640px)': {
                    fontSize: '12px',
                    marginBottom: '8px',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}>Количество:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-3 bg-tertiary text-secondary border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 font-sans"
                  min="1"
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '8px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}
                />
              </div>
              {/* Action Buttons */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddToCart(product)}
                className="w-full px-6 py-3 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card mb-2 break-words"
                disabled={cartLoading}
                style={{
                  '@media (max-width: 640px)': {
                    padding: '10px 16px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    marginBottom: '8px',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}
              >
                <ShoppingCartIcon className="w-5 h-5" style={{
                  '@media (max-width: 640px)': {
                    width: '16px',
                    height: '16px',
                  }
                }} />
                Добавить в корзину
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="w-full px-6 py-3 bg-tertiary text-secondary rounded-lg hover:bg-tertiary/80 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card break-words"
                style={{
                  '@media (max-width: 640px)': {
                    padding: '10px 16px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}
              >
                <ArrowLeftIcon className="w-5 h-5" style={{
                  '@media (max-width: 640px)': {
                    width: '16px',
                    height: '16px',
                  }
                }} />
                Назад
              </motion.button>
              {/* Marketplace Link */}
              <div className="mt-4" style={{
                '@media (max-width: 640px)': {
                  marginTop: '16px',
                }
              }}>
                <p className="text-sm text-secondary mb-2 break-words font-sans" style={{
                  '@media (max-width: 640px)': {
                    fontSize: '12px',
                    marginBottom: '8px',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}>Куплено на:</p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline flex items-center gap-2 break-words font-sans"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Открывается: ${product.url}`);
                  }}
                  style={{
                    '@media (max-width: 640px)': {
                      fontSize: '14px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
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
          style={{
            '@media (max-width: 640px)': {
              marginBottom: '24px',
            }
          }}
        >
          <div className="flex border-b border-primary/50 mb-6" style={{
            '@media (max-width: 640px)': {
              marginBottom: '16px',
            }
          }}>
            {['details', 'reviews'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 text-lg font-semibold font-sans break-words ${
                  activeTab === tab
                    ? 'border-b-2 border-accent-primary text-accent-primary'
                    : 'text-secondary hover:text-accent-primary'
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'reviews') {
                    setPage(0);
                    setReviews([]);
                    setHasMore(true);
                  }
                }}
                style={{
                  '@media (max-width: 640px)': {
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}
              >
                {tab === 'details' ? 'Детали' : 'Отзывы'}
              </motion.button>
            ))}
          </div>
          <div className="bg-tertiary rounded-2xl p-6 shadow-card border border-primary/50 relative overflow-hidden" style={{
            '@media (max-width: 640px)': {
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                backgroundRepeat: 'repeat',
              }}
            />
            {activeTab === 'details' && (
              <div>
                <div className="mb-6" style={{
                  '@media (max-width: 640px)': {
                    marginBottom: '16px',
                  }
                }}>
                  <h4 className="text-xl font-bold font-display text-accent-primary mb-4 break-words" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '12px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}>Описание</h4>
                  {renderDescription(product.description)}
                </div>
                <div>
                  <h4 className="text-xl font-bold font-display text-accent-primary mb-4 break-words" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '12px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}>Информация о товаре</h4>
                  <p className="text-secondary text-base mb-2 break-words font-sans" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '14px',
                      marginBottom: '8px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}>Продано: {product.salesCount || 0} раз</p>
                  <p className="text-secondary text-base mb-2 break-words font-sans" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '14px',
                      marginBottom: '8px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}>Кластер: {product.cluster !== undefined ? product.cluster : 'Не определен'}</p>
                  <p className="text-secondary text-base break-words font-sans" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '14px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}>Последнее обновление: {new Date(product.lastUpdated).toLocaleString('ru-RU')}</p>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {/* Reviews List */}
                <div ref={reviewsContainerRef} className="max-h-[50vh] overflow-y-auto no-scrollbar">
                  <h4 className="text-xl font-bold font-display text-accent-primary mb-4 break-words" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '12px',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }
                  }}>Отзывы</h4>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <div
                          key={review.id}
                          ref={index === reviews.length - 1 ? lastReviewElementRef : null}
                          className="bg-tertiary rounded-lg p-4 border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300"
                          style={{
                            '@media (max-width: 640px)': {
                              padding: '12px',
                              borderRadius: '8px',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }
                          }}
                        >
                          <div className="flex items-center mb-2" style={{
                            '@media (max-width: 640px)': {
                              marginBottom: '8px',
                            }
                          }}>
                            <p className="text-primary font-semibold break-words font-sans" style={{
                              '@media (max-width: 640px)': {
                                fontSize: '14px',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                              }
                            }}>{review.username}</p>
                            <div className="ml-2 flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-primary'}`}
                                  style={{
                                    '@media (max-width: 640px)': {
                                      width: '16px',
                                      height: '16px',
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-secondary text-sm break-words font-sans" style={{
                            '@media (max-width: 640px)': {
                              fontSize: '12px',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal',
                            }
                          }}>{new Date(review.createdAt).toLocaleString('ru-RU')}</p>
                          <p className="text-secondary text-base mt-2 break-words font-sans" style={{
                            '@media (max-width: 640px)': {
                              fontSize: '14px',
                              marginTop: '8px',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal',
                            }
                          }}>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary text-base break-words font-sans" style={{
                      '@media (max-width: 640px)': {
                        fontSize: '14px',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                      }
                    }}>Отзывов пока нет. Будьте первым!</p>
                  )}
                  {loadingReviews && (
                    <div className="text-center text-secondary mt-4" style={{
                      '@media (max-width: 640px)': {
                        marginTop: '16px',
                      }
                    }}>
                      <ClockIcon className="w-6 h-6 animate-spin mx-auto text-accent-primary" style={{
                        '@media (max-width: 640px)': {
                          width: '20px',
                          height: '20px',
                        }
                      }} />
                      <p className="text-base break-words font-sans" style={{
                        '@media (max-width: 640px)': {
                          fontSize: '14px',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                        }
                      }}>Загрузка...</p>
                    </div>
                  )}
                </div>
                {/* Review Form */}
                <div className="mt-6 bg-tertiary rounded-2xl p-6 shadow-card border border-primary/50 relative overflow-hidden" style={{
                  '@media (max-width: 640px)': {
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }
                }}>
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                      backgroundRepeat: 'repeat',
                    }}
                  />
                  <form onSubmit={handleReviewSubmit}>
                    <h5 className="text-lg font-semibold text-secondary mb-2 break-words font-sans" style={{
                      '@media (max-width: 640px)': {
                        fontSize: '16px',
                        marginBottom: '8px',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                      }
                    }}>Оставить отзыв</h5>
                    <div className="mb-4" style={{
                      '@media (max-width: 640px)': {
                        marginBottom: '16px',
                      }
                    }}>
                      <label className="block text-sm font-medium text-secondary mb-2 break-words font-sans" style={{
                        '@media (max-width: 640px)': {
                          fontSize: '12px',
                          marginBottom: '8px',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                        }
                      }}>Рейтинг:</label>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-primary'}`}
                            style={{
                              '@media (max-width: 640px)': {
                                width: '24px',
                                height: '24px',
                              }
                            }}
                          >
                            <StarIcon className="w-full h-full" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4" style={{
                      '@media (max-width: 640px)': {
                        marginBottom: '16px',
                      }
                    }}>
                      <label className="block text-sm font-medium text-secondary mb-2 break-words font-sans" style={{
                        '@media (max-width: 640px)': {
                          fontSize: '12px',
                          marginBottom: '8px',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                        }
                      }}>Комментарий:</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full p-3 bg-tertiary text-secondary border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 font-sans break-words"
                        rows="4"
                        placeholder="Ваш отзыв о товаре..."
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            rows: '3',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                          }
                        }}
                      />
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans shadow-card break-words"
                      disabled={cartLoading || loadingReviews}
                      style={{
                        '@media (max-width: 640px)': {
                          padding: '8px 12px',
                          fontSize: '14px',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                        }
                      }}
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
          style={{
            '@media (max-width: 640px)': {
              marginBottom: '24px',
            }
          }}
        >
          <h3 className="text-2xl font-bold font-display text-accent-primary mb-6 break-words" style={{
            '@media (max-width: 640px)': {
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '16px',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}>Похожие товары</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" style={{
            '@media (max-width: 640px)': {
              gridTemplateColumns: '1fr',
              gap: '16px',
            }
          }}>
            {similarProducts.length > 0 ? (
              similarProducts.map((similar, index) => (
                <Tilt key={similar.id} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    className="bg-tertiary rounded-2xl p-4 border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden flex flex-col h-[400px]"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      '@media (max-width: 640px)': {
                        padding: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        height: '300px',
                      }
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    <div className="w-full h-48 overflow-hidden rounded-lg flex-grow-0" style={{
                      '@media (max-width: 640px)': {
                        height: '144px',
                        borderRadius: '6px',
                      }
                    }}>
                      {similar.imageUrl ? (
                        <img
                          src={similar.imageUrl}
                          alt={similar.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/192x192?text=Изображение+не+доступно';
                          }}
                          style={{
                            '@media (max-width: 640px)': {
                              borderRadius: '6px',
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-tertiary flex items-center justify-center text-secondary text-base border border-primary/50 break-words font-sans" style={{
                          '@media (max-width: 640px)': {
                            borderRadius: '6px',
                            fontSize: '12px',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                          }
                        }}>
                          Изображение отсутствует
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow" style={{
                      '@media (max-width: 640px)': {
                        padding: '12px',
                      }
                    }}>
                      <h4 className="text-lg font-bold text-accent-primary mb-2 line-clamp-2 font-sans" style={{
                        '@media (max-width: 640px)': {
                          fontSize: '16px',
                          fontWeight: '700',
                          marginBottom: '8px',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                        }
                      }}>{similar.name}</h4>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(similar)}
                        className="w-full px-4 py-2 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card mb-2 break-words"
                        disabled={cartLoading}
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            marginBottom: '8px',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                          }
                        }}
                      >
                        <ShoppingCartIcon className="w-5 h-5" style={{
                          '@media (max-width: 640px)': {
                            width: '16px',
                            height: '16px',
                          }
                        }} />
                        Добавить в корзину
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/product/${similar.id}`)}
                        className="w-full px-4 py-2 bg-tertiary text-secondary rounded-lg hover:bg-tertiary/80 transition duration-300 text-base font-semibold font-sans shadow-card break-words"
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                          }
                        }}
                      >
                        Подробнее
                      </motion.button>
                    </div>
                  </motion.div>
                </Tilt>
              ))
            ) : (
              <p className="text-secondary text-base text-center bg-tertiary p-6 rounded-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 break-words font-sans col-span-full" style={{
                '@media (max-width: 640px)': {
                  fontSize: '14px',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }
              }}>
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