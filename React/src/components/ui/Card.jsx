import React from 'react';
import { motion } from 'framer-motion';

/**
 * Карточка с эффектами для товаров и контента
 */
export const Card = ({ 
  children, 
  className = '',
  hover = true,
  glow = false,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -3 } : {}}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{ transformStyle: 'flat' }}
      className={`
        relative rounded-2xl 
        bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]
        shadow-lg
        overflow-hidden
        ${glow ? 'shadow-[#00f0ff]/20' : ''}
        hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)]
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00f0ff]/0 via-[#00f0ff]/5 to-[#a78bfa]/0 opacity-0 hover:opacity-60 transition-opacity duration-300 blur-xl" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};












