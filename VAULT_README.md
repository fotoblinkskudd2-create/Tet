# 🔮 Forbidden Knowledge Vault

En "hemmelig" web-applikasjon der brukeren må løse et puslespill for å låse opp tilgang til kontroversielt og utfordrende innhold. Svar presenteres med dramatisk UI inkludert kryptert-utseende font, advarsler og røde blinkende lys.

## ⚠️ Konsept

Forbidden Knowledge Vault er en tematisk web-app som gir brukere tilgang til informasjon om konspirasjonsteorier, okkultisme, ekstreme filosofier, og andre "forbudte" emner - men bare etter at de har løst et puslespill. Appen har en intens, dramatisk estetikk med:

- 🔴 Røde blinkende advarsellys
- ⚡ Glitch-effekter og animasjoner
- 🔐 Kryptert-utseende tekst og fonts
- 💀 Mørk, hacker-inspirert design
- ⚠️ Advarselsbanners og sikkerhetsmeldinger

## 🎯 Funksjoner

### 1. Puslespill-basert Låsesystem
- Brukere møter en landing page med et tilfeldig puslespill
- Puslespill-typer inkluderer:
  - **Caesar Cipher** - Dekrypter kodet melding
  - **Gåter** - Løs filosofiske/logiske gåter
  - **Matematikk** - Løs matematiske uttrykk
  - **Anagram** - Løs ord-puslespill

### 2. Kategorisert Innhold
- **Konspirasjoner** 🕵️ - Teorier som utfordrer det offisielle narrativet
- **Okkultisme** 🔮 - Skjulte mysterier og esoterisk kunnskap
- **Ekstreme Filosofier** 🧠 - Radikale tankesystemer og ideologier
- **Forbudt Vitenskap** ⚗️ - Eksperimenter og kunnskap samfunnet skjuler
- **Gamle Hemmeligheter** 📜 - Tapt kunnskap fra sivilisasjoner

### 3. Farenivå-system
Hver oppføring har et farenivå (1-5):
- **Nivå 1-2**: Lav risiko, moderat
- **Nivå 3**: Farlig
- **Nivå 4**: Meget farlig
- **Nivå 5**: Ekstremt farlig

### 4. Dramatisk UI/UX
- Røde blinkende lys som pulserer
- Scanline-effekter som i gamle CRT-monitorer
- Glitch-animasjoner på tekst
- Shake-effekt ved feil svar
- Dekrypteringsanimasjon når svar vises
- "Hacker terminal" estetikk

## 🏗️ Arkitektur

### Backend (Express.js + TypeScript)
```
backend/
├── src/
│   ├── server.ts          # Main Express server
│   └── routes/
│       ├── auth.ts        # Authentication routes
│       └── vault.ts       # Vault API endpoints
├── package.json
└── tsconfig.json
```

**API Endpoints:**
- `GET /api/vault/puzzle` - Hent tilfeldig puslespill
- `POST /api/vault/unlock` - Send inn løsning, få tilgangstoken
- `GET /api/vault/verify/:token` - Verifiser om token er gyldig
- `GET /api/vault/categories` - Hent alle kategorier (krever token)
- `GET /api/vault/entries` - Hent oppføringer (krever token)
- `GET /api/vault/entries/:id` - Hent enkelt oppføring (krever token)

### Frontend (Next.js + React + TypeScript)
```
frontend/
├── src/
│   └── pages/
│       ├── vault/
│       │   ├── index.tsx       # Landing page med puslespill
│       │   ├── main.tsx        # Hovedside med kategorier og oppføringer
│       │   └── entry/
│       │       └── [id].tsx    # Detaljer for enkelt oppføring
│       └── auth/
│           ├── login.tsx
│           └── signup.tsx
├── package.json
├── tsconfig.json
└── next.config.js
```

### Database (PostgreSQL)
```sql
vault_categories      # Kategorier for innhold
vault_entries         # Selve kunnskapsoppføringene
vault_access_log      # Logg over hvem som har sett hva
vault_unlock_sessions # Aktive opplåste sesjoner
```

## 🚀 Kom i gang

### Installasjon

1. **Backend:**
```bash
cd backend
npm install
npm run dev  # Kjører på port 3001
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev  # Kjører på port 3000
```

3. **Database:**
```bash
# Kjør migreringer i PostgreSQL
psql -d your_database < migrations/001_create_users.sql
psql -d your_database < migrations/002_create_vault.sql
```

### Miljøvariabler

**Backend (.env):**
```env
PORT=3001
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎮 Bruk

1. **Gå til vault-siden:** `http://localhost:3000/vault`
2. **Løs puslespillet:** Les spørsmålet, klikk "HINT" hvis du trenger det
3. **Skriv inn svaret:** Input ditt svar (store/små bokstaver spiller ingen rolle)
4. **Få tilgang:** Ved korrekt svar, får du en 24-timers tilgangstoken
5. **Utforsk hvelvet:** Bla gjennom kategorier og oppføringer
6. **Les innhold:** Klikk "SE SVAR" for å lese dekryptert innhold

## 🔐 Sikkerhet

- **Token-basert tilgang:** JWT-lignende tokens med 24-timers utløp
- **Session-lagring:** Tokens lagres i localStorage
- **Automatisk utlogging:** Tokens verifiseres på hver forespørsel
- **Ingen permanent tilgang:** Brukere må løse nytt puslespill etter 24 timer

## 🎨 Design-filosofi

Appen har et "dark web" / "hacker terminal" tema med:
- **Fargepalett:** Rødt (#ff0000) på sort bakgrunn
- **Font:** Monospace ('Courier New') for "terminal" følelse
- **Effekter:** CRT scanlines, glitch, pulserende lys
- **Tone:** Mystisk, farlig, forbudt - men ansvarlig

## ⚠️ Ansvarserklæring

Dette er en **tematisk/kunstnerisk** applikasjon laget for underholdning og utdannelse. Innholdet er:
- Kun til informasjons- og diskusjonsformål
- Ikke ment å fremme ulovlige aktiviteter
- Presentert med passende advarsler og kontekst
- Balansert og kritisk i sine fremstillinger

## 🛠️ Teknologier

- **Backend:** Express.js, TypeScript, JWT, bcrypt
- **Frontend:** Next.js, React, TypeScript
- **Database:** PostgreSQL
- **Styling:** Styled JSX (inline CSS-in-JS)
- **Animasjoner:** CSS keyframes

## 📝 Puslespill-løsninger (for testing)

- **Cipher:** `FORBIDDEN KNOWLEDGE AWAITS`
- **Gåte:** `KUNNSKAP`
- **Matematikk:** `123`
- **Anagram:** `KONSPIRASJON`

## 🔮 Fremtidige funksjoner

- [ ] AI-genererte svar via Claude API
- [ ] Bruker-innsendte spørsmål
- [ ] Mer avanserte puslespill (sudoku, logic gates, etc.)
- [ ] Social features (kommentarer, rating)
- [ ] Mørk/lys tema toggle (ironisk nok)
- [ ] Lydeffekter og bakgrunnsmusikk
- [ ] Flere språk (engelsk, tysk, etc.)

## 📜 Lisens

MIT License - Bruk fritt, men på eget ansvar!

---

**⚠️ Advarsel:** Denne appen handler om å utforske kontroversielle ideer på en ansvarlig måte. Alt innhold er kun til utdannelsesformål.
