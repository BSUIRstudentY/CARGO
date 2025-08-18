import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

function AdminCatalog() {
  const { id } = useParams(); // Для будущих деталей, если потребуется
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('price_asc');
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
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        sortBy: sortBy || undefined,
      };
      const response = await api.get('/products', { params });
      if (response.data && response.data.content) {
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError('Нет данных в ответе сервера');
      }
    } catch (error) {
      setError('Ошибка загрузки продуктов: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      try {
        await api.delete(`/products/${productId}`);
        setProducts(products.filter((p) => p.id !== productId));
        setIsEditing(false);
        setSelectedProduct(null);
        alert('Продукт успешно удалён');
      } catch (error) {
        setError('Ошибка удаления продукта: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditedProduct({ ...product });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/products/${editedProduct.id}`, editedProduct);
      setProducts(products.map((p) => (p.id === editedProduct.id ? editedProduct : p)));
      setIsEditing(false);
      setSelectedProduct(null);
      alert('Продукт успешно обновлён');
    } catch (error) {
      setError('Ошибка обновления продукта: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setEditedProduct(null);
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

  if (loading) return <p className="text-center text-gray-400">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section id="catalog" className="container mx-auto px-4 py-8">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-100" style={{ color: 'var(--accent-color)' }}>
        Управление каталогом
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
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => { setMinPrice(parseFloat(e.target.value) || 0); setCurrentPage(1); fetchProducts(); }}
              className="w-1/2 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Мин"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(parseFloat(e.target.value) || 1000); setCurrentPage(1); fetchProducts(); }}
              className="w-1/2 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Макс"
            />
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
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-600 text-white rounded-lg text-center animate-fade-in-out">
          {error}
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
              className="bg-gray-800 p-4 rounded-lg shadow-md text-white hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото'; }}
              />
              <h3 className="text-lg md:text-xl font-semibold mt-2 line-clamp-1">{product.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
              <div className="flex justify-between mt-4">
                <span className="text-green-400 font-bold">¥{product.price?.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="flex-1 bg-yellow-600 p-2 rounded-lg text-white hover:bg-yellow-700 transition duration-300 text-sm"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="flex-1 bg-red-600 p-2 rounded-lg text-white hover:bg-red-700 transition duration-300 text-sm"
                >
                  Удалить
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

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--accent-color)] mb-4">Редактирование продукта</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300">Название</label>
                <input
                  name="name"
                  value={editedProduct.name || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">URL</label>
                <input
                  name="url"
                  value={editedProduct.url || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Цена (¥)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={editedProduct.price || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Изображение URL</label>
                <input
                  name="imageUrl"
                  value={editedProduct.imageUrl || ''}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Описание</label>
                <textarea
                  name="description"
                  value={editedProduct.description || ''}
                  onChange={handleEditChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
                >
                  Отмена
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>
        </div>
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
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default AdminCatalog;