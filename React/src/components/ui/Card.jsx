import React from 'react';

/**
 * Группированная карточка: белая поверхность, мягкая тень.
 */
export const Card = ({
  children,
  className = '',
  hover = true,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`cupertino-card ${hover ? 'transition-transform duration-200 hover:-translate-y-0.5' : ''} ${className}`}
      {...props}
    >
      {glow ? null : null}
      {children}
    </div>
  );
};
