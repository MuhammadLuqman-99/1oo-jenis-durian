'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Handle online event
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);

      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration: any) => {
          registration.sync.register('sync-health-records');
          registration.sync.register('sync-tree-updates');
        });
      }

      // Hide notification after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    };

    // Handle offline event
    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending sync items
    const checkPendingSync = () => {
      // This would check IndexedDB for pending items
      // For now, just a placeholder
      const pending = 0; // Get from IndexedDB
      setPendingSyncCount(pending);
    };

    checkPendingSync();
    const interval = setInterval(checkPendingSync, 30000); // Check every 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) return;

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in (registration as any)) {
          await (registration as any).sync.register('sync-health-records');
          await (registration as any).sync.register('sync-tree-updates');
        }
      } catch (error) {
        console.error('Manual sync failed:', error);
      }
    }
  };

  return (
    <>
      {/* Status Bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        !isOnline ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="bg-yellow-500 text-yellow-900 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff size={16} />
            <span className="text-sm font-medium">You're offline</span>
          </div>
          <span className="text-xs">
            {pendingSyncCount > 0 && `${pendingSyncCount} pending sync`}
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className={`fixed top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 transition-all duration-300 ${
          showNotification ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          <div className={`rounded-xl shadow-2xl p-4 ${
            isOnline
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isOnline ? 'bg-white/20' : 'bg-white/20'
              }`}>
                {isOnline ? (
                  <Wifi size={20} className="text-white" />
                ) : (
                  <WifiOff size={20} className="text-white" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">
                  {isOnline ? 'Back Online!' : 'You\'re Offline'}
                </h4>
                <p className="text-white/90 text-sm">
                  {isOnline
                    ? 'Your data will now sync automatically'
                    : 'Don\'t worry, you can still work. Data will sync when back online.'}
                </p>
                {isOnline && pendingSyncCount > 0 && (
                  <button
                    onClick={handleManualSync}
                    className="mt-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <RefreshCw size={14} />
                    <span>Sync Now ({pendingSyncCount})</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-white/80 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Indicator (bottom right) */}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 z-30">
          <div className="bg-yellow-500 text-yellow-900 rounded-full px-4 py-2 shadow-lg flex items-center space-x-2">
            <CloudOff size={16} />
            <span className="text-sm font-medium">Offline Mode</span>
            {pendingSyncCount > 0 && (
              <span className="bg-yellow-700 text-yellow-100 text-xs px-2 py-0.5 rounded-full">
                {pendingSyncCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Syncing Indicator */}
      {isOnline && pendingSyncCount > 0 && (
        <div className="fixed bottom-4 right-4 z-30">
          <div className="bg-blue-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center space-x-2">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm font-medium">Syncing {pendingSyncCount} items...</span>
          </div>
        </div>
      )}
    </>
  );
}
