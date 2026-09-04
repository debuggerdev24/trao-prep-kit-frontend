'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(isOpen: boolean, onClose?: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save the element that had focus before the modal opened
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const firstFocusable = containerRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
        firstFocusable?.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes the modal
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return containerRef;
}
