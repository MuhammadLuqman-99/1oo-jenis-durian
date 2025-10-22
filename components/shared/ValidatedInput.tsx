'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
}

export default function ValidatedInput({
  label,
  name,
  error,
  touched,
  required = false,
  helperText,
  icon,
  className = '',
  ...props
}: ValidatedInputProps) {
  const hasError = touched && error;

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          className={`
            w-full px-4 py-2 border rounded-lg transition-colors
            ${icon ? 'pl-10' : ''}
            ${hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
            }
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...props}
        />
      </div>
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
