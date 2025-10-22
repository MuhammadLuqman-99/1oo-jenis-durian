/**
 * Accessibility utilities and helpers
 */

import React from 'react';

/**
 * Trap focus within a container (for modals, dropdowns)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  if (typeof window !== 'undefined') {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return;

  const announcer = document.getElementById('aria-announcer');
  if (announcer) {
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
}

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Get descriptive action label
 */
export function getActionLabel(action: string, itemName?: string): string {
  const labels: Record<string, string> = {
    edit: 'Edit',
    delete: 'Delete',
    view: 'View details for',
    download: 'Download',
    upload: 'Upload',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    open: 'Open',
    expand: 'Expand',
    collapse: 'Collapse',
  };

  const label = labels[action] || action;
  return itemName ? `${label} ${itemName}` : label;
}

/**
 * Skip to main content link
 */
export const SkipToMain = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:m-2"
  >
    Skip to main content
  </a>
);

/**
 * Screen reader only text
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

/**
 * Loading announcement
 */
export function announceLoading(loading: boolean, message?: string) {
  if (loading) {
    announce(message || 'Loading...', 'polite');
  }
}

/**
 * Form error announcement
 */
export function announceFormError(errors: Record<string, string>) {
  const errorCount = Object.keys(errors).length;
  if (errorCount > 0) {
    announce(
      `Form has ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}. Please check and correct.`,
      'assertive'
    );
  }
}
