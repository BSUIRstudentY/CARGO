import React from 'react';

/**
 * Заголовок внутренней страницы, как у калькулятора:
 * мелкий kicker, Inter 600 и приглушённый подзаголовок.
 */
export const PageHeader = ({
  kicker,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`page-head flex flex-wrap items-end justify-between gap-3 px-0.5 ${className}`}>
      <div>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1 className={`title${kicker ? ' mt-1' : ''}`}>{title}</h1>
        {subtitle ? <p className="muted mt-1">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
};
