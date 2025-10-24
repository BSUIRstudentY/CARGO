import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import { ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import Slider from 'rc-slider';
import confetti from 'canvas-confetti';
import 'rc-slider/assets/index.css';

function Catalog() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('price_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { addSingleToCart, cart, catalogProducts, loading: cartLoading, error: cartError } = useCart();
  const navigate = useNavigate();
  const productsPerPage = 20;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, searchTerm, minPrice, maxPrice]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: productsPerPage,
        searchTerm: searchTerm || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        sortBy: sortBy || undefined,
      };
      const response = await api.get('/products', { params });
      const { content, totalPages } = response.data;
      setProducts(content || []);
      setTotalPages(totalPages || 1);
      if (!content || content.length === 0) {
        setProducts(catalogProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage));
        setTotalPages(Math.ceil(catalogProducts.length / productsPerPage));
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setProducts(catalogProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage));
      setTotalPages(Math.ceil(catalogProducts.length / productsPerPage));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setCurrentPage(1);
      fetchProducts();
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

  const handleViewProduct = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      setError('Неверный ID товара');
    }
  };

  const handleAddToCart = async (product) => {
    if (!product || !product.id) {
      setError('Неверный товар: отсутствует ID');
      return;
    }
    try {
      const existingItem = cart.find((item) => item.id === product.id);
      if (existingItem) {
        await addSingleToCart({ ...existingItem, quantity: existingItem.quantity + 1 });
      } else {
        await addSingleToCart({ ...product, quantity: 1 });
      }
      confetti({
        particleCount: isMobile ? 50 : 100,
        spread: isMobile ? 60 : 70,
        origin: { y: 0.6 },
        colors: ['#e81e2d', '#ff4757', '#ff6b7a'],
      });
    } catch (error) {
      setError('Ошибка добавления в корзину: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  const mobileLayout = (
    <section id="catalog" className="mobile-catalog">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mobile-catalog-header"
      >
        <h2>Каталог товаров</h2>
        <p>Товары из Китая</p>
      </motion.header>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mobile-catalog-controls"
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
        <div className="mobile-price-filter">
          <label>Цена (¥)</label>
          <Slider
            range
            value={[minPrice, maxPrice]}
            onChange={([min, max]) => {
              setMinPrice(min);
              setMaxPrice(max);
              setCurrentPage(1);
              fetchProducts();
            }}
            min={0}
            max={1000}
            step={10}
            className="custom-slider"
          />
          <div className="mobile-price-range">
            <span>¥{minPrice}</span>
            <span>¥{maxPrice}</span>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="mobile-sort-select"
        >
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="sales_desc">Продажи: по убыванию</option>
        </select>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/cart')}
          className="mobile-cart-button"
          disabled={cartLoading}
        >
          <ShoppingCartIcon className="mobile-cart-icon" />
          Корзина ({cart ? cart.length : 0})
        </motion.button>
      </motion.div>
      <AnimatePresence>
        {(error || cartError) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="mobile-error"
          >
            {error || cartError}
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
        className="mobile-product-grid"
      >
        {products.length > 0 ? (
          products.map((product, index) => (
            <motion.div
              key={product.id}
              className="mobile-product-card-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <div className="mobile-product-card">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="mobile-product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото';
                    }}
                  />
                ) : (
                  <div className="mobile-product-placeholder">
                    Нет фото
                  </div>
                )}
                <div className="mobile-product-details">
                  <h4 className="mobile-product-name">{product.name}</h4>
                  <span className="mobile-product-price">¥{product.price?.toFixed(2) || '0.00'}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(product)}
                    className="mobile-add-to-cart"
                    disabled={cartLoading}
                  >
                    <ShoppingCartIcon className="mobile-cart-icon" />
                    В корзину
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewProduct(product.id)}
                    className="mobile-view-details"
                  >
                    Подробнее
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-no-products"
          >
            Товары не найдены
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
    <section id="catalog" className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary container-xl mx-auto px-4 py-8 w-full max-w-7xl">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-accent-primary tracking-tight">Каталог товаров</h2>
        <p className="text-lg text-text-secondary mt-2 max-w-prose mx-auto">Выберите товары из Китая для добавления в корзину</p>
      </motion.header>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-3 left-3 w-6 h-6 text-accent-primary" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-bg-tertiary text-text-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Цена (¥)</label>
          <Slider
            range
            value={[minPrice, maxPrice]}
            onChange={([min, max]) => {
              setMinPrice(min);
              setMaxPrice(max);
              setCurrentPage(1);
              fetchProducts();
            }}
            min={0}
            max={1000}
            step={10}
            className="custom-slider"
          />
          <div className="flex justify-between mt-2 text-sm text-text-muted">
            <span>¥{minPrice}</span>
            <span>¥{maxPrice}</span>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full p-3 rounded-lg bg-bg-tertiary text-text-primary border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition duration-300 appearance-none bg-no-repeat bg-right"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23cdcdcd' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          }}
        >
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="sales_desc">Продажи: по убыванию</option>
        </select>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/cart')}
          className="flex items-center justify-center gap-2 bg-accent-primary text-text-primary py-3 rounded-lg hover:bg-accent-primary/90 transition duration-300 font-semibold shadow-card"
          disabled={cartLoading}
        >
          <ShoppingCartIcon className="w-5 h-5" />
          Корзина ({cart ? cart.length : 0})
        </motion.button>
      </motion.div>
      <AnimatePresence>
        {(error || cartError) && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-4 bg-accent-primary/20 border border-accent-primary/50 rounded-lg text-accent-primary text-center text-base font-medium shadow-card"
          >
            {error || cartError}
          </motion.div>
        )}
      </AnimatePresence>
      {loading && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-text-primary text-2xl bg-bg-tertiary p-6 rounded-lg border border-border-primary shadow-card"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-accent-primary mx-auto mb-4" />
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
          {products.length > 0 ? (
            products.map((product, index) => (
              <Tilt key={product.id} tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
                <div className="product__item-wrap">
                  <div className="product__item">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-md mb-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото';
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 bg-bg-secondary rounded-md flex items-center justify-center mb-4">
                        <span className="text-text-muted">Нет изображения</span>
                      </div>
                    )}
                    <h4 className="text-xl font-semibold text-text-primary mb-2 line-clamp-2 text-center">{product.name}</h4>
                    <div className="text-2xl font-bold text-accent-primary mb-4 text-center">¥{product.price?.toFixed(2) || '0.00'}</div>
                    <div className="flex gap-2 justify-center w-full">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(product)}
                        className="w-1/2 bg-accent-primary text-text-primary py-2 rounded-md hover:bg-accent-primary/90 transition duration-300 font-medium"
                        disabled={cartLoading}
                      >
                        В корзину
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewProduct(product.id)}
                        className="w-1/2 bg-transparent border-2 border-accent-primary text-accent-primary py-2 rounded-md hover:bg-accent-primary hover:text-text-primary transition duration-300 font-medium"
                      >
                        Подробнее
                      </motion.button>
                    </div>
                  </div>
                </div>
              </Tilt>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-text-secondary col-span-full text-lg bg-bg-tertiary p-6 rounded-lg border border-border-primary shadow-card"
            >
              Товары не найдены
            </motion.div>
          )}
        </div>
      </motion.section>
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center gap-3 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage - 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1 ? 'bg-bg-tertiary cursor-not-allowed' : 'bg-bg-secondary hover:bg-bg-tertiary'
            } text-text-primary font-medium transition duration-300 shadow-sm`}
            disabled={currentPage === 1 || loading}
          >
            Назад
          </motion.button>
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            const isActive = currentPage === pageNum;
            const showPage =
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
            return showPage ? (
              <motion.button
                key={pageNum}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  isActive ? 'bg-accent-primary hover:bg-accent-primary/90' : 'bg-bg-secondary hover:bg-bg-tertiary'
                } text-text-primary font-medium transition duration-300 shadow-sm`}
                disabled={loading}
              >
                {pageNum}
              </motion.button>
            ) : null;
          })}
          {totalPages > 3 && currentPage + 2 < totalPages && (
            <span className="px-4 py-2 text-text-muted">...</span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages ? 'bg-bg-tertiary cursor-not-allowed' : 'bg-bg-secondary hover:bg-bg-tertiary'
            } text-text-primary font-medium transition duration-300 shadow-sm`}
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
      <style jsx>{`
        * {
          text-decoration: none;
          color: var(--text-primary, #f5f9ff);
          box-sizing: border-box;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 16px;
          line-height: 125%;
          font-weight: 500;
        }
        .product__item {
          width: 100%;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 12px;
          height: 100%;
          border-radius: 6px;
          box-shadow: 0 12px 29px -5px var(--shadow-primary, rgba(0, 0, 0, 0.42));
          background: #000000; /* Black background for desktop */
          z-index: 2;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product__item:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px var(--shadow-primary, rgba(0, 0, 0, 0.5));
        }
        .product__item-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 16px;
          line-height: 125%;
          font-weight: 500;
          color: var(--text-primary, #f5f9ff);
          text-decoration: none;
        }
        .product__item-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1px;
          height: 100%;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }
        .product__item-wrap:before {
          content: "";
          position: absolute;
          display: block;
          background: linear-gradient(340deg, var(--bg-primary, rgb(8, 8, 8)) 0%, var(--accent-primary, rgb(255, 37, 73)) 50%, var(--bg-primary, rgb(8, 8, 8)) 80%);
          width: 100%;
          height: 110%;
          z-index: 1;
        }
        .product__item-wrap:nth-child(3n):before {
          background: linear-gradient(-45deg, var(--bg-primary, rgb(8, 8, 8)) 20%, var(--accent-primary, rgb(255, 37, 73)) 50%, var(--bg-primary, rgb(8, 8, 8)) 80%);
        }
        .product__item-wrap:hover:before {
          animation: rotate-gradient linear 5s normal infinite;
        }
        @keyframes rotate-gradient {
          0% {
            transform: rotate(0deg);
            width: 100%;
          }
          50% {
            transform: rotate(180deg);
            width: 200%;
          }
          100% {
            transform: rotate(360deg);
            width: 100%;
          }
        }
        .line-clamp-1, .line-clamp-2, .line-clamp-3 {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .line-clamp-2 {
          -webkit-line-clamp: 2;
        }
        .line-clamp-3 {
          -webkit-line-clamp: 3;
        }
        .custom-slider .rc-slider-track {
          background: linear-gradient(to right, var(--accent-primary, #e81e2d));
        }
        .custom-slider .rc-slider-handle {
          background-color: var(--accent-primary, #e81e2d);
          border-color: var(--accent-primary, #e81e2d);
        }
        /* Mobile Product Wrap Styles */
        .mobile-product-card-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1px;
          height: 100%;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }
        .mobile-product-card-wrap:before {
          content: "";
          position: absolute;
          display: block;
          background: linear-gradient(340deg, var(--bg-primary, rgb(8, 8, 8)) 0%, var(--accent-primary, rgb(255, 37, 73)) 50%, var(--bg-primary, rgb(8, 8, 8)) 80%);
          width: 100%;
          height: 110%;
          z-index: 1;
        }
        .mobile-product-card-wrap:nth-child(3n):before {
          background: linear-gradient(-45deg, var(--bg-primary, rgb(8, 8, 8)) 20%, var(--accent-primary, rgb(255, 37, 73)) 50%, var(--bg-primary, rgb(8, 8, 8)) 80%);
        }
        .mobile-product-card-wrap:hover:before {
          animation: rotate-gradient-mobile linear 3s normal infinite;
        }
        @keyframes rotate-gradient-mobile {
          0% {
            transform: rotate(0deg);
            width: 100%;
          }
          50% {
            transform: rotate(180deg);
            width: 200%;
          }
          100% {
            transform: rotate(360deg);
            width: 100%;
          }
        }
        .mobile-product-card {
          width: 100%;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
          height: 100%;
          border-radius: 6px;
          box-shadow: 0 8px 20px -5px var(--shadow-primary, rgba(0, 0, 0, 0.42));
          background: #000000; /* Black background for mobile */
          z-index: 2;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .mobile-product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px -8px var(--shadow-primary, rgba(0, 0, 0, 0.5));
        }
        .mobile-product-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary, #ffffff);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-align: center;
        }
      `}</style>
      <style>{`
        /* Mobile Styles */
        .mobile-catalog {
          min-height: 100vh;
          background: linear-gradient(to bottom, var(--bg-primary, #0a0a0a), var(--bg-secondary, #1a1a1a));
          padding: 16px 8px;
        }
        .mobile-catalog-header {
          text-align: center;
          margin-bottom: 16px;
        }
        .mobile-catalog-header h2 {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary, #ffffff);
        }
        .mobile-catalog-header p {
          font-size: 0.875rem;
          color: var(--text-secondary, #cdcdcd);
          margin-top: 4px;
        }
        .mobile-catalog-controls {
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
          color: var(--accent-primary, #e81e2d);
        }
        .mobile-search-input {
          width: 100%;
          padding: 8px 16px 8px 32px;
          background-color: var(--bg-tertiary, #2F2F2F);
          color: var(--text-primary, #ffffff);
          border: 1px solid var(--border-primary, #333333);
          border-radius: 6px;
          font-size: 0.875rem;
          outline: none;
        }
        .mobile-search-input:focus {
          border-color: var(--accent-primary, #e81e2d);
          box-shadow: 0 0 0 2px rgba(232, 30, 45, 0.5);
        }
        .mobile-search-button {
          width: 100%;
          padding: 8px;
          background-color: var(--accent-primary, #e81e2d);
          color: var(--text-primary, #ffffff);
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-top: 8px;
        }
        .mobile-price-filter {
          margin-top: 8px;
        }
        .mobile-price-filter label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary, #cdcdcd);
          margin-bottom: 4px;
        }
        .mobile-price-range {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 0.75rem;
          color: var(--text-muted, #808080);
        }
        .mobile-sort-select {
          width: 100%;
          padding: 8px;
          background-color: var(--bg-tertiary, #2F2F2F);
          color: var(--text-primary, #ffffff);
          border: 1px solid var(--border-primary, #333333);
          border-radius: 6px;
          font-size: 0.875rem;
          outline: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23cdcdcd' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 8px center;
          background-size: 18px 18px;
          background-repeat: no-repeat;
          appearance: none;
        }
        .mobile-sort-select:focus {
          border-color: var(--accent-primary, #e81e2d);
          box-shadow: 0 0 0 2px rgba(232, 30, 45, 0.5);
        }
        .mobile-cart-button {
          width: 100%;
          padding: 8px;
          background-color: var(--accent-primary, #e81e2d);
          color: var(--text-primary, #ffffff);
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .mobile-cart-icon {
          width: 16px;
          height: 16px;
        }
        .mobile-error {
          margin-bottom: 16px;
          padding: 8px;
          background-color: rgba(232, 30, 45, 0.2);
          border: 1px solid rgba(232, 30, 45, 0.5);
          border-radius: 6px;
          color: var(--accent-primary, #e81e2d);
          text-align: center;
          font-size: 0.875rem;
        }
        .mobile-loading {
          margin-bottom: 16px;
          text-align: center;
          color: var(--text-primary, #ffffff);
          font-size: 1rem;
          background-color: var(--bg-tertiary, #2F2F2F);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-loading-spinner {
          display: inline-block;
          width: 24px;
          height: 24px;
          border: 2px solid var(--accent-primary, #e81e2d);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 8px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .mobile-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        @media (max-width: 480px) {
          .mobile-product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 320px) {
          .mobile-product-grid {
            grid-template-columns: 1fr;
          }
        }
        .mobile-product-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-product-placeholder {
          width: 100%;
          height: 80px;
          background-color: var(--bg-secondary, #1a1a1a);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted, #808080);
          font-size: 0.75rem;
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-product-details {
          padding: 8px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .mobile-product-price {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--accent-primary, #e81e2d);
          margin-bottom: 8px;
          text-align: center;
        }
        .mobile-add-to-cart, .mobile-view-details {
          width: 100%;
          padding: 6px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mobile-add-to-cart {
          background-color: var(--accent-primary, #e81e2d);
          color: var(--text-primary, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 4px;
        }
        .mobile-view-details {
          background-color: var(--bg-tertiary, #2F2F2F);
          color: var(--text-primary, #ffffff);
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-no-products {
          grid-column: 1 / -1;
          text-align: center;
          color: var(--text-secondary, #cdcdcd);
          font-size: 0.875rem;
          background-color: var(--bg-tertiary, #2F2F2F);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mobile-pagination-button {
          padding: 6px 12px;
          background-color: var(--bg-tertiary, #2F2F2F);
          color: var(--text-primary, #ffffff);
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-pagination-button.active {
          background-color: var(--accent-primary, #e81e2d);
        }
        .mobile-pagination-button.disabled {
          background-color: var(--bg-secondary, #1a1a1a);
          cursor: not-allowed;
          opacity: 0.5;
        }
        .mobile-pagination-ellipsis {
          padding: 6px 12px;
          color: var(--text-muted, #808080);
          font-size: 0.75rem;
        }
      `}</style>
    </>
  );
}

export default Catalog;