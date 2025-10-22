# PWA Icons

This folder contains the app icons for the Progressive Web App.

## Required Icons

The manifest.json requires these icon sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Creating Icons

You can create these icons using:

### Option 1: Online Generator (Easiest)
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload your logo/icon (minimum 512x512 PNG)
3. Download the generated icon pack
4. Extract and place in this `public/icons` folder

### Option 2: Design Tool
1. Create a 512x512 PNG in Photoshop/Figma/Canva
2. Use https://realfavicongenerator.net/ to generate all sizes
3. Download and place in this folder

### Option 3: Simple Placeholder
For now, you can use an emoji or simple colored square:
1. Visit https://favicon.io/favicon-generator/
2. Choose text-based icon (use 🌳 emoji or "DF" text)
3. Generate and download
4. Place in this folder

## Icon Design Tips

- **Simple**: Icons should be recognizable at small sizes
- **High contrast**: Use bold colors that stand out
- **No text**: Avoid small text that won't be readable
- **Centered**: Keep important elements in the center
- **Brand colors**: Use your farm's brand colors

## Temporary Solution

Until you create proper icons, the app will use:
- Browser's default PWA icon
- Or a simple colored background

The app will work fine without icons, they're just for aesthetics!

## Current Icons Needed

Create these files in this directory:
- [ ] icon-72x72.png
- [ ] icon-96x96.png
- [ ] icon-128x128.png
- [ ] icon-144x144.png
- [ ] icon-152x152.png
- [ ] icon-192x192.png
- [ ] icon-384x384.png
- [ ] icon-512x512.png

Optional:
- [ ] health-icon.png (96x96) - For health check shortcut
- [ ] tree-icon.png (96x96) - For add tree shortcut
- [ ] badge-72x72.png - For notification badge
