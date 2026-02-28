import React from 'react';
import { motion } from 'framer-motion';

/**
 * Единый заголовок страницы
 */
export const PageHeader = ({ 
  title, 
  subtitle,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center mb-8 sm:mb-12 ${className}`}
    >
      <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
        <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      {subtitle && (
        <p className="text-sm sm:text-base md:text-xl text-[#9ca3af] max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};












