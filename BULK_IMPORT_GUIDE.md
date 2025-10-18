# 🌳 Bulk Tree Import Guide - Adding 500 Trees

This guide will help you quickly add all 500 trees to your durian farm system.

## Quick Start (3 Easy Steps)

### Step 1: Generate Tree Data
1. **Login as admin** at `/admin/login`
   - Username: `admin`
   - Password: `admin123`

2. **Go to Bulk Import page** at `/admin/bulk-import`
   - Click "Bulk Import Trees (500+)" from the admin dashboard

3. **Generate your data:**
   - Set number of trees: **500**
   - Click **"Generate & Download JSON"** button
   - A file `trees-500.json` will be downloaded

### Step 2: Update Tree Data File

Open `data/trees.ts` and replace the `treesData` array:

```typescript
// Before (only 4 trees)
export const treesData: TreeInfo[] = [
  { id: "tree-001", variety: "Musang King", ... },
  { id: "tree-002", variety: "Black Thorn", ... },
  // etc
];

// After (paste your generated JSON here)
export const treesData: TreeInfo[] = [
  // Paste all 500 trees from the downloaded JSON file
];
```

### Step 3: Done!
Your website now has 500 trees with:
- ✅ Unique QR codes for each tree
- ✅ Complete tree information
- ✅ Care history timeline
- ✅ Mobile admin quick-update capability

---

## What Data Is Generated?

Each of the 500 trees includes:

| Field | Description | Example |
|-------|-------------|---------|
| **ID** | Unique identifier | `tree-001` to `tree-500` |
| **Variety** | Durian type | Musang King, Black Thorn, D24, etc. |
| **Location** | Farm position | Block A, Row 1, Position 3 |
| **Tree Age** | Age in years | 5-25 years |
| **Planting Date** | When planted | Auto-calculated from age |
| **Health Status** | Current condition | Excellent, Good, Fair, Needs Attention |
| **Fertilization** | Last fertilized date & type | Within last 90 days |
| **Harvest Data** | Last & next harvest dates | Historical + future dates |
| **Annual Yield** | Production amount | 50-200 kg/year |
| **Care History** | Timeline events | Planting, fertilization, harvest |

---

## Tree Organization

Trees are automatically organized by:

- **10 Blocks** (A through J): 50 trees each
- **5 Rows per block**: 10 trees each
- **10 Positions per row**: Individual tree spots

Example locations:
- `tree-001` → Block A, Row 1, Position 1
- `tree-050` → Block A, Row 5, Position 10
- `tree-051` → Block B, Row 1, Position 1
- `tree-100` → Block B, Row 5, Position 10

---

## CSV Option (For Excel Editing)

If you want to customize tree data in Excel first:

1. Click **"Generate & Download CSV"** button
2. Open `trees-500.csv` in Excel or Google Sheets
3. Edit any data you want to customize
4. Convert back to JSON format (or manually input)

CSV includes all fields in spreadsheet format for easy editing.

---

## QR Code System

After importing 500 trees:

1. **Each tree gets a unique QR code** automatically
2. **View & download QR codes** from the farm map
3. **Print QR codes** and attach to physical trees
4. **Scan QR** with phone → View/Edit tree data on-site

QR URLs follow pattern: `https://yoursite.com/tree/tree-001`

---

## Production Database (Future)

Currently using in-memory data from `data/trees.ts`.

For production with 500+ trees, you should:

1. **Set up a database:**
   - PostgreSQL (recommended for farms)
   - MongoDB (flexible JSON storage)
   - Supabase (easy setup + auth)
   - Firebase (real-time updates)

2. **Create API endpoints:**
   - `GET /api/trees` - List all trees
   - `GET /api/trees/[id]` - Get single tree
   - `PUT /api/trees/[id]` - Update tree (admin)
   - `POST /api/trees` - Add new tree (bulk import)

3. **Update the codebase:**
   - Replace `treesData` imports with API calls
   - Add server-side authentication
   - Enable real-time updates

Would you like help setting up a production database?

---

## Tips for Managing 500 Trees

### Search & Filter
- Consider adding search by tree ID
- Filter by block, variety, health status
- Sort by age, yield, last harvest

### Batch Operations
- Update multiple trees at once
- Bulk fertilization logging
- Mass health assessments

### Mobile Field App
- Use QR scanning for field work
- Quick update form already mobile-optimized
- Works offline (with service workers)

### Maintenance Schedules
- Generate fertilization calendars
- Harvest planning by expected dates
- Health monitoring alerts

---

## Need Help?

1. **Check the generated data** looks correct in the JSON file
2. **Test with 10 trees first** before importing all 500
3. **Backup your current data** before replacing trees.ts
4. **Verify QR codes work** after importing

---

## Customization

Want to adjust the generated data? Edit `utils/generateTrees.ts`:

```typescript
// Add more durian varieties
const durianVarieties = [
  "Musang King", "Black Thorn", "Your Custom Variety"
];

// Change health distribution
const healthStatuses = ["Excellent", "Good"]; // Remove "Needs Attention"

// Adjust age range
const treeAge = Math.floor(Math.random() * 10) + 10; // 10-20 years instead of 5-25
```

Re-generate the JSON after making changes.

---

**Ready to add your 500 trees? Start at: `/admin/bulk-import`**
