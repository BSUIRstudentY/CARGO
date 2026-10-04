import React from 'react';

/**
 * Pill-кнопка в стиле iOS.
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
  const variants = {
    primary: 'cupertino-btn-fill',
    secondary: 'cupertino-btn-tint',
    outline: 'cupertino-btn-gray',
    ghost: 'cupertino-btn-plain',
  };
  const sizes = {
    sm: 'cupertino-btn-sm',
    md: 'cupertino-btn-md',
    lg: 'cupertino-btn-lg',
  };

  return (
    <button
      className={`cupertino-btn ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
