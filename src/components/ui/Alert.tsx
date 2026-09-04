'use client';

import React from 'react';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  title?: string;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<AlertVariant, { container: string; text: string; icon: string }> = {
  error: {
    container: 'bg-rose-950/60 border-rose-800/80',
    text: 'text-rose-300',
    icon: 'text-rose-400',
  },
  warning: {
    container: 'bg-amber-950/60 border-amber-800/80',
    text: 'text-amber-300',
    icon: 'text-amber-400',
  },
  success: {
    container: 'bg-emerald-950/60 border-emerald-800/80',
    text: 'text-emerald-300',
    icon: 'text-emerald-400',
  },
  info: {
    container: 'bg-indigo-950/60 border-indigo-800/80',
    text: 'text-indigo-300',
    icon: 'text-indigo-400',
  },
};

export function Alert({
  children,
  variant = 'info',
  title,
  onDismiss,
  action,
  className = '',
}: AlertProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      role="alert"
      className={`p-3 sm:p-4 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed ${styles.container} ${styles.text} ${className}`}
    >
      <div className="flex items-start space-x-2.5 min-w-0">
        <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
          {variant === 'error' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {variant === 'warning' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {variant === 'success' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {variant === 'info' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <div className="space-y-0.5 min-w-0">
          {title && <p className="font-semibold text-white">{title}</p>}
          <div>{children}</div>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {action}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800/40 transition cursor-pointer"
            aria-label="Dismiss alert"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
