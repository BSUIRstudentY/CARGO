import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

/**
 * Выпадающий список в стиле сайта: блюр, полупрозрачность, скругления, отступ от триггера.
 * options: [{ value, label }, ...]
 */
export function StyledSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Выберите...',
  label,
  className = '',
  disabled = false,
  name,
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-[#9ca3af] mb-1.5 sm:mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((v) => !v)}
          className="input flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={selectedOption ? 'text-[#111]' : ''} style={selectedOption ? undefined : { color: 'rgba(17,17,17,0.42)' }}>
            {displayValue}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 flex-shrink-0 text-[#111] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute left-0 right-0 z-50 overflow-hidden rounded-[14px] bg-white/95 py-1 shadow-[0_10px_30px_rgba(17,17,17,0.08)]"
            style={{ marginTop: '8px', top: '100%' }}
          >
            <ul className="max-h-60 overflow-y-auto py-1">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-[13px] text-[#111] ${
                      opt.value === value ? 'bg-black/5 font-medium' : 'hover:bg-black/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
