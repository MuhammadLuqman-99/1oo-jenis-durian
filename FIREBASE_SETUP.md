# Firebase Setup Guide for Durian Farm Management System

## Overview
This application now uses Firebase Firestore as the backend database to store all tree data, measurements, and maintenance records in real-time.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `durian-farm` (or any name you prefer)
4. Disable Google Analytics (optional, but recommended for simplicity)
5. Click "Create project"

### 2. Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in **test mode**" (you can add security rules later)
4. Select a Cloud Firestore location (choose closest to Malaysia, e.g., `asia-southeast1`)
5. Click "Enable"

### 3. Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the Web icon (`</>`) to add a web app
5. Give your app a nickname: `Durian Farm Web App`
6. Click "Register app"
7. Copy the configuration object shown (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "durian-farm.firebaseapp.com",
  projectId: "durian-farm",
  storageBucket: "durian-farm.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

### 4. Add Configuration to Your App

1. In your project folder, copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

2. Open `.env.local` and paste your Firebase configuration values:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=durian-farm.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=durian-farm
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=durian-farm.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
   ```

3. Save the file

### 5. Restart the Development Server

1. Stop the current server (Ctrl+C if running)
2. Start it again:
   ```bash
   npm run dev
   ```

## How It Works

### Data Structure in Firestore

The app creates two collections:

1. **`trees`** collection - stores all tree information:
   - Annual measurements (canopy size, circumference)
   - Weekly maintenance (fertilizer, pesticide)
   - Health status and conditions
   - Tree metadata (variety, age, location, zone, etc.)

2. **`activities`** collection - stores farm activities (future feature)

### Real-Time Updates

1. **QR Code Scanning**: When you scan a QR code at a tree:
   - Opens the tree-update page
   - Loads current tree data from Firebase
   - You update measurements/maintenance
   - Saves directly to Firebase database

2. **Admin Dashboard**:
   - Loads all trees from Firebase on page load
   - Displays data in tables (Annual Measurements & Weekly Maintenance)
   - Any updates are instantly saved to Firebase
   - Data syncs across all devices in real-time

3. **Data Persistence**:
   - All data is stored in Firebase Cloud Firestore
   - Accessible from any device with internet connection
   - Automatic backups by Firebase
   - No data lost when closing browser

## Testing Firebase Integration

### First Run
1. Open admin dashboard (`http://localhost:3004/admin`)
2. The app will automatically:
   - Check if trees exist in Firebase
   - If not, initialize with sample data
   - Save all 4 sample trees to Firebase

### Update via QR Code
1. Go to "QR Codes" tab in admin dashboard
2. Click on a tree's QR code (or scan with phone)
3. Update any data (measurements, fertilizer, pesticide, etc.)
4. Click "Save All Updates"
5. Go back to admin dashboard
6. Check "Data Table" tab - your updates should appear!

### Verify in Firebase Console
1. Go to Firebase Console
2. Click "Firestore Database"
3. You should see `trees` collection with 4 documents
4. Click on any tree to see all its data
5. Make an update via QR code
6. Refresh Firebase Console - data should update in real-time!

## Security (Important for Production)

Currently using **test mode** which allows anyone to read/write. For production:

1. Go to Firebase Console > Firestore Database > Rules
2. Replace with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /trees/{treeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /activities/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Implement Firebase Authentication for admin login

## Troubleshooting

### Error: "Firebase not configured"
- Check that `.env.local` file exists and has all values
- Restart dev server after creating `.env.local`

### Error: "Permission denied"
- Check Firestore rules are in test mode
- Verify project ID matches in `.env.local`

### Data not showing
- Check browser console for errors
- Verify Firebase project is active
- Check Firestore Database is enabled

## Features Now Available

✅ Real-time data storage in Firebase
✅ QR code updates save to cloud database
✅ Data syncs across all devices
✅ Annual measurements tracking
✅ Weekly maintenance tracking (fertilizer & pesticide)
✅ Health status monitoring
✅ Automatic data initialization
✅ Fallback to local data if Firebase unavailable

## Next Steps (Optional)

1. Add Firebase Authentication for secure login
2. Set up Cloud Functions for automated tasks
3. Add image upload for tree photos (Firebase Storage)
4. Enable offline data sync
5. Add data export to Excel/CSV
