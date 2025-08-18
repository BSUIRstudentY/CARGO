import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import CartModal from '../components/CartModal';
import Slider from 'rc-slider';
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
  const [isCartOpen, setIsCartOpen] = useState(false);

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
      // Если сервер не вернул данные, используем локальные
      if (!content || content.length === 0) {
        setProducts(catalogProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage));
        setTotalPages(Math.ceil(catalogProducts.length / productsPerPage));
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      // Если запрос провалился, используем локальные данные
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
      // Проверяем, есть ли товар уже в корзине
      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) {
        // Если товар есть, увеличиваем количество на 1
        const updatedCart = cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        await addSingleToCart({ ...existingItem, quantity: existingItem.quantity + 1 });
        alert('Количество товара в корзине увеличено!');
      } else {
        // Если товара нет, добавляем новый с quantity: 1
        await addSingleToCart({ ...product, quantity: 1 });
        alert('Товар добавлен в корзину!');
      }
    } catch (error) {
      setError('Ошибка добавления в корзину: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 403) {
        window.location.href = '/login';
      }
    }
  };

  return (
    <section id="catalog" className=" max-w-full bg-gradient-to-b from-gray-900 to-gray-800 container mx-auto px-4 py-8">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-100" style={{ color: 'var(--accent-color)' }}>
        Каталог товаров
      </h2>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/4">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            className="w-full p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="mt-2 w-full p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
          >
            Искать
          </button>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm text-gray-300 mb-1">Цена (¥)</label>
          <Slider
            range
            value={[minPrice, maxPrice]}
            onChange={([min, max]) => { setMinPrice(min); setMaxPrice(max); setCurrentPage(1); fetchProducts(); }}
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
          className="w-full md:w-1/6 p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="sales_desc">Продажи: по убыванию</option>
        </select>
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-full md:w-1/6 p-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-300"
          disabled={cartLoading}
        >
          Корзина ({cart ? cart.length : 0})
        </button>
      </div>

      {(error || cartError) && (
        <div className="mb-4 p-3 bg-red-600 text-white rounded-lg text-center animate-fade-in-out">
          {error || cartError}
        </div>
      )}
      {loading && (
        <div className="mb-4 p-3 bg-gray-700 text-white rounded-lg text-center animate-fade-in-out">
          Загрузка...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 relative group"
            >
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото'; }}
                />
                <button
                  onClick={() => handleViewProduct(product.id)}
                  className="absolute top-0 left-0 w-full bg-gray-800 bg-opacity-95 text-white py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform -translate-y-full group-hover:translate-y-0 delay-100"
                >
                  Подробнее
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg md:text-xl font-semibold mt-2 line-clamp-1 text-white">{product.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-1">{product.description}</p>
                <div className="mt-4">
                  <span className="text-green-400 font-bold">¥{product.price?.toFixed(2) || '0.00'}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-4 w-full bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700 transition duration-300"
                  disabled={cartLoading}
                >
                  Добавить в корзину
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 col-span-full">Товары не найдены</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => paginate(currentPage - 1)}
            className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            disabled={currentPage === 1 || loading}
          >
            Назад
          </button>
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            const isActive = currentPage === pageNum;
            const showPage = 
              pageNum === 1 || 
              pageNum === totalPages || 
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
            return showPage ? (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                className={`px-4 py-2 rounded-lg ${isActive ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                disabled={loading}
              >
                {pageNum}
              </button>
            ) : null;
          })}
          {totalPages > 3 && currentPage + 2 < totalPages && <span className="px-4 py-2 text-gray-400">...</span>}
          <button
            onClick={() => paginate(currentPage + 1)}
            className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            disabled={currentPage === totalPages || loading}
          >
            Вперед
          </button>
        </div>
      )}

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
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
    background-color: #4b5563;
  }
  .custom-slider .rc-slider-handle {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Catalog;