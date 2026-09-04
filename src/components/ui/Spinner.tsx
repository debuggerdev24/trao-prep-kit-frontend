'use client';

import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'current' | 'indigo' | 'white';
}

const SIZE_MAP = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const COLOR_MAP = {
  current: 'text-current',
  indigo: 'text-indigo-500',
  white: 'text-white',
};

export function Spinner({ size = 'sm', className = '', color = 'current' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${SIZE_MAP[size]} ${COLOR_MAP[color]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
