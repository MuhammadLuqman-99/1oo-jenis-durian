'use client';

import { useState } from 'react';
import { TreeInfo, TreeHealthRecord } from '@/types/tree';
import {
  optimisticTreeUpdate,
  optimisticHealthRecordCreate,
  optimisticDelete,
  withOptimisticUpdate
} from '@/lib/optimisticUpdates';
import { Button } from '@/components/shared';
import { Edit, Trash2, Plus } from 'lucide-react';

/**
 * Example component demonstrating optimistic UI updates
 * This shows best practices for implementing progressive enhancement
 */

interface OptimisticExampleProps {
  trees: TreeInfo[];
  healthRecords: TreeHealthRecord[];
  onTreeUpdate: (tree: TreeInfo) => Promise<boolean>;
  onHealthRecordCreate: (record: TreeHealthRecord) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function OptimisticUpdatesExample({
  trees,
  healthRecords,
  onTreeUpdate,
  onHealthRecordCreate,
  onDelete,
}: OptimisticExampleProps) {
  const [localTrees, setLocalTrees] = useState<TreeInfo[]>(trees);
  const [localRecords, setLocalRecords] = useState<TreeHealthRecord[]>(healthRecords);

  // Example 1: Optimistic tree update
  const handleUpdateTree = async (tree: TreeInfo) => {
    const previousTrees = [...localTrees];

    await optimisticTreeUpdate(
      tree,
      onTreeUpdate,
      // Optimistic update - immediately update UI
      (updatedTree) => {
        setLocalTrees(prev =>
          prev.map(t => (t.id === updatedTree.id ? updatedTree : t))
        );
      },
      // Rollback on error - restore previous state
      () => {
        setLocalTrees(previousTrees);
      }
    );
  };

  // Example 2: Optimistic create
  const handleCreateRecord = async (record: TreeHealthRecord) => {
    const previousRecords = [...localRecords];

    await optimisticHealthRecordCreate(
      record,
      onHealthRecordCreate,
      // Optimistic update - immediately add to UI
      (newRecord) => {
        setLocalRecords(prev => [newRecord, ...prev]);
      },
      // Rollback on error
      () => {
        setLocalRecords(previousRecords);
      }
    );
  };

  // Example 3: Optimistic delete
  const handleDelete = async (id: string) => {
    const previousRecords = [...localRecords];
    const itemToDelete = localRecords.find(r => r.id === id);

    if (!itemToDelete) return;

    await optimisticDelete(
      itemToDelete,
      () => onDelete(id),
      // Optimistic update - immediately remove from UI
      () => {
        setLocalRecords(prev => prev.filter(r => r.id !== id));
      },
      // Rollback on error - restore item
      () => {
        setLocalRecords(previousRecords);
      },
      'health record'
    );
  };

  // Example 4: Generic optimistic update with custom logic
  const handleBulkUpdate = async (updates: Partial<TreeInfo>[]) => {
    const previousTrees = [...localTrees];

    await withOptimisticUpdate(
      updates,
      async (data) => {
        // Simulate batch update
        const results = await Promise.all(
          data.map(update => {
            const tree = localTrees.find(t => t.id === update.id);
            if (!tree) return Promise.resolve(false);
            return onTreeUpdate({ ...tree, ...update });
          })
        );
        return results.every(r => r);
      },
      {
        onOptimisticUpdate: (data) => {
          // Apply all updates immediately
          setLocalTrees(prev =>
            prev.map(tree => {
              const update = data.find(u => u.id === tree.id);
              return update ? { ...tree, ...update } : tree;
            })
          );
        },
        onSuccess: () => {
          console.log('Bulk update completed');
        },
        onError: () => {
          // Rollback all changes
          setLocalTrees(previousTrees);
        },
        loadingMessage: 'Updating trees...',
        successMessage: 'All trees updated successfully!',
        errorMessage: 'Failed to update trees. Changes reverted.',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Optimistic Updates Example</h2>
        <p className="text-gray-600 mb-6">
          This component demonstrates how to implement optimistic updates for better
          perceived performance. Changes appear instantly in the UI while syncing
          with the server in the background.
        </p>

        <div className="space-y-4">
          {/* Trees list with optimistic updates */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Trees (Optimistic Updates)</h3>
            <div className="space-y-2">
              {localTrees.map((tree) => (
                <div
                  key={tree.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-smooth hover:bg-gray-100"
                >
                  <div>
                    <p className="font-semibold">{tree.variety}</p>
                    <p className="text-sm text-gray-600">Age: {tree.treeAge} years</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Edit}
                    onClick={() =>
                      handleUpdateTree({
                        ...tree,
                        treeAge: (parseInt(tree.treeAge) + 1).toString(),
                      })
                    }
                  >
                    Increment Age
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Health records with optimistic create/delete */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Health Records (Optimistic Create/Delete)
            </h3>
            <Button
              variant="success"
              icon={Plus}
              onClick={() =>
                handleCreateRecord({
                  id: `temp-${Date.now()}`,
                  treeId: localTrees[0]?.id || '',
                  treeNo: localTrees[0]?.treeNo || '',
                  variety: localTrees[0]?.variety || '',
                  location: localTrees[0]?.location || '',
                  zone: localTrees[0]?.zone || '',
                  row: localTrees[0]?.row || '',
                  inspectionDate: new Date().toISOString().split('T')[0],
                  healthStatus: 'Sihat',
                  diseaseType: 'Tiada',
                  attackLevel: '',
                  treatment: 'Regular monitoring',
                  notes: 'Optimistically created record',
                  photos: [],
                  inspectedBy: 'System',
                  updatedAt: new Date().toISOString(),
                })
              }
              className="mb-4"
            >
              Add Health Record (Optimistic)
            </Button>

            <div className="space-y-2">
              {localRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-bottom-5 duration-300"
                >
                  <div>
                    <p className="font-semibold">Tree: {record.treeNo}</p>
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(record.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          How Optimistic Updates Work
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>✅ UI updates immediately when you click a button</li>
          <li>⏳ Request is sent to server in the background</li>
          <li>✅ On success: Changes are persisted</li>
          <li>↩️ On error: Changes are rolled back and user is notified</li>
          <li>🎯 Result: Feels instant even on slow connections</li>
        </ul>
      </div>
    </div>
  );
}
