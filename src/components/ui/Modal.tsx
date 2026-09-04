'use client';

import React from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const MAX_WIDTH_MAP: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'md',
  children,
  footer,
  className = '',
}: ModalProps) {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`w-full ${MAX_WIDTH_MAP[maxWidth]} rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl relative text-neutral-100 max-h-[90vh] flex flex-col ${className}`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition cursor-pointer z-10"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        {(title || subtitle) && (
          <div className="border-b border-neutral-800 pb-4 mb-6 pr-8">
            {title && (
              <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-1">{children}</div>

        {/* Footer */}
        {footer && <div className="border-t border-neutral-800 pt-4 mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
