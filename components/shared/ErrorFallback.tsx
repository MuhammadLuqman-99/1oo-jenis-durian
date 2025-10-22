'use client';

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';
import Alert from './Alert';

interface ErrorFallbackProps {
  error?: string | Error;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onReset?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

export default function ErrorFallback({
  error,
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  onRetry,
  onReset,
  showHomeButton = true,
  className = '',
}: ErrorFallbackProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-red-100 rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center">
          <AlertCircle className="text-red-600" size={40} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>

        {errorMessage && (
          <Alert variant="danger" className="text-left">
            {errorMessage}
          </Alert>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          {onRetry && (
            <Button onClick={onRetry} variant="primary" icon={RefreshCw}>
              Try Again
            </Button>
          )}
          {onReset && (
            <Button onClick={onReset} variant="secondary">
              Reset
            </Button>
          )}
          {showHomeButton && (
            <Button
              onClick={() => (window.location.href = '/')}
              variant="ghost"
              icon={Home}
            >
              Go Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface InlineErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ error, onRetry, className = '' }: InlineErrorProps) {
  return (
    <div className={className}>
      <Alert variant="danger" title="Error" onClose={onRetry ? undefined : () => {}}>
        <div className="flex items-center justify-between gap-4">
          <span>{error}</span>
          {onRetry && (
            <Button size="sm" variant="danger" onClick={onRetry} icon={RefreshCw}>
              Retry
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}

interface ErrorMessageProps {
  children: ReactNode;
  className?: string;
}

export function ErrorMessage({ children, className = '' }: ErrorMessageProps) {
  return (
    <div
      className={`flex items-center gap-2 text-red-600 text-sm ${className}`}
      role="alert"
    >
      <AlertCircle size={16} />
      <span>{children}</span>
    </div>
  );
}
