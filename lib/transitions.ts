/**
 * Transition and animation utilities for progressive enhancement
 */

/**
 * Common transition class names for consistent animations
 */
export const transitions = {
  // Fade transitions
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-200',

  // Slide transitions
  slideInFromTop: 'animate-in slide-in-from-top-5 fade-in duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom-5 fade-in duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left-5 fade-in duration-300',
  slideInFromRight: 'animate-in slide-in-from-right-5 fade-in duration-300',

  // Scale transitions
  scaleIn: 'animate-in zoom-in-95 fade-in duration-200',
  scaleOut: 'animate-out zoom-out-95 fade-out duration-150',

  // Combined transitions
  popIn: 'animate-in zoom-in-95 slide-in-from-bottom-5 fade-in duration-300',

  // List stagger (apply delays to children)
  stagger: {
    delay100: 'delay-100',
    delay200: 'delay-200',
    delay300: 'delay-300',
    delay400: 'delay-400',
    delay500: 'delay-500',
  },
} as const;

/**
 * Generate stagger delay for list items
 * @param index - Item index in the list
 * @param baseDelay - Base delay in milliseconds (default: 50)
 * @returns Style object with animation delay
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): React.CSSProperties {
  return {
    animationDelay: `${index * baseDelay}ms`,
  };
}

/**
 * Transition group utilities for managing enter/exit animations
 */
export const transitionStates = {
  entering: 'animate-in fade-in slide-in-from-bottom-5 duration-300',
  entered: 'opacity-100 translate-y-0',
  exiting: 'animate-out fade-out slide-out-to-top-5 duration-200',
  exited: 'opacity-0 -translate-y-5',
} as const;

/**
 * Get transition class based on state
 */
export function getTransitionClass(state: keyof typeof transitionStates): string {
  return transitionStates[state];
}

/**
 * Smooth scroll to element with offset
 */
export function smoothScrollTo(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

/**
 * Trigger layout reflow for CSS animations
 * Useful when adding/removing classes dynamically
 */
export function triggerReflow(element: HTMLElement) {
  void element.offsetHeight;
}

/**
 * Wait for animation to complete
 */
export function waitForAnimation(duration: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * CSS custom properties for dynamic animations
 */
export function setAnimationDuration(element: HTMLElement, duration: number) {
  element.style.setProperty('--animation-duration', `${duration}ms`);
}

/**
 * Optimistic UI update wrapper
 * Performs UI update immediately, then syncs with server
 */
export async function withOptimisticUpdate<T>(
  optimisticUpdate: () => void,
  serverUpdate: () => Promise<T>,
  rollback: () => void
): Promise<T | null> {
  // Apply optimistic update immediately
  optimisticUpdate();

  try {
    // Wait for server confirmation
    const result = await serverUpdate();
    return result;
  } catch (error) {
    // Rollback on error
    rollback();
    throw error;
  }
}

/**
 * Batch updates for better performance
 */
export function batchUpdates<T>(
  updates: Array<() => void>,
  callback?: () => void
): void {
  // Use requestAnimationFrame for batching
  requestAnimationFrame(() => {
    updates.forEach(update => update());
    if (callback) callback();
  });
}

/**
 * Debounced animation frame
 * Ensures updates happen at 60fps
 */
export function rafDebounce<T extends (...args: any[]) => void>(callback: T): T {
  let rafId: number | null = null;

  return ((...args: Parameters<T>) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      callback(...args);
      rafId = null;
    });
  }) as T;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get safe animation duration (respects user preferences)
 */
export function getSafeAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}
