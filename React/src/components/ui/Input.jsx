import React from 'react';
import { motion } from 'framer-motion';

/**
 * Универсальный input с единым дизайном
 */
export const Input = ({ 
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-[var(--ev-text-muted)] mb-1.5 sm:mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--ev-text-muted)] sm:left-4 md:left-4" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-sm sm:text-base
            bg-[var(--ev-void)] border border-[var(--ev-gold)]/20
            text-[var(--ev-text)] placeholder-[var(--ev-text-muted)]
            focus:outline-none focus:ring-1 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)]/50
            transition-all duration-300
            ${Icon ? 'pl-11 sm:pl-12 md:pl-14' : ''}
            ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};












