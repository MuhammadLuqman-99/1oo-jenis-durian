/**
 * Result type for consistent error handling
 *
 * Success case: { success: true, data: T }
 * Error case: { success: false, error: string }
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper to create success result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper to create error result
 */
export function error<T>(message: string): Result<T> {
  return { success: false, error: message };
}

/**
 * Helper to handle async operations with Result type
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<Result<T>> {
  try {
    const data = await fn();
    return success(data);
  } catch (err) {
    const message = errorMessage || (err instanceof Error ? err.message : 'An error occurred');
    return error(message);
  }
}

/**
 * Type guard to check if result is success
 */
export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if result is error
 */
export function isError<T>(result: Result<T>): result is { success: false; error: string } {
  return result.success === false;
}
