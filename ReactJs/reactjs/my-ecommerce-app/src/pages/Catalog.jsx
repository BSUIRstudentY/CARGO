import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';
import CartModal from '../components/CartModal';

function Catalog() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { addToCart, cart, loading: cartLoading, error: cartError } = useCart();
  const navigate = useNavigate();

  const productsPerPage = 20;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, minPrice, maxPrice, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage - 1,
        size: productsPerPage,
        searchTerm: searchTerm || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy: sortBy || undefined,
      };
      const response = await api.get('/products', { params });
      const { content, totalPages } = response.data;
      const filteredProducts = (content || []).filter(product => product.id);
      setProducts(filteredProducts);
      setTotalPages(totalPages || 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleCluster = async () => {
    setLoading(true);
    try {
      await api.post('/cluster', {}, { params: { k: 3 } });
      setCurrentPage(1);
      fetchProducts();
    } catch (error) {
      setError('Ошибка кластеризации: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getClusterColor = (cluster) => {
    const colors = ['border-blue-500', 'border-green-500', 'border-red-500', 'border-yellow-500', 'border-purple-500'];
    return cluster !== undefined ? colors[cluster % colors.length] : 'border-gray-500';
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (product) => {
    if (!product || !product.id) {
      setError('Недействительный товар: отсутствует ID');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/login');
      } else {
        setError('Ошибка добавления в корзину: ' + (error.message || 'Неизвестная ошибка'));
      }
    }
  };

  return (
    <section id="catalog" className="container mx-auto px-4 py-8">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-100" style={{ color: 'var(--accent-color)' }}>
        Каталог товаров
      </h2>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full md:w-1/4 p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Мин. цена..."
          value={minPrice}
          onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
          className="w-full md:w-1/6 p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Макс. цена..."
          value={maxPrice}
          onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
          className="w-full md:w-1/6 p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full md:w-1/4 p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="sales_desc">Продажи: по убыванию</option>
        </select>
        <button
          onClick={handleCluster}
          className="w-full md:w-auto px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? 'Обновление...' : 'Обновить кластеры'}
        </button>
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
      {loading && !error && (
        <div className="mb-4 p-3 bg-gray-700 text-white rounded-lg text-center animate-fade-in-out">
          Загрузка...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className={`bg-gray-800 p-4 rounded-lg shadow-md text-white relative ${getClusterColor(product.cluster)} border-2 hover:shadow-lg transition-shadow duration-300`}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <h3 className="text-lg md:text-xl font-semibold mt-2 line-clamp-1">{product.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
              <div className="flex justify-between mt-4">
                <span className="text-green-400 font-bold">¥{product.price?.toFixed(2)}</span>
                <span className="text-yellow-400 font-bold">BYN {(product.price * 3.5)?.toFixed(2)}</span>
              </div>
              <p className="text-sm mt-2">Кластер: {product.cluster !== undefined ? product.cluster : 'Не определен'}</p>
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-4 w-full bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700 transition duration-300"
                disabled={cartLoading}
              >
                Добавить в корзину
              </button>
              <button
                onClick={() => handleViewProduct(product.id)}
                className="mt-2 w-full bg-gray-600 p-2 rounded-lg text-white hover:bg-gray-700 transition duration-300"
              >
                Подробнее
              </button>
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
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Catalog;