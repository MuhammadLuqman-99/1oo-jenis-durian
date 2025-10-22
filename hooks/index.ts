/**
 * Barrel export for all custom hooks
 * Import hooks using: import { useForm, useToggle } from '@/hooks';
 */

export { useForm } from './useForm';
export type { UseFormOptions } from './useForm';

export { useLocalStorage } from './useLocalStorage';

export { useDebounce, useDebouncedCallback } from './useDebounce';

export { useAsync, useAsyncSimple } from './useAsync';
export type { UseAsyncOptions, UseAsyncReturn } from './useAsync';

export { useToggle } from './useToggle';

export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsDarkMode,
  useReducedMotion,
} from './useMediaQuery';

export { useFormValidation } from './useFormValidation';
