# 🎵 Ultimate Vibe Playlist Curator

En AI-drevet playlist-generator som lager perfekte playlister basert på detaljerte vibe-beskrivelser.

## ✨ Funksjoner

- **AI-genererte playlister**: Beskriv din vibe i detalj, og få en kuratert playlist med 15-20 sanger
- **Omslagsbilde-beskrivelser**: Få en visuell beskrivelse som matcher stemningen
- **Gonzo-tekster**: Få en kreativ tekst i Hunter S. Thompson-stil som fanger essensen av viben
- **Fargepaletter**: Få 5 hex-farger som representerer stemningen, perfekt for telefon-bakgrunner
- **Lagring og deling**: Lagre dine vibes og del dem med andre
- **Eksport**: Last ned playlisten som en tekstfil

## 🚀 Kom i gang

### Forutsetninger

1. **Anthropic API-nøkkel**: Du trenger en API-nøkkel fra [Anthropic](https://console.anthropic.com/)

### Oppsett

1. **Sett miljøvariabel**:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

2. **Kjør database-migrering**:
   ```bash
   # Kjør migreringen for å opprette vibes-tabellen
   psql -U your_user -d your_database -f migrations/002_create_vibes.sql
   ```

3. **Start utviklingsserver**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Besøk appen**:
   - Åpne [http://localhost:3000/curator](http://localhost:3000/curator)

## 📖 Bruk

### 1. Beskriv din vibe

Gå til `/curator` og beskriv din vibe så detaljert som mulig. Jo mer spesifikk du er, jo bedre vil playlisten bli.

**Eksempler på gode vibe-beskrivelser:**

- "Kjørende gjennom regnvåt Oslo natt kl 03, full av speed og eksistensiell angst"
- "Morgensol gjennom vinduet, kaffe i hånden, alt føles mulig"
- "Alene på fjellet, vind i ansiktet, frihetsfølelse"
- "Nattklubb kl 02, svettig, forelsket, alt er kaos"
- "Søndagsdepresjon, regn mot vinduet, alt er meningsløst"

### 2. Generer playlisten

Klikk på "🎨 Generer Vibe" og vent mens AI-en lager din perfekte playlist.

### 3. Utforsk resultatet

Du får:
- ✅ En komplett playlist med sangtitler, artister og album
- ✅ En beskrivelse av et omslagsbilde
- ✅ En gonzo-tekst som fanger stemningen
- ✅ En fargepalett med 5 farger

### 4. Del eller eksporter

- **Del**: Kopier lenken og del med venner
- **Eksporter**: Last ned playlisten som en tekstfil

## 🏗️ Arkitektur

### Backend API Routes

- `POST /api/vibes/generate` - Generer ny vibe
- `GET /api/vibes` - Hent alle vibes for innlogget bruker
- `GET /api/vibes/:id` - Hent spesifikk vibe
- `DELETE /api/vibes/:id` - Slett vibe

### Frontend Pages

- `/curator` - Hovedside for å lage nye vibes
- `/curator/:id` - Vis en generert vibe
- `/curator/my-vibes` - Se alle lagrede vibes

### Database Schema

```sql
CREATE TABLE vibes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  vibe_description TEXT NOT NULL,
  playlist_data JSONB NOT NULL,
  cover_art_description TEXT,
  gonzo_text TEXT,
  color_palette JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

## 🎨 Fargepalett

Appen bruker et mørkt tema med gradient-aksenter:

- **Primær**: #6366f1 (Indigo)
- **Sekundær**: #ec4899 (Pink)
- **Bakgrunn**: #0f0f0f (Nesten svart)
- **Overflate**: #1a1a1a (Mørk grå)

## 🔧 Teknologi

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Next.js API Routes
- **AI**: Anthropic Claude 3.5 Sonnet
- **Database**: PostgreSQL
- **Styling**: CSS Modules

## 📝 Eksempel-respons fra AI

```json
{
  "id": "uuid-here",
  "userId": "user-uuid",
  "vibeDescription": "Kjørende gjennom regnvåt Oslo natt kl 03...",
  "playlistData": [
    {
      "title": "Nightcall",
      "artist": "Kavinsky",
      "album": "OutRun"
    },
    ...
  ],
  "coverArtDescription": "En neonlyst gate i Oslo, refleksjoner i våt asfalt...",
  "gonzoText": "Det er 03:00 og regnet pisker mot frontruten...",
  "colorPalette": ["#1a1a2e", "#0f3460", "#16213e", "#533483", "#e94560"],
  "createdAt": "2025-12-25T22:00:00.000Z"
}
```

## 🚧 Fremtidige funksjoner

- [ ] Integrasjon med Spotify API for å lage faktiske playlister
- [ ] Generere omslagsbilder med DALL-E eller Stable Diffusion
- [ ] Mulighet til å justere AI-genereringen (mer/mindre sanger, spesifikke sjangre, etc.)
- [ ] Sosiale funksjoner (like, kommentere, dele)
- [ ] Eksport til Apple Music, YouTube Music, etc.

## 📄 Lisens

MIT

## 👨‍💻 Utviklet med

❤️ og Claude AI
