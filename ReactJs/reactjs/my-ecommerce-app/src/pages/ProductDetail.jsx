import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../components/CartContext';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartLoading, cartError } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

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
      await addToCart({ ...productToAdd, quantity: 1 }); // По умолчанию количество 1 для похожих товаров
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate('/login');
      } else {
        setError('Ошибка добавления в корзину: ' + (error.message || 'Неизвестная ошибка'));
      }
    }
  };

  const maskedMarketplaceLink = (url) => {
    return url ? '🔗 Зашифрованная ссылка на маркетплейс (нажмите для открытия)' : 'Ссылка недоступна';
  };

  if (loading) return <p className="text-center text-gray-400">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center text-gray-400">Товар не найден</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-gray-100 mb-6" style={{ color: 'var(--accent-color)' }}>
        Подробности товара: {product.name}
      </h2>

      {/* Основной макет */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Изображение текущего товара */}
        <div className="w-full lg:w-1/2">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/384x384?text=Изображение+не+доступно';
              }}
            />
          ) : (
            <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Изображение отсутствует</span>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="w-20 h-20 bg-gray-600 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="w-full lg:w-1/2 bg-gray-800 p-6 rounded-lg shadow-md text-white">
          <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
          <div className="flex justify-between mb-4">
            <span className="text-green-400 font-bold">¥{product.price?.toFixed(2)}</span>
            <span className="text-yellow-400 font-bold">BYN {(product.price * 3.5)?.toFixed(2)}</span>
          </div>

          {/* Количество */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Количество:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2 bg-gray-700 text-white rounded-lg"
              min="1"
            />
          </div>

          {/* Кнопки действий */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700 transition duration-300 mb-2"
            disabled={cartLoading}
          >
            Добавить в корзину
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-600 p-2 rounded-lg text-white hover:bg-gray-700 transition duration-300"
          >
            Назад
          </button>

          {/* Ссылка на маркетплейс */}
          <div className="mt-4">
            <p className="text-sm text-gray-300">Куплено на:</p>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                alert(`Открывается: ${product.url}`);
              }}
            >
              {maskedMarketplaceLink(product.url)}
            </a>
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="mt-8">
        <div className="flex border-b border-gray-600">
          <button
            className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('details')}
          >
            Детали
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('history')}
          >
            История
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reviews' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Отзывы
          </button>
        </div>

        <div className="mt-4 p-6 bg-gray-800 rounded-lg">
          {activeTab === 'details' && (
            <div>
              <p className="text-gray-300">{product.description || 'Детали товара будут здесь.'}</p>
            </div>
          )}
          {activeTab === 'history' && (
            <div>
              <p className="text-gray-300">Продано: {product.salesCount || 0} раз</p>
              <p className="text-gray-300">Кластер: {product.cluster !== undefined ? product.cluster : 'Не определен'}</p>
              <p className="text-gray-300">Последнее обновление: {new Date(product.lastUpdated).toLocaleString()}</p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div>
              <p className="text-gray-300">Отзывы: (макет) Здесь будут отзывы пользователей.</p>
              <button className="mt-2 bg-gray-600 p-2 rounded-lg text-white">Оставить отзыв</button>
            </div>
          )}
        </div>
      </div>

      {/* Похожие товары */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Похожие товары</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.length > 0 ? (
            similarProducts.map((similar) => (
              <div key={similar.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-48">
                  {similar.imageUrl ? (
                    <img
                      src={similar.imageUrl}
                      alt={similar.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/192x192?text=Изображение+не+доступно';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">Изображение отсутствует</span>
                    </div>
                  )}
                </div>
                <div className="p-4 text-white">
                  <h4 className="text-lg font-semibold mb-2">{similar.name}</h4>
                  <button
                    onClick={() => handleAddToCart(similar)}
                    className="w-full bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700 transition duration-300 mb-2"
                    disabled={cartLoading}
                  >
                    Добавить в корзину
                  </button>
                  <button
                    onClick={() => navigate(`/product/${similar.id}`)}
                    className="w-full bg-gray-600 p-2 rounded-lg text-white hover:bg-gray-700 transition duration-300"
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-full">Похожие товары не найдены</p>
          )}
        </div>
      </div>

      {(cartError || error) && <p className="text-red-500 mt-2">{cartError || error}</p>}
    </div>
  );
}

export default ProductDetail;