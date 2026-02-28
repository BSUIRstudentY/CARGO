import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

/**
 * Компонент уведомлений с единым дизайном
 */
export const Alert = ({ 
  type = 'info', 
  message, 
  onClose,
  className = '' 
}) => {
  const variants = {
    success: {
      bg: 'bg-[#4caf50]/20',
      border: 'border-[#4caf50]/50',
      text: 'text-[#4caf50]',
      icon: CheckCircleIcon,
    },
    error: {
      bg: 'bg-[#e81e2d]/20',
      border: 'border-[#e81e2d]/50',
      text: 'text-[#e81e2d]',
      icon: ExclamationTriangleIcon,
    },
    warning: {
      bg: 'bg-[#ff9800]/20',
      border: 'border-[#ff9800]/50',
      text: 'text-[#ff9800]',
      icon: ExclamationTriangleIcon,
    },
    info: {
      bg: 'bg-[#407CFF]/20',
      border: 'border-[#407CFF]/50',
      text: 'text-[#407CFF]',
      icon: InformationCircleIcon,
    },
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className={`p-3 sm:p-4 rounded-lg border ${variant.bg} ${variant.border} ${variant.text} ${className}`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <p className="flex-1 text-xs sm:text-sm font-medium">{message}</p>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};












