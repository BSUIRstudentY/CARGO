import React from 'react';

/**
 * Индикатор загрузки: тонкое кольцо system blue.
 */
export const Loading = ({ message = 'Загрузка...', size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-2 border-[rgba(60,60,67,0.16)] border-t-[#007aff] animate-spin mb-3`}
      />
      {message && (
        <p className="text-sm" style={{ color: 'var(--c-secondary)' }}>{message}</p>
      )}
    </div>
  );
};
