'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TreeInfo, TreeHealthRecord, FarmActivity } from '@/types/tree';
import { Result, isSuccess } from '@/types/result';
import {
  getAllTrees,
  updateTree as updateTreeInFirebase,
  initializeTreesInFirebase,
  getAllHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord
} from '@/lib/firebaseService';
import {
  saveHealthRecordOffline,
  getAllHealthRecordsOffline,
  updateHealthRecordOffline,
  deleteHealthRecordOffline,
  isOnline,
} from '@/lib/offlineStorage';
import { treesData as initialTreesData, farmActivities as initialActivities } from '@/data/trees';

interface AdminContextType {
  // Data
  trees: TreeInfo[];
  healthRecords: TreeHealthRecord[];
  activities: FarmActivity[];

  // Loading states
  loading: boolean;
  loadingTrees: boolean;
  loadingHealthRecords: boolean;
  submitting: boolean;

  // Error states
  error: string | null;
  treesError: string | null;
  healthRecordsError: string | null;

  // Auth
  isAuthenticated: boolean;
  adminUser: string | null;

  // Actions
  loadTrees: () => Promise<void>;
  loadHealthRecords: () => Promise<void>;
  updateTree: (id: string, data: Partial<TreeInfo>) => Promise<boolean>;
  saveHealthRecord: (record: Partial<TreeHealthRecord>, editingId?: string) => Promise<boolean>;
  removeHealthRecord: (id: string) => Promise<boolean>;
  clearError: () => void;

  // Setters (for backward compatibility)
  setTrees: (trees: TreeInfo[]) => void;
  setHealthRecords: (records: TreeHealthRecord[]) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [trees, setTrees] = useState<TreeInfo[]>(initialTreesData);
  const [healthRecords, setHealthRecords] = useState<TreeHealthRecord[]>([]);
  const [activities, setActivities] = useState<FarmActivity[]>(initialActivities);
  const [loading, setLoading] = useState(true);
  const [loadingTrees, setLoadingTrees] = useState(false);
  const [loadingHealthRecords, setLoadingHealthRecords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treesError, setTreesError] = useState<string | null>(null);
  const [healthRecordsError, setHealthRecordsError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const user = localStorage.getItem("adminUser");

    if (loggedIn === "true") {
      setIsAuthenticated(true);
      setAdminUser(user);
    }

    setLoading(false);
  }, []);

  // Load trees from Firebase
  const loadTrees = async () => {
    setLoadingTrees(true);
    setTreesError(null);

    try {
      const result = await getAllTrees();

      if (isSuccess(result)) {
        if (result.data.length > 0) {
          setTrees(result.data);
        } else {
          // Initialize Firebase with default data on first run
          const initResult = await initializeTreesInFirebase(initialTreesData);
          if (isSuccess(initResult)) {
            setTrees(initialTreesData);
          } else {
            setTreesError(initResult.error);
          }
        }
      } else {
        console.error("Error loading trees:", result.error);
        setTreesError(result.error);
        // Fallback to local data if Firebase fails
        setTrees(initialTreesData);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load trees';
      setTreesError(errorMsg);
      setTrees(initialTreesData);
    } finally {
      setLoadingTrees(false);
    }
  };

  // Load health records (offline-first)
  const loadHealthRecords = async () => {
    setLoadingHealthRecords(true);
    setHealthRecordsError(null);

    try {
      const online = isOnline();

      if (online) {
        // Try Firebase first when online
        const result = await getAllHealthRecords();
        if (isSuccess(result)) {
          setHealthRecords(result.data);
        } else {
          console.error("Error loading from Firebase:", result.error);
          setHealthRecordsError(result.error);
          // Fallback to offline
          const offlineRecords = await getAllHealthRecordsOffline();
          setHealthRecords(offlineRecords);
        }
      } else {
        // Load from IndexedDB when offline
        const offlineRecords = await getAllHealthRecordsOffline();
        setHealthRecords(offlineRecords);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load health records';
      setHealthRecordsError(errorMsg);
    } finally {
      setLoadingHealthRecords(false);
    }
  };

  // Update tree
  const updateTree = async (id: string, data: Partial<TreeInfo>): Promise<boolean> => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await updateTreeInFirebase(id, data);

      if (isSuccess(result)) {
        await loadTrees();
        return true;
      } else {
        console.error("Error updating tree:", result.error);
        setError(result.error);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update tree';
      setError(errorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Save health record (offline-first)
  const saveHealthRecord = async (record: Partial<TreeHealthRecord>, editingId?: string): Promise<boolean> => {
    setSubmitting(true);
    setError(null);

    try {
      if (!record.treeId || !record.healthStatus || !record.inspectionDate) {
        throw new Error("Missing required fields");
      }

      const newRecord: TreeHealthRecord = {
        id: editingId || `health-${Date.now()}`,
        treeId: record.treeId,
        treeNo: record.treeNo || '',
        variety: record.variety || '',
        location: record.location || '',
        zone: record.zone || '',
        row: record.row || '',
        inspectionDate: record.inspectionDate,
        healthStatus: record.healthStatus,
        diseaseType: record.diseaseType || '',
        attackLevel: record.attackLevel,
        treatment: record.treatment || '',
        notes: record.notes || '',
        photos: record.photos || [],
        inspectedBy: record.inspectedBy || '',
        createdAt: editingId ? record.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Offline-first approach: Always save locally first
      let success: boolean;
      if (editingId) {
        success = await updateHealthRecordOffline(editingId, newRecord);
      } else {
        success = await saveHealthRecordOffline(newRecord);
      }

      if (success) {
        await loadHealthRecords();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error saving health record:", error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to save health record';
      setError(errorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete health record
  const removeHealthRecord = async (id: string): Promise<boolean> => {
    setSubmitting(true);
    setError(null);

    try {
      const success = await deleteHealthRecordOffline(id);

      if (success) {
        await loadHealthRecords();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting health record:", error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete health record';
      setError(errorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
    setTreesError(null);
    setHealthRecordsError(null);
  };

  const value: AdminContextType = {
    trees,
    healthRecords,
    activities,
    loading,
    loadingTrees,
    loadingHealthRecords,
    submitting,
    error,
    treesError,
    healthRecordsError,
    isAuthenticated,
    adminUser,
    loadTrees,
    loadHealthRecords,
    updateTree,
    saveHealthRecord,
    removeHealthRecord,
    clearError,
    setTrees,
    setHealthRecords,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
