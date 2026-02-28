import React from 'react';
import { motion } from 'framer-motion';

/**
 * Компонент загрузки с единым дизайном
 */
export const Loading = ({ message = 'Загрузка...', size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} border-4 border-[rgba(255,255,255,0.1)] border-t-[#00f0ff] rounded-full mb-4`}
      />
      {message && (
        <p className="text-[#9ca3af] text-lg">{message}</p>
      )}
    </div>
  );
};












