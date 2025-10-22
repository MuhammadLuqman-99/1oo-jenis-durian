import { useState, useEffect, useCallback } from 'react';
import { Result } from '@/types/result';

export interface UseAsyncOptions {
  immediate?: boolean; // Execute immediately on mount
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for handling async operations with loading, error, and data states
 * Works with Result<T> type for consistent error handling
 */
export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<Result<T>>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { immediate = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);

        if (result.success) {
          setData(result.data);
          setError(null);
          if (onSuccess) {
            onSuccess(result.data);
          }
        } else {
          setData(null);
          setError(result.error);
          if (onError) {
            onError(result.error);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setData(null);
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { data, error, loading, execute, reset };
}

/**
 * Simplified hook for async operations without Result type
 */
export function useAsyncSimple<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { immediate = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);
        setError(null);
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setData(null);
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { data, error, loading, execute, reset };
}
