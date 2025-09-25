import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, XMarkIcon, DocumentCheckIcon } from '@heroicons/react/24/solid';
import Tilt from 'react-parallax-tilt';

// Append global styles
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
      await addToCart(products);
      alert('Все товары добавлены в корзину!');
      setProducts([]);
      setErrors({});
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      setErrors({
        cart: `Ошибка при добавлении в корзину: ${error.response?.data?.message || error.message || 'Неизвестная ошибка'}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight animate-fade-in-down">
            Многофункциональный терминал
          </h1>
          <p className="text-lg text-gray-300 mt-2">Добавляйте и управляйте товарами с китайских площадок</p>
        </motion.header>

        <AnimatePresence>
          {Object.keys(errors).length > 0 && errors.cart && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-center text-base font-medium shadow-md"
            >
              {errors.cart}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-12"
        >
          <motion.div
            className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 relative overflow-hidden"
            whileTap={{ scale: 0.97 }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                backgroundRepeat: 'repeat',
              }}
            />
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
              <DocumentCheckIcon className="w-6 h-6 mr-2" />
              Инструкция по покупке
            </h2>
            <p className="text-gray-300 mb-4 text-base">
              Используйте терминал для добавления и управления товарами с китайских площадок:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-gray-300">
              <li>
                <strong>Добавление товара:</strong> Заполните форму с названием, URL, ценой и описанием.
              </li>
              <li>
                <strong>Проверка данных:</strong> Проверьте информацию перед сохранением.
              </li>
              <li>
                <strong>Сохранение товара:</strong> Сохраните товар локально для дальнейшего использования.
              </li>
              <li>
                <strong>Управление товарами:</strong> Удаляйте или добавляйте товары в корзину.
              </li>
              <li>
                <strong>Добавление в корзину:</strong> Отправьте товары на обработку.
              </li>
            </ol>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
              <motion.div
                className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 transition-shadow duration-300 transform cursor-pointer"
                whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsFormVisible(true)}
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                    backgroundRepeat: 'repeat',
                  }}
                />
                <div className="w-full h-40 flex items-center justify-center text-5xl text-cyan-400 font-bold">
                  +
                </div>
                <p className="text-center text-gray-300 mt-4 text-base">Добавить товар</p>
              </motion.div>
            </Tilt>
            {isFormVisible && (
              <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                <motion.div
                  className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 transition-shadow duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                      backgroundRepeat: 'repeat',
                    }}
                  />
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name || 'Предпросмотр'}
                      className="w-full h-40 object-cover rounded-lg mb-6 border border-gray-600/20"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-700/50 flex items-center justify-center rounded-lg text-gray-300 text-base mb-6 border border-gray-600/20">
                      Нет фото
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-white truncate">{product.name || 'Название'}</h4>
                  <p className="text-base text-cyan-400 font-medium mt-2">¥{product.price || '0'}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 text-red-400 hover:text-red-600 text-base font-medium transition duration-300"
                    onClick={cancelProduct}
                    aria-label="Отменить добавление товара"
                  >
                    Отмена
                  </motion.button>
                </motion.div>
              </Tilt>
            )}
            {products.map((item, index) => (
              <Tilt key={item.id} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                <motion.div
                  className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 transition-shadow duration-300"
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
                  />
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-lg mb-6 border border-gray-600/20"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-700/50 flex items-center justify-center rounded-lg text-gray-300 text-base mb-6 border border-gray-600/20">
                      Нет фото
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-white truncate">{item.name}</h4>
                  <p className="text-base text-cyan-400 font-medium mt-2">¥{item.price}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 text-red-400 hover:text-red-600 text-base font-medium transition duration-300"
                    onClick={() => removeProduct(item.id)}
                    aria-label={`Удалить товар ${item.name}`}
                  >
                    Удалить
                  </motion.button>
                </motion.div>
              </Tilt>
            ))}
          </div>

          {isFormVisible && (
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
              <motion.div
                className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-8 rounded-2xl shadow-lg border border-cyan-500/30 animate-slide-up relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                    backgroundRepeat: 'repeat',
                  }}
                />
                <button
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition duration-300"
                  onClick={cancelProduct}
                  aria-label="Закрыть форму"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">Добавить новый товар</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2" htmlFor="name">
                      Название *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={product.name}
                      onChange={handleFieldChange('name')}
                      className={`w-full px-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Скопируйте название с 1688"
                      aria-required="true"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2" htmlFor="url">
                      URL товара *
                    </label>
                    <input
                      id="url"
                      type="text"
                      value={product.url}
                      onChange={handleFieldChange('url')}
                      className={`w-full px-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 ${errors.url ? 'border-red-500' : ''}`}
                      placeholder="https://detail.1688.com/offer/123.html"
                      aria-required="true"
                    />
                    {errors.url && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.url}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2" htmlFor="price">
                      Цена (¥)
                    </label>
                    <input
                      id="price"
                      type="text"
                      value={product.price}
                      onChange={handleFieldChange('price')}
                      className={`w-full px-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 ${errors.price ? 'border-red-500' : ''}`}
                      placeholder="Введите цену"
                    />
                    {errors.price && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2" htmlFor="imageUrl">
                      Ссылка на изображение
                    </label>
                    <input
                      id="imageUrl"
                      type="text"
                      value={product.imageUrl}
                      onChange={handleFieldChange('imageUrl')}
                      className="w-full px-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
                      placeholder="URL изображения"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-300 mb-2" htmlFor="description">
                      Описание
                    </label>
                    <textarea
                      id="description"
                      value={product.description}
                      onChange={handleFieldChange('description')}
                      className="w-full px-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 resize-y"
                      placeholder="Описание товара"
                      rows="4"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-base font-semibold shadow-sm"
                    onClick={cancelProduct}
                    aria-label="Отменить добавление товара"
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold shadow-sm"
                    onClick={saveProduct}
                    aria-label="Сохранить товар"
                  >
                    Сохранить
                  </motion.button>
                </div>
              </motion.div>
            </Tilt>
          )}

          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 mx-auto shadow-sm"
                onClick={addAllToCart}
                aria-label="Добавить все товары в корзину"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Добавить все в корзину
              </motion.button>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default MultiTerminal;