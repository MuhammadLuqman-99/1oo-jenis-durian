'use client';

import { ReactNode } from 'react';
import Button from './Button';
import { LucideIcon } from 'lucide-react';

interface MobileFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitIcon?: LucideIcon;
  className?: string;
  stickyFooter?: boolean;
}

export default function MobileForm({
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  submitIcon,
  className = '',
  stickyFooter = true,
}: MobileFormProps) {
  return (
    <form onSubmit={onSubmit} className={`flex flex-col h-full ${className}`}>
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
        {children}
      </div>

      {/* Form Actions */}
      <div
        className={`border-t border-gray-200 bg-white p-4 md:p-6 ${
          stickyFooter ? 'sticky bottom-0' : ''
        }`}
      >
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="min-h-[48px] w-full sm:w-auto"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            icon={submitIcon}
            isLoading={isSubmitting}
            className="min-h-[48px] w-full sm:w-auto"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

interface MobileFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function MobileFormSection({
  title,
  description,
  children,
  className = '',
}: MobileFormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface MobileFormGroupProps {
  children: ReactNode;
  columns?: 1 | 2;
  className?: string;
}

export function MobileFormGroup({
  children,
  columns = 1,
  className = '',
}: MobileFormGroupProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface MobileFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
}

export function MobileFormField({
  label,
  required,
  error,
  helperText,
  children,
  className = '',
}: MobileFormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-base font-semibold text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
