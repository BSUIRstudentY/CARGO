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
      <div className="n-product h-full w-full flex flex-col">
        <div className="relative w-full n-product-photo overflow-hidden flex items-center justify-center">
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
            <div className="n-photo-empty">
              <span>Нет изображения</span>
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Название товара */}
          <h3 className="n-card-name">
            {product.name || 'Без названия'}
          </h3>
          
          {/* Цена */}
          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <div className="n-card-price">
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






