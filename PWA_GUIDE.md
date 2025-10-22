# Progressive Web App (PWA) Guide

## Overview

Your Durian Farm Management System is now a **Progressive Web App (PWA)**! This means farm workers can install it on their phones and use it like a native app, even **offline in the field**.

## 🌟 Key Features

### 1. **Install on Any Device**
- Works on **iPhone, Android, and Desktop**
- No App Store approval needed
- Installs directly from the website
- Takes up minimal storage space

### 2. **Offline Functionality**
- ✅ View cached tree data
- ✅ Record health inspections
- ✅ Take photos with camera
- ✅ Tag GPS locations
- ✅ Auto-sync when back online

### 3. **Native App Experience**
- Appears on home screen with icon
- Works in fullscreen (no browser bar)
- Fast loading and smooth performance
- Background sync for pending data

## 📱 Installation Instructions

### **On iPhone/iPad**

1. Open Safari and visit your farm website
2. Tap the **Share** button (📤) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** to confirm
5. The app icon will appear on your home screen

### **On Android**

1. Open Chrome and visit your farm website
2. Tap the menu (⋮) in top right
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Tap **"Add"** to confirm
5. The app icon will appear on your home screen

**OR** - A prompt will appear automatically asking if you want to install. Just tap **"Install"**!

### **On Desktop** (Chrome/Edge)

1. Visit the website
2. Look for the install icon (➕) in the address bar
3. Click it and select **"Install"**

## 📸 Using the Camera

### Taking Field Photos

1. Go to **Tree Health** tab in admin panel
2. Click **"Add Health Record"**
3. Click the **Camera** icon
4. Allow camera access when prompted
5. Take up to 5 photos per inspection
6. Photos are automatically attached to the health record

### Camera Features

- **Switch camera**: Tap the 🔄 button to switch between front/back cameras
- **Grid overlay**: Helps you frame photos properly
- **Preview**: Review photos before saving
- **Retake**: Don't like the photo? Take it again!

## 📍 GPS Location Tagging

### Auto-Location

When you create a health record:
1. GPS automatically captures your location
2. Shows **latitude, longitude, and accuracy**
3. Displayed as a map coordinate
4. Can view location on Google Maps

### Location Features

- **High accuracy**: Uses GPS for precise coordinates
- **Accuracy indicator**: Shows if location is Excellent/Good/Fair
- **Continuous tracking**: Option to update location in real-time
- **Manual refresh**: Refresh location if you move

## 🔄 Offline Mode

### How It Works

1. **When Online**: All data syncs immediately to Firebase
2. **When Offline**: Data is saved locally on your device
3. **Back Online**: Automatically syncs pending data

### What Works Offline

✅ **View Data**
- View all previously loaded trees
- View health records
- View activities

✅ **Create Data**
- Add health inspections
- Take photos
- Record GPS locations
- Add notes

✅ **Edit Data** (limited)
- Update tree information
- Modify health records

### Offline Indicators

- **Yellow bar at top**: You're currently offline
- **Pending sync count**: Shows how many items need to sync
- **Auto-sync**: When back online, data syncs automatically

## 🔧 Troubleshooting

### Camera Not Working

**Problem**: "Camera permission denied"

**Solutions**:
1. Go to phone **Settings** > **Safari/Chrome**
2. Find **Camera** permissions
3. Allow camera access for the website
4. Refresh the page

**Problem**: "Camera already in use"

**Solution**: Close other apps using the camera

### GPS Not Working

**Problem**: "Location permission denied"

**Solutions**:
1. Go to phone **Settings** > **Safari/Chrome**
2. Find **Location** permissions
3. Allow location access "While Using App"
4. Refresh the page

**Problem**: Location accuracy is "Fair" or worse

**Solutions**:
- Move to an open area (away from buildings/trees)
- Wait 10-20 seconds for GPS to lock
- Ensure Location Services are enabled on phone

### Offline Sync Issues

**Problem**: Data not syncing when back online

**Solutions**:
1. Check the sync indicator (bottom right)
2. Pull down to refresh the page
3. Click **"Sync Now"** if available
4. Check internet connection

## 💡 Best Practices for Field Workers

### Before Going to Field

1. ✅ **Install the app** on your phone
2. ✅ **Load the admin page** while online (to cache data)
3. ✅ **Test camera** and GPS permissions

### In the Field

1. 📸 **Take clear photos** with good lighting
2. 📍 **Wait for GPS** to show "Excellent" or "Good" accuracy
3. 📝 **Fill all required fields** for health inspections
4. 🔄 **Check offline indicator** - yellow bar means data will sync later

### After Field Work

1. 🌐 **Connect to WiFi/Internet**
2. 🔄 **Open the app** to trigger auto-sync
3. ✅ **Verify sync** - offline indicator should disappear
4. 📊 **Review synced data** in admin panel

## 🎯 Pro Tips

### For Maximum Offline Capability

1. **Pre-load data**: Visit all pages you'll need while online
2. **Clear browser cache**: If app acts strange, clear cache and reload
3. **Update regularly**: Reinstall app when major updates are released

### For Best Camera Quality

1. **Clean lens**: Wipe camera lens before taking photos
2. **Good lighting**: Take photos in daylight when possible
3. **Steady hands**: Hold phone steady for clear images
4. **Multiple angles**: Take photos from different angles

### For Accurate GPS

1. **Open sky**: Get best GPS signal in open areas
2. **Wait for lock**: Green "Excellent" accuracy is best
3. **Continuous tracking**: Enable for walking inspections

## 📊 Data Management

### What's Stored Locally

- **Tree list**: Last loaded tree information
- **Health records**: Records from last 30 days
- **Photos**: Compressed for efficient storage
- **Form data**: Pending health inspections

### What Requires Internet

- **First load**: Initial data download
- **Firebase sync**: Saving data to cloud
- **Photo upload**: Uploading full-resolution images
- **Reports**: Generating analytics and reports

### Storage Limits

- **Average usage**: 10-50 MB
- **With photos**: Up to 200 MB
- **Auto-cleanup**: Old data removed after 90 days
- **Manual clear**: Clear cache in browser settings

## 🔐 Security & Privacy

### Data Protection

- ✅ **HTTPS**: All data encrypted in transit
- ✅ **Local encryption**: Offline data is secured
- ✅ **Authentication**: Login required for sensitive data
- ✅ **Auto-logout**: After 24 hours of inactivity

### Privacy

- 📍 **GPS**: Location only used for health records, never shared
- 📸 **Photos**: Stored securely in Firebase, not public
- 👤 **Personal info**: Only visible to farm admins
- 🔒 **Permissions**: Camera/GPS only activated when you use features

## 📞 Support

### Common Questions

**Q: Will this use my mobile data?**
A: Only when syncing. Most work is done offline with no data usage.

**Q: Can multiple workers use the same phone?**
A: Yes, but each should log in with their own account for proper tracking.

**Q: What happens if my phone dies with unsaved data?**
A: Data is saved immediately to device storage. It will sync when you restart and connect to internet.

**Q: Can I uninstall and reinstall without losing data?**
A: Yes, all data is in the cloud. Just log in again after reinstalling.

### Getting Help

If you encounter issues:
1. Check this guide first
2. Try refreshing/restarting the app
3. Contact your farm admin
4. Check browser console for errors (for admins)

---

**Version**: 1.0
**Last Updated**: 2025-01-22
**Supports**: iOS 14+, Android 8+, Chrome 90+, Safari 14+
