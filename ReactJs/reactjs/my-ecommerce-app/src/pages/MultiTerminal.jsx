import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import api from '../api/axiosInstance';

function MultiTerminal() {
  const { addToCart } = useCart();
  const [product, setProduct] = useState({
    id: '',
    name: '',
    url: '', // Reintroduced to match server requirement
    price: '',
    imageUrl: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field) => (e) => {
    setProduct((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = 'Название обязательно (скопируйте с китайского сайта)';
    if (!product.url.trim()) newErrors.url = 'URL товара обязателен'; // New validation
    if (product.price && isNaN(parseFloat(product.price))) newErrors.price = 'Цена должна быть числом';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProduct = async () => {
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    const productData = {
      id: crypto.randomUUID(),
      name: product.name.trim(),
      url: product.url.trim(), // Included to satisfy server
      price: parseFloat(product.price) || 0,
      imageUrl: product.imageUrl.trim() || '',
      description: product.description.trim() || '',
    };

    console.log('Sending product data:', productData); // Debug log

    try {
      const response = await api.post('/products', productData);
      if (response.status !== 201 && response.status !== 200) { // Accept 201 (Created) as success
        throw new Error(`Unexpected response: ${response.statusText}`);
      }

      await addToCart({
        id: productData.id,
        name: productData.name,
        price: productData.price,
        quantity: 1,
      });

      alert('Товар успешно добавлен в корзину!');
      setProduct({
        id: '',
        name: '',
        url: '',
        price: '',
        imageUrl: '',
        description: '',
      });
    } catch (error) {
      console.error('Ошибка при сохранении товара:', error);
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data || error.response.statusText;
        if (status === 403) {
          alert('Ошибка авторизации. Пожалуйста, войдите заново.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (status === 400) {
          alert(`Ошибка 400: ${errorMessage || 'Неверные данные. Проверьте поля.'}`);
        } else {
          alert(`Ошибка сервера: ${errorMessage || 'Не удалось добавить товар.'}`);
        }
      } else {
        alert('Неизвестная ошибка: ' + (error.message || 'Проверьте подключение к серверу.'));
      }
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 min-h-screen bg-[var(--background-color)] text-white">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--accent-color)] mb-6">
        Добавить товар
      </h2>

      <div className="p-4 bg-gray-800 rounded-lg mx-auto max-w-md sm:max-w-lg md:max-w-xl shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Название (как на китайском сайте) *</label>
          <input
            type="text"
            value={product.name}
            onChange={handleFieldChange('name')}
            className={`mt-1 block w-full border rounded-lg p-2 bg-gray-700 text-white ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Скопируйте название с китайского сайта (например, 1688)"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">URL товара *</label>
          <input
            type="text"
            value={product.url}
            onChange={handleFieldChange('url')}
            className={`mt-1 block w-full border rounded-lg p-2 bg-gray-700 text-white ${errors.url ? 'border-red-500' : ''}`}
            placeholder="Введите URL товара (например, https://detail.1688.com/offer/123.html)"
          />
          {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Цена (¥)</label>
          <input
            type="text"
            value={product.price}
            onChange={handleFieldChange('price')}
            className={`mt-1 block w-full border rounded-lg p-2 bg-gray-700 text-white ${errors.price ? 'border-red-500' : ''}`}
            placeholder="Цена в юанях"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Ссылка на изображение</label>
          <input
            type="text"
            value={product.imageUrl}
            onChange={handleFieldChange('imageUrl')}
            className="mt-1 block w-full border rounded-lg p-2 bg-gray-700 text-white"
            placeholder="URL изображения с сайта"
          />
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt="Product Preview"
              className="mt-2 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto object-cover rounded"
              onError={() => setErrors((prev) => ({ ...prev, imageUrl: 'Недействительная ссылка на изображение' }))}
            />
          )}
          {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Описание</label>
          <textarea
            value={product.description}
            onChange={handleFieldChange('description')}
            className="mt-1 block w-full border rounded-lg p-2 bg-gray-700 text-white"
            placeholder="Краткое описание товара"
            rows="4"
          />
        </div>

        <button
          className="w-full sm:w-auto bg-[var(--accent-color)] text-white py-2 px-4 rounded hover:bg-[var(--accent-hover-color)] transition duration-200"
          onClick={saveProduct}
        >
          Добавить в корзину
        </button>
      </div>
    </div>
  );
}

export default MultiTerminal;