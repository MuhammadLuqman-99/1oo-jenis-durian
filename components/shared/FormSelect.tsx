'use client';

import { AlertCircle } from 'lucide-react';
import { useId } from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  options: { value: string; label: string }[];
}

export default function FormSelect({
  label,
  error,
  required,
  helperText,
  options,
  className = '',
  id,
  ...props
}: FormSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500" aria-label="required">*</span>}
      </label>
      <select
        id={selectId}
        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
          error
            ? 'border-red-300 focus:border-red-500 bg-red-50'
            : 'border-gray-200 focus:border-green-500'
        } ${className}`}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
