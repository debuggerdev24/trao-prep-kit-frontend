'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  options?: SelectOption[];
  selectSize?: 'sm' | 'md';
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: { target: { value: any; name?: string } }) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      selectSize = 'md',
      value,
      defaultValue,
      onChange,
      name,
      id,
      disabled,
      className = '',
      children,
      placeholder = 'Select an option',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string | number>(
      defaultValue ?? (options?.[0]?.value || '')
    );
    const containerRef = useRef<HTMLDivElement>(null);

    // Support both `options` array and `<option>` children
    const parsedOptions: SelectOption[] = useMemo(() => {
      if (options && options.length > 0) return options;
      if (!children) return [];
      const list: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const props = child.props as any;
          list.push({
            value: props.value,
            label: typeof props.children === 'string' ? props.children : String(props.children ?? props.value),
            disabled: Boolean(props.disabled),
          });
        }
      });
      return list;
    }, [options, children]);

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = parsedOptions.find((opt) => String(opt.value) === String(currentValue));
    const displayText = selectedOption?.label || placeholder;

    // Close on click outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') setIsOpen(false);
      }
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [isOpen]);

    const handleSelect = (opt: SelectOption) => {
      if (opt.disabled || disabled) return;
      if (value === undefined) {
        setInternalValue(opt.value);
      }
      onChange?.({
        target: {
          value: opt.value,
          name,
        },
      });
      setIsOpen(false);
    };

    const sizeClasses =
      selectSize === 'sm'
        ? 'h-8 px-2.5 text-xs rounded-lg'
        : 'h-9.5 px-3.5 text-sm rounded-xl';

    // Difficulty dot helper for level/difficulty labels
    const getDotColor = (optValue: string | number, labelText: string) => {
      const lower = labelText.toLowerCase();
      if (lower.includes('basic') || lower.includes('easy') || optValue === 1) return 'bg-emerald-400';
      if (lower.includes('moderate') || lower.includes('medium') || optValue === 2) return 'bg-amber-400';
      if (lower.includes('hard') || lower.includes('advanced') || optValue === 3) return 'bg-rose-400';
      return null;
    };

    const currentDot = selectedOption ? getDotColor(selectedOption.value, selectedOption.label) : null;

    return (
      <div className="w-full space-y-1.5 text-left" ref={containerRef}>
        {label && (
          <label className="block text-xs font-medium text-neutral-300">
            {label}
          </label>
        )}

        <div className="relative">
          {/* Custom Trigger Button */}
          <button
            type="button"
            id={id}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={`w-full ${sizeClasses} flex items-center justify-between gap-2 bg-neutral-900/90 hover:bg-neutral-800/90 border text-neutral-200 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? 'border-rose-500/80 ring-1 ring-rose-500/30'
                : isOpen
                ? 'border-neutral-600 bg-neutral-800 ring-1 ring-neutral-600/50 shadow-md'
                : 'border-neutral-700/60 hover:border-neutral-600 shadow-sm'
            } ${className}`}
          >
            <div className="flex items-center gap-2 truncate">
              {currentDot && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentDot}`} />
              )}
              <span className="truncate font-medium">{displayText}</span>
            </div>

            <svg
              className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-white' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Floating Dropdown Popover */}
          {isOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-full mt-1.5 z-50 min-w-full w-max max-w-xs bg-neutral-900/95 border border-neutral-700/80 shadow-2xl shadow-black/80 rounded-xl p-1 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-100 max-h-60 overflow-y-auto"
            >
              {parsedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(currentValue);
                const dotColor = getDotColor(opt.value, opt.label);

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-neutral-800 text-white font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {dotColor && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] text-rose-400 flex items-center space-x-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && <p className="text-[11px] text-neutral-400">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
