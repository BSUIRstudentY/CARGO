import React from 'react';

/**
 * Поле ввода: серая заливка iOS, синее кольцо фокуса.
 */
export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--c-tertiary)' }} />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`cupertino-field ${Icon ? 'pl-11' : ''} ${error ? 'ring-2 ring-[#ff3b30]' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--c-red)' }}>
          {error}
        </p>
      )}
    </div>
  );
};
