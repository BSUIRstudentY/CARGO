import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/solid';
import { Button } from './Button';

/**
 * Карточка товара с эффектами для каталога
 */
export const ProductCard = ({ 
  product, 
  onAddToCart, 
  onViewDetails,
  index = 0,
  isMobile = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full flex"
    >
      <div className="ev-card h-full w-full flex flex-col p-3 sm:p-4 lg:p-5 rounded-2xl bg-[var(--ev-card-bg)] transition-all duration-300">
        {/* Изображение товара — без границы */}
        <div className="relative w-full aspect-square mb-3 sm:mb-4 rounded-xl bg-[var(--ev-void)] overflow-hidden flex items-center justify-center p-2 sm:p-3 flex-shrink-0">
          {product.imageUrl ? (
            <motion.img
              src={product.imageUrl}
              alt={product.name || 'Товар'}
              className="w-full h-full object-contain max-w-full max-h-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x300/1a1a1a/00f0ff?text=Нет+фото';
              }}
            />
          ) : (
            <div className="w-full h-full bg-[var(--ev-void)] flex items-center justify-center rounded-lg">
              <span className="text-[var(--ev-text-muted)] text-xs sm:text-sm text-center px-2">Нет изображения</span>
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Название товара — основной текст */}
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--ev-text)] mb-2 sm:mb-3 line-clamp-2 break-words overflow-hidden leading-snug">
            {product.name || 'Без названия'}
          </h3>
          
          {/* Цена — акцент золотом из палитры */}
          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--ev-gold)] break-words">
              ¥{product.price?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs sm:text-sm text-[var(--ev-text-muted)] mt-0.5">Из Китая</p>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2 flex-shrink-0">
            <Button
              variant="ev-primary"
              size="sm"
              onClick={() => onAddToCart(product)}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 py-1.5 sm:py-2 min-w-0"
            >
              <ShoppingCartIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">В корзину</span>
            </Button>
            <Button
              variant="ev-outline"
              size="sm"
              onClick={() => onViewDetails(product.id)}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 py-1.5 sm:py-2 min-w-0"
            >
              <EyeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Подробнее</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};






