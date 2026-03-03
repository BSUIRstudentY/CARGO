import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ProductCard } from '../components/ui/ProductCard';
import { StyledSelect } from '../components/ui/StyledSelect';
import Footer from './Footer';

/**
 * Каталог товаров из Китая с современным дизайном
 */
function Catalog() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canvasRef = useRef(null);
  const particlesApiRef = useRef(null);
  
  const { addSingleToCart, cart, loading: cartLoading, error: cartError } = useCart();
  const navigate = useNavigate();
  const productsPerPage = 20;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const check = () => setReduceMotion(mq.matches);
    check();
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage - 1,
        size: productsPerPage,
      };
      
      // Добавляем параметры только если они заданы
      if (searchTerm && searchTerm.trim()) {
        params.searchTerm = searchTerm.trim();
      }
      if (sortBy) {
        params.sortBy = sortBy;
      }
      
      const response = await api.get('/catalog', { params });
      
      console.log('Catalog API Response:', response.data);
      
      // Обработка разных форматов ответа
      let productsData = [];
      let totalPagesData = 1;
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Если ответ - массив
          productsData = response.data;
        } else if (response.data.content) {
          // Если ответ - объект с content
          productsData = response.data.content || [];
          totalPagesData = response.data.totalPages || 1;
        } else if (response.data.products) {
          // Если ответ - объект с products
          productsData = response.data.products || [];
          totalPagesData = response.data.totalPages || 1;
        }
      }
      
      // Фильтруем null и невалидные товары
      productsData = productsData.filter(product => 
        product != null && 
        product.id != null && 
        product.id !== undefined &&
        product.name != null
      );
      
      console.log('Parsed products:', productsData.length, 'Total pages:', totalPagesData);
      
      setProducts(productsData);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setError(error.response?.data?.message || error.message || 'Ошибка загрузки товаров');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setCurrentPage(1);
      fetchProducts();
    }
  }, [searchTerm]);

  const handleAddToCart = useCallback(async (product) => {
    if (!product?.id) {
      setError('Неверный товар: отсутствует ID');
      return;
    }
    try {
      const existingItem = cart?.find((item) => item.id === product.id);
      if (existingItem) {
        await addSingleToCart({ ...existingItem, quantity: existingItem.quantity + 1 });
      } else {
        await addSingleToCart({ ...product, quantity: 1 });
      }
      confetti({
        particleCount: isMobile ? 50 : 100,
        spread: isMobile ? 60 : 70,
        origin: { y: 0.6 },
        colors: ['#C9A97A', 'rgba(201,169,122,0.8)', '#F5F5F5'],
      });
    } catch (error) {
      setError('Ошибка добавления в корзину: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 403) {
        navigate('/login');
      }
    }
  }, [cart, addSingleToCart, isMobile, navigate]);

  const handleViewProduct = useCallback((productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      setError('Неверный ID товара');
    }
  }, [navigate]);

  const paginate = useCallback((pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    setTimeout(() => fetchProducts(), 0);
  }, []);

  // Canvas — золотые звёзды + соединяющиеся линии (как в старой главной)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const particlesRef = { current: [] };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor(initX, initY) {
        this.x = initX ?? Math.random() * width;
        this.y = initY ?? Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = `rgba(201, 169, 122, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 100; i++) particlesRef.current.push(new Particle());

    particlesApiRef.current = {
      addParticles(px, py) {
        const count = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
          const dist = 8 + Math.random() * 12;
          const x = px + Math.cos(angle) * dist;
          const y = py + Math.sin(angle) * dist;
          const p = new Particle(x, y);
          p.speedX = (Math.random() - 0.5) * 0.2;
          p.speedY = (Math.random() - 0.5) * 0.2;
          p.opacity = 0.2 + Math.random() * 0.4;
          particlesRef.current.push(p);
        }
      },
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.06)';
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      particles.forEach((p, i) => {
        p.update();
        p.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.strokeStyle = `rgba(201, 169, 122, ${0.12 * (1 - d / 140)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      particlesApiRef.current = null;
      window.removeEventListener('resize', resize);
    };
  }, [reduceMotion]);

  // Мемоизация для оптимизации
  const displayedError = useMemo(() => error || cartError, [error, cartError]);

  const location = useLocation();
  const searchQuery = searchTerm ? ` - ${searchTerm}` : '';
  const pageTitle = `Примеры товаров из Китая${searchQuery} | Fluvion`;
  const pageDescription = searchTerm 
    ? `Найдено по запросу "${searchTerm}" — примеры товаров Fluvion. Доставка из Китая в Беларусь за 18-35 дней.`
    : `Примеры товаров, которые уже заказывали клиенты. Доставка из Китая в Беларусь. Фиксированная цена $7/кг.`;

  return (
    <div
      className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] relative overflow-x-hidden pb-24 sm:pb-0 font-[var(--ev-font-body)] cursor-crosshair"
      onClick={(e) => {
        const canvas = canvasRef.current;
        if (!canvas || !particlesApiRef.current) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * scaleX;
        const py = (e.clientY - rect.top) * scaleY;
        particlesApiRef.current.addParticles(px, py);
      }}
    >
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`каталог товаров из Китая, товары из Китая, ${searchTerm || 'китайские товары'}, доставка из Китая, Fluvion каталог`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://fluvion.by${location.pathname}${location.search}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://fluvion.by/logo.png" />
        <link rel="canonical" href={`https://fluvion.by${location.pathname}${location.search}`} />
      </Helmet>
      {/* Эфирные звёзды — фон */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[1] pointer-events-none"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--ev-void)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--ev-gold)_0.5px,transparent_1px)] bg-[length:32px_32px] md:bg-[length:40px_40px] opacity-[0.04] md:opacity-[0.06]" />
      </div>

      {/* Контент и футер поверх фона и canvas */}
      <div className="relative z-10">
      {/* МОБИЛЬНАЯ ВЕРСИЯ - показывается только на мобильных */}
      <div className="lg:hidden">
        {/* Мобильный Hero: overflow-x-hidden чтобы выпадающий список сортировки не обрезался */}
        <section className="relative overflow-x-hidden py-6 z-20">
          <div className="max-w-screen-xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-4"
            >
              <p className="ev-label text-[var(--ev-gold)] mb-2">Примеры товаров</p>
              <h1 className="font-ev-hero text-2xl sm:text-3xl font-light tracking-[-0.02em] text-[var(--ev-gold)]">
                Примеры товаров
              </h1>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-4"
              >
                <div className="p-3 rounded-xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-[var(--ev-gold)] flex-shrink-0 mt-0.5" aria-hidden />
                    <div className="text-left">
                      <p className="text-xs font-medium text-[var(--ev-gold)] mb-0.5">
                        Только проверенные товары
                      </p>
                      <p className="text-xs text-[var(--ev-text-muted)] leading-relaxed">
                        Уже заказывали наши клиенты. Другой товар — через раздел «Заказать товар».
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-4 relative z-20"
            >
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--ev-text-muted)]" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full pl-10 pr-20 py-2.5 bg-[var(--ev-void)] border border-[var(--ev-gold)]/25 rounded-lg text-sm text-[var(--ev-text)] placeholder-[var(--ev-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/40 focus:border-[var(--ev-gold)]/50 transition-all"
                />
                <button
                  onClick={handleSearch}
                  type="button"
                  aria-label="Искать"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[var(--ev-gold)]/25 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/35 text-xs font-medium transition-colors"
                >
                  Найти
                </button>
              </div>
              <div>
                <StyledSelect
                  label="Сортировка"
                  value={sortBy}
                  onChange={(v) => { setSortBy(v); setCurrentPage(1); }}
                  options={[
                    { value: 'date_desc', label: 'Сначала новые' },
                    { value: 'price_asc', label: 'Цена: по возрастанию' },
                    { value: 'price_desc', label: 'Цена: по убыванию' },
                    { value: 'sales_desc', label: 'Популярность' },
                  ]}
                  placeholder="Сортировка"
                  className="text-sm"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Сообщения об ошибках для мобильных */}
        <AnimatePresence>
          {displayedError && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-screen-xl mx-auto px-4 mb-4"
            >
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm text-center">{displayedError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="max-w-screen-xl mx-auto px-4 mb-6">
            <div className="p-4 rounded-xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25">
              <div className="flex flex-col items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-2 border-[var(--ev-gold)]/20 border-t-[var(--ev-gold)] rounded-full mb-3"
                />
                <p className="text-[var(--ev-text-muted)] text-sm">Загружаем примеры товаров...</p>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <section className="max-w-screen-xl mx-auto px-4 pb-8 relative z-10" aria-label="Список товаров">
            {products.length > 0 ? (
              <>
                <p className="catalog-section-label mb-3 mt-2">Товары</p>
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 gap-2"
              >
                {products
                  .filter(product => product != null && product.id != null)
                  .map((product, index) => (
                    <ProductCard
                      key={product.id || `product-${index}`}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewProduct}
                      index={index}
                      isMobile={true}
                    />
                  ))}
              </motion.div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25">
                <div className="text-center py-8">
                  <p className="text-base sm:text-lg font-medium text-[var(--ev-text)] mb-1.5 sm:mb-2">
                    Товары не найдены
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--ev-text-muted)] mb-4">
                    {searchTerm ? `По запросу «${searchTerm}» ничего не найдено.` : 'Попробуйте изменить параметры поиска или сортировки.'}
                  </p>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--ev-gold)]/25 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/35 transition-colors"
                    >
                      Сбросить поиск
                    </button>
                  )}
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 mt-6"
              >
                <p className="text-xs text-[var(--ev-text-muted)]">
                  Страница {currentPage} из {totalPages}
                </p>
                <div className="flex justify-center items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1.5 rounded-lg bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/30 hover:shadow-[0_0_16px_var(--ev-gold-soft)] text-xs font-normal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      disabled={loading}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-normal transition-all duration-300 min-w-[2.5rem] disabled:opacity-50 disabled:cursor-not-allowed ${
                        isActive
                          ? 'bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)]'
                          : 'bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25 text-[var(--ev-text-muted)] hover:border-[var(--ev-gold)]/25 hover:text-[var(--ev-text)]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="text-[var(--ev-text-muted)] px-1 text-xs">...</span>
                )}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1.5 rounded-lg bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/30 hover:shadow-[0_0_16px_var(--ev-gold-soft)] text-xs font-normal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
                </div>
              </motion.div>
            )}
          </section>
        )}
      </div>

      {/* ДЕСКТОПНАЯ ВЕРСИЯ - показывается только на больших экранах */}
      <div className="hidden lg:block">

        {/* Hero секция каталога: overflow-x-hidden чтобы выпадающий список не обрезался */}
        <section className="relative overflow-x-hidden py-16 md:py-24 z-20 pb-safe">
        <div className="max-w-screen-xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="ev-label text-[var(--ev-gold)] mb-2">Примеры товаров</p>
            <h1 className="font-ev-hero text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.02em] text-[var(--ev-gold)] mb-6">
              Примеры товаров
            </h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <div className="p-6 md:p-8 rounded-2xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25">
                <div className="flex items-start gap-4">
                  <ExclamationTriangleIcon className="w-8 h-8 md:w-10 md:h-10 text-[var(--ev-gold)] flex-shrink-0" aria-hidden />
                  <div className="flex-1 text-left">
                    <h2 className="text-lg md:text-xl font-medium text-[var(--ev-gold)] mb-2 font-[var(--ev-font-display)]">
                      Только проверенные товары
                    </h2>
                    <p className="text-base md:text-lg text-[var(--ev-text)] leading-relaxed mb-2">
                      Здесь товары, которые уже заказывали наши клиенты.
                    </p>
                    <p className="text-sm md:text-base text-[var(--ev-text-muted)] leading-relaxed">
                      Чтобы заказать любой другой товар — используйте раздел «Заказать товар» в меню.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <p className="text-base md:text-lg text-[var(--ev-text-muted)] max-w-2xl mx-auto mb-2">
              Товары с отзывами и доставкой в Беларусь.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto relative z-20"
          >
            <div className="p-6 rounded-2xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25 mb-8">
              <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[var(--ev-text-muted)]" />
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full pl-12 pr-4 py-4 bg-[var(--ev-void)] border border-[var(--ev-gold)]/25 rounded-xl text-[var(--ev-text)] placeholder-[var(--ev-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/40 focus:border-[var(--ev-gold)]/50 transition-all"
                />
                <button
                  onClick={handleSearch}
                  type="button"
                  aria-label="Искать"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-xl bg-[var(--ev-gold)]/25 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/35 text-sm font-medium transition-colors"
                >
                  Найти
                </button>
              </div>
              <div>
                <StyledSelect
                  label="Сортировка"
                  value={sortBy}
                  onChange={(v) => { setSortBy(v); setCurrentPage(1); }}
                  options={[
                    { value: 'date_desc', label: 'Сначала новые' },
                    { value: 'price_asc', label: 'Цена: по возрастанию' },
                    { value: 'price_desc', label: 'Цена: по убыванию' },
                    { value: 'sales_desc', label: 'Популярность' },
                  ]}
                  placeholder="Сортировка"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

        <AnimatePresence>
          {displayedError && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-screen-xl mx-auto px-4 mb-6"
            >
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-center">{displayedError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="max-w-screen-xl mx-auto px-4 mb-8">
            <div className="p-6 rounded-2xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25">
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-2 border-[var(--ev-gold)]/20 border-t-[var(--ev-gold)] rounded-full mb-4"
                />
                <p className="text-[var(--ev-text-muted)] text-lg">Загружаем примеры товаров...</p>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <section className="max-w-screen-xl mx-auto px-4 pb-12 relative z-10" aria-label="Список товаров">
            {products.length > 0 ? (
              <>
                <p className="catalog-section-label mb-3 mt-2">Товары</p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
                >
                {products
                  .filter(product => product != null && product.id != null)
                  .map((product, index) => (
                    <ProductCard
                      key={product.id || `product-${index}`}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewProduct}
                      index={index}
                      isMobile={isMobile}
                    />
                  ))}
                </motion.div>
              </>
            ) : (
              <div className="p-6 rounded-2xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25">
                <div className="text-center py-12">
                  <p className="text-xl font-medium text-[var(--ev-text)] mb-2">
                    Товары не найдены
                  </p>
                  <p className="text-[var(--ev-text-muted)] mb-6">
                    {searchTerm ? `По запросу «${searchTerm}» ничего не найдено.` : 'Попробуйте изменить параметры поиска или сортировки.'}
                  </p>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--ev-gold)]/25 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/35 transition-colors"
                    >
                      Сбросить поиск
                    </button>
                  )}
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 mt-12 flex-wrap"
              >
                <p className="text-sm text-[var(--ev-text-muted)]">
                  Страница {currentPage} из {totalPages}
                  {products.length > 0 && (
                    <span className="ml-1">
                      · Показано {(currentPage - 1) * productsPerPage + 1}–{Math.min(currentPage * productsPerPage, (currentPage - 1) * productsPerPage + products.length)}
                    </span>
                  )}
                </p>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 rounded-xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/30 hover:shadow-[0_0_16px_var(--ev-gold-soft)] text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Назад
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-xl text-sm font-normal transition-all duration-300 min-w-[3rem] disabled:opacity-50 disabled:cursor-not-allowed ${
                        isActive
                          ? 'bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)]'
                          : 'bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25 text-[var(--ev-text-muted)] hover:border-[var(--ev-gold)]/25 hover:text-[var(--ev-text)]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 7 && currentPage < totalPages - 3 && (
                  <span className="text-[var(--ev-text-muted)] px-2">...</span>
                )}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 rounded-xl bg-[var(--ev-card-bg)] border border-[var(--ev-gold)]/25 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/30 hover:shadow-[0_0_16px_var(--ev-gold-soft)] text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Вперед
                </button>
                </div>
              </motion.div>
            )}
          </section>
        )}
      </div>
      <div className="relative z-10">
        <Footer id="contact" />
      </div>
      </div>
    </div>
  );
}

export default Catalog;
