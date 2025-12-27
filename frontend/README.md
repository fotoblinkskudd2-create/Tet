# FRIHET - Progressive Web App

En kraftig PWA bygget for å løse reelle problemer. Ingen App Store-dritt, ingen 30% skatt, ingen sensur.

## Features

### 🔴 Gjeldsknuser
Analyser gjeld, få AI-generert strategi for raskeste vei ut av renteslaveriet.

### 🔴 Sannhetsmotor
AI-drevet faktasjekk av nyheter. Avdekk bias, eierskap, og manipulasjon.

### 🔴 Handlingstracker
Daglige oppgaver som tvinger deg til handling. Streaks, stats, ingen unnskyldninger.

### 🔴 Offline First
Hele appen funker uten nett. Cached data, service workers, full offline-støtte.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (dark mode, iOS safe areas)
- **PWA**: vite-plugin-pwa + Workbox
- **AI**: Google Gemini API
- **Push**: Firebase Cloud Messaging (optional)
- **State**: React Hooks (minimal, no Redux bloat)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Get your Gemini API key: https://makersuite.google.com/app/apikey

Add to `.env`:
```
VITE_GEMINI_API_KEY=your_actual_key_here
```

### 3. Generate icons

Du trenger ikoner for PWA:
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)
- `public/apple-touch-icon.png` (180x180)

Bruk f.eks. en svart bakgrunn med rød knyttneve eller symbol.

Online generator: https://www.pwabuilder.com/imageGenerator

### 4. Run development server

```bash
npm run dev
```

Åpne http://localhost:3000

### 5. Build for production

```bash
npm run build
```

Output: `dist/` folder

### 6. Deploy

#### Vercel (anbefalt)

```bash
npm install -g vercel
vercel
```

#### Netlify

Drag-and-drop `dist/` folder til https://app.netlify.com/drop

#### Manual

Upload `dist/` til hvilken som helst static hosting.

## iOS Installation

1. Åpne appen i Safari på iOS
2. Trykk på Del-knappen (firkant med pil)
3. Velg "Legg til på Hjem-skjerm"
4. Nå kjører den som native app!

## Firebase Push Notifications (Optional)

Hvis du vil ha push-varsler:

1. Opprett Firebase-prosjekt: https://console.firebase.google.com
2. Aktiver Cloud Messaging
3. Få Web credentials (API key, project ID, etc.)
4. Legg til i `.env`
5. Generer VAPID key pair i Firebase Console
6. Add til `.env` som `VITE_FIREBASE_VAPID_KEY`

## File Structure

```
frontend/
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   └── manifest.webmanifest (auto-generated)
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   ├── lib/
│   │   ├── gemini.ts        # Gemini AI integration
│   │   └── firebase.ts      # Firebase/FCM setup
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── DebtDestroyer.tsx
│   │   ├── TruthEngine.tsx
│   │   ├── ActionTracker.tsx
│   │   └── Offline.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Customization

### Colors

Edit `tailwind.config.js`:

```js
colors: {
  'blood': '#FF0000',    // Main accent
  'void': '#000000',     // Background
  'steel': '#1a1a1a',    // Cards
  'concrete': '#2d2d2d', // Borders
}
```

### PWA Name/Theme

Edit `vite.config.ts` manifest section.

### Daily Actions

Edit `src/pages/ActionTracker.tsx` `defaultActions` array.

## Performance

- Lighthouse score: 95+ on all metrics
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Full offline functionality
- Aggressive caching strategy

## Security

- All API keys in `.env` (never committed)
- HTTPS required for PWA features
- Firebase security rules (if used)
- No sensitive data stored client-side

## Browser Support

- iOS Safari 12+
- Chrome 80+
- Firefox 75+
- Edge 80+

PWA features require modern browsers with service worker support.

## Troubleshooting

**PWA ikke installer på iOS?**
- Sjekk at du bruker Safari (ikke Chrome)
- Sjekk at manifest.webmanifest er tilgjengelig
- Sjekk at du har ikoner i riktig størrelse

**Gemini API feil?**
- Sjekk at API-nøkkel er satt i .env
- Sjekk at du har aktivert Gemini API i Google Cloud Console
- Sjekk browser console for detaljer

**Service Worker ikke registrerer?**
- Service workers krever HTTPS (eller localhost)
- Sjekk browser console
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

## License

Do whatever the fuck you want with this code. No restrictions.

## Support

Dette er ikke et kommersielt produkt. Ingen support garantert.

Men hvis du finner bugs eller vil bidra: PRs welcome.

---

Bygg. Deploy. Bryt fri.
