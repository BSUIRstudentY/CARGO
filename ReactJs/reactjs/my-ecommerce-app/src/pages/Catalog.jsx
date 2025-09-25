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
  const { addSingleToCart, cart, catalogProducts, loading: cartLoading, error: cartError } = useCart();
  const navigate = useNavigate();
  const productsPerPage = 20;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy]);

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
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0891b2', '#0ea5e9', '#38bdf8'],
      });
    } catch (error) {
      setError('Ошибка добавления в корзину: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  return (
    <section id="catalog" className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 container mx-auto px-4 py-8">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-white tracking-tight">Каталог товаров</h2>
        <p className="text-lg text-gray-300 mt-2">Выберите товары из Китая для добавления в корзину</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="w-full md:w-1/4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-500" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="mt-2 w-full py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold shadow-md"
          >
            Искать
          </motion.button>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Цена (¥)</label>
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
          <div className="flex justify-between mt-2 text-sm text-gray-300">
            <span>Min: ¥{minPrice}</span>
            <span>Max: ¥{maxPrice}</span>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full md:w-1/6 p-3 rounded-lg bg-gray-800/80 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 appearance-none bg-no-repeat bg-right"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d1d5db' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
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
          className="w-full md:w-1/6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-md"
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
            className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-center text-base font-medium shadow-md"
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
          className="mb-8 text-center text-white text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-cyan-500 mx-auto" />
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
              <Tilt key={product.id} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
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
                  ></div>
                  <div className="relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg border border-gray-600/20"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-300 text-sm border border-gray-600/20">
                        Изображение отсутствует
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.name}</h4>
                    <div className="mt-2">
                      <span className="text-green-400 font-semibold text-base">¥{product.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(product)}
                      className="mt-3 w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm"
                      disabled={cartLoading}
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      Добавить в корзину
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewProduct(product.id)}
                      className="mt-2 w-full py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold shadow-sm"
                    >
                      Подробнее
                    </motion.button>
                  </div>
                </motion.div>
              </Tilt>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-300 col-span-full text-lg bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
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
          className="mt-8 flex justify-center gap-3 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage - 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1 ? 'bg-gray-600/80 cursor-not-allowed' : 'bg-gray-700/80 hover:bg-gray-600/80'
            } text-white text-sm font-semibold shadow-sm`}
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
                  isActive ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-gray-700/80 hover:bg-gray-600/80'
                } text-white text-sm font-semibold shadow-sm`}
                disabled={loading}
              >
                {pageNum}
              </motion.button>
            ) : null;
          })}
          {totalPages > 3 && currentPage + 2 < totalPages && (
            <span className="px-4 py-2 text-gray-300 text-sm">...</span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages ? 'bg-gray-600/80 cursor-not-allowed' : 'bg-gray-700/80 hover:bg-gray-600/80'
            } text-white text-sm font-semibold shadow-sm`}
            disabled={currentPage === totalPages || loading}
          >
            Вперед
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}

const styles = `
  .custom-slider .rc-slider-track {
    background-color: #06b6d4;
  }
  .custom-slider .rc-slider-handle {
    background-color: #06b6d4;
    border-color: #06b6d4;
    box-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
  }
  .custom-slider .rc-slider-handle:hover {
    box-shadow: 0 0 8px rgba(6, 182, 212, 0.8);
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Catalog;