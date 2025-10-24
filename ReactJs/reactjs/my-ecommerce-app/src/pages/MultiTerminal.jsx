
import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, XMarkIcon, DocumentCheckIcon } from '@heroicons/react/24/solid';
import Tilt from 'react-parallax-tilt';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const mobileLayout = (
    <section id="multi-terminal" className="mobile-terminal">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mobile-terminal-header"
      >
        <h1 className="text-2xl font-bold text-accent-primary">Многофункциональный терминал</h1>
        <p className="text-sm text-text-secondary mt-2">Добавляйте товары с китайских площадок</p>
      </motion.header>

      <AnimatePresence>
        {Object.keys(errors).length > 0 && errors.cart && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="mobile-error"
          >
            {errors.cart}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mobile-terminal-content"
      >
        <motion.div
          className="mobile-instructions"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h2 className="text-lg font-bold text-accent-primary flex items-center">
            <DocumentCheckIcon className="w-5 h-5 mr-2" />
            Инструкция
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
            <li>Добавьте товар через форму.</li>
            <li>Проверьте данные.</li>
            <li>Сохраните локально.</li>
            <li>Добавьте в корзину.</li>
          </ul>
        </motion.div>

        <motion.div
          className="mobile-add-product"
          onClick={() => setIsFormVisible(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-full h-24 flex items-center justify-center text-4xl text-accent-primary font-bold">
            +
          </div>
          <p className="text-center text-text-secondary">Добавить товар</p>
        </motion.div>

        {isFormVisible && (
          <motion.div
            className="mobile-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-2 right-2 text-text-secondary hover:text-accent-primary"
              onClick={cancelProduct}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-accent-primary mb-4">Добавить товар</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1" htmlFor="name">Название *</label>
                <input
                  id="name"
                  type="text"
                  value={product.name}
                  onChange={handleFieldChange('name')}
                  className={`w-full px-3 py-2 bg-bg-tertiary text-text-primary border ${errors.name ? 'border-accent-primary' : 'border-border-primary'} rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary/50`}
                  placeholder="Название с 1688"
                />
                {errors.name && <p className="text-accent-primary text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1" htmlFor="url">URL *</label>
                <input
                  id="url"
                  type="text"
                  value={product.url}
                  onChange={handleFieldChange('url')}
                  className={`w-full px-3 py-2 bg-bg-tertiary text-text-primary border ${errors.url ? 'border-accent-primary' : 'border-border-primary'} rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary/50`}
                  placeholder="https://detail.1688.com/offer/123.html"
                />
                {errors.url && <p className="text-accent-primary text-xs mt-1">{errors.url}</p>}
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1" htmlFor="price">Цена (¥)</label>
                <input
                  id="price"
                  type="text"
                  value={product.price}
                  onChange={handleFieldChange('price')}
                  className={`w-full px-3 py-2 bg-bg-tertiary text-text-primary border ${errors.price ? 'border-accent-primary' : 'border-border-primary'} rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary/50`}
                  placeholder="Цена"
                />
                {errors.price && <p className="text-accent-primary text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1" htmlFor="imageUrl">Ссылка на фото</label>
                <input
                  id="imageUrl"
                  type="text"
                  value={product.imageUrl}
                  onChange={handleFieldChange('imageUrl')}
                  className="w-full px-3 py-2 bg-bg-tertiary text-text-primary border border-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                  placeholder="URL изображения"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1" htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  value={product.description}
                  onChange={handleFieldChange('description')}
                  className="w-full px-3 py-2 bg-bg-tertiary text-text-primary border border-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-y"
                  placeholder="Описание товара"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-bg-tertiary text-text-primary border border-accent-primary py-2 rounded-md"
                  onClick={cancelProduct}
                >
                  Отмена
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-accent-primary text-text-primary py-2 rounded-md"
                  onClick={saveProduct}
                >
                  Сохранить
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mobile-product-grid">
          {products.map((item, index) => (
            <motion.div
              key={item.id}
              className="mobile-product-card-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <div className="mobile-product-card">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="mobile-product-image"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото')}
                  />
                ) : (
                  <div className="mobile-product-placeholder">Нет фото</div>
                )}
                <div className="mobile-product-details">
                  <h4 className="mobile-product-name">{item.name}</h4>
                  <span className="mobile-product-price">¥{item.price}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mobile-remove-product"
                    onClick={() => removeProduct(item.id)}
                  >
                    Удалить
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <div className="mobile-no-products">Нет сохранённых товаров</div>
          )}
        </div>

        {products.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mobile-add-all-to-cart"
            onClick={addAllToCart}
          >
            <ShoppingCartIcon className="w-4 h-4 mr-2" />
            Добавить все в корзину
          </motion.button>
        )}
      </motion.section>
    </section>
  );

  const desktopLayout = (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary text-text-primary py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-accent-primary tracking-tight">
            Многофункциональный терминал
          </h1>
          <p className="text-lg text-text-secondary mt-2">Добавляйте и управляйте товарами с китайских площадок</p>
        </motion.header>

        <AnimatePresence>
          {Object.keys(errors).length > 0 && errors.cart && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-accent-primary/20 border border-accent-primary/50 rounded-lg text-accent-primary text-center text-base font-medium shadow-card"
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
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
            <motion.div
              className="bg-black p-6 rounded-lg border border-border-primary shadow-card"
              whileHover={{ y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <h2 className="text-2xl font-bold text-accent-primary mb-4 flex items-center">
                <DocumentCheckIcon className="w-6 h-6 mr-2" />
                Инструкция по покупке
              </h2>
              <p className="text-text-secondary mb-4">Используйте терминал для добавления и управления товарами:</p>
              <ol className="list-decimal pl-6 space-y-2 text-text-secondary">
                <li>Добавление товара: Заполните форму с названием, URL, ценой и описанием.</li>
                <li>Проверка данных: Проверьте информацию перед сохранением.</li>
                <li>Сохранение товара: Сохраните товар локально.</li>
                <li>Управление товарами: Удаляйте или добавляйте товары в корзину.</li>
                <li>Добавление в корзину: Отправьте товары на обработку.</li>
              </ol>
            </motion.div>
          </Tilt>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
              <motion.div
                className="product-card-wrap"
                whileHover={{ y: -10, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsFormVisible(true)}
              >
                <div className="product-card">
                  <div className="w-full h-40 flex items-center justify-center text-5xl text-accent-primary font-bold">
                    +
                  </div>
                  <p className="text-center text-text-secondary mt-4">Добавить товар</p>
                </div>
              </motion.div>
            </Tilt>

            {isFormVisible && (
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
                <motion.div
                  className="product-card-wrap"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="product-card">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name || 'Предпросмотр'}
                        className="w-full h-40 object-cover rounded-md mb-4 border border-border-primary"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                      />
                    ) : (
                      <div className="w-full h-40 bg-bg-secondary rounded-md flex items-center justify-center mb-4 border border-border-primary">
                        Нет фото
                      </div>
                    )}
                    <h4 className="text-xl font-semibold text-text-primary mb-2 line-clamp-2 text-center">{product.name || 'Название'}</h4>
                    <p className="text-lg font-medium text-accent-primary mb-4 text-center">¥{product.price || '0'}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-transparent border-2 border-accent-primary text-accent-primary py-2 rounded-md hover:bg-accent-primary hover:text-text-primary transition duration-300 font-medium"
                      onClick={cancelProduct}
                    >
                      Отмена
                    </motion.button>
                  </div>
                </motion.div>
              </Tilt>
            )}

            {products.map((item, index) => (
              <Tilt key={item.id} tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
                <motion.div
                  className="product-card-wrap"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="product-card">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-md mb-4 border border-border-primary"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                      />
                    ) : (
                      <div className="w-full h-40 bg-bg-secondary rounded-md flex items-center justify-center mb-4 border border-border-primary">
                        Нет фото
                      </div>
                    )}
                    <h4 className="text-xl font-semibold text-text-primary mb-2 line-clamp-2 text-center">{item.name}</h4>
                    <p className="text-lg font-medium text-accent-primary mb-4 text-center">¥{item.price}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-transparent border-2 border-accent-primary text-accent-primary py-2 rounded-md hover:bg-accent-primary hover:text-text-primary transition duration-300 font-medium"
                      onClick={() => removeProduct(item.id)}
                    >
                      Удалить
                    </motion.button>
                  </div>
                </motion.div>
              </Tilt>
            ))}
          </div>

          {isFormVisible && (
            <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
              <motion.div
                className="bg-black p-8 rounded-lg border border-border-primary shadow-card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <button
                  className="absolute top-4 right-4 text-text-secondary hover:text-accent-primary"
                  onClick={cancelProduct}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-accent-primary mb-6">Добавить новый товар</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-text-secondary mb-2" htmlFor="name">Название *</label>
                    <input
                      id="name"
                      type="text"
                      value={product.name}
                      onChange={handleFieldChange('name')}
                      className={`w-full px-4 py-3 bg-bg-tertiary text-text-primary border ${errors.name ? 'border-accent-primary' : 'border-border-primary'} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition duration-300`}
                      placeholder="Скопируйте название с 1688"
                    />
                    {errors.name && <p className="text-accent-primary text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-text-secondary mb-2" htmlFor="url">URL товара *</label>
                    <input
                      id="url"
                      type="text"
                      value={product.url}
                      onChange={handleFieldChange('url')}
                      className={`w-full px-4 py-3 bg-bg-tertiary text-text-primary border ${errors.url ? 'border-accent-primary' : 'border-border-primary'} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition duration-300`}
                      placeholder="https://detail.1688.com/offer/123.html"
                    />
                    {errors.url && <p className="text-accent-primary text-sm mt-1">{errors.url}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-text-secondary mb-2" htmlFor="price">Цена (¥)</label>
                    <input
                      id="price"
                      type="text"
                      value={product.price}
                      onChange={handleFieldChange('price')}
                      className={`w-full px-4 py-3 bg-bg-tertiary text-text-primary border ${errors.price ? 'border-accent-primary' : 'border-border-primary'} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition duration-300`}
                      placeholder="Введите цену"
                    />
                    {errors.price && <p className="text-accent-primary text-sm mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-text-secondary mb-2" htmlFor="imageUrl">Ссылка на изображение</label>
                    <input
                      id="imageUrl"
                      type="text"
                      value={product.imageUrl}
                      onChange={handleFieldChange('imageUrl')}
                      className="w-full px-4 py-3 bg-bg-tertiary text-text-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition duration-300"
                      placeholder="URL изображения"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-text-secondary mb-2" htmlFor="description">Описание</label>
                    <textarea
                      id="description"
                      value={product.description}
                      onChange={handleFieldChange('description')}
                      className="w-full px-4 py-3 bg-bg-tertiary text-text-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition duration-300 resize-y"
                      placeholder="Описание товара"
                      rows="4"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-4 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-1/2 bg-transparent border-2 border-accent-primary text-accent-primary py-2 rounded-lg hover:bg-accent-primary hover:text-text-primary transition duration-300 font-medium"
                    onClick={cancelProduct}
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-1/2 bg-accent-primary text-text-primary py-2 rounded-lg hover:bg-accent-primary/90 transition duration-300 font-medium"
                    onClick={saveProduct}
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
                className="px-6 py-3 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 font-semibold flex items-center justify-center gap-2 mx-auto shadow-card"
                onClick={addAllToCart}
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

  return (
    <>
      {isMobile ? mobileLayout : desktopLayout}
      <style jsx>{`
        * {
          text-decoration: none;
          color: var(--text-primary, #ffffff);
          box-sizing: border-box;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 16px;
          line-height: 125%;
          font-weight: 500;
        }
        .product-card {
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
          background: #000000;
          z-index: 2;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px var(--shadow-primary, rgba(0, 0, 0, 0.5));
        }
        .product-card-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1px;
          height: 100%;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }
        .product-card-wrap:before {
          content: "";
          position: absolute;
          display: block;
          background: linear-gradient(340deg, var(--bg-primary, rgb(8, 8, 8)) 0%, var(--accent-primary, rgb(255, 37, 73)) 50%, var(--bg-primary, rgb(8, 8, 8)) 80%);
          width: 100%;
          height: 110%;
          z-index: 1;
        }
        .product-card-wrap:nth-child(3n):before {
          background: linear-gradient(-45deg, var(--bg-primary, rgb(8, 8, 8)) 20%, var(--accent-primary, rgb(255, 37, 73)) 50%, var(--bg-primary, rgb(8, 8, 8)) 80%);
        }
        .product-card-wrap:hover:before {
          animation: rotate-gradient linear 5s normal infinite;
        }
        @keyframes rotate-gradient {
          0% { transform: rotate(0deg); width: 100%; }
          50% { transform: rotate(180deg); width: 200%; }
          100% { transform: rotate(360deg); width: 100%; }
        }
        .line-clamp-2 {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        /* Mobile Styles */
        .mobile-terminal {
          min-height: 100vh;
          background: linear-gradient(to bottom, var(--bg-primary, #0a0a0a), var(--bg-secondary, #1a1a1a));
          padding: 16px 8px;
        }
        .mobile-terminal-header {
          text-align: center;
          margin-bottom: 16px;
        }
        .mobile-terminal-header h1 {
          font-size: 1.5rem;
        }
        .mobile-terminal-header p {
          font-size: 0.875rem;
        }
        .mobile-instructions {
          background: #000000;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid var(--border-primary, #333333);
          margin-bottom: 16px;
        }
        .mobile-add-product {
          background: #000000;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid var(--border-primary, #333333);
          text-align: center;
        }
        .mobile-form {
          background: #000000;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid var(--border-primary, #333333);
          position: relative;
          margin-bottom: 16px;
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
          0% { transform: rotate(0deg); width: 100%; }
          50% { transform: rotate(180deg); width: 200%; }
          100% { transform: rotate(360deg); width: 100%; }
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
          background: #000000;
          z-index: 2;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .mobile-product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px -8px var(--shadow-primary, rgba(0, 0, 0, 0.5));
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
        .mobile-product-price {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--accent-primary, #e81e2d);
          text-align: center;
        }
        .mobile-remove-product {
          width: 100%;
          padding: 6px;
          background: transparent;
          border: 1px solid var(--accent-primary, #e81e2d);
          color: var(--accent-primary, #e81e2d);
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
        }
        .mobile-remove-product:hover {
          background: var(--accent-primary, #e81e2d);
          color: var(--text-primary, #ffffff);
        }
        .mobile-no-products {
          grid-column: 1 / -1;
          text-align: center;
          color: var(--text-secondary, #cdcdcd);
          font-size: 0.875rem;
          background: var(--bg-tertiary, #2F2F2F);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-add-all-to-cart {
          width: 100%;
          padding: 8px;
          background: var(--accent-primary, #e81e2d);
          color: var(--text-primary, #ffffff);
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
        }
      `}</style>
    </>
  );
}

export default MultiTerminal;