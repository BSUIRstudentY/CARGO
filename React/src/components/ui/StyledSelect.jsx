import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

/**
 * Выпадающий список в стиле сайта. Список рендерится в Portal с z-index 9999,
 * чтобы не перекрывался карточками каталога.
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
  const [dropdownRect, setDropdownRect] = useState(null);
  const containerRef = useRef(null);

  const updatePosition = () => {
    if (containerRef.current && isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setDropdownRect(null);
      return;
    }
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) updatePosition();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        const portal = document.getElementById('styled-select-dropdown-portal');
        if (portal && portal.contains(e.target)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const dropdownContent = isOpen && dropdownRect && createPortal(
    <div
      id="styled-select-dropdown-portal"
      className="fixed py-1.5 rounded-xl overflow-hidden bg-[var(--ev-void)] border border-[var(--ev-gold)]/20 backdrop-blur-xl shadow-xl shadow-black/50 min-w-0"
      style={{
        zIndex: 9999,
        top: dropdownRect.top,
        left: dropdownRect.left,
        width: dropdownRect.width,
      }}
    >
      <ul className="max-h-60 overflow-y-auto py-1">
        {options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm sm:text-base transition-colors ${opt.value === value ? 'bg-[var(--ev-gold)]/20 text-[var(--ev-gold)]' : 'text-[var(--ev-text)] hover:bg-[var(--ev-glass)]'}`}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-[var(--ev-text-muted)] mb-1.5 sm:mb-2">
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
            bg-[var(--ev-void)] text-[var(--ev-text)] border border-[var(--ev-gold)]/20
            backdrop-blur-md
            hover:border-[var(--ev-gold)]/40 hover:bg-[var(--ev-void)]/90
            focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/50 focus:border-[var(--ev-gold)]/50
            transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={selectedOption ? 'text-[var(--ev-text)]' : 'text-[var(--ev-text-muted)]'}>
            {displayValue}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 text-[var(--ev-text-muted)] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {dropdownContent}
      </div>
    </div>
  );
}
