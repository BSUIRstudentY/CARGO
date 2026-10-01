import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ProductCard } from '../components/ui/ProductCard';
import { StyledSelect } from '../components/ui/StyledSelect';

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
  
  const { addSingleToCart, cart, loading: cartLoading, error: cartError } = useCart();
  const navigate = useNavigate();
  const productsPerPage = 20;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        colors: ['#00f0ff', '#a78bfa', '#10b981', '#00d9ff'],
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

  // Мемоизация для оптимизации
  const displayedError = useMemo(() => error || cartError, [error, cartError]);

  const location = useLocation();
  const searchQuery = searchTerm ? ` - ${searchTerm}` : '';
  const pageTitle = `Примеры товаров из Китая${searchQuery} | Fluvion`;
  const pageDescription = searchTerm 
    ? `Найдено по запросу "${searchTerm}" — примеры товаров Fluvion. Доставка из Китая в Беларусь за 18-35 дней.`
    : `Примеры товаров, которые уже заказывали клиенты. Доставка из Китая в Беларусь. Фиксированная цена $6/кг.`;

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] relative overflow-hidden pb-24 sm:pb-0">
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
      {/* МОБИЛЬНАЯ ВЕРСИЯ - показывается только на мобильных */}
      <div className="lg:hidden">
        {/* Мобильный Hero */}
        <section className="relative overflow-hidden py-6 z-10">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-left mb-4"
            >
              <h1 className="nl-title">Примеры товаров</h1>
              <div className="n-note">
                <ExclamationTriangleIcon className="n-note-icon" />
                <div>
                  <p className="n-note-title">Только проверенные товары</p>
                  <p>Здесь товары, которые уже заказывали клиенты</p>
                </div>
              </div>
            </motion.div>

            {/* Компактный поиск для мобильных */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-4"
            >
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full pl-10 pr-20 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm text-[#e5e7eb] placeholder-[#9ca3af] focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/50 transition-all"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] transition-all text-xs font-medium"
                >
                  Найти
                </button>
              </div>
            </motion.div>

            {/* Сортировка для мобильных */}
            <div className="mb-4">
              <StyledSelect
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
          </div>
        </section>

        {/* Сообщения об ошибках для мобильных */}
        <AnimatePresence>
          {displayedError && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="container mx-auto px-4 mb-4"
            >
              <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
                <p className="text-[#ef4444] text-sm text-center">{displayedError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Загрузка для мобильных */}
        {loading && (
          <div className="container mx-auto px-4 mb-6">
            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div className="flex flex-col items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-3 border-[rgba(255,255,255,0.1)] border-t-[#00f0ff] rounded-full mb-3"
                />
                <p className="text-[#9ca3af] text-sm">Загрузка...</p>
              </div>
            </div>
          </div>
        )}

        {/* Мобильная сетка товаров */}
        {!loading && (
          <section className="container mx-auto px-4 pb-8">
            {products.length > 0 ? (
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
            ) : (
              <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="text-center py-8">
                  <p className="text-base sm:text-lg font-semibold text-[#e5e7eb] mb-1.5 sm:mb-2">
                    Товары не найдены
                  </p>
                  <p className="text-xs sm:text-sm text-[#9ca3af]">
                    Попробуйте изменить параметры поиска
                  </p>
                </div>
              </div>
            )}

            {/* Мобильная пагинация */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-1.5 mt-6 flex-wrap"
              >
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 min-w-[2.5rem] disabled:opacity-50 disabled:cursor-not-allowed ${
                        isActive
                          ? 'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff]'
                          : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="text-[#9ca3af] px-1 text-xs">...</span>
                )}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </motion.div>
            )}
          </section>
        )}
      </div>

      {/* ДЕСКТОПНАЯ ВЕРСИЯ - показывается только на больших экранах */}
      <div className="hidden lg:block">

        {/* Hero секция каталога */}
        <section className="relative z-10">

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left mb-8"
          >
            <h1 className="nl-title">Примеры товаров</h1>
            <div className="n-note">
              <ExclamationTriangleIcon className="n-note-icon" />
              <div>
                <p className="n-note-title">Важно. Обратите внимание</p>
                <p>
                  Здесь только товары, которые уже заказывали наши клиенты. Проверенные товары с отзывами. Чтобы заказать любой другой товар — используйте раздел «Заказать товар» в меню.
                </p>
              </div>
            </div>
            <p className="text-sm text-[#9ca3af] max-w-2xl mt-3 mb-2">
              Товары, которые уже заказывали наши клиенты. Вы можете посмотреть отзывы и выбрать проверенные товары с доставкой в Беларусь.
            </p>
          </motion.div>

          {/* Поиск и фильтры */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl"
          >
            <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 mb-8">
              {/* Поиск */}
              <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full pl-12 pr-4 py-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] placeholder-[#9ca3af] focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/50 transition-all"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 text-sm font-medium"
                >
                  Найти
                </button>
              </div>

              {/* Сортировка */}
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

        {/* Сообщения об ошибках */}
        <AnimatePresence>
          {displayedError && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="container mx-auto px-4 mb-6"
            >
              <div className="p-4 rounded-2xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
                <p className="text-[#ef4444] text-center">{displayedError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Загрузка */}
        {loading && (
          <div className="container mx-auto px-4 mb-8">
            <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-[rgba(255,255,255,0.1)] border-t-[#00f0ff] rounded-full mb-4"
                />
                <p className="text-[#9ca3af] text-lg">Загрузка товаров...</p>
              </div>
            </div>
          </div>
        )}

        {/* Сетка товаров */}
        {!loading && (
          <section className="container mx-auto px-4 pb-12 relative z-10">
            {products.length > 0 ? (
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
            ) : (
              <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="text-center py-12">
                  <p className="text-2xl font-semibold text-[#e5e7eb] mb-2">
                    Товары не найдены
                  </p>
                  <p className="text-[#9ca3af]">
                    Попробуйте изменить параметры поиска
                  </p>
                </div>
              </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-2 mt-12 flex-wrap"
              >
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 min-w-[3rem] disabled:opacity-50 disabled:cursor-not-allowed ${
                        isActive
                          ? 'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)]'
                          : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e5e7eb]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 7 && currentPage < totalPages - 3 && (
                  <span className="text-[#9ca3af] px-2">...</span>
                )}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </motion.div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Catalog;
