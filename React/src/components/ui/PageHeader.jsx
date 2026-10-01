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
      <h1 className="n-page-title">
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
