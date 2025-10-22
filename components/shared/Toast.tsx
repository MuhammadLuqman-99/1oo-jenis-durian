'use client';

import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { toast as hotToast } from 'react-hot-toast';

interface CustomToastProps {
  message: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  toastId: string;
  onDismiss?: () => void;
}

export default function CustomToast({
  message,
  description,
  type,
  toastId,
  onDismiss,
}: CustomToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-orange-50 border-orange-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const handleDismiss = () => {
    hotToast.dismiss(toastId);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      className={`${bgColors[type]} border rounded-lg p-4 shadow-lg max-w-md w-full animate-in slide-in-from-top-5 fade-in duration-300`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5">{icons[type]}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{message}</p>
          {description && (
            <p className="text-sm text-gray-700 mt-1">{description}</p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

// Helper functions to show custom toasts
export function showCustomSuccess(message: string, description?: string) {
  const id = hotToast.custom(
    (t) => (
      <CustomToast
        message={message}
        description={description}
        type="success"
        toastId={t.id}
      />
    ),
    { duration: 4000 }
  );
  return id;
}

export function showCustomError(message: string, description?: string) {
  const id = hotToast.custom(
    (t) => (
      <CustomToast
        message={message}
        description={description}
        type="error"
        toastId={t.id}
      />
    ),
    { duration: 5000 }
  );
  return id;
}

export function showCustomWarning(message: string, description?: string) {
  const id = hotToast.custom(
    (t) => (
      <CustomToast
        message={message}
        description={description}
        type="warning"
        toastId={t.id}
      />
    ),
    { duration: 4500 }
  );
  return id;
}

export function showCustomInfo(message: string, description?: string) {
  const id = hotToast.custom(
    (t) => (
      <CustomToast
        message={message}
        description={description}
        type="info"
        toastId={t.id}
      />
    ),
    { duration: 4000 }
  );
  return id;
}
