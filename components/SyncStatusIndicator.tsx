"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { RefreshCw, Wifi, WifiOff, Cloud, CloudOff } from "lucide-react";

export const SyncStatusIndicator = () => {
  const {
    isOffline,
    isSyncing,
    pendingCount,
    getLastSyncText,
    getStatusColor,
    getStatusText,
    forceSyncNow,
  } = useOfflineSync();

  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const lastSyncText = getLastSyncText();

  const colorClasses = {
    red: "bg-red-500 border-red-600",
    yellow: "bg-yellow-500 border-yellow-600",
    orange: "bg-orange-500 border-orange-600",
    green: "bg-green-500 border-green-600",
  };

  const bgColorClasses = {
    red: "bg-red-50 border-red-200",
    yellow: "bg-yellow-50 border-yellow-200",
    orange: "bg-orange-50 border-orange-200",
    green: "bg-green-50 border-green-200",
  };

  const textColorClasses = {
    red: "text-red-700",
    yellow: "text-yellow-700",
    orange: "text-orange-700",
    green: "text-green-700",
  };

  return (
    <div
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${
        bgColorClasses[statusColor]
      }`}
    >
      {/* Status Icon */}
      <div className="flex items-center space-x-2">
        {isOffline ? (
          <CloudOff className={textColorClasses[statusColor]} size={20} />
        ) : (
          <Cloud className={textColorClasses[statusColor]} size={20} />
        )}
        <div
          className={`w-2 h-2 rounded-full ${colorClasses[statusColor]} animate-pulse`}
        ></div>
      </div>

      {/* Status Text */}
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${textColorClasses[statusColor]}`}>
          {statusText}
        </span>
        {!isOffline && (
          <span className="text-xs text-gray-500">
            Last sync: {lastSyncText}
          </span>
        )}
      </div>

      {/* Pending Count Badge */}
      {pendingCount > 0 && (
        <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full">
          <span className="text-xs font-bold text-orange-700">
            {pendingCount}
          </span>
          <span className="text-xs text-orange-600">pending</span>
        </div>
      )}

      {/* Manual Sync Button */}
      <button
        onClick={forceSyncNow}
        disabled={isOffline || isSyncing}
        className={`p-2 rounded-lg transition-all ${
          isOffline || isSyncing
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-sm"
        }`}
        title={isOffline ? "No internet connection" : "Force sync now"}
      >
        <RefreshCw
          size={16}
          className={isSyncing ? "animate-spin" : ""}
        />
      </button>
    </div>
  );
};
