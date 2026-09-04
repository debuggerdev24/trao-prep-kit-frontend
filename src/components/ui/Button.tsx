'use client';

import React, { forwardRef } from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 border border-transparent focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
  secondary:
    'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/80 focus-visible:ring-2 focus-visible:ring-neutral-500',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-transparent focus-visible:ring-2 focus-visible:ring-rose-500',
  ghost:
    'bg-transparent hover:bg-neutral-800/70 text-neutral-400 hover:text-white border border-transparent focus-visible:ring-2 focus-visible:ring-neutral-600',
  outline:
    'bg-transparent hover:bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 focus-visible:ring-2 focus-visible:ring-indigo-500',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs font-medium rounded-xl gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 py-2.5 text-sm sm:text-base font-semibold rounded-2xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled = false,
      className = '',
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-medium transition cursor-pointer select-none outline-none disabled:opacity-45 disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} />
            {loadingText ? <span>{loadingText}</span> : children ? <span>{children}</span> : null}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
