import React from 'react';
import { motion } from 'framer-motion';

/**
 * Универсальная кнопка с анимациями
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] focus:ring-[#00f0ff]/50',
    secondary: 'bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] text-[#a78bfa] hover:bg-[rgba(167,139,250,0.15)] hover:border-[rgba(167,139,250,0.5)] focus:ring-[#a78bfa]/50',
    outline: 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] focus:ring-[#00f0ff]/50',
    ghost: 'text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e5e7eb] focus:ring-[#00f0ff]/50',
    'ev-primary': 'bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/30 hover:border-[var(--ev-gold)]/60 focus:ring-[var(--ev-gold)]/50',
    'ev-outline': 'bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)] hover:border-[var(--ev-gold)]/40 hover:text-[var(--ev-gold)] focus:ring-[var(--ev-gold)]/50',
  };
  
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
    md: 'px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
    lg: 'px-5 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};












