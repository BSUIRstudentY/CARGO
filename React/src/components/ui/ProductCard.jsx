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
      <article className="glass sheet relative flex h-full w-full flex-col overflow-hidden">
        <div className="photo relative aspect-square w-full shrink-0 overflow-hidden rounded-none">
          {product.imageUrl ? (
            <motion.img
              src={product.imageUrl}
              alt={product.name || 'Товар'}
              className="w-full h-full object-cover object-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="photo-empty">
              <span>Нет изображения</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3 pb-3 pt-1">
          <h3 className="line-clamp-2 min-h-[32px] text-[12px] font-medium text-[#111]">
            {product.name || 'Без названия'}
          </h3>
          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <div className="text-[11px] tabular-nums text-black/55">
              ¥{product.price?.toFixed(2) || '0.00'}
            </div>
            <div className="text-[11px] text-black/55 mt-1">Из Китая</div>
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
      </article>
    </motion.div>
  );
};






