import React from 'react';

/**
 * Крупный заголовок страницы в духе iOS large title.
 */
export const PageHeader = ({
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`mb-8 text-left ${className}`}>
      <h1 className="c-large-title" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
        {title}
      </h1>
      {subtitle && (
        <p className="c-section-lead" style={{ marginTop: 8 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
