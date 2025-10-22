# Vercel Deployment Guide - Durian Farm Management System

## 🚀 Deploy ke Vercel (Step-by-Step)

### Preparation (Sudah Siap ✅)

Code sudah di-push ke GitHub repository anda:
- **Repository**: https://github.com/MuhammadLuqman-99/1oo-jenis-durian
- **Branch**: main

---

## Step 1: Buat Akaun Vercel (Kalau Belum Ada)

1. Pergi ke https://vercel.com
2. Click **"Sign Up"**
3. Pilih **"Continue with GitHub"** (paling mudah)
4. Authorize Vercel untuk access GitHub anda
5. Done! Akaun sudah siap

---

## Step 2: Import Project dari GitHub

### Method 1: Dari Vercel Dashboard (Paling Mudah)

```
1. Login ke Vercel (https://vercel.com/dashboard)

2. Click button "Add New..." → "Project"

3. Anda akan nampak senarai GitHub repositories
   - Kalau tak nampak, click "Adjust GitHub App Permissions"
   - Select repositories atau "All repositories"
   - Click "Save"

4. Cari repository "1oo-jenis-durian"

5. Click "Import" button

6. Configure Project:
   ✅ Project Name: 100-jenis-durian (atau nama lain)
   ✅ Framework Preset: Next.js (auto-detect)
   ✅ Root Directory: ./ (default)
   ✅ Build Command: npm run build (default)
   ✅ Output Directory: .next (default)
   ✅ Install Command: npm install (default)
```

### Method 2: Dari GitHub (Quick Deploy)

```
1. Pergi ke repository GitHub anda:
   https://github.com/MuhammadLuqman-99/1oo-jenis-durian

2. Scroll ke bawah README

3. Click button "Deploy to Vercel" (kalau ada)
   ATAU
   Pergi direct: https://vercel.com/new/clone?repository-url=https://github.com/MuhammadLuqman-99/1oo-jenis-durian

4. Follow wizard deployment
```

---

## Step 3: Setup Environment Variables (PENTING!)

Sebelum deploy, kena set Firebase credentials as environment variables:

### Di Vercel Dashboard:

```
1. Dalam project settings, pergi ke "Environment Variables"

2. Tambah variables ini (dari firebase.ts anda):

   NEXT_PUBLIC_FIREBASE_API_KEY
   Value: AIzaSyDzh6YrHiiwNMLPa8u9rIyF6mWPu3VN9Vw

   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   Value: durian-store.firebaseapp.com

   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   Value: durian-store

   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   Value: durian-store.firebasestorage.app

   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   Value: 293346476999

   NEXT_PUBLIC_FIREBASE_APP_ID
   Value: 1:293346476999:web:2cc3a4353d8d1ad3f6adb1

   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   Value: G-QTDPXTDVC4

3. Environment: Pilih "Production", "Preview", "Development" (semua)

4. Click "Save"
```

**IMPORTANT**: Guna `NEXT_PUBLIC_` prefix supaya variables accessible di client-side.

### Alternative: Guna `.env` File (Recommended untuk Production)

Untuk production, better simpan dalam Vercel dashboard, bukan dalam code.

Tapi untuk reference, format `.env`:

```bash
# .env.production (DON'T COMMIT THIS!)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDzh6YrHiiwNMLPa8u9rIyF6mWPu3VN9Vw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=durian-store.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=durian-store
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=durian-store.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=293346476999
NEXT_PUBLIC_FIREBASE_APP_ID=1:293346476999:web:2cc3a4353d8d1ad3f6adb1
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QTDPXTDVC4
```

---

## Step 4: Deploy!

```
1. Setelah environment variables set, click "Deploy"

2. Vercel akan:
   ✅ Clone repository
   ✅ Install dependencies (npm install)
   ✅ Build project (npm run build)
   ✅ Deploy to production

3. Tunggu 2-5 minit

4. Bila siap, akan dapat URL:
   https://100-jenis-durian.vercel.app
   (atau custom URL yang anda pilih)
```

---

## Step 5: Test Deployment

Setelah deploy, test semua features:

### Checklist Testing:

```
□ Homepage loads correctly
□ Admin login page accessible (/admin/login)
□ Can login dengan Firebase
□ PWA install prompt appears
□ Offline mode works
□ Camera access works (on HTTPS)
□ GPS location works (on HTTPS)
□ E-commerce shop loads (/shop)
□ Analytics dashboard displays data
□ QR codes generate correctly
```

---

## Step 6: Setup Custom Domain (Optional)

Kalau anda ada domain sendiri (contoh: durianfarm.com):

```
1. Dalam Vercel project settings → "Domains"

2. Click "Add Domain"

3. Enter domain: durianfarm.com

4. Vercel akan bagi DNS settings:
   Type: A
   Name: @
   Value: 76.76.21.21 (contoh IP)

5. Pergi ke domain registrar anda (GoDaddy, Namecheap, dll)

6. Add DNS record yang Vercel bagi

7. Tunggu DNS propagation (15min - 48 jam)

8. Done! Website accessible via custom domain
```

---

## Step 7: Setup Auto-Deployment

Vercel automatically deploys setiap kali anda push ke GitHub!

### How It Works:

```
1. Anda buat changes dalam code locally

2. Commit & push to GitHub:
   git add .
   git commit -m "Update feature X"
   git push

3. Vercel auto-detect push

4. Trigger automatic build & deploy

5. New version live dalam 2-3 minit!
```

### Branch Deployments:

```
main branch → Production (https://durianfarm.com)
dev branch → Preview (https://durianfarm-git-dev.vercel.app)
feature/x → Preview (https://durianfarm-git-feature-x.vercel.app)
```

---

## Important Vercel Configurations

### `vercel.json` (Optional - Kalau Perlu Custom Config)

Create file `vercel.json` dalam root directory:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

**Regions**: `sin1` = Singapore (closest to Malaysia, fastest)

---

## Firebase Configuration for Production

### Update Firebase Console:

```
1. Pergi Firebase Console:
   https://console.firebase.google.com/project/durian-store

2. Project Settings → General

3. Scroll to "Your apps" → Web app

4. Add authorized domain:
   - Click "Add domain"
   - Enter: 100-jenis-durian.vercel.app
   - (atau custom domain anda)

5. Authentication → Settings → Authorized domains
   - Add Vercel domain
   - Add custom domain (kalau ada)

6. Firestore Rules → Update (kalau perlu):
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
```

---

## PWA Requirements untuk Production

### 1. HTTPS (Vercel Auto-Enable ✅)

Vercel provides HTTPS by default - no configuration needed!

### 2. Service Worker

Already configured in `public/sw.js` ✅

### 3. Manifest

Already configured in `public/manifest.json` ✅

### 4. Icons (TODO)

```
Perlu create app icons untuk PWA install:

1. Go to: https://www.pwabuilder.com/imageGenerator

2. Upload logo (512x512 PNG)

3. Download icon pack

4. Extract ke folder: public/icons/

5. Icons needed:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

6. Commit & push:
   git add public/icons
   git commit -m "Add PWA icons"
   git push

7. Vercel auto-deploy dengan icons!
```

---

## Monitoring & Analytics

### Vercel Analytics (Free Tier)

```
1. Dalam Vercel dashboard → Analytics tab

2. Enable Vercel Analytics

3. Dapat insights:
   - Page views
   - User locations
   - Device types
   - Performance metrics
   - Real User Monitoring (RUM)
```

### Performance Monitoring

```
Vercel provides:
✅ Build time analytics
✅ Function execution time
✅ Lighthouse scores
✅ Core Web Vitals
✅ Error tracking
```

---

## Troubleshooting Common Issues

### Issue 1: Build Fails

**Error**: `Module not found` atau `Cannot find module`

**Solution**:
```bash
# Locally test build
npm run build

# If success, push to GitHub
# Vercel will use same build process
```

### Issue 2: Environment Variables Not Working

**Error**: Firebase initialization fails

**Solution**:
1. Check environment variables dalam Vercel dashboard
2. Pastikan guna `NEXT_PUBLIC_` prefix
3. Redeploy setelah add variables

### Issue 3: PWA Not Installing

**Error**: Install prompt tak keluar

**Solution**:
1. Check HTTPS enabled (Vercel auto-enable)
2. Verify manifest.json accessible: https://your-domain.vercel.app/manifest.json
3. Verify service worker: https://your-domain.vercel.app/sw.js
4. Check browser console for errors

### Issue 4: Firebase Connection Issues

**Error**: "Firebase: Error (auth/unauthorized-domain)"

**Solution**:
1. Pergi Firebase Console → Authentication → Settings
2. Add Vercel domain dalam "Authorized domains"
3. Wait 5-10 minutes for propagation

### Issue 5: API Routes Not Working

**Error**: 404 on /api/* routes

**Solution**:
1. Verify API routes dalam `app/api/` directory
2. Check `route.ts` naming (bukan `route.js`)
3. Verify export: `export async function GET()`, `export async function POST()`

---

## Performance Optimization

### Vercel Edge Network

Vercel deploys ke global CDN automatically:
- Assets cached globally
- Fastest server auto-selected
- Zero config needed

### Recommended Optimizations:

#### 1. Image Optimization

```typescript
// Guna Next.js Image component
import Image from 'next/image'

<Image
  src="/durian.jpg"
  width={500}
  height={300}
  alt="Durian"
  loading="lazy"
/>
```

#### 2. Code Splitting

Already enabled by Next.js! ✅
- Automatic route-based splitting
- Dynamic imports for large components

#### 3. Caching Headers

Vercel automatically sets optimal cache headers ✅

---

## Cost & Limits (Vercel Free Tier)

### Included FREE:

```
✅ Unlimited deployments
✅ Automatic HTTPS
✅ Global CDN
✅ 100 GB bandwidth/month
✅ Serverless Functions (100 GB-hours)
✅ 6,000 build minutes/month
✅ Unlimited team members (Hobby plan)
```

### Limits to Watch:

```
⚠️ Bandwidth: 100 GB/month
   - Typical usage: 2-5 GB/month (small farm)
   - If exceeded: Upgrade to Pro ($20/month)

⚠️ Function Execution: 10 seconds max
   - API routes must respond within 10s
   - For longer tasks, use background jobs

⚠️ Image Optimization: 1,000 source images
   - Optimized images cached automatically
   - Beyond 1,000: Upgrade to Pro
```

---

## Deployment Checklist

Sebelum go-live, check semua:

### Pre-Launch:

```
□ Environment variables configured
□ Firebase domain authorized
□ PWA icons created & uploaded
□ All features tested locally
□ No console errors
□ Lighthouse score > 90
□ Mobile responsive tested
□ Forms validation working
□ Payment gateway tested (Curlec sandbox)
□ Backup system configured
```

### Post-Launch:

```
□ Test PWA installation (iOS & Android)
□ Test offline mode
□ Verify camera & GPS permissions
□ Test e-commerce checkout flow
□ Monitor Vercel Analytics
□ Check Firebase usage
□ Setup monitoring alerts
□ Document production URL
```

---

## Support & Resources

### Vercel Documentation:
- Main Docs: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

### Firebase:
- Console: https://console.firebase.google.com
- Docs: https://firebase.google.com/docs

### Your Deployment:
- GitHub Repo: https://github.com/MuhammadLuqman-99/1oo-jenis-durian
- Vercel Dashboard: https://vercel.com/dashboard

---

## Next Steps After Deployment

### 1. Add Production Data

```
1. Login ke admin panel (production URL)
2. Tambah pokok-pokok durian anda
3. Generate QR codes
4. Test semua features
```

### 2. Setup Monitoring

```
- Enable Vercel Analytics
- Setup error tracking (Sentry - optional)
- Monitor Firebase quotas
- Track user engagement
```

### 3. Marketing & SEO

```
- Submit sitemap to Google
- Setup Google Analytics
- Social media integration
- Content optimization
```

---

## Summary

Deployment Steps (Quick Reference):

```
1. ✅ Code pushed ke GitHub
2. ✅ Create Vercel account
3. ✅ Import project dari GitHub
4. ⏳ Setup environment variables
5. ⏳ Click Deploy
6. ⏳ Test deployment
7. ⏳ Setup custom domain (optional)
8. ⏳ Add PWA icons
9. ⏳ Monitor & optimize
```

**Your farm management system sudah ready untuk production! 🚀🌳**

---

**Version**: 1.0
**Last Updated**: January 2025
**Status**: ✅ Ready for Deployment
**Estimated Deploy Time**: 10-15 minutes
