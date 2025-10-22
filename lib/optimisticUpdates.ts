/**
 * Optimistic UI updates for better perceived performance
 * Updates the UI immediately while syncing with the backend
 */

import { TreeInfo, TreeHealthRecord } from '@/types/tree';
import { showSuccess, showError, showLoading, dismissToast } from './toast';

/**
 * Optimistic tree update
 * Updates the tree in the UI immediately, then syncs with server
 */
export async function optimisticTreeUpdate(
  tree: TreeInfo,
  updateFn: (tree: TreeInfo) => Promise<boolean>,
  onSuccess: (tree: TreeInfo) => void,
  onError: () => void
): Promise<boolean> {
  // Show loading toast
  const loadingToastId = showLoading('Updating tree...');

  // Apply optimistic update immediately
  onSuccess(tree);

  try {
    // Sync with server
    const success = await updateFn(tree);

    dismissToast(loadingToastId);

    if (success) {
      showSuccess('Tree updated successfully!');
      return true;
    } else {
      // Rollback on failure
      onError();
      showError('Failed to update tree. Please try again.');
      return false;
    }
  } catch (error) {
    dismissToast(loadingToastId);
    // Rollback on error
    onError();
    showError('Error updating tree. Please check your connection.');
    return false;
  }
}

/**
 * Optimistic health record creation
 */
export async function optimisticHealthRecordCreate(
  record: TreeHealthRecord,
  createFn: (record: TreeHealthRecord) => Promise<boolean>,
  onSuccess: (record: TreeHealthRecord) => void,
  onError: () => void
): Promise<boolean> {
  const loadingToastId = showLoading('Saving health record...');

  // Apply optimistic update
  onSuccess(record);

  try {
    const success = await createFn(record);

    dismissToast(loadingToastId);

    if (success) {
      showSuccess('Health record saved successfully!');
      return true;
    } else {
      onError();
      showError('Failed to save health record.');
      return false;
    }
  } catch (error) {
    dismissToast(loadingToastId);
    onError();
    showError('Error saving health record.');
    return false;
  }
}

/**
 * Optimistic health record update
 */
export async function optimisticHealthRecordUpdate(
  record: TreeHealthRecord,
  updateFn: (id: string, record: TreeHealthRecord) => Promise<boolean>,
  onSuccess: (record: TreeHealthRecord) => void,
  onError: () => void
): Promise<boolean> {
  const loadingToastId = showLoading('Updating health record...');

  // Apply optimistic update
  onSuccess(record);

  try {
    const success = await updateFn(record.id, record);

    dismissToast(loadingToastId);

    if (success) {
      showSuccess('Health record updated successfully!');
      return true;
    } else {
      onError();
      showError('Failed to update health record.');
      return false;
    }
  } catch (error) {
    dismissToast(loadingToastId);
    onError();
    showError('Error updating health record.');
    return false;
  }
}

/**
 * Optimistic delete operation
 */
export async function optimisticDelete<T>(
  item: T,
  deleteFn: () => Promise<boolean>,
  onSuccess: () => void,
  onError: () => void,
  itemName: string = 'item'
): Promise<boolean> {
  const loadingToastId = showLoading(`Deleting ${itemName}...`);

  // Apply optimistic delete (remove from UI)
  onSuccess();

  try {
    const success = await deleteFn();

    dismissToast(loadingToastId);

    if (success) {
      showSuccess(`${itemName.charAt(0).toUpperCase() + itemName.slice(1)} deleted successfully!`);
      return true;
    } else {
      // Restore item on failure
      onError();
      showError(`Failed to delete ${itemName}.`);
      return false;
    }
  } catch (error) {
    dismissToast(loadingToastId);
    onError();
    showError(`Error deleting ${itemName}.`);
    return false;
  }
}

/**
 * Generic optimistic update wrapper
 */
export async function withOptimisticUpdate<T, R>(
  data: T,
  operation: (data: T) => Promise<R>,
  options: {
    onOptimisticUpdate: (data: T) => void;
    onSuccess?: (result: R) => void;
    onError: () => void;
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  }
): Promise<R | null> {
  const {
    onOptimisticUpdate,
    onSuccess,
    onError,
    loadingMessage = 'Processing...',
    successMessage = 'Operation completed successfully!',
    errorMessage = 'Operation failed. Please try again.',
  } = options;

  const loadingToastId = showLoading(loadingMessage);

  // Apply optimistic update
  onOptimisticUpdate(data);

  try {
    const result = await operation(data);

    dismissToast(loadingToastId);

    if (onSuccess) {
      onSuccess(result);
    }

    showSuccess(successMessage);
    return result;
  } catch (error) {
    dismissToast(loadingToastId);
    onError();
    showError(errorMessage);
    return null;
  }
}

/**
 * Batch optimistic updates
 * Useful for bulk operations
 */
export async function batchOptimisticUpdates<T>(
  items: T[],
  operation: (item: T) => Promise<boolean>,
  options: {
    onItemSuccess: (item: T, index: number) => void;
    onItemError: (item: T, index: number) => void;
    itemName?: string;
  }
): Promise<{ succeeded: number; failed: number }> {
  const { onItemSuccess, onItemError, itemName = 'item' } = options;

  const loadingToastId = showLoading(`Processing ${items.length} ${itemName}s...`);

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    try {
      const success = await operation(item);

      if (success) {
        onItemSuccess(item, i);
        succeeded++;
      } else {
        onItemError(item, i);
        failed++;
      }
    } catch (error) {
      onItemError(item, i);
      failed++;
    }
  }

  dismissToast(loadingToastId);

  if (failed === 0) {
    showSuccess(`All ${items.length} ${itemName}s processed successfully!`);
  } else if (succeeded === 0) {
    showError(`Failed to process ${itemName}s.`);
  } else {
    showSuccess(`Processed ${succeeded} ${itemName}s successfully. ${failed} failed.`);
  }

  return { succeeded, failed };
}
