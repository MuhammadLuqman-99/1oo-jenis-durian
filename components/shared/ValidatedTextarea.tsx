'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export default function ValidatedTextarea({
  label,
  name,
  error,
  touched,
  required = false,
  helperText,
  showCharCount = false,
  maxLength,
  className = '',
  value,
  ...props
}: ValidatedTextareaProps) {
  const hasError = touched && error;
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showCharCount && maxLength && (
          <span className={`text-xs ${charCount > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
            {charCount} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        id={name}
        name={name}
        value={value}
        maxLength={maxLength}
        className={`
          w-full px-4 py-2 border rounded-lg transition-colors resize-none
          ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
          }
          focus:outline-none focus:ring-2
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        {...props}
      />
      {hasError && (
        <div id={`${name}-error`} className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle size={14} className="mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {helperText && !hasError && (
        <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
