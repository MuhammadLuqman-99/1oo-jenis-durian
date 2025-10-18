import { TreeHealthRecord } from "@/types/tree";

// Offline Storage Service using IndexedDB and localStorage
// Provides offline-first capability with automatic sync

const DB_NAME = "DurianFarmDB";
const DB_VERSION = 1;
const HEALTH_STORE = "healthRecords";
const SYNC_QUEUE_STORE = "syncQueue";

// Sync queue item interface
export interface SyncQueueItem {
  id: string;
  operation: "create" | "update" | "delete";
  collection: string;
  data: any;
  timestamp: number;
  attempts: number;
  error?: string;
}

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create health records store
      if (!db.objectStoreNames.contains(HEALTH_STORE)) {
        const healthStore = db.createObjectStore(HEALTH_STORE, { keyPath: "id" });
        healthStore.createIndex("treeId", "treeId", { unique: false });
        healthStore.createIndex("inspectionDate", "inspectionDate", { unique: false });
        healthStore.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: "id" });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
        syncStore.createIndex("operation", "operation", { unique: false });
      }
    };
  });
};

// Health Records Operations
export const saveHealthRecordOffline = async (record: TreeHealthRecord): Promise<boolean> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([HEALTH_STORE], "readwrite");
    const store = transaction.objectStore(HEALTH_STORE);

    // Add sync status
    const recordWithSync = {
      ...record,
      syncStatus: "pending",
      lastModified: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(recordWithSync);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue
    await addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      operation: "create",
      collection: "healthRecords",
      data: record,
      timestamp: Date.now(),
      attempts: 0,
    });

    return true;
  } catch (error) {
    console.error("Error saving offline:", error);
    return false;
  }
};

export const getAllHealthRecordsOffline = async (): Promise<TreeHealthRecord[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([HEALTH_STORE], "readonly");
    const store = transaction.objectStore(HEALTH_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting offline records:", error);
    return [];
  }
};

export const updateHealthRecordOffline = async (
  id: string,
  updates: Partial<TreeHealthRecord>
): Promise<boolean> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([HEALTH_STORE], "readwrite");
    const store = transaction.objectStore(HEALTH_STORE);

    // Get existing record
    const existing = await new Promise<any>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!existing) return false;

    // Update record
    const updated = {
      ...existing,
      ...updates,
      syncStatus: "pending",
      lastModified: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(updated);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue
    await addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      operation: "update",
      collection: "healthRecords",
      data: { id, updates },
      timestamp: Date.now(),
      attempts: 0,
    });

    return true;
  } catch (error) {
    console.error("Error updating offline:", error);
    return false;
  }
};

export const deleteHealthRecordOffline = async (id: string): Promise<boolean> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([HEALTH_STORE], "readwrite");
    const store = transaction.objectStore(HEALTH_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue
    await addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      operation: "delete",
      collection: "healthRecords",
      data: { id },
      timestamp: Date.now(),
      attempts: 0,
    });

    return true;
  } catch (error) {
    console.error("Error deleting offline:", error);
    return false;
  }
};

// Sync Queue Operations
export const addToSyncQueue = async (item: SyncQueueItem): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([SYNC_QUEUE_STORE], "readwrite");
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error adding to sync queue:", error);
  }
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([SYNC_QUEUE_STORE], "readonly");
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting sync queue:", error);
    return [];
  }
};

export const removeSyncQueueItem = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([SYNC_QUEUE_STORE], "readwrite");
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error removing sync queue item:", error);
  }
};

export const updateSyncQueueItem = async (item: SyncQueueItem): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([SYNC_QUEUE_STORE], "readwrite");
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error updating sync queue item:", error);
  }
};

export const clearSyncQueue = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([SYNC_QUEUE_STORE], "readwrite");
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error clearing sync queue:", error);
  }
};

// Mark record as synced
export const markRecordAsSynced = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([HEALTH_STORE], "readwrite");
    const store = transaction.objectStore(HEALTH_STORE);

    const record = await new Promise<any>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (record) {
      record.syncStatus = "synced";
      record.lastSynced = Date.now();

      await new Promise<void>((resolve, reject) => {
        const request = store.put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.error("Error marking as synced:", error);
  }
};

// Get pending sync count
export const getPendingSyncCount = async (): Promise<number> => {
  try {
    const queue = await getSyncQueue();
    return queue.length;
  } catch (error) {
    console.error("Error getting pending count:", error);
    return 0;
  }
};

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Network status storage
export const getNetworkStatus = (): {
  isOnline: boolean;
  lastOnline: number | null;
  lastOffline: number | null;
} => {
  const stored = localStorage.getItem("networkStatus");
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    isOnline: navigator.onLine,
    lastOnline: navigator.onLine ? Date.now() : null,
    lastOffline: !navigator.onLine ? Date.now() : null,
  };
};

export const updateNetworkStatus = (online: boolean): void => {
  const status = getNetworkStatus();
  status.isOnline = online;
  if (online) {
    status.lastOnline = Date.now();
  } else {
    status.lastOffline = Date.now();
  }
  localStorage.setItem("networkStatus", JSON.stringify(status));
};
