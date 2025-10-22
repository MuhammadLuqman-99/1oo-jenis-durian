import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Provides consistent toast notifications throughout the application
 */

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * Show a success toast notification
 * @param message - The message to display
 * @param options - Optional configuration
 */
export function showSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, {
    duration: options?.duration,
    position: options?.position,
  });
}

/**
 * Show an error toast notification
 * @param message - The error message to display
 * @param options - Optional configuration
 */
export function showError(message: string, options?: ToastOptions) {
  return toast.error(message, {
    duration: options?.duration,
    position: options?.position,
  });
}

/**
 * Show a loading toast notification
 * @param message - The loading message to display
 * @param options - Optional configuration
 * @returns Toast ID that can be used to dismiss the toast
 */
export function showLoading(message: string, options?: ToastOptions) {
  return toast.loading(message, {
    duration: options?.duration,
    position: options?.position,
  });
}

/**
 * Show an info toast notification (custom)
 * @param message - The info message to display
 * @param options - Optional configuration
 */
export function showInfo(message: string, options?: ToastOptions) {
  return toast(message, {
    duration: options?.duration,
    position: options?.position,
    icon: 'ℹ️',
    style: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: '#fff',
    },
  });
}

/**
 * Show a warning toast notification (custom)
 * @param message - The warning message to display
 * @param options - Optional configuration
 */
export function showWarning(message: string, options?: ToastOptions) {
  return toast(message, {
    duration: options?.duration,
    position: options?.position,
    icon: '⚠️',
    style: {
      background: 'linear-gradient(to right, #f59e0b, #d97706)',
      color: '#fff',
    },
  });
}

/**
 * Dismiss a specific toast by ID
 * @param toastId - The ID of the toast to dismiss
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}

/**
 * Dismiss all active toasts
 */
export function dismissAllToasts() {
  toast.dismiss();
}

/**
 * Show a promise toast that automatically updates based on promise state
 * @param promise - The promise to track
 * @param messages - Messages for loading, success, and error states
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
) {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      duration: options?.duration,
      position: options?.position,
    }
  );
}

/**
 * Show a custom toast with custom JSX content
 * @param content - React component or JSX to display
 * @param options - Optional configuration
 */
export function showCustom(content: React.ReactNode, options?: ToastOptions) {
  return toast.custom(content, {
    duration: options?.duration,
    position: options?.position,
  });
}

// Export the raw toast object for advanced usage
export { toast };

// Re-export common patterns
export const toastUtils = {
  success: showSuccess,
  error: showError,
  loading: showLoading,
  info: showInfo,
  warning: showWarning,
  promise: showPromise,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  custom: showCustom,
};
