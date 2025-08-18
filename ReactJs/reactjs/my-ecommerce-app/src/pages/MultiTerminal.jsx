import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import api from '../api/axiosInstance';

function MultiTerminal() {
  const { addToCart } = useCart();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('savedProducts');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [product, setProduct] = useState({
    id: crypto.randomUUID(),
    name: '',
    url: '',
    price: '',
    imageUrl: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem('savedProducts', JSON.stringify(products));
  }, [products]);

  const handleFieldChange = (field) => (e) => {
    setProduct((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = 'Название обязательно (скопируйте с китайского сайта)';
    if (!product.url.trim()) newErrors.url = 'URL товара обязателен';
    if (product.price && isNaN(parseFloat(product.price))) newErrors.price = 'Цена должна быть числом';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProduct = () => {
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    const productData = {
      id: product.id,
      name: product.name.trim(),
      url: product.url.trim(),
      price: parseFloat(product.price) || 0,
      imageUrl: product.imageUrl.trim() || '',
      description: product.description.trim() || '',
    };
    setProducts((prev) => [productData, ...prev]);
    setProduct({
      id: crypto.randomUUID(),
      name: '',
      url: '',
      price: '',
      imageUrl: '',
      description: '',
    });
    setErrors({});
    setIsFormVisible(false);
    alert('Вещь успешно сохранена локально!');
  };

  const cancelProduct = () => {
    setProduct({
      id: crypto.randomUUID(),
      name: '',
      url: '',
      price: '',
      imageUrl: '',
      description: '',
    });
    setErrors({});
    setIsFormVisible(false);
  };

  const removeProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const addAllToCart = async () => {
    if (products.length === 0) {
      alert('Нет сохранённых товаров для добавления.');
      return;
    }
    try {
      await addToCart(products); // Отправка массива товаров
      alert('Все товары добавлены в корзину!');
      setProducts([]);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      alert('Произошла ошибка при добавлении товаров в корзину.');
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
        backgroundRepeat: 'repeat',
        zIndex: 0,
      }}></div>

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-[var(--accent-color)] animate-fade-in-down relative">
          Многофункциональный терминал
          <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[var(--accent-color)] rounded-full opacity-50 animate-pulse"></span>
        </h1>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Instruction Section */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[var(--accent-color)] mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              Инструкция по покупке
            </h2>
            <p className="text-gray-300 mb-4">
              Используйте терминал для добавления и управления товарами с китайских площадок. Следуйте этим шагам:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-gray-300">
              <li>
                <strong>Добавление товара:</strong> Нажмите "Добавить товар" и заполните форму с названием, URL, ценой и, при желании, ссылкой на изображение и описанием. Убедитесь, что данные верны.
              </li>
              <li>
                <strong>Проверка данных:</strong> После заполнения проверьте введённую информацию перед сохранением. Исправьте ошибки, если они есть.
              </li>
              <li>
                <strong>Сохранение товара:</strong> Сохраните товар локально. Он отобразится в списке для дальнейшего использования.
              </li>
              <li>
                <strong>Управление товарами:</strong> Удаляйте товары из списка при необходимости или добавляйте все сохранённые товары в корзину одним кликом.
              </li>
              <li>
                <strong>Добавление в корзину:</strong> После проверки списка нажмите "Добавить все в корзину" для отправки товаров на дальнейшую обработку.
              </li>
            </ol>
          </div>

          {/* Product Cards Section */}
          <div className="flex flex-wrap gap-8">
            <div
              className="bg-gray-700/80 p-6 rounded-2xl border-2 border-gray-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => setIsFormVisible(true)}
            >
              <div className="w-64 h-64 flex items-center justify-center text-5xl text-[var(--accent-color)] font-bold">
                +
              </div>
              <p className="text-center text-gray-300 mt-4">Добавить товар</p>
            </div>
            {isFormVisible && (
              <div className="bg-gray-700/80 p-6 rounded-2xl border-4 border-[var(--accent-color)] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 w-64">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-6"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-500 flex items-center justify-center rounded-lg text-gray-300 text-sm mb-10">
                    Нет фото
                  </div>
                )}
                <h4 className="text-xl font-semibold text-gray-100 truncate">{product.name || 'Название'}</h4>
                <p className="text-lg text-[var(--accent-color)] font-medium mt-2">Цена: ¥{product.price || '0'}</p>
                <button
                  className="mt-6 text-red-400 hover:text-red-600 text-md font-medium transition duration-300"
                  onClick={cancelProduct}
                >
                  Отмена
                </button>
              </div>
            )}
            {products.map((item) => (
              <div
                key={item.id}
                className="bg-gray-700/80 p-6 rounded-2xl border-2 border-gray-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 w-64"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-40 object-cover rounded-lg mb-6"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-500 flex items-center justify-center rounded-lg text-gray-300 text-sm mb-10">
                    Нет фото
                  </div>
                )}
                <h4 className="text-xl font-semibold text-gray-100 truncate">{item.name}</h4>
                <p className="text-lg text-[var(--accent-color)] font-medium mt-2">Цена: ¥{item.price}</p>
                <button
                  className="mt-6 text-red-400 hover:text-red-600 text-md font-medium transition duration-300"
                  onClick={() => removeProduct(item.id)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>

          {/* Product Form */}
          {isFormVisible && (
            <div className="bg-gray-700/80 p-8 rounded-2xl shadow-md border-2 border-gray-600/50 animate-slide-up">
              <h2 className="text-2xl font-semibold text-gray-200 mb-6">Добавить новый товар</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-300 mb-2">Название *</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={handleFieldChange('name')}
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300 ${
                      errors.name ? 'border-red-500' : 'border-gray-500'
                    }`}
                    placeholder="Скопируйте название с 1688"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-300 mb-2">URL товара *</label>
                  <input
                    type="text"
                    value={product.url}
                    onChange={handleFieldChange('url')}
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300 ${
                      errors.url ? 'border-red-500' : 'border-gray-500'
                    }`}
                    placeholder="https://detail.1688.com/offer/123.html"
                  />
                  {errors.url && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.url}</p>}
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-300 mb-2">Цена (¥)</label>
                  <input
                    type="text"
                    value={product.price}
                    onChange={handleFieldChange('price')}
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300 ${
                      errors.price ? 'border-red-500' : 'border-gray-500'
                    }`}
                    placeholder="Введите цену"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-300 mb-2">Ссылка на изображение</label>
                  <input
                    type="text"
                    value={product.imageUrl}
                    onChange={handleFieldChange('imageUrl')}
                    className="w-full px-4 py-3 border-2 rounded-lg bg-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] border-gray-500"
                    placeholder="URL изображения"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-gray-300 mb-2">Описание</label>
                  <textarea
                    value={product.description}
                    onChange={handleFieldChange('description')}
                    className="w-full px-4 py-3 border-2 rounded-lg bg-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] border-gray-500 resize-y"
                    placeholder="Описание товара"
                    rows="4"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                  onClick={cancelProduct}
                >
                  Отмена
                </button>
                <button
                  className="px-6 py-3 bg-[var(--accent-color)] text-white font-medium rounded-lg hover:bg-[var(--accent-hover-color)] transition-all duration-300 transform hover:scale-105 shadow-md"
                  onClick={saveProduct}
                >
                  Сохранить
                </button>
              </div>
            </div>
          )}
          {products.length > 0 && (
            <div className="mt-8 text-center">
              <button
                className="w-full sm:w-auto bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                onClick={addAllToCart}
              >
                Добавить все в корзину
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Добавление CSS-анимаций
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
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse {
  animation: pulse 1.5s infinite;
}
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default MultiTerminal;