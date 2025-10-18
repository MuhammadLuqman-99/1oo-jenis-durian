import {
  getSyncQueue,
  removeSyncQueueItem,
  updateSyncQueueItem,
  markRecordAsSynced,
  isOnline,
  SyncQueueItem,
} from "./offlineStorage";
import {
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
} from "./firebaseService";

// Sync Service - Handles automatic synchronization with Firebase
export class SyncService {
  private static instance: SyncService;
  private syncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  private constructor() {
    // Initialize network listeners
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());
    }
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Start automatic sync (every 30 seconds when online)
  startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (isOnline() && !this.syncing) {
        this.syncAll();
      }
    }, 30000); // 30 seconds

    // Initial sync if online
    if (isOnline()) {
      this.syncAll();
    }
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Handle coming online
  private handleOnline(): void {
    console.log("🟢 Network online - starting sync");
    this.notifyListeners({
      status: "online",
      syncing: false,
      pendingCount: 0,
      lastSync: null,
    });
    this.syncAll();
  }

  // Handle going offline
  private handleOffline(): void {
    console.log("🔴 Network offline");
    this.notifyListeners({
      status: "offline",
      syncing: false,
      pendingCount: 0,
      lastSync: null,
    });
  }

  // Sync all pending operations
  async syncAll(): Promise<SyncResult> {
    if (this.syncing) {
      return {
        success: false,
        message: "Sync already in progress",
        synced: 0,
        failed: 0,
      };
    }

    if (!isOnline()) {
      return {
        success: false,
        message: "No internet connection",
        synced: 0,
        failed: 0,
      };
    }

    this.syncing = true;
    this.notifyListeners({
      status: "syncing",
      syncing: true,
      pendingCount: 0,
      lastSync: null,
    });

    const queue = await getSyncQueue();
    let synced = 0;
    let failed = 0;

    console.log(`🔄 Syncing ${queue.length} items...`);

    for (const item of queue) {
      try {
        const success = await this.syncItem(item);
        if (success) {
          await removeSyncQueueItem(item.id);
          if (item.operation !== "delete") {
            await markRecordAsSynced(item.data.id);
          }
          synced++;
          console.log(`✅ Synced: ${item.operation} - ${item.data.id}`);
        } else {
          failed++;
          // Update attempts
          item.attempts++;
          item.error = "Sync failed";
          await updateSyncQueueItem(item);
          console.log(`❌ Failed: ${item.operation} - ${item.data.id}`);
        }
      } catch (error) {
        failed++;
        console.error(`Error syncing item ${item.id}:`, error);

        // Update error info
        item.attempts++;
        item.error = error instanceof Error ? error.message : "Unknown error";
        await updateSyncQueueItem(item);
      }
    }

    this.syncing = false;
    const lastSync = Date.now();

    this.notifyListeners({
      status: "online",
      syncing: false,
      pendingCount: failed,
      lastSync,
    });

    console.log(`✅ Sync complete: ${synced} synced, ${failed} failed`);

    return {
      success: failed === 0,
      message: `Synced ${synced} items${failed > 0 ? `, ${failed} failed` : ""}`,
      synced,
      failed,
    };
  }

  // Sync individual item
  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      switch (item.operation) {
        case "create":
          return await createHealthRecord(item.data);

        case "update":
          return await updateHealthRecord(item.data.id, item.data.updates);

        case "delete":
          return await deleteHealthRecord(item.data.id);

        default:
          console.error(`Unknown operation: ${item.operation}`);
          return false;
      }
    } catch (error) {
      console.error(`Error in syncItem:`, error);
      return false;
    }
  }

  // Force immediate sync
  async forceSyncNow(): Promise<SyncResult> {
    return await this.syncAll();
  }

  // Add listener for sync status updates
  addListener(callback: (status: SyncStatus) => void): void {
    this.listeners.add(callback);
  }

  // Remove listener
  removeListener(callback: (status: SyncStatus) => void): void {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach((callback) => callback(status));
  }

  // Get current sync status
  async getStatus(): Promise<SyncStatus> {
    const queue = await getSyncQueue();
    return {
      status: isOnline() ? "online" : "offline",
      syncing: this.syncing,
      pendingCount: queue.length,
      lastSync: this.getLastSyncTime(),
    };
  }

  // Get last sync time from localStorage
  private getLastSyncTime(): number | null {
    const stored = localStorage.getItem("lastSyncTime");
    return stored ? parseInt(stored) : null;
  }

  // Save last sync time
  private saveLastSyncTime(): void {
    localStorage.setItem("lastSyncTime", Date.now().toString());
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();

// Types
export interface SyncResult {
  success: boolean;
  message: string;
  synced: number;
  failed: number;
}

export interface SyncStatus {
  status: "online" | "offline" | "syncing";
  syncing: boolean;
  pendingCount: number;
  lastSync: number | null;
}
