import React from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Системное сообщение: заливка iOS, без неона.
 */
export const Alert = ({
  type = 'info',
  message,
  onClose,
  className = '',
}) => {
  const variants = {
    success: { bg: 'rgba(255, 255, 255, 0.72)', color: '#111111', icon: CheckCircleIcon },
    error: { bg: 'rgba(255, 255, 255, 0.72)', color: '#111111', icon: ExclamationTriangleIcon },
    warning: { bg: 'rgba(255, 255, 255, 0.72)', color: '#111111', icon: ExclamationTriangleIcon },
    info: { bg: 'rgba(255, 255, 255, 0.72)', color: '#111111', icon: InformationCircleIcon },
  };

  const variant = variants[type] || variants.info;
  const Icon = variant.icon;
  if (!message) return null;

  return (
    <div
      className={`p-3 rounded-2xl ${className}`}
      style={{ background: variant.bg, color: variant.color }}
      role="status"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        {onClose && (
          <button type="button" onClick={onClose} className="flex-shrink-0" aria-label="Закрыть">
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
