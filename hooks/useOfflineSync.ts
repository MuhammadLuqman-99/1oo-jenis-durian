import { useState, useEffect, useCallback } from "react";
import { syncService, SyncStatus } from "@/lib/syncService";
import { getPendingSyncCount, isOnline } from "@/lib/offlineStorage";

// Custom hook for offline sync functionality
export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: "online",
    syncing: false,
    pendingCount: 0,
    lastSync: null,
  });

  const [isOffline, setIsOffline] = useState(!isOnline());

  useEffect(() => {
    // Initialize sync service
    syncService.startAutoSync();

    // Get initial status
    const updateStatus = async () => {
      const status = await syncService.getStatus();
      setSyncStatus(status);
      setIsOffline(status.status === "offline");
    };

    updateStatus();

    // Add sync status listener
    const handleStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
      setIsOffline(status.status === "offline");
    };

    syncService.addListener(handleStatusChange);

    // Online/offline listeners
    const handleOnline = () => {
      setIsOffline(false);
      updateStatus();
    };

    const handleOffline = () => {
      setIsOffline(true);
      updateStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Update pending count periodically
    const interval = setInterval(async () => {
      const count = await getPendingSyncCount();
      setSyncStatus((prev) => ({ ...prev, pendingCount: count }));
    }, 5000); // Every 5 seconds

    // Cleanup
    return () => {
      syncService.removeListener(handleStatusChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Force sync now
  const forceSyncNow = useCallback(async () => {
    const result = await syncService.forceSyncNow();
    return result;
  }, []);

  // Get formatted last sync time
  const getLastSyncText = useCallback(() => {
    if (!syncStatus.lastSync) return "Never";

    const now = Date.now();
    const diff = now - syncStatus.lastSync;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }, [syncStatus.lastSync]);

  // Get status color
  const getStatusColor = useCallback(() => {
    if (isOffline) return "red";
    if (syncStatus.syncing) return "yellow";
    if (syncStatus.pendingCount > 0) return "orange";
    return "green";
  }, [isOffline, syncStatus.syncing, syncStatus.pendingCount]);

  // Get status text
  const getStatusText = useCallback(() => {
    if (isOffline) return "Offline";
    if (syncStatus.syncing) return "Syncing...";
    if (syncStatus.pendingCount > 0) return `${syncStatus.pendingCount} pending`;
    return "Synced";
  }, [isOffline, syncStatus.syncing, syncStatus.pendingCount]);

  return {
    // Status
    syncStatus,
    isOffline,
    isSyncing: syncStatus.syncing,
    pendingCount: syncStatus.pendingCount,
    lastSync: syncStatus.lastSync,

    // Actions
    forceSyncNow,

    // Helpers
    getLastSyncText,
    getStatusColor,
    getStatusText,
  };
};
