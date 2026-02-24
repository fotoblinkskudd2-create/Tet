# NestEgg — AI Pensjonsplanlegging for Alle

> **Domeneforslag:** nestegg.app, mynestegg.com  
> **Tagline:** «Din pensjon. Ditt ansvar. Vår hjelp.»  
> **Elevator Pitch:** NestEgg gjør pensjonsplanlegging tilgjengelig for alle gjennom AI-drevet beregning av pensjonsgap, personlige spareplaner, automatisk investering, og visualisering av fremtiden — slik at 64% av verdens befolkning faktisk kan forberede seg til pensjon.

---

## 1. Toppopplysninger

### Problemkort

| Felt | Detalj |
|------|--------|
| **Problem** | 64% av verdens befolkning sparer ikke nok til pensjon. Globalt pensjonsgap: $400T innen 2050. De fleste vet ikke hva de trenger, og utsetter handling. |
| **Hvem rammes** | Alle yrkesaktive 25–65, spesielt: freelancere/selvstendig (ingen arbeidsgiver-pensjon), millennials/Gen Z, lavtlønte, kvinner (lever lenger, sparer mindre) |
| **Omfang** | $400T globalt pensjonsgap (WEF). 50% av amerikanere har $0 i pensjonssp. I Norge: 1/3 får «pensjonssjokk». Gig-økonomien gjør det verre. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
- Pensjonskalkulator: «Hva trenger du?» basert på levekostnader, alder, land
- Gap-analyse: Visuell fremstilling av hva du har vs. hva du trenger
- Automatisk spareplan med rundering og schedult overføring
- Investeringsforslag (risikoprofilbasert, index-ETF)
- Push-varsler og milepæler («Du har spart 10% av målet!»)

**Nice-to-have:**
- Koble eksisterende pensjonskonto (NAV/folketrygd, 401k, ISA)
- «Fremtids-deg» visualisering (AR-bilde av deg ved pensjonsalder)
- Social: anonyme sammenligninger med jevnaldrende
- Arbeidsgiver-modul (matche ansatte-bidrag)
- Pensjonssimulator: «Hva om du pensjonerer deg 2 år tidlig?»

### Brukerpersonaer

**Persona 1: Lisa (32, Oslo)**
- Designer, freelancer, ingen innskuddspensjon fra arbeidsgiver
- Mål: Forstå hva hun trenger, starte automatisk sparing
- Smertepunkt: Pensjon føles abstrakt og langt unna

**Persona 2: Marcus (48, Berlin)**
- Fast jobb, har noe i bedriftspensjon, usikker om det er nok
- Mål: Se gap mellom nåværende og nødvendig sparing
- Smertepunkt: Komplisert system, flere pensjonskontoer

**Persona 3: Aisha (26, New York)**
- Første jobb, $55K/år, studielån, ingen 401k ennå
- Mål: Komme i gang uten at det «gjør vondt»
- Smertepunkt: Føler hun ikke tjener nok til å spare

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | NestEgg-differensiering |
|-----------|--------|---------|------------------------|
| Betterment/Wealthfront | God auto-investering | Kun USA, ingen pensjonsspesifikt fokus | Globalt, 100% pensjonsfokus, pedagogisk |
| Pensjonista (Norge) | Lokal tilpasning | Kun kalkulator, ingen handlingsverktøy | Kalkulator + investering + coaching |
| PensionBee (UK) | Konsolidering av pensjoner | Kun UK, dyr | Globalt, billigere, AI-drevet |

---

## 3. Tekniske Spesifikasjoner

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI, Charts framework, WidgetKit |
| Web | Next.js 14, React 18, TypeScript, TailwindCSS, D3.js |
| Backend | Node.js, TypeScript, Express, Prisma |
| Database | PostgreSQL, Redis |
| AI | OpenAI (pensjonscoach), egne beregningsmodeller |
| Investering | Alpaca API (US), Interactive Brokers API (global) |
| Auth | Clerk |
| Betaling | Stripe |
| Hosting | Vercel + AWS |

### API-Design

```
GET    /pension/calculate      → Beregn pensjonsbehov
POST   /pension/gap-analysis   → Visuell gap-analyse
GET    /pension/projections    → Fremtidsscenarier

POST   /savings/plan           → Opprett spareplan
PUT    /savings/plan/:id       → Oppdater spareplan
POST   /savings/auto-invest    → Sett opp automatisk investering

GET    /portfolio              → Hent investeringsportefølje
GET    /portfolio/performance  → Avkastningshistorikk

POST   /coach/ask              → Spør AI-pensjonscoach
```

### Datamodeller

```
pension_profiles
├── id (UUID, PK)
├── user_id (UUID, FK)
├── current_age (INT)
├── target_retirement_age (INT)
├── current_savings (DECIMAL)
├── monthly_income (DECIMAL)
├── monthly_expenses (DECIMAL)
├── risk_tolerance (ENUM: conservative, moderate, aggressive)
├── country (VARCHAR)
├── existing_pension_annual (DECIMAL) — folketrygd, 401k, etc.
└── created_at (TIMESTAMP)

savings_plans
├── id (UUID, PK)
├── user_id (UUID, FK)
├── monthly_amount (DECIMAL)
├── auto_invest (BOOLEAN)
├── investment_strategy (ENUM: conservative, balanced, growth)
├── target_total (DECIMAL)
├── current_total (DECIMAL)
└── status (ENUM: active, paused)

investments
├── id (UUID, PK)
├── user_id (UUID, FK)
├── asset (VARCHAR) — VWRL, SPY, etc.
├── shares (DECIMAL)
├── avg_cost (DECIMAL)
├── current_value (DECIMAL)
└── purchased_at (TIMESTAMP)
```

---

## 4. Implementasjon

### MVP (10 uker, 3 utviklere)

| Sprint | Uke | Oppgaver |
|--------|-----|----------|
| 1 | 1–2 | Auth, pensjonsprofil, kalkulator-motor |
| 2 | 3–4 | Gap-analyse visualisering, scenarier |
| 3 | 5–7 | Spareplan, automatisk overføring, investeringskobling |
| 4 | 8–9 | AI-coach, push-varsler, milepæler |
| 5 | 10 | iOS app, testing, App Store |

### Estimater

| Scenario | Tid | Kostnad |
|----------|-----|---------|
| **Lean** | 10 uker | $50,000–75,000 |
| **Standard** | 16 uker | $180,000–280,000 |
| **Full** | 24 uker | $400,000–600,000 |

---

## 5–10. Kode, Design, Go-to-Market, Juridisk, Drift, Salgspakke

### Forretningsmodell
- **Free:** Pensjonskalkulator, gap-analyse, grunnleggende coach
- **Pro ($7.99/mnd):** Auto-investering, avanserte scenarier, porteføljeovervåking
- **Advisor ($14.99/mnd):** Dedikert AI-coach, skatteoptimalisering, konsolidering

### Investor One-Pager
```
NESTEGG — Investor One-Pager

Problem:  $400T globalt pensjonsgap, 64% sparer ikke nok
Løsning:  AI-drevet pensjonsplanlegging + auto-investering
Marked:   TAM $30B (robo-advisory + pension tech)
Modell:   Freemium $8/mnd + AUM 0.25%/år
Mål:      300K brukere, $5M ARR innen 18 mnd
Funding:  $1M seed (krav: investeringslisens)
```

Se medfølgende kodefiler for iOS, web og backend implementasjoner.
