import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';

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

  const handleAddToCart = async (item) => {
    try {
      await addToCart([item]);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      setErrors({
        cart: `Ошибка при добавлении в корзину: ${error.response?.data?.message || error.message || 'Неизвестная ошибка'}`,
      });
    }
  };

  const addAllToCart = async () => {
    if (products.length === 0) {
      return;
    }
    try {
      await addToCart(products);
      setProducts([]);
      setErrors({});
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      setErrors({
        cart: `Ошибка при добавлении в корзину: ${error.response?.data?.message || error.message || 'Неизвестная ошибка'}`,
      });
    }
  };

  const instructionSteps = [
    {
      step: 1,
      title: 'Добавление товара',
      short: 'Нажмите «Добавить товар» и заполните форму.',
      content: (
        <>
          <p className="text-sm text-[#9ca3af]">
            Нажмите на карточку с плюсом «Добавить товар». Откроется форма. Заполните поля:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-[#9ca3af]">
            <li>
              <strong className="text-[#e5e7eb]">Название *</strong> — скопируйте название товара с китайского сайта
              (1688, Taobao, Pinduoduo и т.д.).
            </li>
            <li>
              <strong className="text-[#e5e7eb]">URL *</strong> — вставьте прямую ссылку на страницу товара.
            </li>
            <li>
              <strong className="text-[#e5e7eb]">Цена (¥)</strong> — по желанию (можно указать позже).
            </li>
            <li>
              <strong className="text-[#e5e7eb]">Ссылка на фото</strong> — по желанию, чтобы товар был нагляднее в списке.
            </li>
            <li>
              <strong className="text-[#e5e7eb]">Описание</strong> — размер/цвет/артикул/комментарий для заказа (по желанию).
            </li>
          </ul>
        </>
      ),
    },
    {
      step: 2,
      title: 'Сохранение',
      short: 'Нажмите «Сохранить» — товар появится в списке.',
      content: (
        <p className="text-sm text-[#9ca3af]">
          Нажмите «Сохранить». Товар появится в блоке «Ваши товары» ниже. Данные хранятся в вашем браузере — список
          сохранится даже после закрытия вкладки.
        </p>
      ),
    },
    {
      step: 3,
      title: 'Управление списком',
      short: 'Удаляйте лишнее, добавляйте по одному в корзину.',
      content: (
        <p className="text-sm text-[#9ca3af]">
          В блоке «Ваши товары» можно просматривать сохранённые позиции, удалять ненужные («Удалить»), либо добавлять
          отдельный товар в корзину («В корзину»).
        </p>
      ),
    },
    {
      step: 4,
      title: 'Оформление заказа',
      short: 'Нажмите «Добавить все в корзину» и оформляйте заказ.',
      content: (
        <p className="text-sm text-[#9ca3af]">
          Когда всё готово, нажмите «Добавить все в корзину». Затем перейдите в корзину, выберите отделение доставки,
          упаковку и страховку (если нужно) и оформите заказ.
        </p>
      ),
    },
  ];

  const marketplaces = [
    {
      href: 'https://www.pinduoduo.com',
      title: 'Pinduoduo',
      el: (
        <img
          src="/logos/pinduoduo.svg"
          alt="Pinduoduo"
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<span class="text-gray-600 font-bold text-xs">拼多多</span>';
          }}
        />
      ),
      className: 'bg-white',
    },
    { href: 'https://www.taobao.com', title: 'Taobao', el: <span className="text-white font-bold text-xs">淘宝</span>, style: { backgroundColor: '#FF5000' } },
    { href: 'https://www.1688.com', title: '1688', el: <span className="text-white font-bold text-sm">1688</span>, style: { backgroundColor: '#FF6A00' } },
    { href: 'https://www.gofish.com', title: 'GoFish', el: <span className="text-white font-bold text-[10px]">GoFish</span>, className: 'bg-[rgba(255,255,255,0.05)]' },
    { href: 'https://www.wechat.com', title: 'WeChat', el: <span className="text-white font-bold text-xs">微信</span>, style: { backgroundColor: '#09BB07' } },
    { href: 'https://www.poizon.com', title: 'Poizon', el: <span className="text-white font-bold text-[10px]">Poizon</span>, className: 'bg-black' },
    { href: 'https://www.95.com', title: '95', el: <span className="text-white font-bold text-xs">95</span>, className: 'bg-[rgba(255,255,255,0.05)]' },
  ];

  const InstructionBlocks = ({ variant }) => {
    const isCompact = variant === 'mobile';
    return (
      <div className={isCompact ? 'mb-4' : 'mb-10'}>
        <div className={isCompact ? 'mb-2' : 'mb-4'}>
          <h2 className={isCompact ? 'text-xs font-semibold text-[#00f0ff]' : 'text-xl font-bold text-[#00f0ff]'}>
            Как пользоваться
          </h2>
          <p className={isCompact ? 'text-[10px] text-[#9ca3af] mt-0.5' : 'text-sm text-[#9ca3af] mt-2'}>
            {isCompact ? 'Товар → сохранить → в корзину' : 'Пошагово: добавьте товар → сохраните → проверьте список → отправьте в корзину.'}
          </p>
        </div>

        {isCompact ? (
          <div className="space-y-1.5">
            {instructionSteps.map((s) => (
              <details
                key={s.step}
                className="group rounded-lg border border-[rgba(255,255,255,0.08)] bg-transparent px-3 py-2"
              >
                <summary className="cursor-pointer list-none flex items-start gap-2">
                  <span className="mt-0.5 w-5 h-5 rounded bg-[rgba(0,240,255,0.15)] text-[#00f0ff] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[#e5e7eb]">{s.title}</span>
                    <span className="block text-[10px] text-[#9ca3af] mt-0.5">{s.short}</span>
                  </span>
                  <span className="text-[#9ca3af] group-open:text-[#00f0ff] transition-colors text-xs">▼</span>
                </summary>
                <div className="pt-2 pl-7">{s.content}</div>
              </details>
            ))}

            <details className="group rounded-lg border border-[rgba(255,255,255,0.08)] bg-transparent px-3 py-2">
              <summary className="cursor-pointer list-none flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[rgba(255,255,255,0.06)] text-[#9ca3af] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  i
                </span>
                <span className="text-xs font-semibold text-[#e5e7eb]">Площадки</span>
                <span className="ml-auto text-[#9ca3af] group-open:text-[#00f0ff] transition-colors text-xs">▼</span>
              </summary>
              <div className="pt-2 pl-7">
                <p className="text-[10px] text-[#9ca3af] mb-2">Китайские площадки:</p>
                <div className="flex flex-wrap gap-1.5">
                  {marketplaces.map((m) => (
                    <a
                      key={m.title}
                      href={m.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={m.title}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded border border-[rgba(255,255,255,0.12)] hover:border-[#00f0ff] transition-colors overflow-hidden ${m.className || ''}`}
                      style={m.style || undefined}
                    >
                      {m.el}
                    </a>
                  ))}
                </div>
              </div>
            </details>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instructionSteps.map((s) => (
              <div
                key={s.step}
                className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[rgba(0,240,255,0.15)] text-[#00f0ff] font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-[#e5e7eb]">{s.title}</h3>
                    <p className="text-sm text-[#9ca3af] mt-0.5">{s.short}</p>
                  </div>
                </div>
                {s.content}
              </div>
            ))}

            <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] md:col-span-2">
              <p className="text-sm text-[#9ca3af] mb-3">Мы можем привезти товары с этих и других китайских площадок:</p>
              <div className="flex flex-wrap gap-2">
                {marketplaces.map((m) => (
                  <a
                    key={m.title}
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={m.title}
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl border border-[rgba(255,255,255,0.15)] hover:border-[#00f0ff] transition-colors overflow-hidden ${m.className || ''}`}
                    style={m.style || undefined}
                  >
                    {m.el}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const mobileLayout = (
    <section id="multi-terminal" className="min-h-screen bg-transparent text-[#e5e7eb] py-3 px-3 relative overflow-hidden pb-20 sm:pb-6">
      
      <div className="relative z-10">
        <PageHeader 
          title="Заказать товар"
          subtitle="Ссылки на товары → заявка"
          className="mb-4 sm:mb-8"
        />

        <AnimatePresence>
          {Object.keys(errors).length > 0 && errors.cart && (
            <Alert
              type="error"
              message={errors.cart}
              onClose={() => setErrors({})}
              className="mb-6"
            />
          )}
        </AnimatePresence>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mobile-terminal-content"
      >
        <InstructionBlocks variant="mobile" />

        <p className="text-xs font-semibold text-[#00f0ff] mb-1.5 sm:mb-3">Добавить товар</p>
        <div className="mobile-product-grid">
          <motion.div
            className="mobile-add-product"
            onClick={() => setIsFormVisible(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-full h-20 sm:h-32 flex items-center justify-center text-3xl sm:text-5xl text-[#00f0ff] font-bold">
              +
            </div>
            <p className="text-center text-[#9ca3af] text-xs sm:text-base mt-0.5 sm:mt-2">Добавить товар</p>
          </motion.div>

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
                  <div className="mobile-product-image-wrapper">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="mobile-product-image"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото')}
                    />
                  </div>
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

        {isFormVisible && (
          <motion.div
            className="mobile-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[#9ca3af] hover:text-[#00f0ff] transition-colors p-1"
              onClick={cancelProduct}
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h2 className="text-base sm:text-xl font-bold text-[#00f0ff] mb-3 sm:mb-6 pr-8">Добавить товар</h2>
            <div className="space-y-2 sm:space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1 sm:mb-2" htmlFor="name">Название *</label>
                <input
                  id="name"
                  type="text"
                  value={product.name}
                  onChange={handleFieldChange('name')}
                  className={`w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border ${errors.name ? 'border-[rgba(239,68,68,0.5)]' : 'border-[rgba(255,255,255,0.1)]'} focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition-colors`}
                  placeholder="Название с 1688"
                />
                {errors.name && <p className="text-[#ef4444] text-xs mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1 sm:mb-2" htmlFor="url">URL *</label>
                <input
                  id="url"
                  type="text"
                  value={product.url}
                  onChange={handleFieldChange('url')}
                  className={`w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border ${errors.url ? 'border-[rgba(239,68,68,0.5)]' : 'border-[rgba(255,255,255,0.1)]'} focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition-colors`}
                  placeholder="https://detail.1688.com/..."
                />
                {errors.url && <p className="text-[#ef4444] text-xs mt-0.5">{errors.url}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1 sm:mb-2" htmlFor="price">Цена (¥)</label>
                <input
                  id="price"
                  type="text"
                  value={product.price}
                  onChange={handleFieldChange('price')}
                  className={`w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border ${errors.price ? 'border-[rgba(239,68,68,0.5)]' : 'border-[rgba(255,255,255,0.1)]'} focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition-colors`}
                  placeholder="Цена"
                />
                {errors.price && <p className="text-[#ef4444] text-xs mt-0.5">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1 sm:mb-2" htmlFor="imageUrl">Ссылка на фото</label>
                <input
                  id="imageUrl"
                  type="text"
                  value={product.imageUrl}
                  onChange={handleFieldChange('imageUrl')}
                  className="w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition-colors"
                  placeholder="URL изображения"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1 sm:mb-2" htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  value={product.description}
                  onChange={handleFieldChange('description')}
                  className="w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] resize-y transition-colors min-h-[72px]"
                  placeholder="Описание"
                  rows="3"
                />
              </div>
              <div className="flex gap-2 pt-1 sm:pt-2">
                <button
                  onClick={cancelProduct}
                  className="flex-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 font-medium"
                >
                  Отмена
                </button>
                <button
                  onClick={saveProduct}
                  className="flex-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </motion.div>
        )}

          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={addAllToCart}
                className="w-full px-4 py-2.5 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium flex items-center justify-center"
              >
                <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                В корзину
              </button>
            </motion.div>
          )}
      </motion.section>
      </div>
    </section>
  );

  const desktopLayout = (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden pb-24 sm:pb-12">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader 
          title="Заказать товар"
          subtitle="Добавьте ссылки на товары и оформите заявку"
        />

        <AnimatePresence>
          {Object.keys(errors).length > 0 && errors.cart && (
            <Alert
              type="error"
              message={errors.cart}
              onClose={() => setErrors({})}
              className="mb-8"
            />
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          <InstructionBlocks variant="desktop" />

          <p className="text-base font-semibold text-[#00f0ff] mb-4">Добавить товар</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="product-card-wrap"
              whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsFormVisible(true)}
              >
                <div className="product-card">
                  <div className="w-full h-40 flex items-center justify-center text-5xl text-[#00f0ff] font-bold">
                    +
                  </div>
                  <p className="text-center text-[#9ca3af] mt-4 text-base">Добавить товар</p>
                </div>
            </motion.div>

            {isFormVisible && (
              <motion.div
                className="product-card-wrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                  <div className="product-card">
                    {product.imageUrl ? (
                      <div className="w-full h-40 bg-[rgba(255,255,255,0.02)] rounded-xl mb-4 border border-[rgba(255,255,255,0.1)] flex items-center justify-center p-3 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name || 'Предпросмотр'}
                          className="w-full h-full object-contain"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-4 border border-[rgba(255,255,255,0.1)] text-[#9ca3af] text-sm">
                        Нет фото
                      </div>
                    )}
                    <h4 className="text-xl font-semibold text-[#e5e7eb] mb-2 line-clamp-2 text-center">{product.name || 'Название'}</h4>
                    <p className="text-xl font-semibold text-[#00f0ff] mb-4 text-center">¥{product.price || '0'}</p>
                    <button
                      onClick={cancelProduct}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 font-medium"
                    >
                      Отмена
                    </button>
                  </div>
              </motion.div>
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-[#00f0ff] mb-4">Ваши товары {products.length > 0 ? `(${products.length} в списке — затем нажмите «Добавить все в корзину»)` : '— сохраняйте товары карточкой выше'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((item, index) => (
              <motion.div
                key={item.id}
                className="product-card-wrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                  <div className="product-card">
                    {item.imageUrl ? (
                      <div className="w-full h-40 bg-[rgba(255,255,255,0.02)] rounded-xl mb-4 border border-[rgba(255,255,255,0.1)] flex items-center justify-center p-3 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-4 border border-[rgba(255,255,255,0.1)] text-[#9ca3af] text-sm">
                        Нет фото
                      </div>
                    )}
                    <h4 className="text-xl font-semibold text-[#e5e7eb] mb-2 line-clamp-2 text-center">{item.name}</h4>
                    <p className="text-xl font-semibold text-[#00f0ff] mb-4 text-center">¥{item.price}</p>
                    <button
                      onClick={() => removeProduct(item.id)}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(239,68,68,0.4)] hover:text-[#ef4444] transition-all duration-300 font-medium mb-2"
                    >
                      Удалить
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium"
                    >
                      В корзину
                    </button>
                  </div>
              </motion.div>
            ))}
            </div>
          </div>

          {isFormVisible && (
            <div className="p-8 relative rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
                <button
                  className="absolute top-6 right-6 text-[#9ca3af] hover:text-[#00f0ff] transition-colors z-10"
                  onClick={cancelProduct}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-[#00f0ff] mb-6">Добавить новый товар</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-[#9ca3af] mb-2" htmlFor="name">Название *</label>
                    <input
                      id="name"
                      type="text"
                      value={product.name}
                      onChange={handleFieldChange('name')}
                      className={`w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border ${errors.name ? 'border-[rgba(239,68,68,0.5)]' : 'border-[rgba(255,255,255,0.1)]'} focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition duration-300`}
                      placeholder="Скопируйте название с 1688"
                    />
                    {errors.name && <p className="text-[#ef4444] text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-[#9ca3af] mb-2" htmlFor="url">URL товара *</label>
                    <input
                      id="url"
                      type="text"
                      value={product.url}
                      onChange={handleFieldChange('url')}
                      className={`w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border ${errors.url ? 'border-[rgba(239,68,68,0.5)]' : 'border-[rgba(255,255,255,0.1)]'} focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition duration-300`}
                      placeholder="https://detail.1688.com/offer/123.html"
                    />
                    {errors.url && <p className="text-[#ef4444] text-sm mt-1">{errors.url}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-[#9ca3af] mb-2" htmlFor="price">Цена (¥)</label>
                    <input
                      id="price"
                      type="text"
                      value={product.price}
                      onChange={handleFieldChange('price')}
                      className={`w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border ${errors.price ? 'border-[rgba(239,68,68,0.5)]' : 'border-[rgba(255,255,255,0.1)]'} focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition duration-300`}
                      placeholder="Введите цену"
                    />
                    {errors.price && <p className="text-[#ef4444] text-sm mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-[#9ca3af] mb-2" htmlFor="imageUrl">Ссылка на изображение</label>
                    <input
                      id="imageUrl"
                      type="text"
                      value={product.imageUrl}
                      onChange={handleFieldChange('imageUrl')}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition duration-300"
                      placeholder="URL изображения"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-[#9ca3af] mb-2" htmlFor="description">Описание</label>
                    <textarea
                      id="description"
                      value={product.description}
                      onChange={handleFieldChange('description')}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff] transition duration-300 resize-y"
                      placeholder="Описание товара"
                      rows="4"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={cancelProduct}
                    className="flex-1 px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 font-medium"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={saveProduct}
                    className="flex-1 px-6 py-3 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium"
                  >
                    Сохранить
                  </button>
                </div>
            </div>
          )}

          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <button
                onClick={addAllToCart}
                className="mx-auto px-8 py-4 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium flex items-center"
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                Добавить все в корзину
              </button>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? mobileLayout : desktopLayout}
      <style>{`
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
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          height: 100%;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 2;
          position: relative;
          transition: all 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .product-card-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          position: relative;
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
          background: rgba(255, 255, 255, 0.02);
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 16px;
        }
        .mobile-add-product {
          background: rgba(255, 255, 255, 0.02);
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .mobile-add-product:hover {
          border-color: rgba(0, 240, 255, 0.3);
          background: rgba(255, 255, 255, 0.04);
        }
        .mobile-form {
          background: rgba(255, 255, 255, 0.02);
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
          margin-bottom: 16px;
        }
        .mobile-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }
        @media (max-width: 480px) {
          .mobile-product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
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
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }
        .mobile-product-card-wrap:before {
          content: "";
          position: absolute;
          display: block;
          background: transparent;
          width: 100%;
          height: 110%;
          z-index: 1;
        }
        .mobile-product-card {
          width: 100%;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
          height: 100%;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 2;
          position: relative;
          transition: all 0.3s ease;
        }
        .mobile-product-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .mobile-product-image {
          width: 100%;
          height: 80px;
          object-fit: contain;
          border-radius: 6px;
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-product-image-wrapper {
          width: 100%;
          height: 80px;
          background-color: var(--bg-secondary, #1a1a1a);
          border-radius: 6px;
          border: 1px solid var(--border-primary, #333333);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          overflow: hidden;
        }
        .mobile-product-placeholder {
          width: 100%;
          height: 80px;
          background-color: var(--bg-secondary, #1a1a1a);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted, #808080);
          font-size: 0.7rem;
          border: 1px solid var(--border-primary, #333333);
        }
        .mobile-product-details {
          padding: 4px 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mobile-product-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: #e5e7eb;
          margin-bottom: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-align: center;
          line-height: 1.3;
        }
        .mobile-product-price {
          font-size: 0.875rem;
          font-weight: 600;
          color: #00f0ff;
          text-align: center;
        }
        .mobile-remove-product {
          width: 100%;
          padding: 4px 6px;
          background: transparent;
          border: 1px solid var(--accent-primary, #e81e2d);
          color: var(--accent-primary, #e81e2d);
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-align: center;
          transition: all 0.3s ease;
        }
        .mobile-remove-product:hover {
          background: var(--accent-primary, #e81e2d);
          color: var(--text-primary, #ffffff);
        }
        .mobile-no-products {
          grid-column: 1 / -1;
          text-align: center;
          color: var(--text-secondary, #cdcdcd);
          font-size: 0.8rem;
          background: var(--bg-card, #1f1f1f);
          padding: 12px;
          border-radius: 10px;
          border: 1px solid var(--border-primary, #333333);
        }
      `}</style>
    </>
  );
}

export default MultiTerminal;