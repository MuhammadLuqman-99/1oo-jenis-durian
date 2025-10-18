# Offline Mode & Auto-Sync Guide 🔄

## Overview

The durian farm management system now includes **offline-first functionality** with automatic synchronization. This allows farmers to work in areas with poor or no internet connectivity, with all data automatically syncing when the connection returns.

---

## Key Features

### 1. **Offline-First Storage** 💾
- All health records are saved locally first using **IndexedDB**
- Works even when completely offline
- No data loss if connection drops during save

### 2. **Automatic Sync** 🔄
- Auto-syncs every **30 seconds** when online
- Syncs immediately when coming back online
- Queue system ensures all operations are synced

### 3. **Sync Status Indicator** 🚦
- Real-time status display showing:
  - **Green**: Online & synced
  - **Yellow**: Syncing in progress
  - **Orange**: Pending items to sync
  - **Red**: Offline mode
- Shows pending operation count
- Displays last sync time
- Manual sync button available

### 4. **Photo Support** 📸
- Photos stored offline as base64
- Automatically synced with health records
- No size limitations (uses browser storage)

---

## How It Works

### When Online ✅
1. User saves health record
2. Data saved to **local IndexedDB** immediately
3. Operation added to **sync queue**
4. Auto-sync sends data to **Firebase** within 30 seconds
5. Local data marked as synced
6. Queue item removed

### When Offline 📵
1. User saves health record
2. Data saved to **local IndexedDB** immediately
3. Operation added to **sync queue**
4. User sees message: "Record added (will sync when online)"
5. Data stays in queue until connection returns

### When Connection Returns 🌐
1. System detects online status
2. Auto-sync immediately processes queue
3. All pending operations sent to Firebase
4. Success: Queue cleared, data marked as synced
5. Failure: Item stays in queue, retry on next sync

---

## User Interface

### Sync Status Indicator

The sync indicator appears in the **header** of both:
- Admin Dashboard (`/admin`)
- Tree Update Page (`/admin/tree-update`)

**Status Display:**
```
[Cloud Icon] [Status Dot] [Status Text] [Pending Badge] [Sync Button]
```

**Status Messages:**
- **"Synced"** - All data synchronized ✅
- **"Syncing..."** - Currently syncing data 🔄
- **"X pending"** - Number of operations waiting to sync ⏳
- **"Offline"** - No internet connection 📵

**Last Sync Time:**
- "Just now"
- "X minutes ago"
- "X hours ago"
- "X days ago"
- "Never"

**Manual Sync Button:**
- Click to force immediate sync
- Disabled when offline
- Spinning icon during sync

---

## Technical Architecture

### Storage Layer

**IndexedDB Database: `DurianFarmDB`**

**Object Stores:**
1. `healthRecords` - Local copy of all health records
   - Indexed by: `id`, `treeId`, `inspectionDate`, `syncStatus`

2. `syncQueue` - Pending operations
   - Indexed by: `id`, `timestamp`, `operation`

### Sync Queue Item Structure
```typescript
{
  id: string;                    // Unique queue ID
  operation: "create" | "update" | "delete";
  collection: string;            // e.g., "healthRecords"
  data: any;                     // Operation payload
  timestamp: number;             // When queued
  attempts: number;              // Retry count
  error?: string;                // Last error message
}
```

### Service Architecture

**1. Offline Storage Service** (`lib/offlineStorage.ts`)
- IndexedDB operations
- Queue management
- Network status checking

**2. Sync Service** (`lib/syncService.ts`)
- Singleton pattern
- Auto-sync every 30 seconds
- Event listeners for online/offline
- Retry mechanism for failed syncs

**3. useOfflineSync Hook** (`hooks/useOfflineSync.ts`)
- React hook for components
- Real-time status updates
- Helper functions for UI display

---

## Integration in Pages

### Admin Dashboard

**Location:** `/app/admin/page.tsx`

**Changes:**
```typescript
// Imports
import { saveHealthRecordOffline, ... } from "@/lib/offlineStorage";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

// Save operation (offline-first)
const success = await saveHealthRecordOffline(newRecord);

// Load operation (try offline first, then Firebase)
const offlineRecords = await getAllHealthRecordsOffline();
```

### Tree Update Page

**Location:** `/app/admin/tree-update/page.tsx`

**Changes:**
```typescript
// Quick Health Check uses offline storage
const success = await saveHealthRecordOffline(newRecord);

// Shows sync status in header
<SyncStatusIndicator />
```

---

## Best Practices for Farmers

### 1. **Field Work** 🌾
- Start inspection even without signal
- Save health records as normal
- Check sync indicator when back in range
- Wait for "Synced" status before leaving

### 2. **Photo Tips** 📸
- Take photos normally, even offline
- Photos stored locally automatically
- Synced with health records together
- No need to retake if offline

### 3. **Monitoring Sync** 🔍
- Check pending count regularly
- Orange badge = items waiting to sync
- Red status = completely offline
- Green = all data safe in cloud

### 4. **Troubleshooting** ⚠️
- If pending count stuck, click manual sync
- Check internet connection
- Refresh page if needed
- Data safe in browser storage

---

## Error Handling

### Sync Failures
- Failed operations stay in queue
- Automatic retry on next sync (every 30 seconds)
- Error message stored in queue item
- Max retries: unlimited (keeps trying)

### Data Conflicts
- Last write wins (no conflict resolution yet)
- Local data takes precedence
- Synced to Firebase when online
- Future: Implement conflict resolution

### Storage Limits
- IndexedDB: ~50MB typical limit
- Varies by browser
- Photos use base64 (larger size)
- Monitor browser storage if heavy photo use

---

## Testing the Feature

### Test Offline Mode
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Try creating health record
5. Should see "(will sync when online)" message
6. Check sync indicator shows "Offline" in red
7. Change back to "Online"
8. Watch auto-sync happen within 30 seconds

### Test Pending Queue
1. Go offline
2. Create 3 health records
3. Check pending count shows "3 pending"
4. Go back online
5. Watch pending count decrease to 0
6. Status changes to "Synced"

### Test Manual Sync
1. Go offline
2. Create a record
3. Go back online
4. Click manual sync button (refresh icon)
5. Immediate sync occurs
6. Button disabled while syncing

---

## Future Enhancements

### Planned Features
1. **Conflict Resolution** - Handle simultaneous edits
2. **Offline Indicators** - Visual cues on unsyncedrecords
3. **Sync History** - Log of all sync operations
4. **Selective Sync** - Choose what to sync
5. **Compression** - Reduce photo sizes
6. **Background Sync** - Use Service Workers
7. **Offline Map** - Download map tiles
8. **Smart Retry** - Exponential backoff

---

## Performance Notes

### Sync Efficiency
- **Auto-sync interval:** 30 seconds
- **Batch operations:** All pending items at once
- **Network detection:** Instant on/offline events
- **Queue processing:** Sequential (one at a time)

### Browser Storage
- **IndexedDB:** Faster than localStorage
- **Async operations:** Non-blocking UI
- **Indexed queries:** Quick data retrieval
- **Transaction support:** Data integrity

### Battery Impact
- **Minimal:** Only syncs when online
- **Event-driven:** Not polling continuously
- **Efficient queries:** Indexed database
- **Smart intervals:** 30 seconds balance

---

## Troubleshooting

### Problem: Sync indicator stuck on "Syncing..."
**Solution:**
- Refresh the page
- Check browser console for errors
- Verify Firebase connection

### Problem: Pending count not decreasing
**Solution:**
- Check internet connection
- Click manual sync button
- Check Firebase rules/permissions
- Look for errors in browser console

### Problem: "Offline" status but internet works
**Solution:**
- Refresh the page
- Check `navigator.onLine` in console
- Try disconnecting/reconnecting WiFi
- Browser may cache offline state

### Problem: Photos not syncing
**Solution:**
- Check photo file sizes
- Verify base64 encoding successful
- Check browser storage quota
- Consider compressing images

---

## Developer Notes

### Key Files
- `/lib/offlineStorage.ts` - IndexedDB wrapper
- `/lib/syncService.ts` - Sync logic
- `/hooks/useOfflineSync.ts` - React hook
- `/components/SyncStatusIndicator.tsx` - UI component

### Adding New Collections
To support offline for other data types:

1. Add store to `offlineStorage.ts`:
```typescript
if (!db.objectStoreNames.contains("newStore")) {
  const store = db.createObjectStore("newStore", { keyPath: "id" });
}
```

2. Create CRUD functions following health record pattern

3. Update sync service to handle new operations

4. Add to sync queue with appropriate operation type

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify IndexedDB in DevTools > Application
3. Check sync queue contents
4. Review Firebase connection
5. Test with simple offline/online toggle

---

**Last Updated:** October 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
