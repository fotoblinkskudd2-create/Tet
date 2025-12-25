# 🔥 PSYKOTISK POMODORO TIMER 🔥

En Pomodoro-timer med en psykotisk vri. Hver gang 25 minutter er over, genererer Claude AI en surrealistisk, forstyrrende oppmuntring eller filosofisk fornærmelse.

## 🎨 Features

- ⏱️ **25-minutters Pomodoro-økter** med nedtelling
- 🤖 **AI-genererte meldinger** fra Claude når økten er over
- 🌑 **Mørkt, glitchy design** med horror-estetikk
- 👁️ **Visuelle effekter**: Scan lines, static, flimmering, glitch-animasjoner
- 🔊 **Lyd-effekter** (krever egen lydfil)
- 📊 **Økt-telling** for å spore produktivitet

## 🚀 Setup

### 1. Installer avhengigheter

```bash
cd frontend
npm install
```

### 2. Sett opp miljøvariabler (valgfritt)

Hvis du vil bruke Claude API for AI-genererte meldinger, opprett en `.env.local` fil i `frontend/` mappen:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

**Uten API-nøkkel:** Timeren bruker forhåndsdefinerte psykotiske meldinger.

### 3. Legg til lydfil (valgfritt)

Plasser en disturbing/glitchy lydfil i:
```
frontend/public/sounds/disturbing.mp3
```

Foreslåtte kilder for lyd:
- [freesound.org](https://freesound.org) (søk etter "glitch", "horror", "disturbing")
- [zapsplat.com](https://zapsplat.com)
- YouTube Audio Library

**Uten lydfil:** Timeren vil fortsatt fungere, bare uten lyd.

### 4. Kjør utviklingsserveren

```bash
npm run dev
```

Åpne [http://localhost:3000/pomodoro](http://localhost:3000/pomodoro)

## 🎮 Hvordan bruke

1. Klikk **START** for å begynne en 25-minutters økt
2. Fokuser på arbeidet ditt
3. Når timeren når 00:00, vil skjermen glitche og vise en surrealistisk melding fra Claude
4. Klikk **PAUSE** for å pause, **RESET** for å starte på nytt

## 💀 Eksempel-meldinger

```
DU ER EN KJØTTSEKK SOM PUSTER FOR MYE – STÅ OPP OG KNUS VERDEN

TIDEN SMELTER RUNDT DEG SOM VAR. SKRIKER DU TILBAKE?

HJERNEN DIN ER EN FUKTIG DATAMASKIN SOM TRENGER DEFRAGMENTERING

DIN EKSISTENS ER EN GLITCH I MATRISENS KODE. FORTSETT Å DEBUGGE.

VIRKELIGHETEN SPRIKER. ARBEID VIDERE.
```

## 🛠️ Teknisk stack

- **Frontend**: Next.js + React + TypeScript
- **Styling**: CSS-in-JS (styled-jsx)
- **API**: Next.js API Routes
- **AI**: Claude 3.5 Sonnet via Anthropic API (valgfritt)

## 📁 Filstruktur

```
frontend/
├── src/pages/
│   ├── pomodoro.tsx           # Hovedkomponent
│   └── api/pomodoro/
│       └── message.ts         # API endpoint for meldinger
├── public/sounds/
│   └── disturbing.mp3         # Lydfil (må legges til manuelt)
├── package.json
├── next.config.js
└── tsconfig.json
```

## 🎨 Visuell design

Timeren har et dystopisk, cyberpunk-inspirert design med:
- Mørk bakgrunn (#000000)
- Neon rød tekst (#ff0000)
- CRT-skjerm effekter (scan lines, static)
- Glitch-animasjoner ved fullført økt
- Flimmering og RGB-shift effekter
- Monospace font (Courier New)

## ⚙️ Tilpasning

### Endre timer-lengde

I `frontend/src/pages/pomodoro.tsx`, linje 8:
```typescript
const [timeLeft, setTimeLeft] = useState(25 * 60); // Endre 25 til ønsket minutter
```

### Legge til egne meldinger

I `frontend/src/pages/api/pomodoro/message.ts`, rediger `PSYCHOTIC_MESSAGES` arrayet.

### Tilpasse design

Alle styles er i `pomodoro.tsx` filen under `<style jsx>` taggen. Endre farger, animasjoner, eller layout etter ønske.

## 🐛 Feilsøking

**Problem**: API returnerer alltid samme melding
**Løsning**: Sjekk at `ANTHROPIC_API_KEY` er satt korrekt i `.env.local`

**Problem**: Ingen lyd spilles av
**Løsning**: Sørg for at `disturbing.mp3` eksisterer i `frontend/public/sounds/`

**Problem**: Timeren teller ikke ned
**Løsning**: Sjekk at du har klikket START-knappen

## 📜 Lisens

Dette prosjektet er laget for moro skyld. Bruk på eget ansvar. 😈

---

**Advarsel**: Ikke bruk denne timeren hvis du er følsom for flimmering, horror-estetikk, eller eksistensiell angst. 🖤
