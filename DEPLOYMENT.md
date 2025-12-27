# FRIHET PWA - Deployment Guide

## Quick Start

The PWA is located in `/frontend` directory.

### Prerequisites

- Node.js 18+ and npm
- A Gemini API key (free tier available)

### Local Development

```bash
cd frontend

# Install dependencies
npm install

# Configure API key
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY

# Run dev server
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
```

Output: `dist/` folder (ready to deploy)

## Generate Icons

**Option 1: Browser-based (Recommended)**
```bash
# Open this file in a browser:
open frontend/scripts/icon-generator.html

# Click "Generate All" to download PNG icons
# Move them to frontend/public/
```

**Option 2: Use SVG placeholders**
```bash
python3 frontend/scripts/generate-icons.py
# Then convert SVG to PNG manually or use an online converter
```

**Option 3: Design custom icons**
- Use https://www.pwabuilder.com/imageGenerator
- Or design in Figma/Canva
- Required sizes: 192x192, 512x512, 180x180 (apple)

## Deploy to Vercel (Recommended)

### One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
```

### Environment Variables in Vercel

1. Go to your project settings
2. Environment Variables section
3. Add: `VITE_GEMINI_API_KEY` = your_key
4. Redeploy

## Deploy to Netlify

### Drag & Drop
1. Build locally: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag `frontend/dist` folder

### CLI Deploy
```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables in Netlify
1. Site settings → Environment variables
2. Add: `VITE_GEMINI_API_KEY`
3. Redeploy

## Deploy to GitHub Pages

```bash
cd frontend

# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

Update `vite.config.ts`:
```ts
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest
})
```

## iOS Installation

Once deployed:

1. Open the deployed URL in **Safari** on iOS
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

The app now runs like a native app with:
- Full-screen mode
- Home screen icon
- Offline functionality
- No browser chrome

## Testing PWA Features

### Test Service Worker
1. Open deployed app
2. Open DevTools → Application → Service Workers
3. Should see "activated and running"

### Test Offline Mode
1. Open app
2. DevTools → Network → Set to "Offline"
3. Reload page
4. Should still work with cached content

### Test Installation
1. Chrome: Look for install icon in address bar
2. iOS Safari: Share → Add to Home Screen
3. Android Chrome: Should show "Add to Home Screen" banner

## Monitoring & Analytics

### Check PWA Score
- Run Lighthouse audit in Chrome DevTools
- Should score 90+ in PWA category

### Performance
- First Contentful Paint: < 1s (target)
- Time to Interactive: < 2s (target)
- Lighthouse Performance: 90+ (target)

## Firebase Setup (Optional - for Push Notifications)

1. Create project at https://console.firebase.google.com
2. Add web app
3. Enable Cloud Messaging
4. Get configuration:
   - API Key
   - Project ID
   - Messaging Sender ID
   - App ID
5. Generate VAPID key pair in Cloud Messaging settings
6. Add all to `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_VAPID_KEY=...
   ```

### Send Test Notification

Firebase Console → Cloud Messaging → Send test notification

## Troubleshooting

### PWA not installing on iOS?
- ✓ Using Safari (not Chrome)
- ✓ manifest.webmanifest accessible
- ✓ Icons exist (192x192, 512x512)
- ✓ Served over HTTPS

### Gemini API not working?
- ✓ API key set in .env
- ✓ API key valid at https://makersuite.google.com
- ✓ Gemini API enabled in Google Cloud Console
- ✓ Check browser console for errors

### Service Worker not updating?
- Hard reload: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
- DevTools → Application → Service Workers → Unregister
- Clear site data and reload

### Build fails?
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Production Checklist

- [ ] Icons generated (192, 512, 180px)
- [ ] `.env` configured with Gemini API key
- [ ] Build succeeds: `npm run build`
- [ ] Test locally: `npm run preview`
- [ ] Lighthouse PWA score 90+
- [ ] Works offline
- [ ] Installable on iOS Safari
- [ ] Installable on Chrome Desktop/Android
- [ ] Responsive on all screen sizes
- [ ] manifest.webmanifest accessible
- [ ] Service worker registered
- [ ] HTTPS enabled (automatic on Vercel/Netlify)

## Custom Domain

### Vercel
1. Project settings → Domains
2. Add your domain
3. Configure DNS (A/CNAME records)

### Netlify
1. Site settings → Domain management
2. Add custom domain
3. Configure DNS

## Updates & Versioning

After making changes:

```bash
# Bump version in package.json
# Update CACHE_NAME in public/sw.js

npm run build
vercel --prod  # or your deploy command
```

Service workers will auto-update on next visit.

## Security

- ✓ API keys in `.env` (never committed)
- ✓ `.env` in `.gitignore`
- ✓ HTTPS required for PWA features
- ✓ Firebase security rules (if using)
- ✓ No sensitive data in localStorage
- ✓ Content Security Policy headers (optional)

## Support

Check the main README for:
- Feature documentation
- Architecture overview
- Development guidelines

---

**Bygg. Deploy. Bryt fri.**
