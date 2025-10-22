'use client';

import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  schema?: ZodSchema
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name as string]: true }));

    // Validate single field on blur if schema is provided
    if (schema) {
      try {
        schema.parse(values);
        // Clear error for this field if validation passes
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name as string];
          return newErrors;
        });
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.errors.find((err) =>
            err.path.join('.') === String(name)
          );
          if (fieldError) {
            setErrors((prev) => ({
              ...prev,
              [name as string]: fieldError.message
            }));
          }
        }
      }
    }
  }, [schema, values]);

  const validate = useCallback((validationSchema?: ZodSchema): boolean => {
    const schemaToUse = validationSchema || schema;
    if (!schemaToUse) {
      console.warn('No schema provided for validation');
      return true;
    }

    setIsValidating(true);
    try {
      schemaToUse.parse(values);
      setErrors({});
      setIsValidating(false);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      setIsValidating(false);
      return false;
    }
  }, [schema, values]);

  const validateField = useCallback((name: keyof T, validationSchema?: ZodSchema): boolean => {
    const schemaToUse = validationSchema || schema;
    if (!schemaToUse) return true;

    try {
      schemaToUse.parse(values);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.errors.find((err) =>
          err.path.join('.') === String(name)
        );
        if (fieldError) {
          setErrors((prev) => ({
            ...prev,
            [name as string]: fieldError.message
          }));
          return false;
        }
      }
      return true;
    }
  }, [schema, values]);

  const reset = useCallback((newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) =>
      async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        // Mark all fields as touched
        const allTouched: Record<string, boolean> = {};
        Object.keys(values).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);

        // Validate before submit
        const isValid = validate();
        if (!isValid) {
          return;
        }

        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      },
    [values, validate]
  );

  const getFieldError = useCallback((name: keyof T): string | undefined => {
    return touched[name as string] ? errors[name as string] : undefined;
  }, [errors, touched]);

  const hasError = useCallback((name: keyof T): boolean => {
    return touched[name as string] && !!errors[name as string];
  }, [errors, touched]);

  return {
    values,
    errors,
    touched,
    isValidating,
    isSubmitting,
    handleChange,
    handleBlur,
    validate,
    validateField,
    reset,
    handleSubmit,
    getFieldError,
    hasError,
    setValues,
    setErrors,
    setTouched,
  };
}
