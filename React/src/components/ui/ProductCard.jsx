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
      <div className="h-full w-full flex flex-col p-3 sm:p-4 bg-white rounded-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-0.5">
        {/* Изображение товара */}
        <div className="relative w-full aspect-square mb-3 sm:mb-4 rounded-2xl bg-[#f2f2f7] overflow-hidden flex items-center justify-center p-3 flex-shrink-0">
          {product.imageUrl ? (
            <motion.img
              src={product.imageUrl}
              alt={product.name || 'Товар'}
              className="w-full h-full object-contain max-w-full max-h-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center rounded-lg">
              <span className="text-[#9ca3af] text-xs sm:text-sm text-center px-2">Нет изображения</span>
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Название товара */}
          <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] mb-2 line-clamp-2 break-words overflow-hidden leading-tight tracking-tight">
            {product.name || 'Без названия'}
          </h3>
          
          {/* Цена */}
          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <div className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f] break-words">
              ¥{product.price?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-[#6e6e73] mt-1">Из Китая</div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2 flex-shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAddToCart(product)}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 py-1.5 sm:py-2 min-w-0"
            >
              <ShoppingCartIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">В корзину</span>
            </Button>
            <Button
              variant="outline"
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






