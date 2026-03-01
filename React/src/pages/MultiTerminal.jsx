import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, XMarkIcon, LinkIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { Alert } from '../components/ui/Alert';

function MultiTerminal() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickDescription, setQuickDescription] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const nameInputRef = useRef(null);
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
    if (!validateForm()) return;
    const productData = {
      id: editingProductId || product.id,
      name: product.name.trim(),
      url: product.url.trim(),
      price: parseFloat(product.price) || 0,
      imageUrl: product.imageUrl.trim() || '',
      description: product.description.trim() || '',
    };
    if (editingProductId) {
      setProducts((prev) => prev.map((p) => (p.id === editingProductId ? productData : p)));
      setEditingProductId(null);
    } else {
      setProducts((prev) => [productData, ...prev]);
    }
    resetProductForm();
    setIsFormVisible(false);
  };

  const saveAndAddAnother = () => {
    if (!validateForm()) return;
    const productData = {
      id: product.id,
      name: product.name.trim(),
      url: product.url.trim(),
      price: parseFloat(product.price) || 0,
      imageUrl: product.imageUrl.trim() || '',
      description: product.description.trim() || '',
    };
    setProducts((prev) => [productData, ...prev]);
    resetProductForm();
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const resetProductForm = () => {
    setProduct({
      id: crypto.randomUUID(),
      name: '',
      url: '',
      price: '',
      imageUrl: '',
      description: '',
    });
    setErrors({});
  };

  const quickAddByUrl = () => {
    const url = quickUrl.trim();
    if (!url) {
      setErrors({ url: 'Вставьте ссылку на товар' });
      return;
    }
    let name = 'Товар по ссылке';
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      if (host) name = `Товар с ${host}`;
    } catch (_) {}
    setProducts((prev) => [
      {
        id: crypto.randomUUID(),
        name,
        url,
        price: 0,
        imageUrl: '',
        description: quickDescription.trim(),
      },
      ...prev,
    ]);
    setQuickUrl('');
    setQuickDescription('');
    setErrors({});
  };

  const openEdit = (item) => {
    setProduct({
      id: item.id,
      name: item.name,
      url: item.url,
      price: String(item.price ?? ''),
      imageUrl: item.imageUrl || '',
      description: item.description || '',
    });
    setEditingProductId(item.id);
    setIsFormVisible(true);
    setErrors({});
  };

  const removeProduct = (id) => {
    setRemovingId(id);
  };

  const cancelRemove = () => setRemovingId(null);

  const confirmRemove = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setRemovingId(null);
  };

  const cancelProduct = () => {
    resetProductForm();
    setEditingProductId(null);
    setIsFormVisible(false);
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
    if (products.length === 0) return;
    try {
      await addToCart(products);
      setProducts([]);
      setErrors({});
      setSuccessMessage('Товары добавлены в корзину');
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
          <p className="text-sm text-[var(--ev-text-muted)]">
            Нажмите на карточку с плюсом «Добавить товар». Откроется форма. Заполните поля:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-[var(--ev-text-muted)]">
            <li>
              <strong className="text-[var(--ev-text)]">Название *</strong> — скопируйте название товара с китайского сайта
              (1688, Taobao, Pinduoduo и т.д.).
            </li>
            <li>
              <strong className="text-[var(--ev-text)]">URL *</strong> — вставьте прямую ссылку на страницу товара.
            </li>
            <li>
              <strong className="text-[var(--ev-text)]">Цена (¥)</strong> — по желанию (можно указать позже).
            </li>
            <li>
              <strong className="text-[var(--ev-text)]">Ссылка на фото</strong> — по желанию, чтобы товар был нагляднее в списке.
            </li>
            <li>
              <strong className="text-[var(--ev-text)] font-ev-display">Описание</strong> — размер/цвет/артикул/комментарий для заказа (по желанию).
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
        <p className="text-sm text-[var(--ev-text-muted)]">
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
        <p className="text-sm text-[var(--ev-text-muted)]">
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
        <p className="text-sm text-[var(--ev-text-muted)]">
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
    { href: 'https://www.taobao.com', title: 'Taobao', el: <span className="text-white font-normal text-xs">淘宝</span>, style: { backgroundColor: '#FF5000' } },
    { href: 'https://www.1688.com', title: '1688', el: <span className="text-white font-normal text-sm">1688</span>, style: { backgroundColor: '#FF6A00' } },
    { href: 'https://www.gofish.com', title: 'GoFish', el: <span className="text-[var(--ev-text)] font-normal text-[10px]">GoFish</span>, className: 'bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20' },
    { href: 'https://www.wechat.com', title: 'WeChat', el: <span className="text-white font-normal text-xs">微信</span>, style: { backgroundColor: '#09BB07' } },
    { href: 'https://www.poizon.com', title: 'Poizon', el: <span className="text-[var(--ev-text)] font-normal text-[10px]">Poizon</span>, className: 'bg-[var(--ev-void)] border border-[var(--ev-gold)]/20' },
    { href: 'https://www.95.com', title: '95', el: <span className="text-[var(--ev-text)] font-normal text-xs">95</span>, className: 'bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20' },
  ];

  const InstructionBlocks = ({ variant }) => {
    const isCompact = variant === 'mobile';
    return (
      <div className={isCompact ? 'mb-4' : 'mb-10'}>
        <div className={isCompact ? 'mb-2' : 'mb-4'}>
          <h2 className={isCompact ? 'ev-label text-[var(--ev-gold)]' : 'ev-label text-[var(--ev-gold)]'}>
            Как пользоваться
          </h2>
          <p className={isCompact ? 'ev-label text-[var(--ev-text-muted)] mt-0.5' : 'ev-label text-[var(--ev-text-muted)] mt-2'}>
            {isCompact ? 'Товар → сохранить → в корзину' : 'Пошагово: добавьте товар → сохраните → проверьте список → отправьте в корзину.'}
          </p>
        </div>

        {isCompact ? (
          <div className="space-y-1.5">
            {instructionSteps.map((s) => (
              <details
                key={s.step}
                className="group rounded-lg border border-[var(--ev-gold)]/10 bg-[var(--ev-glass)] backdrop-blur-md px-3 py-2"
              >
                <summary className="cursor-pointer list-none flex items-start gap-2">
                  <span className="mt-0.5 w-5 h-5 rounded bg-[var(--ev-gold)]/20 text-[var(--ev-gold)] font-normal text-[10px] flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-normal text-[var(--ev-text)]">{s.title}</span>
                    <span className="block text-[10px] text-[var(--ev-text-muted)] mt-0.5">{s.short}</span>
                  </span>
                  <span className="text-[var(--ev-text-muted)] group-open:text-[var(--ev-gold)] transition-colors text-xs">▼</span>
                </summary>
                <div className="pt-2 pl-7">{s.content}</div>
              </details>
            ))}

            <details className="group rounded-lg border border-[var(--ev-gold)]/10 bg-[var(--ev-glass)] backdrop-blur-md px-3 py-2">
              <summary className="cursor-pointer list-none flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[var(--ev-gold)]/10 text-[var(--ev-text-muted)] font-normal text-[10px] flex items-center justify-center flex-shrink-0">
                  i
                </span>
                <span className="text-xs font-normal text-[var(--ev-text)]">Площадки</span>
                <span className="ml-auto text-[var(--ev-text-muted)] group-open:text-[var(--ev-gold)] transition-colors text-xs">▼</span>
              </summary>
              <div className="pt-2 pl-7">
                <p className="ev-label text-[var(--ev-text-muted)] mb-2">Китайские площадки:</p>
                <div className="flex flex-wrap gap-1.5">
                  {marketplaces.map((m) => (
                    <a
                      key={m.title}
                      href={m.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={m.title}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded border border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)] transition-colors overflow-hidden ${m.className || ''}`}
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
                className="p-5 rounded-2xl bg-[var(--ev-glass)] backdrop-blur-md border border-[var(--ev-gold)]/10"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[var(--ev-gold)]/20 text-[var(--ev-gold)] font-normal text-sm flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  <div className="min-w-0">
                    <h3 className="ev-label text-[var(--ev-gold)]">{s.title}</h3>
                    <p className="text-sm text-[var(--ev-text-muted)] mt-0.5 font-normal">{s.short}</p>
                  </div>
                </div>
                {s.content}
              </div>
            ))}

            <div className="p-5 rounded-2xl bg-[var(--ev-glass)] backdrop-blur-md border border-[var(--ev-gold)]/10 md:col-span-2">
              <p className="ev-label text-[var(--ev-text-muted)] mb-3 font-normal">Мы можем привезти товары с этих и других китайских площадок:</p>
              <div className="flex flex-wrap gap-2">
                {marketplaces.map((m) => (
                  <a
                    key={m.title}
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={m.title}
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl border border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)] transition-colors overflow-hidden ${m.className || ''}`}
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
    <section id="multi-terminal" className={`min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] py-6 px-4 relative overflow-hidden font-[var(--ev-font-body)] ${products.length > 0 && !isFormVisible ? 'pb-24' : 'pb-20 sm:pb-6'}`}>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6 sm:mb-8"
        >
          <p className="ev-label text-[var(--ev-gold)] mb-2">Заказать товар</p>
          <h1 className="font-ev-hero text-2xl sm:text-3xl md:text-4xl font-light tracking-[-0.02em] text-[var(--ev-gold)]">
            Ссылки на товары → заявка
          </h1>
        </motion.div>

        <AnimatePresence>
          {Object.keys(errors).length > 0 && errors.cart && (
            <Alert
              type="error"
              message={errors.cart}
              onClose={() => setErrors({})}
              className="mb-6"
            />
          )}
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
              className="mb-6"
            />
          )}
        </AnimatePresence>

        {successMessage && (
          <div className="mb-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => { setSuccessMessage(''); navigate('/cart'); }}
              className="px-4 py-2.5 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal text-sm"
            >
              Перейти в корзину
            </button>
          </div>
        )}

        {/* Быстро добавить по ссылке */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md"
        >
          <p className="ev-label text-[var(--ev-gold)] mb-2">Быстро добавить по ссылке</p>
          <p className="text-xs text-[var(--ev-text-muted)] mb-3">Вставьте ссылку — товар появится в списке. Укажите описание, если на странице несколько карточек (какую выбрать). Название и цену можно отредактировать потом.</p>
          <div className="space-y-3">
            <input
              type="url"
              value={quickUrl}
              onChange={(e) => { setQuickUrl(e.target.value); setErrors({}); }}
              placeholder="https://detail.1688.com/..."
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 placeholder:text-[var(--ev-text-muted)]"
            />
            <input
              type="text"
              value={quickDescription}
              onChange={(e) => setQuickDescription(e.target.value)}
              placeholder="Описание (напр.: вторая карточка сверху, красный размер M)"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20 text-sm font-ev-display focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 placeholder:text-[var(--ev-text-muted)]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={quickAddByUrl}
                className="px-4 py-2.5 rounded-lg bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal flex items-center gap-1.5 text-sm"
              >
                <LinkIcon className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>
          {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url}</p>}
        </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mobile-terminal-content"
      >
        <InstructionBlocks variant="mobile" />

        <p className="ev-label text-[var(--ev-gold)] mb-3 sm:mb-4">Добавить товар</p>
        <div className="mobile-product-grid">
          <motion.div
            className="mobile-add-product rounded-xl md:rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md hover:border-[var(--ev-gold)] transition-all cursor-pointer"
            onClick={() => setIsFormVisible(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-full h-20 sm:h-32 flex items-center justify-center text-3xl sm:text-5xl text-[var(--ev-gold)] font-light">
              +
            </div>
                  <p className="text-center text-[var(--ev-text-muted)] ev-label mt-0.5 sm:mt-2 font-normal">Добавить товар</p>
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
                {removingId === item.id ? (
                  <div className="flex flex-col gap-2 p-2">
                    <span className="text-[10px] text-[var(--ev-text-muted)] text-center">Удалить?</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => confirmRemove(item.id)}
                        className="flex-1 py-1.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/40"
                      >
                        Да
                      </button>
                      <button
                        type="button"
                        onClick={cancelRemove}
                        className="flex-1 py-1.5 rounded text-[10px] bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)]"
                      >
                        Нет
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                      <div className="flex gap-1 w-full">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-1.5 rounded text-[10px] border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] bg-[var(--ev-gold)]/10"
                          onClick={() => openEdit(item)}
                        >
                          <PencilSquareIcon className="w-3 h-3 mx-auto" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 mobile-remove-product py-1.5 text-[10px]"
                          onClick={() => removeProduct(item.id)}
                        >
                          Удалить
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <div className="mobile-no-products">
              <p className="ev-label text-[var(--ev-text-muted)] mb-2">Пока нет товаров в списке</p>
              <p className="ev-label text-[var(--ev-gold)]">Добавьте по ссылке выше или нажмите «+»</p>
            </div>
          )}
        </div>

        {isFormVisible && (
          <motion.div
            className="mobile-form rounded-xl md:rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md p-4 sm:p-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)] transition-colors p-1"
              onClick={cancelProduct}
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h2 className="ev-label text-[var(--ev-gold)] mb-3 sm:mb-6 pr-8">
              {editingProductId ? 'Редактировать товар' : 'Добавить товар'}
            </h2>
            <div className="space-y-2 sm:space-y-4">
              <div>
                <label className="block ev-label text-[var(--ev-text-muted)] mb-1 sm:mb-2" htmlFor="name">Название *</label>
                <input
                  ref={nameInputRef}
                  id="name"
                  type="text"
                  value={product.name}
                  onChange={handleFieldChange('name')}
                  className={`w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[var(--ev-void)] text-[var(--ev-text)] border backdrop-blur-md ${errors.name ? 'border-red-500/50' : 'border-[var(--ev-gold)]/20'} focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors placeholder:text-[var(--ev-text-muted)]`}
                  placeholder="Название с 1688"
                />
                {errors.name && <p className="text-red-400 text-xs mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <label className="block ev-label text-[var(--ev-text-muted)] mb-1 sm:mb-2" htmlFor="url">URL *</label>
                <input
                  id="url"
                  type="text"
                  value={product.url}
                  onChange={handleFieldChange('url')}
                  className={`w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[var(--ev-void)] text-[var(--ev-text)] border backdrop-blur-md ${errors.url ? 'border-red-500/50' : 'border-[var(--ev-gold)]/20'} focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors placeholder:text-[var(--ev-text-muted)]`}
                  placeholder="https://detail.1688.com/..."
                />
                {errors.url && <p className="text-red-400 text-xs mt-0.5">{errors.url}</p>}
              </div>
              <div>
                <label className="block ev-label text-[var(--ev-text-muted)] mb-1 sm:mb-2" htmlFor="price">Цена (¥)</label>
                <input
                  id="price"
                  type="text"
                  value={product.price}
                  onChange={handleFieldChange('price')}
                  className={`w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[var(--ev-void)] text-[var(--ev-text)] border backdrop-blur-md ${errors.price ? 'border-red-500/50' : 'border-[var(--ev-gold)]/20'} focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors placeholder:text-[var(--ev-text-muted)]`}
                  placeholder="Цена"
                />
                {errors.price && <p className="text-red-400 text-xs mt-0.5">{errors.price}</p>}
              </div>
              <div>
                <label className="block ev-label text-[var(--ev-text-muted)] mb-1 sm:mb-2" htmlFor="imageUrl">Ссылка на фото</label>
                <input
                  id="imageUrl"
                  type="text"
                  value={product.imageUrl}
                  onChange={handleFieldChange('imageUrl')}
                  className="w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20 backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors placeholder:text-[var(--ev-text-muted)]"
                  placeholder="URL изображения"
                />
              </div>
              <div>
                <label className="block ev-label text-[var(--ev-text-muted)] mb-1 sm:mb-2 font-ev-display" htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  value={product.description}
                  onChange={handleFieldChange('description')}
                  className="w-full px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20 backdrop-blur-md font-ev-display focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] resize-y transition-colors min-h-[72px] placeholder:text-[var(--ev-text-muted)]"
                  placeholder="Описание"
                  rows="3"
                />
              </div>
              <div className="flex gap-2 pt-1 sm:pt-2">
                <button
                  onClick={cancelProduct}
                  className="flex-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/40 transition-all font-normal"
                >
                  Отмена
                </button>
                {!editingProductId && (
                  <button
                    type="button"
                    onClick={saveAndAddAnother}
                    className="flex-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[var(--ev-glass)] border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:border-[var(--ev-gold)]/50 transition-all font-normal"
                  >
                    Сохранить и ещё
                  </button>
                )}
                <button
                  onClick={saveProduct}
                  className="flex-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal"
                >
                  {editingProductId ? 'Сохранить' : 'Сохранить'}
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
                className="w-full px-4 py-2.5 sm:px-6 sm:py-4 rounded-xl text-xs sm:text-base bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal flex items-center justify-center"
              >
                <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                В корзину
              </button>
            </motion.div>
          )}
      </motion.section>
      </div>

      {/* Sticky CTA на мобиле */}
      {isMobile && products.length > 0 && !isFormVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-[var(--ev-void)]/95 backdrop-blur-lg border-t border-[var(--ev-gold)]/20 safe-area-pb">
          <button
            onClick={addAllToCart}
            className="w-full py-3.5 rounded-xl bg-[var(--ev-gold)]/25 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] font-normal flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            В корзину ({products.length})
          </button>
        </div>
      )}
    </section>
  );

  const desktopLayout = (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden pb-24 sm:pb-12 font-[var(--ev-font-body)]">
      <div className="max-w-screen-xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <p className="ev-label text-[var(--ev-gold)] mb-2">Заказать товар</p>
          <h1 className="font-ev-hero text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.02em] text-[var(--ev-gold)]">
            Добавьте ссылки на товары и оформите заявку
          </h1>
        </motion.div>

        <AnimatePresence>
          {Object.keys(errors).length > 0 && errors.cart && (
            <Alert
              type="error"
              message={errors.cart}
              onClose={() => setErrors({})}
              className="mb-8"
            />
          )}
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
              className="mb-8"
            />
          )}
        </AnimatePresence>

        {successMessage && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => { setSuccessMessage(''); navigate('/cart'); }}
              className="px-6 py-3 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal"
            >
              Перейти в корзину
            </button>
          </div>
        )}

        {/* Быстро добавить по ссылке */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md"
        >
          <p className="ev-label text-[var(--ev-gold)] mb-2">Быстро добавить по ссылке</p>
          <p className="text-sm text-[var(--ev-text-muted)] mb-4">Вставьте ссылку — товар появится в списке. Укажите описание, если на странице несколько карточек (какую выбрать). Название и цену можно отредактировать в карточке.</p>
          <div className="space-y-3 max-w-2xl">
            <input
              type="url"
              value={quickUrl}
              onChange={(e) => { setQuickUrl(e.target.value); setErrors({}); }}
              placeholder="https://detail.1688.com/offer/..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20 focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 placeholder:text-[var(--ev-text-muted)]"
            />
            <input
              type="text"
              value={quickDescription}
              onChange={(e) => setQuickDescription(e.target.value)}
              placeholder="Описание (напр.: вторая карточка сверху, красный размер M)"
              className="w-full px-4 py-3 rounded-xl bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20 font-ev-display focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 placeholder:text-[var(--ev-text-muted)]"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={quickAddByUrl}
                className="px-6 py-3 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal flex items-center gap-2"
              >
                <LinkIcon className="w-5 h-5" />
                Добавить
              </button>
            </div>
          </div>
          {errors.url && <p className="text-red-400 text-sm mt-2">{errors.url}</p>}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          <InstructionBlocks variant="desktop" />

          <p className="ev-label text-[var(--ev-gold)] mb-4">Добавить товар</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <motion.div
              className="product-card-wrap"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFormVisible(true)}
            >
                <div className="product-card rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md hover:border-[var(--ev-gold)]/40 transition-all cursor-pointer">
                  <div className="w-full h-40 flex items-center justify-center text-5xl text-[var(--ev-gold)] font-light">
                    +
                  </div>
                  <p className="text-center text-[var(--ev-text-muted)] ev-label mt-4 font-normal">Добавить товар</p>
                </div>
            </motion.div>

            {isFormVisible && (
              <motion.div
                className="product-card-wrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                  <div className="product-card rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md">
                    {product.imageUrl ? (
                      <div className="w-full h-40 rounded-xl mb-4 border border-[var(--ev-gold)]/20 bg-[var(--ev-void)]/50 flex items-center justify-center p-3 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name || 'Предпросмотр'}
                          className="w-full h-full object-contain"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 rounded-xl flex items-center justify-center mb-4 border border-[var(--ev-gold)]/20 bg-[var(--ev-void)]/50 text-[var(--ev-text-muted)] text-sm font-normal">
                        Нет фото
                      </div>
                    )}
                    <h4 className="text-lg font-normal text-[var(--ev-text)] mb-2 line-clamp-2 text-center font-[var(--ev-font-body)]">{product.name || 'Название'}</h4>
                    <p className="ev-label text-[var(--ev-gold)] mb-4 text-center">¥{product.price || '0'}</p>
                    <button
                      onClick={cancelProduct}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/40 transition-all font-normal"
                    >
                      Отмена
                    </button>
                  </div>
              </motion.div>
            )}
          </div>

          <div>
            <p className="ev-label text-[var(--ev-gold)] mb-4">Ваши товары {products.length > 0 ? `(${products.length}) — нажмите «Добавить все в корзину»` : '— добавьте по ссылке выше или карточкой «+»'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((item, index) => (
              <motion.div
                key={item.id}
                className="product-card-wrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                  <div className="product-card rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md">
                    {removingId === item.id ? (
                      <div className="flex flex-col gap-3 p-4">
                        <span className="text-sm text-[var(--ev-text-muted)] text-center">Удалить товар?</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => confirmRemove(item.id)}
                            className="flex-1 py-2.5 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                          >
                            Да
                          </button>
                          <button
                            type="button"
                            onClick={cancelRemove}
                            className="flex-1 py-2.5 rounded-xl text-sm bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/40"
                          >
                            Нет
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item.imageUrl ? (
                          <div className="w-full h-40 rounded-xl mb-4 border border-[var(--ev-gold)]/20 bg-[var(--ev-void)]/50 flex items-center justify-center p-3 overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-40 rounded-xl flex items-center justify-center mb-4 border border-[var(--ev-gold)]/20 bg-[var(--ev-void)]/50 text-[var(--ev-text-muted)] text-sm font-normal">
                            Нет фото
                          </div>
                        )}
                        <h4 className="text-lg font-normal text-[var(--ev-text)] mb-2 line-clamp-2 text-center font-[var(--ev-font-body)]">{item.name}</h4>
                        <p className="ev-label text-[var(--ev-gold)] mb-4 text-center">¥{item.price}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="flex-1 px-4 py-3 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/40 transition-all font-normal flex items-center justify-center gap-1.5"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                            Изменить
                          </button>
                          <button
                            onClick={() => removeProduct(item.id)}
                            className="flex-1 px-4 py-3 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)] hover:border-red-500/40 hover:text-red-400 transition-all font-normal"
                          >
                            Удалить
                          </button>
                        </div>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full mt-2 px-4 py-3 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal"
                        >
                          В корзину
                        </button>
                      </>
                    )}
                  </div>
              </motion.div>
            ))}
            </div>
            {products.length === 0 && (
              <div className="rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md p-8 text-center">
                <p className="ev-label text-[var(--ev-text-muted)] mb-2">Пока нет товаров в списке</p>
                <p className="ev-label text-[var(--ev-gold)]">Добавьте по ссылке выше или нажмите карточку «+»</p>
              </div>
            )}
          </div>

          {isFormVisible && (
            <div className="p-8 relative rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md">
                <button
                  className="absolute top-6 right-6 text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)] transition-colors z-10"
                  onClick={cancelProduct}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="ev-label text-[var(--ev-gold)] mb-6">
                  {editingProductId ? 'Редактировать товар' : 'Добавить новый товар'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block ev-label text-[var(--ev-text-muted)] mb-2" htmlFor="d-name">Название *</label>
                    <input
                      id="d-name"
                      type="text"
                      value={product.name}
                      onChange={handleFieldChange('name')}
                      className={`w-full px-4 py-3 rounded-xl bg-[var(--ev-void)] text-[var(--ev-text)] border backdrop-blur-md ${errors.name ? 'border-red-500/50' : 'border-[var(--ev-gold)]/20'} focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors placeholder:text-[var(--ev-text-muted)]`}
                      placeholder="Скопируйте название с 1688"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block ev-label text-[var(--ev-text-muted)] mb-2" htmlFor="d-url">URL товара *</label>
                    <input
                      id="d-url"
                      type="text"
                      value={product.url}
                      onChange={handleFieldChange('url')}
                      className={`w-full px-4 py-3 rounded-xl bg-[var(--ev-void)] text-[var(--ev-text)] border backdrop-blur-md ${errors.url ? 'border-red-500/50' : 'border-[var(--ev-gold)]/20'} focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors placeholder:text-[var(--ev-text-muted)]`}
                      placeholder="https://detail.1688.com/offer/123.html"
                    />
                    {errors.url && <p className="text-red-400 text-sm mt-1">{errors.url}</p>}
                  </div>
                  <div>
                    <label className="block ev-label text-[var(--ev-text-muted)] mb-2" htmlFor="d-price">Цена (¥)</label>
                    <input
                      id="d-price"
                      type="text"
                      value={product.price}
                      onChange={handleFieldChange('price')}
                      className={`w-full px-4 py-3 rounded-xl bg-[var(--ev-void)] text-[var(--ev-text)] border backdrop-blur-md ${errors.price ? 'border-red-500/50' : 'border-[var(--ev-gold)]/20'} focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors placeholder:text-[var(--ev-text-muted)]`}
                      placeholder="Введите цену"
                    />
                    {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block ev-label text-[var(--ev-text-muted)] mb-2" htmlFor="d-imageUrl">Ссылка на изображение</label>
                    <input
                      id="d-imageUrl"
                      type="text"
                      value={product.imageUrl}
                      onChange={handleFieldChange('imageUrl')}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20 backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors placeholder:text-[var(--ev-text-muted)]"
                      placeholder="URL изображения"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block ev-label text-[var(--ev-text-muted)] mb-2 font-ev-display" htmlFor="d-description">Описание</label>
                    <textarea
                      id="d-description"
                      value={product.description}
                      onChange={handleFieldChange('description')}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20 backdrop-blur-md font-ev-display focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)] transition-colors resize-y placeholder:text-[var(--ev-text-muted)]"
                      placeholder="Описание товара"
                      rows="4"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={cancelProduct}
                    className="flex-1 px-6 py-3 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/40 transition-all font-normal"
                  >
                    Отмена
                  </button>
                  {!editingProductId && (
                    <button
                      type="button"
                      onClick={saveAndAddAnother}
                      className="flex-1 px-6 py-3 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:border-[var(--ev-gold)]/50 transition-all font-normal"
                    >
                      Сохранить и добавить ещё
                    </button>
                  )}
                  <button
                    onClick={saveProduct}
                    className="flex-1 px-6 py-3 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal"
                  >
                    {editingProductId ? 'Сохранить' : 'Сохранить'}
                  </button>
                </div>
            </div>
          )}

          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <button
                onClick={addAllToCart}
                className="mx-auto px-8 py-4 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 transition-all font-normal flex items-center"
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
        .product-card {
          width: 100%;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          height: 100%;
          z-index: 2;
          position: relative;
          transition: all 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-4px);
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
          background: var(--ev-glass);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(201, 169, 122, 0.2);
          z-index: 2;
          position: relative;
          transition: all 0.3s ease;
        }
        .mobile-product-card:hover {
          transform: translateY(-2px);
          border-color: rgba(201, 169, 122, 0.4);
        }
        .mobile-product-image {
          width: 100%;
          height: 80px;
          object-fit: contain;
          border-radius: 6px;
          border: 1px solid rgba(201, 169, 122, 0.2);
        }
        .mobile-product-image-wrapper {
          width: 100%;
          height: 80px;
          background: color-mix(in srgb, var(--ev-void) 90%, transparent);
          border-radius: 6px;
          border: 1px solid rgba(201, 169, 122, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          overflow: hidden;
        }
        .mobile-product-placeholder {
          width: 100%;
          height: 80px;
          background: color-mix(in srgb, var(--ev-void) 90%, transparent);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ev-text-muted);
          font-size: 0.7rem;
          border: 1px solid rgba(201, 169, 122, 0.2);
          font-family: var(--ev-font-body);
          font-weight: 400;
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
          font-weight: 400;
          color: var(--ev-text);
          margin-bottom: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-align: center;
          line-height: 1.3;
          font-family: var(--ev-font-body);
        }
        .mobile-product-price {
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--ev-gold);
          text-align: center;
          font-family: var(--ev-font-body);
        }
        .mobile-remove-product {
          width: 100%;
          padding: 4px 6px;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: rgb(248, 113, 113);
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 400;
          text-align: center;
          transition: all 0.3s ease;
          font-family: var(--ev-font-body);
        }
        .mobile-remove-product:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.6);
        }
        .mobile-no-products {
          grid-column: 1 / -1;
          text-align: center;
          color: var(--ev-text-muted);
          font-size: 0.8rem;
          background: var(--ev-glass);
          backdrop-filter: blur(12px);
          padding: 12px;
          border-radius: 10px;
          border: 1px solid rgba(201, 169, 122, 0.2);
          font-family: var(--ev-font-body);
          font-weight: 400;
        }
      `}</style>
    </>
  );
}

export default MultiTerminal;