'use client';

import React, { forwardRef, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isPassword = false,
      type = 'text',
      className = '',
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-neutral-300">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={`w-full px-3.5 py-2 rounded-xl bg-neutral-950 border text-sm text-white placeholder-neutral-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-9' : ''
            } ${isPassword || rightIcon ? 'pr-11' : ''} ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
                : 'border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            } ${className}`}
            {...rest}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition cursor-pointer p-1 rounded-md hover:bg-neutral-800/60 focus:outline-none flex items-center justify-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                /* Open Eye */
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                /* Closed / Slashed Eye */
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 text-neutral-400 flex items-center">{rightIcon}</div>
          ) : null}
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

Input.displayName = 'Input';
