# 🔥 Gonzo Story Generator - Uendelig rå historie-maskin

En web-app der du skriver inn 3 stikkord og får generert rå gonzo-historier i Hunter S. Thompson-stil. Fullt eksplisitt, ingen sensur - ren Hunter S. Thompson galskap.

## 🎯 Funksjoner

- **Generer nye historier**: Skriv inn 3 stikkord (f.eks. "speed, kannibal, Tromsø") og få en rå gonzo-historie
- **Mer galskap**: Fortsett historien med samme intensitet
- **Ny vri**: Ta historien i en helt ny, gal retning
- **Del som PDF**: Eksporter hele historien til PDF-format

## 🚀 Oppsett

### Backend (Flask + Claude API)

1. Installer Python-avhengigheter:
```bash
pip install -r requirements-gonzo.txt
```

2. Sett opp Anthropic API-nøkkel:
```bash
export ANTHROPIC_API_KEY='din-api-nøkkel-her'
```

3. Start backend-serveren:
```bash
python gonzo_app.py
```

Backend kjører på `http://localhost:5000`

### Frontend (Next.js/React)

1. Gå til frontend-mappen:
```bash
cd frontend
```

2. Installer avhengigheter (hvis ikke allerede gjort):
```bash
npm install
# eller
yarn install
```

3. Sett miljøvariabel for API URL (valgfritt):
```bash
export NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Start frontend:
```bash
npm run dev
# eller
yarn dev
```

5. Åpne nettleseren på:
```
http://localhost:3000/gonzo
```

## 📖 Bruk

1. **Skriv inn 3 stikkord** som basis for historien
2. **Klikk "GENERER GONZO HISTORIE"** - Claude genererer første del
3. **Mer galskap**: Fortsett historien med samme intensitet
4. **Ny vri**: Introduser en absurd, uventet vending
5. **Del som PDF**: Last ned hele historien som PDF
6. **Ny historie**: Start på nytt med nye stikkord

## ⚡ Stil og Tone

Historiene genereres i ekte Hunter S. Thompson gonzo-stil:
- Rå, eksplisitt språk - INGEN SENSUR
- Blanding av fakta, fiksjon og hallusinasjoner
- Paranoide observasjoner
- Absurde sammenligninger
- Referanser til dop, frykt, galskap og kaos
- Skrevet på norsk med gonzo-intensitet

## 🛠️ Teknisk Stack

**Backend:**
- Flask (Python web framework)
- Anthropic Claude API (Sonnet 4.5 - latest model)
- ReportLab (PDF-generering)
- CORS support for frontend-kommunikasjon

**Frontend:**
- Next.js / React
- TypeScript
- Responsive design med gonzo-estetikk

## 📋 API Endepunkter

### POST `/api/gonzo/generate`
Generer ny historie eller fortsett eksisterende

**Body for ny historie:**
```json
{
  "keywords": ["speed", "kannibal", "Tromsø"],
  "action": "new"
}
```

**Body for å fortsette:**
```json
{
  "session_id": "20231225120000000000",
  "action": "continue"
}
```

**Body for ny vri:**
```json
{
  "session_id": "20231225120000000000",
  "action": "twist"
}
```

### GET `/api/gonzo/pdf/<session_id>`
Last ned historien som PDF

### GET `/api/gonzo/session/<session_id>`
Hent full historie fra sesjon

### GET `/health`
Health check

## ⚠️ Viktige Notater

1. **API-nøkkel påkrevd**: Du må ha en gyldig Anthropic API-nøkkel
2. **Eksplisitt innhold**: Gonzo-historier kan inneholde eksplisitt språk og voksent innhold
3. **Ingen sensur**: Claude er instruert til å generere ufiltrert gonzo-innhold
4. **Sesjon-lagring**: Historier lagres i minnet (går tapt ved server-restart)

## 🎨 Eksempel-stikkord

Prøv disse kombinasjonene for maksimal galskap:

- "whiskey, politiker, polarsirkel"
- "fear, loathing, Bergen"
- "casino, havfruer, Svalbard"
- "motorsykkel, kjøttboller, midnight sun"
- "ether, vikinger, Oslo"

## 📝 Utviklingsnotater

- Historier genereres med Claude Sonnet 4.5 (latest model)
- PDF-er genereres med ReportLab
- Frontend bruker moderne React hooks
- Real-time story continuation
- Session-basert historie-tracking

## 🔮 Fremtidige Forbedringer

- Database-lagring av historier
- Bruker-autentisering og historie-bibliotek
- Del-funksjon på sosiale medier
- Flere språk-alternativer
- Custom prompts for ulike gonzo-stiler
- Audio-generering av historiene

## 💀 Fear and Loathing Credits

> "We were somewhere around Tromsø on the edge of the polar circle when the drugs began to take hold..."

Inspirert av Hunter S. Thompson's gonzo journalism og Fear and Loathing in Las Vegas.

---

**Nyt galskapen! 🔥⚡🌪️**
