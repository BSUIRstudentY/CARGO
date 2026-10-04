/**
 * Performance optimization utilities.
 * Includes memoization helpers and lazy loading utilities.
 */

/**
 * Memoizes a function result based on its arguments.
 * Useful for expensive calculations.
 */
export function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Throttles function execution to limit calls per time period.
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounces function execution.
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Lazy loads an image with error handling.
 */
export function lazyLoadImage(src, placeholder = '/placeholder.png') {
  return new Promise((resolve, _reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}, using placeholder`);
      resolve(placeholder);
    };
  });
}

/**
 * Formats price with currency symbol.
 */
export function formatPrice(price, currency = 'BYN') {
  if (price == null) return '0.00';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats date for display.
 */
export function formatDate(date, locale = 'ru-RU') {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}












