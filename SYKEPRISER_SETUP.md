# 💣 SykePriser.app - Full Oppsettsguide

## 🎯 Hva er dette?

SykePriser.app er en fullstendig fungerende Progressive Web App (PWA) som lar norske forbrukere crowdsource og rapportere høye matvarepriser fra Rema 1000, Coop, Kiwi og andre kjeder.

**Funksjonalitet:**
- ✅ Ta bilde av hylleetiketter
- ✅ Rapporter vare, pris, butikk og sted
- ✅ Se alle rapporter i sanntid
- ✅ Installerbar på iOS (Safari) og Android
- ✅ Offline-støtte via service worker
- ✅ Gratis hosting på Vercel/Netlify
- ✅ Gratis backend med Supabase (Postgres)

---

## 🚀 Trinn-for-trinn oppsett

### 1️⃣ Sett opp Supabase (Gratis backend)

1. **Gå til [supabase.com](https://supabase.com)**
   - Lag en gratis konto
   - Klikk "New project"
   - Velg organisasjon, gi prosjektet et navn (f.eks. "sykepriser")
   - Velg region (helst Frankfurt/EU for raskere respons i Norge)
   - Sett et sterkt database-passord (lagre det!)
   - Klikk "Create new project" (tar 1-2 min)

2. **Opprett database-tabell:**
   - Gå til "Table Editor" i venstre meny
   - Klikk "New table"
   - Navn: `reports`
   - Klikk "Add column" og legg til disse kolonnene:

   | Navn       | Type      | Default                | Nullable | Unique |
   |------------|-----------|------------------------|----------|--------|
   | id         | uuid      | gen_random_uuid()      | No       | Yes    |
   | created_at | timestamp | now()                  | No       | No     |
   | product    | text      | -                      | No       | No     |
   | price      | numeric   | -                      | No       | No     |
   | store      | text      | -                      | No       | No     |
   | location   | text      | -                      | Yes      | No     |
   | image_url  | text      | -                      | Yes      | No     |
   | approved   | boolean   | true                   | No       | No     |

   - Klikk "Save"

3. **Aktiver Storage for bilder:**
   - Gå til "Storage" i venstre meny
   - Klikk "Create a new bucket"
   - Navn: `prices`
   - Velg "Public bucket" (så bildene kan vises)
   - Klikk "Create bucket"

4. **Sett opp Row Level Security (RLS) - VIKTIG:**

   Gå til "SQL Editor" og kjør dette:

   ```sql
   -- Tillat alle å lese godkjente rapporter
   CREATE POLICY "Alle kan lese godkjente rapporter"
   ON reports FOR SELECT
   USING (approved = true);

   -- Tillat alle å sende inn rapporter
   CREATE POLICY "Alle kan sende inn rapporter"
   ON reports FOR INSERT
   WITH CHECK (true);

   -- Aktiver RLS
   ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

   -- Tillat alle å lese bilder fra prices bucket
   CREATE POLICY "Alle kan lese bilder"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'prices');

   -- Tillat alle å laste opp bilder
   CREATE POLICY "Alle kan laste opp bilder"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'prices');
   ```

5. **Hent API-nøkler:**
   - Gå til "Settings" → "API"
   - Kopier disse to verdiene:
     - **Project URL** (f.eks. `https://abcdefg.supabase.co`)
     - **anon/public key** (lang streng som starter med `eyJ...`)

---

### 2️⃣ Konfigurer appen med dine Supabase-nøkler

Åpne `public/script.js` og erstatt disse linjene øverst:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'; // ← ENDRE DETTE
const SUPABASE_KEY = 'your-anon-key-here';              // ← ENDRE DETTE
```

Med dine faktiske verdier fra Supabase.

---

### 3️⃣ Lag app-ikoner (192x192 og 512x512 PNG)

Du har tre alternativer:

**Alternativ A: Bruk online SVG-til-PNG konverter**
1. Gå til [cloudconvert.com/svg-to-png](https://cloudconvert.com/svg-to-png)
2. Last opp `public/icon.svg`
3. Konverter til 192x192 PNG → lagre som `public/icon.png`
4. Konverter til 512x512 PNG → lagre som `public/icon-512.png`

**Alternativ B: Bruk Canva/Figma**
1. Lag et design med:
   - Rød bakgrunn (#cc0000)
   - Hvit tekst/symboler
   - Pris-tema (💣 bomb-emoji, pris-tag, osv.)
2. Eksporter som 192x192 PNG og 512x512 PNG

**Alternativ C: Bruk ImageMagick (hvis installert)**
```bash
cd public
convert icon.svg -resize 192x192 icon.png
convert icon.svg -resize 512x512 icon-512.png
```

---

### 4️⃣ Deploy til Vercel (anbefalt - gratis og superenkelt)

**Metode 1: Via Vercel CLI (raskest)**

```bash
# Installer Vercel CLI globalt
npm install -g vercel

# Gå til prosjektmappen
cd /home/user/Tet

# Deploy
vercel --prod

# Følg instruksjonene:
# - Login med GitHub/email
# - Velg "public" som root directory
# - Godta standardinnstillinger
```

**Metode 2: Via Vercel Dashboard (enklest)**

1. Gå til [vercel.com](https://vercel.com)
2. Logg inn med GitHub
3. Klikk "Add New" → "Project"
4. Import dette GitHub-repoet
5. Under "Build & Development Settings":
   - **Root Directory:** `public`
   - La resten være standard
6. Klikk "Deploy"

Ferdig! Appen er live på `https://ditt-prosjekt.vercel.app` 🎉

---

### 5️⃣ Deploy til Netlify (alternativ)

**Metode: Drag-and-drop (superenkelt)**

1. Zip `public`-mappen:
   ```bash
   cd /home/user/Tet
   zip -r public.zip public/
   ```
2. Gå til [netlify.com](https://netlify.com)
3. Logg inn
4. Dra `public.zip` til "Drag and drop" området
5. Ferdig! Live på `https://random-name.netlify.app`

---

## 📱 Installer PWA på iOS

1. Åpne appen i Safari
2. Trykk på "Del"-knappen (firkant med pil opp)
3. Scroll ned og velg "Legg til på Hjem-skjerm"
4. Gi den et navn (f.eks. "SykePriser")
5. Trykk "Legg til"

Appen fungerer nå som en nativ app! 🚀

---

## 🎨 Tilpass designet

- **Farger:** Endre i `public/style.css` (søk etter `#c00`, `#f00`, osv.)
- **Tekst:** Endre i `public/index.html`
- **Butikker:** Legg til flere i `<select id="store">` i `index.html`

---

## 🔥 Neste steg (valgfritt)

1. **Moderering:** Legg til admin-panel for å godkjenne/avvise rapporter
2. **Kart:** Integrer Google Maps for å vise rapporter geografisk
3. **Statistikk:** Vis gjennomsnittspriser per butikk/vare
4. **Eksport:** Legg til "Last ned som PDF" funksjon
5. **Push-varsler:** Varsle brukere om nye syke priser i deres område

---

## 🛠 Feilsøking

**Problem: Bildeopplasting feiler**
- Sjekk at du har opprettet `prices` bucket i Supabase Storage
- Sjekk at bucketen er satt til "public"
- Sjekk at RLS-policies er korrekte

**Problem: Ingen rapporter vises**
- Sjekk at du har lagt til Supabase-nøkler i `script.js`
- Åpne browser console (F12) og se etter feilmeldinger
- Sjekk at `reports`-tabellen eksisterer i Supabase

**Problem: PWA installeres ikke på iOS**
- Sjekk at `icon.png` finnes og er 192x192
- Åpne appen i Safari (ikke Chrome/Firefox)
- Sjekk at `manifest.json` er riktig konfigurert

---

## 📊 Database-schema (referanse)

```sql
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    product TEXT NOT NULL,
    price NUMERIC NOT NULL,
    store TEXT NOT NULL,
    location TEXT,
    image_url TEXT,
    approved BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_approved ON reports(approved);
```

---

## 💰 Kostnader

**Helt gratis med:**
- Supabase Free Tier: 500 MB database, 1 GB storage, 2 GB bandwidth/måned
- Vercel Hobby: Unlimited bandwidth, 100 GB/måned
- Netlify Free: 100 GB bandwidth/måned

Dette holder lett for tusenvis av rapporter! 🚀

---

## 📄 Lisens

Dette er åpen kildekode. Bruk, modifiser og deploy fritt. Knus kjedene! 💣
