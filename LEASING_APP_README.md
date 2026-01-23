# 🤖 AI Leasing App - Genial Micro App

En intelligent leasing-applikasjon hvor AI gjør de beste valgene for deg!

## 🌟 Oversikt

AI Leasing App er en fullstack micro-applikasjon som bruker kunstig intelligens til å analysere brukerens behov og preferanser, og anbefaler de optimale leasingalternativene. Systemet vurderer budsjett, prioriteringer, bruksmønster og spesifikke funksjoner for å gi personaliserte, datadrevne anbefalinger.

## ✨ Hovedfunksjoner

### 🎯 AI-Drevet Anbefaling
- **Smart matching-algoritme**: Analyserer flere dimensjoner (budsjett, funksjoner, prioriteringer, verdi)
- **Vektet scoring**: Kombinerer ulike faktorer med tilpassede vekter
- **Detaljert begrunnelse**: Forklarer hvorfor hver anbefaling passer for deg
- **Fordeler/ulemper-analyse**: Transparente AI-beslutninger

### 📊 Kategorier
- **Biler** 🚗: Elektriske og hybride kjøretøy
- **Leiligheter** 🏠: Urbane og moderne boliger
- **Elektronikk** 💻: Laptops, telefoner og enheter
- **Utstyr** 🔧: Verktøy og spesialutstyr

### 💡 Intelligente Preferanser
Brukere kan angi:
- Budsjettområde (min/maks månedsleie)
- Foretrukket leieperiode (6-48 måneder)
- Bruksmønster (daglig pendling, familie, arbeid, etc.)
- Prioriteringer (miljøvennlig, luksus, prisbevisst)
- Obligatoriske og ønskede funksjoner

### 📈 Personlig Dashboard
- Oversikt over aktive leasingavtaler
- Fremdriftsvisualisering av hver avtale
- Total månedlig kostnad
- Dager igjen på hver kontrakt

## 🏗️ Arkitektur

### Backend (TypeScript/Express)
```
backend/
├── src/
│   ├── server.ts                          # Express server
│   ├── routes/
│   │   ├── auth.ts                        # Autentisering
│   │   └── leasing.ts                     # Leasing API
│   └── services/
│       └── aiRecommendationEngine.ts      # AI-motor
├── package.json
└── tsconfig.json
```

### Frontend (React/Next.js)
```
frontend/
└── src/
    └── pages/
        └── leasing/
            ├── index.tsx              # Hovedside med kategorier
            ├── browse.tsx             # Bla gjennom produkter + preferanser
            ├── recommendations.tsx    # AI-anbefalinger
            └── dashboard.tsx          # Mine leasingavtaler
```

### Database
```
migrations/
└── 002_create_leasing_system.sql
```

## 🧠 AI Recommendation Engine

### Scoring-Dimensjoner

1. **Budget Fit (25% vekt)**
   - Sjekker om prisen er innenfor brukerens budsjett
   - Favoriserer produkter nær midtpunktet av budsjettområdet
   - Straffer produkter som er for langt unna idealprisen

2. **Feature Match (25% vekt)**
   - Må-ha funksjoner er obligatoriske (0 poeng hvis mangler)
   - Bonus for hver nice-to-have funksjon som matches
   - Sjekker både boolean og numeriske spesifikasjoner

3. **Priority Alignment (20% vekt)**
   - Matcher produktspesifikasjoner mot brukerprioriteringer
   - Vekter: eco_friendly, luxury, cost_effective, etc.
   - Skalerer verdier til 0-100 poeng

4. **Value Score (15% vekt)**
   - Rating/anmeldelser (maks 40 poeng)
   - Priseffektivitet innenfor budsjett (maks 30 poeng)
   - Spesifikasjonsrikdom (maks 30 poeng)

5. **Duration Compatibility (15% vekt)**
   - Perfekt match hvis foretrukket varighet er innenfor produktets min/maks
   - Gradvis reduksjon for avvik

### Overall Score
```
Overall = (BudgetFit × 0.25) + (FeatureMatch × 0.25) +
          (PriorityAlign × 0.20) + (ValueScore × 0.15) +
          (DurationCompat × 0.15)
```

### Reasoning Generation
AI-motoren genererer:
- **Sammendrag**: En setning som oppsummerer hvorfor produktet anbefales
- **Fordeler**: Liste over styrker basert på scoring
- **Ulemper**: Potensielle svakheter eller avvik fra ønsker
- **Perfekt for**: Bruksscenarier hvor produktet excel

## 🔌 API Endpoints

### Leasing API (`/api/leasing`)

#### `GET /categories`
Hent alle leasingkategorier
```json
[
  {
    "id": "uuid",
    "name": "Biler",
    "description": "Personbiler og elektriske kjøretøy",
    "icon": "🚗"
  }
]
```

#### `GET /items?category={id}`
Hent produkter i en kategori
```json
[
  {
    "id": "uuid",
    "name": "Tesla Model 3 Long Range",
    "monthly_price": 6500,
    "deposit": 25000,
    "specifications": { "range_km": 614, ... },
    "rating": 4.8,
    "available": true
  }
]
```

#### `POST /preferences` (autentisert)
Opprett/oppdater brukerpreferanser
```json
{
  "category_id": "uuid",
  "budget_min": 3000,
  "budget_max": 8000,
  "preferred_duration": 24,
  "priorities": {
    "eco_friendly": 9,
    "luxury": 6,
    "cost_effective": 7
  },
  "usage_pattern": "daglig pendling",
  "must_have_features": ["autopilot"],
  "nice_to_have_features": ["luxury_interior"]
}
```

#### `POST /recommendations` (autentisert)
Få AI-anbefalinger
```json
{
  "preference_id": "uuid"
}
```

Response:
```json
[
  {
    "id": "uuid",
    "score": 92.5,
    "reasoning": {
      "summary": "Tesla Model 3 er et fantastisk valg...",
      "pros": ["Perfekt pris innenfor budsjettet...", ...],
      "cons": [],
      "perfect_for": ["miljøbevisste brukere", ...]
    },
    "match_details": {
      "budget_fit": 95,
      "feature_match": 100,
      "priority_alignment": 88,
      "value_score": 85,
      "overall_fit": 92.5
    },
    "item": { ... }
  }
]
```

#### `POST /contracts` (autentisert)
Opprett leasingavtale
```json
{
  "item_id": "uuid",
  "recommendation_id": "uuid",
  "duration_months": 24,
  "start_date": "2026-01-23"
}
```

#### `GET /contracts` (autentisert)
Hent brukerens leasingavtaler

## 🚀 Kom i gang

### Forutsetninger
- Node.js 18+
- PostgreSQL (for produksjon)
- npm eller yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

Server kjører på `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend kjører på `http://localhost:3000`

### Database Setup (Produksjon)
```bash
psql -U postgres -d leasing_db -f migrations/001_create_users.sql
psql -U postgres -d leasing_db -f migrations/002_create_leasing_system.sql
```

**NB**: Backend bruker i prototypen in-memory storage for rask utvikling, men databaseskjemaet er klart for produksjon.

## 🎨 UI/UX

### Design Principles
- **Gradient tema**: Lilla/blå gradienter (#667eea til #764ba2)
- **Card-basert layout**: Moderne, responsive kort
- **Visuell feedback**: Fremdriftsbalker, scores, badges
- **Transparent AI**: Viser detaljert begrunnelse og matching-detaljer
- **Mobilvennlig**: Responsive grid layouts

### Key Pages

1. **Landing Page** (`/leasing`)
   - Hero seksjon med 4-stegs prosess
   - Kategorikort med ikoner
   - Link til dashboard

2. **Browse Page** (`/leasing/browse`)
   - Produktgalleri
   - Utvidbar preferansepanel
   - AI-anbefalingsknapp

3. **Recommendations Page** (`/leasing/recommendations`)
   - Rangerte anbefalinger med badges (#1, #2, etc.)
   - AI-analyse med sammendrag, fordeler, ulemper
   - Detaljerte matching-balker (budget, funksjoner, prioriteringer, verdi)
   - "Start leasing"-knapp

4. **Dashboard** (`/leasing/dashboard`)
   - Sammendragskort (avtaler, total kostnad, depositum)
   - Avtalekort med fremdriftsvisualisering
   - Dager igjen på hver avtale
   - Spesifikasjoner for hvert produkt

## 🔒 Sikkerhet

- JWT-basert autentisering
- HttpOnly cookies for sessions
- Bcrypt password hashing
- CORS konfigurert for frontend/backend separasjon
- Input validering på alle endpoints

## 📱 Sample Data

Systemet kommer forhåndsinitialisert med:
- 4 kategorier
- 6 leasingprodukter:
  - Tesla Model 3 Long Range
  - Toyota Yaris Hybrid
  - BMW iX3
  - MacBook Pro 16" M3 Max
  - Dell XPS 13
  - Moderne 2-roms i Grünerløkka

## 🧪 Testing

Test den komplette flyten:
1. Gå til `/leasing`
2. Velg en kategori (f.eks. Biler 🚗)
3. Klikk "🤖 Få AI-anbefalinger"
4. Sett dine preferanser:
   - Budsjett: kr 5000-8000/mnd
   - Varighet: 24 måneder
   - Prioriteringer: Miljøvennlig=9, Luksus=6, Prisbevisst=7
5. Klikk "Se AI-anbefalinger"
6. Se rangerte anbefalinger med detaljert AI-analyse
7. Klikk "Start leasing" på et produkt
8. Gå til Dashboard for å se din nye avtale

## 🎯 Future Enhancements

- **Sammenligning**: Side-ved-side produktsammenligning
- **Varsler**: E-post/push når avtaler nærmer seg slutt
- **Ratingssystem**: La brukere rate produkter etter leasing
- **Favoritter**: Lagre produkter for senere
- **Kalkulatorer**: Total kostnad over tid, sammenligning med kjøp
- **AI Chat**: Konversasjonsbasert anbefaling
- **Bildeupload**: Produktbilder
- **Søk og filtrering**: Avansert produktsøk
- **Admin panel**: Legg til/rediger produkter
- **Integrasjoner**: Betalingstjenester, CRM

## 🏆 Hvorfor denne appen er genial

1. **AI-drevet beslutningstaking**: Ikke bare filter og sortering - faktisk intelligent matching
2. **Transparent AI**: Brukere ser nøyaktig hvorfor AI anbefaler hvert produkt
3. **Multi-dimensjonal scoring**: Vurderer budsjett, funksjoner, prioriteringer, verdi samtidig
4. **Personalisert**: Tilpasser seg hver brukers unike behov og preferanser
5. **Visuelt tiltalende**: Moderne UI med gradienter, badges, og fremdriftsvisualiseringer
6. **Fullstack**: Complete solution fra database til frontend
7. **Type-safe**: TypeScript i hele stacken
8. **Skalerbar**: Klar for produksjon med PostgreSQL-migrasjoner

## 📄 Lisens

MIT

## 👨‍💻 Utviklet med

- TypeScript
- Express.js
- React
- Next.js
- PostgreSQL
- JWT
- Bcrypt

---

**La AI-en finne det perfekte valget for deg!** 🤖✨
