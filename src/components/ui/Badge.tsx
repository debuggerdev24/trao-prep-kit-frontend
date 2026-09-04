'use client';

import React from 'react';

export type BadgeVariant =
  | 'indigo'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'sky'
  | 'purple'
  | 'neutral';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  withDot?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, { container: string; dot: string }> = {
  indigo: {
    container: 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60',
    dot: 'bg-indigo-400',
  },
  emerald: {
    container: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    dot: 'bg-emerald-400',
  },
  rose: {
    container: 'bg-rose-950/80 text-rose-400 border-rose-800/60',
    dot: 'bg-rose-400',
  },
  amber: {
    container: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    dot: 'bg-amber-400',
  },
  sky: {
    container: 'bg-sky-950/80 text-sky-400 border-sky-800/60',
    dot: 'bg-sky-400',
  },
  purple: {
    container: 'bg-purple-950/80 text-purple-400 border-purple-800/60',
    dot: 'bg-purple-400',
  },
  neutral: {
    container: 'bg-neutral-900 text-neutral-300 border-neutral-800',
    dot: 'bg-neutral-400',
  },
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  withDot = false,
  className = '',
}: BadgeProps) {
  const styles = VARIANT_STYLES[variant];
  const showDot = dot || withDot;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${styles.container} ${SIZE_STYLES[size]} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />}
      <span>{children}</span>
    </span>
  );
}
