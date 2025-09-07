
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
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
      setError('Invalid product ID');
    }
  };

  const handleAddToCart = async (product) => {
    if (!product || !product.id) {
      setError('Invalid product: missing ID');
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
        colors: ['#10b981', '#34d399', '#6ee7b7'],
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
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-emerald-500">
          Каталог товаров
        </h2>
        <p className="text-lg text-gray-400 mt-2">Выберите товары для добавления в корзину</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="w-full md:w-1/4">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="mt-2 w-full p-2 bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 text-white rounded-lg hover:bg-opacity-90 transition"
          >
            Искать
          </motion.button>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Цена (¥)</label>
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
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Min: ¥{minPrice}</span>
            <span>Max: ¥{maxPrice}</span>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full md:w-1/6 p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition"
        >
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="sales_desc">Продажи: по убыванию</option>
        </select>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/cart')}
          className="w-full md:w-1/6 p-2 bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 text-white rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2"
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
            className="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center"
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
          className="mb-8 text-center text-white text-2xl bg-gray-700/90 p-6 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          Загрузка...
        </motion.div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product, index) => (
              <Tilt key={product.id} tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000}>
                <motion.div
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-3 shadow-xl border border-gray-700/50 transition-transform duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none rounded-2xl" />
                  <div className="relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-600 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Изображение отсутствует
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-base font-semibold text-white mb-1 line-clamp-1">{product.name}</h4>
                    <p className="text-gray-400 text-xs line-clamp-1">{product.description}</p>
                    <div className="mt-2">
                      <span className="text-green-400 font-bold text-sm">¥{product.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(product)}
                      className="mt-2 w-full p-2 bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 text-white rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2 text-sm"
                      disabled={cartLoading}
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      Добавить в корзину
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewProduct(product.id)}
                      className="mt-2 w-full p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
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
              className="text-center text-gray-400 col-span-full text-lg bg-gray-700/90 p-6 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]"
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
          className="mt-8 flex justify-center gap-2 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage - 1)}
            className={`px-3 py-1 rounded-lg ${
              currentPage === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'
            } text-white text-sm`}
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
                className={`px-3 py-1 rounded-lg ${
                  isActive ? 'bg-gradient-to-r from-[var(--accent-color)] to-emerald-500' : 'bg-gray-700 hover:bg-gray-600'
                } text-white text-sm`}
                disabled={loading}
              >
                {pageNum}
              </motion.button>
            ) : null;
          })}
          {totalPages > 3 && currentPage + 2 < totalPages && (
            <span className="px-3 py-1 text-gray-400 text-sm">...</span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage + 1)}
            className={`px-3 py-1 rounded-lg ${
              currentPage === totalPages ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'
            } text-white text-sm`}
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
  @keyframes fadeInOut {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }
  .animate-fade-in-out {
    animation: fadeInOut 3s ease-in-out;
  }
  .custom-slider .rc-slider-track {
    background-color: #10b981;
  }
  .custom-slider .rc-slider-handle {
    background-color: #10b981;
    border-color: #10b981;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Catalog;