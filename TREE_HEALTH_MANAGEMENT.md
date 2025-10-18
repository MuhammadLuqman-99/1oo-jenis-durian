# 🌳 Tree Health Management System

Complete documentation for the Durian Tree Health & Disease Management feature.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Quick Start Guide](#quick-start-guide)
4. [Field Usage (QR Code)](#field-usage-qr-code)
5. [Admin Dashboard Usage](#admin-dashboard-usage)
6. [Data Structure](#data-structure)
7. [Disease Types Reference](#disease-types-reference)
8. [Photo Management](#photo-management)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

The Tree Health Management System allows you to:
- **Track tree health conditions** with detailed disease/pest information
- **Record inspections** with dates, severity levels, and treatments
- **Upload photos** to visually document tree conditions over time
- **Access from field** via QR code scanning (single QR per tree)
- **Manage centrally** through admin dashboard
- **Store securely** in Firebase cloud database

### System Architecture

```
┌─────────────────┐
│   QR Code       │
│   (On Tree)     │
└────────┬────────┘
         │ Scan
         ↓
┌─────────────────────────────┐
│  Tree Update Page           │
│  ┌───────────────────────┐  │
│  │ Quick Health Check    │ ← Click
│  └───────────────────────┘  │
│  Tree Data Forms            │
└────────┬────────────────────┘
         │ Submit
         ↓
┌─────────────────────────────┐
│     Firebase Database        │
│  (healthRecords collection)  │
└────────┬────────────────────┘
         │ Syncs to
         ↓
┌─────────────────────────────┐
│    Admin Dashboard           │
│  🌳 Tree Health Tab          │
│  - View all records          │
│  - Edit/Delete               │
│  - Statistics                │
└──────────────────────────────┘
```

---

## ✨ Features

### 1. Health Status Tracking
- **Three status levels:**
  - ✅ **Sihat (Healthy)** - Tree in good condition
  - ⚠️ **Sederhana (Moderate)** - Requires monitoring
  - 🚨 **Sakit (Sick)** - Needs immediate attention

### 2. Disease & Pest Management
- **9 Disease/Pest Types:**
  - Phytophthora (Busuk akar)
  - Stem Canker
  - Patch Canker
  - Serangan Penggerek Batang
  - Serangan Ulat
  - Serangan Kumbang
  - Penyakit Daun
  - Lain-lain

### 3. Severity Assessment
- **Ringan (Light)** - < 25% affected
- **Sederhana (Moderate)** - 25-50% affected
- **Teruk (Severe)** - > 50% affected

### 4. Photo Documentation
- **Multiple photo upload** per inspection
- **Before/after comparison** capability
- **Thumbnail preview** in data table
- **Full-size lightbox** viewer
- **Photos stored as base64** in Firebase

### 5. Treatment Records
- Document actions taken
- Track fertilizer/pesticide applications
- Monitor treatment effectiveness

### 6. Statistics Dashboard
- Total health records count
- Number of healthy trees
- Trees requiring attention
- Trees with diseases

---

## 🚀 Quick Start Guide

### For Farm Workers (Field Use)

**You'll need:**
- Smartphone with camera
- Internet connection
- Admin login credentials

**Steps:**
1. Open camera app
2. Scan QR code on tree
3. Login if prompted
4. Click **"🌳 Quick Health Check"** button
5. Fill in inspection form
6. Take photos if needed
7. Click **"Save Health Record"**

### For Admin (Office/Dashboard)

**Access:**
1. Go to `http://localhost:3000/admin`
2. Login with admin credentials
3. Click **"🌳 Tree Health"** tab

---

## 📱 Field Usage (QR Code)

### Scanning Process

```
Step 1: Scan QR Code
┌─────────────────┐
│   [QR CODE]     │  ← Point camera here
│                 │
│  Tree D-001     │
│  Musang King    │
└─────────────────┘

Step 2: Page Opens
┌─────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 🌳 Quick Health Check ┃ │ ← Tap this button
│ ┗━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                             │
│ Tree Information:           │
│ • Variety: Musang King      │
│ • Zone: A, Row: 3           │
│ • Age: 5 years              │
└─────────────────────────────┘

Step 3: Quick Form
┌─────────────────────────────┐
│ Inspection Date: [Today]    │
│ Health Status: [Select]     │
│ Disease Type: [Select]      │
│ Severity: [Select]          │
│ Treatment: [Text]           │
│ Photos: [Upload]            │
│ Notes: [Text]               │
│ Inspector: [Auto-filled]    │
│                             │
│ [Cancel] [Save Record]      │
└─────────────────────────────┘
```

### Example Inspection Workflow

**Scenario: Found diseased tree during morning rounds**

```
1. Walk to tree D-015
2. Notice yellowing leaves and root rot
3. Scan QR code
4. Tap "Quick Health Check"
5. Fill form:
   - Status: 🚨 Sakit
   - Disease: Phytophthora (Busuk akar)
   - Severity: Sederhana (25-50%)
   - Photos: [Take 3 photos - leaves, trunk, roots]
   - Treatment: "Applied fungicide, improved drainage"
   - Notes: "Heavy rainfall last week may have caused waterlogging"
6. Save
7. ✅ Record saved to cloud
8. Continue to next tree
```

---

## 💼 Admin Dashboard Usage

### Accessing Tree Health Tab

1. Navigate to `/admin`
2. Login with credentials
3. Click **"🌳 Tree Health"** tab

### Dashboard Layout

```
┌────────────────────────────────────────────┐
│         STATISTICS CARDS                   │
├──────────┬──────────┬──────────┬──────────┤
│  Total   │  Sihat   │ Sederhana│  Sakit   │
│   156    │   120    │    24    │   12     │
└──────────┴──────────┴──────────┴──────────┘

┌────────────────────────────────────────────┐
│  [+ Add Health Record]                     │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  HEALTH RECORDS TABLE                      │
├──────┬──────┬────────┬────────┬──────────┤
│ Date │ Tree │ Status │ Disease│ Photos   │
├──────┼──────┼────────┼────────┼──────────┤
│ ...  │ ...  │  ...   │  ...   │ [🖼️🖼️]  │
└──────┴──────┴────────┴────────┴──────────┘
```

### Adding a Record

**Method 1: From Dashboard**
```
1. Click "Add Health Record" button
2. Select tree from dropdown
3. Fill inspection details
4. Upload photos (optional)
5. Save
```

**Method 2: Edit Existing**
```
1. Find record in table
2. Click "Edit" (blue pencil icon)
3. Modify fields
4. Save changes
```

### Viewing Photos

**In Table:**
- Thumbnails show first 3 photos
- "+X" badge shows additional photo count
- Click any thumbnail → Opens full-size viewer

**In Lightbox:**
- Click anywhere outside photo to close
- Click X button in corner to close

### Deleting Records

```
⚠️ Warning: This action cannot be undone!

1. Find record in table
2. Click "Delete" (red trash icon)
3. Confirm deletion
4. Record removed from Firebase
```

---

## 🗄️ Data Structure

### TreeHealthRecord Interface

```typescript
interface TreeHealthRecord {
  id: string;                    // Unique ID: health-{timestamp}
  treeId: string;                // Tree identifier
  treeNo: string;                // Tree number/code
  variety: string;               // Durian variety
  location: string;              // Tree location
  zone?: string;                 // Farm zone
  row?: string;                  // Row number

  // Health Information
  inspectionDate: string;        // ISO date format
  healthStatus: "Sihat" | "Sederhana" | "Sakit";
  diseaseType?: string;          // See disease types below
  attackLevel?: "Ringan" | "Sederhana" | "Teruk" | "";
  treatment?: string;            // Treatment description
  notes?: string;                // Additional observations

  // Media & Metadata
  photos?: string[];             // Base64 encoded photos
  inspectedBy: string;           // Inspector name
  updatedAt: string;             // Last update timestamp
}
```

### Firebase Storage

**Collection:** `healthRecords`

**Document Structure:**
```json
{
  "health-1729242000000": {
    "id": "health-1729242000000",
    "treeId": "DUR-001",
    "treeNo": "D-001",
    "variety": "Musang King",
    "location": "Blok A, Baris 1",
    "zone": "A",
    "row": "1",
    "inspectionDate": "2025-10-18",
    "healthStatus": "Sederhana",
    "diseaseType": "Phytophthora (Busuk akar)",
    "attackLevel": "Sederhana",
    "treatment": "Applied fungicide, improved drainage",
    "notes": "Yellowing leaves observed, root system shows signs of rot",
    "photos": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    ],
    "inspectedBy": "Ahmad bin Abdullah",
    "updatedAt": "2025-10-18T08:30:00.000Z"
  }
}
```

---

## 🦠 Disease Types Reference

### 1. Phytophthora (Busuk akar)
**Type:** Fungal disease
**Symptoms:**
- Yellowing leaves
- Wilting branches
- Root rot
- Dark discoloration at trunk base

**Treatment:**
- Improve drainage
- Apply systemic fungicide
- Remove affected roots
- Reduce watering frequency

---

### 2. Stem Canker
**Type:** Fungal infection
**Symptoms:**
- Sunken lesions on trunk
- Gum/sap oozing
- Bark cracking
- Branch dieback

**Treatment:**
- Prune affected branches
- Apply copper-based fungicide
- Improve air circulation
- Remove fallen debris

---

### 3. Patch Canker
**Type:** Fungal disease
**Symptoms:**
- Circular patches on trunk
- Brown/black discoloration
- Bark peeling
- Slow growth

**Treatment:**
- Surgical removal of canker
- Apply wound sealant
- Fungicide application
- Monitor regularly

---

### 4. Serangan Penggerek Batang (Stem Borer)
**Type:** Insect pest
**Symptoms:**
- Small holes in trunk
- Sawdust-like frass
- Wilting branches
- Exit holes in bark

**Treatment:**
- Inject insecticide in holes
- Wire probing to kill larvae
- Apply systemic pesticide
- Remove severely affected branches

---

### 5. Serangan Ulat (Caterpillar Attack)
**Type:** Insect pest
**Symptoms:**
- Leaf damage/holes
- Defoliation
- Visible caterpillars
- Webbing on leaves

**Treatment:**
- Manual removal
- Biological control (Bt spray)
- Insecticide application
- Encourage natural predators

---

### 6. Serangan Kumbang (Beetle Attack)
**Type:** Insect pest
**Symptoms:**
- Leaf notching
- Bark damage
- Adult beetles visible
- Larvae in soil

**Treatment:**
- Pesticide spray
- Soil treatment
- Trunk banding
- Adult beetle trapping

---

### 7. Penyakit Daun (Leaf Disease)
**Type:** Various (fungal/bacterial)
**Symptoms:**
- Leaf spots
- Yellowing
- Premature leaf drop
- Mold/mildew

**Treatment:**
- Remove infected leaves
- Fungicide spray
- Improve air circulation
- Reduce humidity

---

### 8. Lain-lain (Others)
**Type:** Miscellaneous
**Use for:**
- Uncommon diseases
- Nutrient deficiencies
- Environmental stress
- Unknown conditions

**Action:**
- Document symptoms in notes
- Consult agricultural expert
- Take detailed photos
- Monitor progression

---

## 📸 Photo Management

### Uploading Photos

**From Mobile:**
```
1. Tap "Choose Files" or "Upload Photos"
2. Select "Camera" to take new photo
   OR "Gallery" to choose existing
3. Can select multiple photos at once
4. Photos appear as thumbnails
5. Tap X on thumbnail to remove
```

**Best Practices:**
- Take 2-4 photos per inspection
- Include: overall tree, close-up of problem, affected area
- Ensure good lighting
- Focus on relevant symptoms
- Avoid blurry images

### Photo Storage

**Technical Details:**
- Format: Base64 encoded strings
- Storage: Firebase Firestore
- Max size: Recommended < 2MB per photo
- Supported formats: JPEG, PNG, WebP

**Size Optimization:**
- Photos auto-compressed by browser
- Thumbnail generation on display
- Full-size only shown in lightbox

### Viewing Photos

**In Table:**
```
┌─────────────────┐
│ [📷] [📷] [📷] │ ← First 3 photos
│      [+2]       │ ← Shows count if > 3
└─────────────────┘
```

**In Lightbox:**
```
┌─────────────────────────────┐
│              [X]             │ ← Close button
│                              │
│     ┌─────────────────┐     │
│     │                 │     │
│     │   Full Photo    │     │
│     │                 │     │
│     └─────────────────┘     │
│                              │
│  Click anywhere to close     │
└─────────────────────────────┘
```

---

## 💡 Best Practices

### Inspection Frequency

**Recommended Schedule:**
- **Daily:** Visual walk-through
- **Weekly:** Detailed inspections of flagged trees
- **Monthly:** Comprehensive health assessment
- **Quarterly:** Photo documentation for comparison

### Documentation Tips

1. **Be Specific:**
   ```
   ❌ Bad: "Tree not looking good"
   ✅ Good: "Yellowing on 30% of leaves, trunk shows dark patches at base"
   ```

2. **Include Context:**
   ```
   ✅ "Heavy rain for 3 days before symptoms appeared"
   ✅ "First noticed 2 weeks after fertilizer application"
   ✅ "Adjacent trees showing similar symptoms"
   ```

3. **Photo Documentation:**
   ```
   Photo 1: Wide shot of entire tree
   Photo 2: Close-up of affected area
   Photo 3: Detail of symptoms (leaves, trunk, etc.)
   Photo 4: Surrounding area for context
   ```

### Treatment Tracking

**Record Format:**
```
Date: 2025-10-18
Treatment: Applied Ridomil Gold (250g) diluted in 10L water
Method: Soil drenching around root zone
Follow-up: Check in 7 days for improvement
```

### Data Quality

**Required Fields:**
- ✅ Always fill: Date, Health Status, Inspector
- 📸 Recommended: At least 1 photo for sick trees
- 📝 Important: Detailed notes for moderate/sick trees

---

## 🔧 Troubleshooting

### QR Code Not Working

**Problem:** QR code scan doesn't open page

**Solutions:**
1. Check internet connection
2. Verify QR code URL format: `http://localhost:3000/admin/tree-update?id=TREE_ID`
3. Try scanning with different QR reader app
4. Ensure admin credentials are saved
5. Check if tree ID exists in database

---

### Photos Not Uploading

**Problem:** Photos fail to upload or show error

**Solutions:**
1. Check photo file size (reduce if > 2MB)
2. Ensure browser has camera/storage permissions
3. Try reducing number of photos (max 5-6 recommended)
4. Check internet connection
5. Try different image format (JPEG recommended)

---

### Data Not Saving

**Problem:** Health record doesn't save to Firebase

**Solutions:**
1. Verify Firebase configuration in `lib/firebase.ts`
2. Check Firebase console for write permissions
3. Ensure all required fields are filled:
   - Tree ID
   - Health Status
   - Inspection Date
   - Inspector Name
4. Check browser console for error messages
5. Verify internet connection

---

### Cannot See Photos in Table

**Problem:** Photos uploaded but not visible

**Solutions:**
1. Check if photos array is populated in Firebase
2. Verify base64 encoding is correct
3. Clear browser cache
4. Try different browser
5. Check browser console for errors

---

### Modal Won't Close

**Problem:** Health check modal stuck open

**Solutions:**
1. Click "Cancel" button
2. Press ESC key
3. Click outside modal area
4. Refresh page (will lose unsaved data)
5. Clear browser cache

---

## 📊 Usage Statistics & Reports

### Available Metrics

**Dashboard Shows:**
- Total health records
- Trees by health status
- Recent inspections
- Disease outbreak patterns (manual analysis)

### Generating Reports

**Manual Export (via Browser):**
```
1. Go to Admin → Tree Health tab
2. Open browser console (F12)
3. Type:
   const data = JSON.stringify(healthRecords);
   console.log(data);
4. Copy output
5. Save as JSON file
```

**Future Features (Planned):**
- CSV export
- PDF reports
- Email notifications for sick trees
- Trend analysis graphs
- Disease outbreak maps

---

## 🔐 Security & Permissions

### Access Control

**Required Authentication:**
- Admin login required for all functions
- Local storage manages session
- Firebase rules control data access

### Data Privacy

**Stored Information:**
- Tree health data
- Inspector names
- Photos (base64 in database)
- Timestamps

**Not Stored:**
- GPS coordinates (can be added if needed)
- Personal contact information
- Payment/financial data

---

## 🚀 Future Enhancements

### Planned Features

1. **Advanced Analytics:**
   - Disease trend graphs
   - Heat maps of affected areas
   - Predictive health scoring

2. **Notifications:**
   - Email alerts for sick trees
   - SMS notifications for urgent cases
   - Scheduled inspection reminders

3. **Mobile App:**
   - Native iOS/Android app
   - Offline mode with sync
   - GPS location tagging

4. **Reporting:**
   - PDF report generation
   - CSV export functionality
   - Weekly health summaries

5. **Integration:**
   - Weather data correlation
   - Fertilizer schedule integration
   - Harvest prediction models

---

## 📞 Support

### Getting Help

**For Technical Issues:**
1. Check this documentation
2. Review troubleshooting section
3. Check browser console for errors
4. Verify Firebase configuration

**For Feature Requests:**
- Document your use case
- Describe desired functionality
- Provide examples

### File Locations

**Key Files:**
```
/app/admin/page.tsx                    - Admin dashboard with health tab
/app/admin/tree-update/page.tsx        - QR code landing page with quick health check
/app/admin/tree-health/page.tsx        - Standalone health management page
/lib/firebaseService.ts                - Firebase CRUD operations
/types/tree.ts                         - TypeScript interfaces
/data/trees.ts                         - Initial tree data
```

---

## 📝 Change Log

### Version 1.0.0 (2025-10-18)
- ✅ Initial release
- ✅ Health status tracking (Sihat/Sederhana/Sakit)
- ✅ Disease type management (9 types)
- ✅ Severity levels (Ringan/Sederhana/Teruk)
- ✅ Photo upload with preview
- ✅ Firebase integration
- ✅ QR code access
- ✅ Admin dashboard tab
- ✅ Quick health check modal
- ✅ Statistics dashboard
- ✅ Photo lightbox viewer

---

## 🎯 Quick Reference Card

### Field Worker Checklist

```
□ Scan tree QR code
□ Click "Quick Health Check"
□ Set health status
□ Select disease (if any)
□ Rate severity
□ Take 2-3 photos
□ Note treatment applied
□ Add observations
□ Save record
```

### Disease Quick Reference

```
Phytophthora → Root rot, yellowing
Stem Canker → Trunk lesions, oozing
Patch Canker → Circular bark patches
Penggerek → Holes in trunk, sawdust
Ulat → Leaf damage, caterpillars visible
Kumbang → Leaf notching, beetles
Penyakit Daun → Leaf spots, yellowing
```

### Photo Guide

```
📷 Shot 1: Full tree (context)
📷 Shot 2: Problem area (medium)
📷 Shot 3: Close-up (detail)
📷 Shot 4: Comparison (optional)
```

---

**End of Documentation**

For updates and additional information, check the project repository or contact the development team.

**Last Updated:** October 18, 2025
**Version:** 1.0.0
**Maintained by:** Development Team
