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
          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left text-sm sm:text-base
            bg-[rgba(26,26,26,0.85)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)]
            backdrop-blur-md
            hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(26,26,26,0.9)]
            focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 focus:border-[#00f0ff]/50
            transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={selectedOption ? 'text-[#e5e7eb]' : 'text-[#9ca3af]'}>
            {displayValue}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 text-[#9ca3af] flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute left-0 right-0 z-50 py-1.5 rounded-xl overflow-hidden
              bg-[rgba(26,26,26,0.92)] border border-[rgba(255,255,255,0.1)]
              backdrop-blur-xl shadow-xl shadow-black/40
              transition-all duration-200"
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
                    className={`w-full px-4 py-2.5 text-left text-sm sm:text-base transition-colors
                      ${opt.value === value
                        ? 'bg-[rgba(0,240,255,0.15)] text-[#00f0ff]'
                        : 'text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.06)]'
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
