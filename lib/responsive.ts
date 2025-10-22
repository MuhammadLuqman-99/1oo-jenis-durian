/**
 * Responsive utility functions and helpers
 */

/**
 * Touch target size constants (minimum 44x44px for accessibility)
 */
export const TOUCH_TARGET = {
  MIN: '44px',
  COMFORTABLE: '48px',
  LARGE: '56px',
} as const;

/**
 * Breakpoint values matching Tailwind defaults
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Check if current viewport is mobile
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Check if current viewport is tablet
 */
export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if current viewport is desktop
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Get responsive class names based on screen size
 */
export function getResponsiveClasses(mobile: string, tablet?: string, desktop?: string): string {
  const classes = [mobile];
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
}

/**
 * Touch-friendly spacing
 */
export const SPACING = {
  touch: '12px', // Minimum spacing between touch targets
  comfortable: '16px',
  generous: '24px',
} as const;

/**
 * Font sizes for readability on mobile
 */
export const FONT_SIZES = {
  mobile: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
  },
  desktop: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
  },
} as const;

/**
 * Helper to get touch-friendly button classes
 */
export function getTouchButtonClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizeClasses = {
    sm: 'min-h-[44px] px-4 py-2 text-sm',
    md: 'min-h-[48px] px-6 py-3 text-base',
    lg: 'min-h-[56px] px-8 py-4 text-lg',
  };

  return `${sizeClasses[size]} active:scale-95 transition-transform`;
}

/**
 * Helper for mobile-optimized padding
 */
export function getMobilePadding(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const paddingClasses = {
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  return paddingClasses[size];
}

/**
 * Helper for mobile-friendly grid
 */
export function getResponsiveGrid(columns: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}): string {
  const { mobile = 1, tablet = 2, desktop = 3 } = columns;

  return `grid grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get container max width for responsive layouts
 */
export function getContainerClasses(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'xl'): string {
  const containerClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };

  return `${containerClasses[size]} mx-auto px-4 md:px-6 lg:px-8`;
}

/**
 * Mobile-optimized modal/dialog classes
 */
export function getMobileModalClasses(): string {
  return 'fixed inset-0 md:inset-4 md:my-auto md:max-h-[90vh] rounded-t-xl md:rounded-xl';
}

/**
 * Stack items vertically on mobile, horizontally on desktop
 */
export function getStackClasses(gap: 'sm' | 'md' | 'lg' = 'md'): string {
  const gapSizes = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4',
    lg: 'gap-4 md:gap-6',
  };

  return `flex flex-col md:flex-row ${gapSizes[gap]}`;
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaClasses(): string {
  return 'pb-safe pt-safe pl-safe pr-safe';
}
