'use client';

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  showCharCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount,
      maxLength,
      value,
      className = '',
      id,
      disabled,
      rows = 4,
      ...rest
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={textareaId} className="block text-xs font-medium text-neutral-300">
              {label}
            </label>
          )}
          {showCharCount && maxLength && (
            <span className="text-[10px] text-neutral-500 font-mono">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border text-sm text-white placeholder-neutral-500 outline-none transition resize-y leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
              : 'border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
          } ${className}`}
          {...rest}
        />

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

Textarea.displayName = 'Textarea';
