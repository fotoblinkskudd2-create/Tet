# 💣 SykePriser.app

En crowdsourced Progressive Web App for å rapportere og eksponere høye matvarepriser fra norske dagligvarekjeder.

## 🚀 Kom i gang

Se [SYKEPRISER_SETUP.md](../SYKEPRISER_SETUP.md) for full oppsettsguide.

## ⚡ Quick Start

1. **Sett opp Supabase:**
   - Lag gratis prosjekt på [supabase.com](https://supabase.com)
   - Opprett `reports` tabell (se setup-guide)
   - Opprett `prices` storage bucket
   - Kopier API URL og anon key

2. **Konfigurer:**
   - Åpne `script.js`
   - Erstatt `SUPABASE_URL` og `SUPABASE_KEY`

3. **Deploy:**
   ```bash
   vercel --prod
   # eller
   netlify deploy --prod --dir=.
   ```

## 📁 Filer

- `index.html` - Hovedside med skjema og feed
- `style.css` - Mobilvennlig styling
- `script.js` - Supabase-integrasjon og logikk
- `manifest.json` - PWA-konfigurasjon
- `sw.js` - Service worker for offline-støtte
- `icon.svg` - SVG-ikon (konverter til PNG)

## 🎯 Funksjoner

✅ Rapporter pris med bilde
✅ Sanntids feed av alle rapporter
✅ Installerbar på iOS og Android
✅ Offline-støtte
✅ Ingen login påkrevd
✅ 100% gratis hosting

## 🛠 Teknologi

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Supabase (Postgres + Storage)
- **Hosting:** Vercel / Netlify
- **PWA:** Service Worker, Web Manifest

## 📱 iOS-installasjon

1. Åpn i Safari
2. Trykk Del-knappen
3. "Legg til på Hjem-skjerm"
4. Ferdig! 🎉

---

**Knus kjedene. Eksponér prissamarbeidet. Folket slår tilbake.** 💣
