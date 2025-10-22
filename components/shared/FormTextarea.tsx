'use client';

import { AlertCircle } from 'lucide-react';
import { useId } from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export default function FormTextarea({
  label,
  error,
  required,
  helperText,
  className = '',
  id,
  ...props
}: FormTextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  return (
    <div className="space-y-1">
      <label htmlFor={textareaId} className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500" aria-label="required">*</span>}
      </label>
      <textarea
        id={textareaId}
        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
          error
            ? 'border-red-300 focus:border-red-500 bg-red-50'
            : 'border-gray-200 focus:border-green-500'
        } ${className}`}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...props}
      />
      {error && (
        <div id={errorId} className="flex items-center gap-1 text-red-600 text-sm mt-1" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
