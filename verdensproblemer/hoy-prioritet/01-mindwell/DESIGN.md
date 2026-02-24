# 01 — MindWell 🧠

> AI-drevet mental helse-hjelp tilgjengelig for alle, overalt, alltid.

---

## 1. Toppopplysninger

| Felt | Verdi |
|------|-------|
| **App-navn** | MindWell |
| **Domeneforslag** | mindwell.app / getmindwell.com |
| **Tagline** | Din lomme-terapeut — evidensbasert, alltid tilgjengelig. |
| **Elevator pitch** | MindWell gir alle tilgang til evidensbasert psykisk helsehjelp via AI-terapi, kognitiv atferdsterapi-moduler og krisestøtte — uten venteliste, uten stigma, fra $4,99/mnd. Kobler brukere til ekte terapeuter ved behov. |

### Problemkort

| | |
|---|---|
| **Problem** | 785 millioner mennesker globalt mangler tilgang til psykisk helsehjelp. Ventelister er 6–18 mnd. Kostnad per time: $100–300. |
| **Hvem rammes** | Unge voksne (18–35), foreldre, arbeidstakere med stress, mennesker i lav-inntektsland |
| **Omfang** | Globalt mentalt helse-marked: $383 mrd (2020), forventet $537 mrd i 2030. 1 av 4 mennesker opplever psykisk lidelse i løpet av livet. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
1. AI-terapeut (CBT-basert samtale) — tekstchat med kontekstuell hukommelse
2. Daglig humørsporing med innsikter og trender
3. Guidede øvelser (pust, mindfulness, journaling)
4. Kriselinje-integrasjon (1-trykk til nødnummer)
5. Brukerautentisering med kryptert helseprofil
6. Freemium-modell med Stripe-betaling

**Nice-to-have (v2):**
7. Video-konsultasjon med lisensierte terapeuter
8. Gruppeterapi / støttegrupper
9. Arbeidsgiver-dashboard (B2B mental helse)
10. Wearable-integrasjon (HRV, søvn fra Apple Watch)
11. Flerspråklig støtte (25+ språk)

### Målgruppe og brukerpersonaer

**Persona 1: «Sara, 27, UX-designer»**
- Mål: Håndtere angst og søvnproblemer uten å vente 8 mnd på terapeut
- Smertepunkt: For dyrt, for lang ventetid, stigma på arbeidsplassen

**Persona 2: «Ahmed, 45, taxisjåfør, Kenya»**
- Mål: Få hjelp med depresjon uten å reise 200 km til nærmeste psykolog
- Smertepunkt: Ingen tilgjengelige tjenester i nærheten, kulturell stigma

**Persona 3: «Maria, 34, HR-leder»**
- Mål: Tilby mental helsestøtte til 500 ansatte
- Smertepunkt: Høye kostnader for bedrifts-EAP-programmer, lav bruk

### Use Cases / Brukerreiser

1. **Kriseøyeblikk:** Sara får panikkanfall kl. 02:00 → åpner MindWell → AI guider gjennom 4-7-8 pusteøvelse → tilbyr å koble til kriselinje → logger hendelse
2. **Daglig sjekk-inn:** Ahmed logger humør hver morgen → AI foreslår 10-min CBT-øvelse basert på trender → etter 4 uker viser graf nedgang i depressive symptomer
3. **B2B onboarding:** Maria kjøper MindWell Teams → ansatte får invitasjonslink → anonymisert dashboard viser organisasjonens stressnivå over tid
4. **Terapeut-eskalering:** Sara's AI oppdager vedvarende selvskade-tanker → anbefaler sterkt å booke video-time med lisensiert terapeut → booking skjer i appen
5. **Journaling:** Ahmed skriver daglig journal → AI oppsummerer tema og mønstre → deler trygt med terapeut når han ønsker

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | MindWell differensiering |
|------------|--------|---------|--------------------------|
| BetterHelp | Stort terapeutnettverk | Dyrt ($60–90/uke), kun USA-fokusert | AI-first = 1/10 av prisen, globalt |
| Headspace | Sterk merkevare, meditasjon | Ikke terapi, ingen AI-samtale | Klinisk CBT + AI-terapeut |
| Woebot | AI CBT | Begrenset, ingen ekte terapeuter | Hybrid AI + terapeut, B2B |

---

## 3. Tekniske spesifikasjoner

### Arkitekturdiagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  iOS App      │     │  Web App      │     │  Admin Dashboard      │
│  (SwiftUI)    │     │  (Next.js)    │     │  (Next.js)            │
└──────┬───────┘     └──────┬───────┘     └──────────┬───────────┘
       │                     │                         │
       └─────────┬───────────┴─────────────────────────┘
                 │ HTTPS / WSS
       ┌─────────▼──────────┐
       │  API Gateway        │
       │  (AWS API Gateway)  │
       └─────────┬──────────┘
                 │
       ┌─────────▼──────────┐     ┌──────────────┐
       │  Backend             │────▶│  OpenAI API   │
       │  Node.js/Express     │     │  (GPT-4)      │
       │  (ECS / Lambda)      │     └──────────────┘
       └─────────┬──────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌──────────┐
│PostgreSQL│ │ Redis  │ │ S3       │
│(Supabase)│ │(Cache) │ │(Uploads) │
└────────┘ └────────┘ └──────────┘
```

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI, Combine, HealthKit, KeychainAccess |
| Web frontend | Next.js 14 (App Router), React, TailwindCSS, Zustand |
| Backend | Node.js 20 + TypeScript, Express.js |
| Database | PostgreSQL via Supabase (RLS) |
| Cache | Redis (Upstash) |
| Auth | Supabase Auth (OAuth, magic link, passkeys) |
| AI | OpenAI GPT-4o (streaming), langchain.js |
| Betaling | Stripe (subscriptions) |
| Analytics | PostHog (self-hosted) |
| Push | Firebase Cloud Messaging + APNs |
| Hosting | Vercel (web), AWS ECS (backend), Supabase (DB) |
| CI/CD | GitHub Actions |

### API-design (REST)

**Base URL:** `https://api.mindwell.app/v1`

#### Viktigste endepunkter

```
POST   /auth/signup          — Registrer bruker
POST   /auth/login           — Logg inn (JWT)
GET    /profile              — Hent brukerprofil
PUT    /profile              — Oppdater profil

POST   /mood                 — Logg humør
GET    /mood?from=&to=       — Hent humørhistorikk
GET    /mood/insights        — AI-genererte innsikter

POST   /chat                 — Send melding til AI-terapeut
GET    /chat/history         — Hent samtalehistorikk
WS     /chat/stream          — Streaming AI-respons

GET    /exercises            — Liste over øvelser
GET    /exercises/:id        — Hent spesifikk øvelse
POST   /exercises/:id/complete — Marker fullført

POST   /journal              — Lagre journaloppføring
GET    /journal              — Hent journal

POST   /billing/subscribe    — Start abonnement
POST   /billing/webhook      — Stripe webhook
GET    /billing/status       — Abonnementsstatus
```

#### Request/Response eksempel

```json
// POST /mood
// Request:
{
  "score": 6,
  "emotions": ["anxious", "hopeful"],
  "note": "Stressende dag, men gikk en tur",
  "context": "work"
}

// Response: 201 Created
{
  "id": "mood_abc123",
  "score": 6,
  "emotions": ["anxious", "hopeful"],
  "note": "Stressende dag, men gikk en tur",
  "context": "work",
  "created_at": "2026-02-24T14:30:00Z",
  "ai_suggestion": "Bra at du gikk en tur! Forsøk 5-min pusteøvelse før leggetid."
}
```

```json
// POST /chat
// Request:
{
  "message": "Jeg føler meg veldig angstfull i dag",
  "session_id": "sess_xyz789"
}

// Response: 200 OK (streamed)
{
  "session_id": "sess_xyz789",
  "response": "Jeg hører deg. Angst kan føles overveldende...",
  "suggested_exercise": "breathing_478",
  "crisis_detected": false
}
```

### Datamodeller / ER-diagram

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ users         │     │ mood_entries   │     │ chat_sessions  │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ id (uuid) PK │◄────│ user_id FK     │     │ id (uuid) PK   │
│ email         │     │ id (uuid) PK   │     │ user_id FK     │
│ name          │     │ score (1-10)   │     │ started_at     │
│ avatar_url    │     │ emotions[]     │     │ ended_at       │
│ plan (enum)   │     │ note           │     │ message_count  │
│ created_at    │     │ context        │     │ crisis_flagged │
│ updated_at    │     │ created_at     │     └──────┬───────┘
└──────┬──────┘     └──────────────┘              │
       │                                           │
       │            ┌──────────────┐     ┌────────▼───────┐
       │            │ journals       │     │ chat_messages    │
       │            ├──────────────┤     ├────────────────┤
       ├────────────│ user_id FK     │     │ id (uuid) PK    │
       │            │ id (uuid) PK   │     │ session_id FK   │
       │            │ content (enc)  │     │ role (user/ai)  │
       │            │ ai_summary     │     │ content (enc)   │
       │            │ created_at     │     │ created_at      │
       │            └──────────────┘     └────────────────┘
       │
       │            ┌──────────────┐     ┌──────────────┐
       │            │ subscriptions  │     │ exercises      │
       │            ├──────────────┤     ├──────────────┤
       └────────────│ user_id FK     │     │ id (uuid) PK  │
                    │ stripe_id      │     │ title          │
                    │ plan           │     │ type           │
                    │ status         │     │ duration_min   │
                    │ current_period │     │ content (json) │
                    │ created_at     │     │ premium        │
                    └──────────────┘     └──────────────┘
```

### Sikkerhet og personvern

- **Autentisering:** JWT med refresh tokens, OAuth2 (Google, Apple), passkeys
- **Kryptering:** AES-256 for journal/chat i databasen, TLS 1.3 i transit
- **HIPAA-kompatibel:** BAA med Supabase, krypterte backups, audit log
- **GDPR:** Samtykkebasert databehandling, rett til sletting, dataportabilitet
- **Krisehåndtering:** AI flaggér selvmordsrisiko → umiddelbar varsling + kriselinje
- **Rate limiting:** 100 req/min per bruker, DDoS-beskyttelse via Cloudflare

---

## 4. Implementasjonsleveranser

### Mappestruktur

```
mindwell/
├── apps/
│   └── ios/
│       ├── MindWell.xcodeproj
│       ├── MindWell/
│       │   ├── App.swift
│       │   ├── Views/
│       │   │   ├── MainTabView.swift
│       │   │   ├── ChatView.swift
│       │   │   ├── MoodTrackerView.swift
│       │   │   ├── ExercisesView.swift
│       │   │   └── ProfileView.swift
│       │   ├── ViewModels/
│       │   ├── Models/
│       │   ├── Services/
│       │   │   ├── APIService.swift
│       │   │   ├── AuthService.swift
│       │   │   └── KeychainService.swift
│       │   └── Resources/
│       └── MindWellTests/
├── packages/
│   └── web/
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── (auth)/login/page.tsx
│       │   ├── (auth)/signup/page.tsx
│       │   ├── dashboard/page.tsx
│       │   ├── chat/page.tsx
│       │   ├── mood/page.tsx
│       │   ├── exercises/page.tsx
│       │   └── api/ (Next.js API routes)
│       ├── components/
│       ├── lib/
│       └── public/
├── services/
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── mood.ts
│       │   │   ├── chat.ts
│       │   │   ├── exercises.ts
│       │   │   └── billing.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── rateLimit.ts
│       │   ├── services/
│       │   │   ├── aiService.ts
│       │   │   └── crisisDetector.ts
│       │   ├── models/
│       │   └── utils/
│       ├── Dockerfile
│       └── tests/
├── infra/
│   ├── docker-compose.yml
│   ├── terraform/
│   └── k8s/
├── scripts/
│   ├── seed.ts
│   └── migrate.ts
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
└── README.md
```

### MVP Funksjonssett & Sprintplan

| Sprint | Uker | Leveranse |
|--------|------|-----------|
| 0 | 1 | Setup: repo, CI/CD, DB-skjema, auth |
| 1 | 2 | Humørsporing + daglig sjekk-inn (backend + web + iOS) |
| 2 | 2 | AI-terapeut chat (GPT-4 integrasjon, streaming) |
| 3 | 2 | Øvelsesbibliotek + journaling |
| 4 | 1 | Stripe-betaling + freemium-gate |
| 5 | 1 | Kriselinje + sikkerhetsfunksjoner |
| 6 | 1 | Testing, polish, App Store submission |
| **Total** | **10 uker** | **MVP klar for lansering** |

### Kostnadsestimater

| Scenario | Team | Tid | Kostnad |
|----------|------|-----|---------|
| **Lean** | 1 fullstack + 1 AI/ML | 12 uker | $25 000–40 000 |
| **Standard** | 2 fullstack + 1 iOS + 1 designer | 10 uker | $60 000–90 000 |
| **Full** | 4 devs + 1 designer + 1 PM + 1 QA | 8 uker | $120 000–180 000 |

*Antakelser: Markedslønn for senior utviklere ($70–100/t), OpenAI API-kostnader ~$2 000/mnd ved 10K brukere.*

### CI/CD og Deploy

**GitHub Actions pipeline:**
- Push → Lint + Type-check → Unit tests → Integration tests → Build
- Main branch → Auto-deploy web til Vercel, backend til AWS ECS
- Tag `v*` → TestFlight-bygg (Fastlane) + production deploy

**Miljøvariabler:**
```env
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...

# Frontend (web)
NEXT_PUBLIC_API_URL=https://api.mindwell.app
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...

# iOS
API_BASE_URL=https://api.mindwell.app
```

---

## 5. Kode og eksempler

Se tilhørende filer i denne mappen:
- [`ios/MainView.swift`](ios/MainView.swift) — SwiftUI hovedskjerm med auth + API
- [`web/DashboardPage.tsx`](web/DashboardPage.tsx) — Next.js dashboard-komponent
- [`backend/server.ts`](backend/server.ts) — Express backend med mood + chat endepunkter
- [`backend/Dockerfile`](backend/Dockerfile) — Container-oppsett
- [`tests/mood.test.ts`](tests/mood.test.ts) — Unit + API-tester

---

## 6. Design og UX

### Fargepalett

| Rolle | Farge | Hex |
|-------|-------|-----|
| Primary | Rolig blå | `#4A90D9` |
| Secondary | Varm lavendel | `#9B8EC4` |
| Accent | Solnedgang oransje | `#F5A623` |
| Background | Kremet hvit | `#FAF9F6` |
| Text | Dyp grafitt | `#2C2C2E` |
| Success | Myk grønn | `#6BBF6A` |
| Danger | Myk rød | `#E85D5D` |

### Typografi

- **Overskrifter:** SF Pro Display (iOS) / Inter (web), semibold
- **Brødtekst:** SF Pro Text / Inter, regular, 16px
- **Aksent:** Rounded corners, bløte skygger, ingen skarpe kanter

### Hovedskjermer (wireframe-beskrivelse)

1. **Hjem/Dashboard:** Humørgraf (siste 7 dager), dagens anbefaling, snarvei til chat
2. **Chat:** Meldingsbobler (bruker høyre, AI venstre), input-felt med mikrofon, «SOS»-knapp
3. **Humørsporing:** Slider (1–10), emosjons-chips, tekstfelt, lagre-knapp
4. **Øvelser:** Kort-grid (pusteøvelse, body scan, journaling), filtrering etter tid/type
5. **Profil:** Statistikk, abonnement, innstillinger, GDPR-eksport

### Onboarding-flow

1. Velkomstskjerm → «Hvordan har du det i dag?» (soft mood check)
2. Velg fokusområder (angst, søvn, stress, depresjon)
3. «Hvor ofte ønsker du påminnelser?» (daglig/ukentlig)
4. Opprett konto (Apple/Google/e-post)
5. Første AI-samtale (2 min intro)
6. Dashboard med personalisert plan

### Tilgjengelighet

- WCAG 2.1 AA minimum, mål: AAA for tekst
- Alle interaktive elementer med ARIA-labels
- Kontrastforhold ≥ 4.5:1 for tekst, ≥ 3:1 for stor tekst
- Full keyboard-navigasjon (web)
- VoiceOver/TalkBack-støtte (mobil)
- Respekterer «Reduce Motion» og «Dark Mode»

---

## 7. Go-to-market & salgsklarhet

### Forretningsmodell

**Freemium + Abonnement + B2B**

| Pakke | Pris | Innhold |
|-------|------|---------|
| Free | $0 | 3 AI-samtaler/dag, humørsporing, 2 øvelser/dag |
| Pro | $4,99/mnd | Ubegrenset AI, alle øvelser, journal, innsikter |
| Pro+ | $14,99/mnd | Alt i Pro + 2 terapeut-timer/mnd |
| Teams | $8/ansatt/mnd | Pro for alle + admin-dashboard + anonymisert data |

### App Store-tekster

**Tittel:** MindWell — AI Terapi & Mental Helse
**Undertittel:** Evidensbasert selvhjelp i lomma

**Beskrivelse:**
> Føler du deg stresset, engstelig eller nedfor? MindWell gir deg tilgang til en AI-terapeut basert på kognitiv atferdsterapi — tilgjengelig 24/7, uten venteliste.
>
> ✅ AI-terapi basert på CBT
> ✅ Daglig humørsporing med innsikter
> ✅ Guidede pusteøvelser og meditasjon
> ✅ Kryptert og HIPAA-kompatibel
> ✅ Koble til ekte terapeut ved behov
>
> Brukt av 500 000+ mennesker i 40 land.

**Keywords:** mental helse, terapi, CBT, angst, depresjon, mindfulness, meditasjon, humørsporing, AI terapeut, selvhjelp

### Markedsføringsplan (første 3 mnd)

| Mnd | Kanal | Aktivitet |
|-----|-------|-----------|
| 1 | Product Hunt + Twitter/X | Lansering, «#1 Product of the Day»-kampanje |
| 1 | Content | 10 blogginnlegg om mental helse + SEO |
| 2 | Influencer | Samarbeid med 5 mental helse-influencere |
| 2 | Betalt | Google Ads + TikTok ($5K/mnd budsjett) |
| 3 | B2B | Outreach til 100 HR-ledere, LinkedIn-kampanje |
| 3 | PR | Pressemelding + podcast-gjesting |

### Kundestøtte

- In-app FAQ + chatbot
- E-post support: <48t responstid (free), <4t (Pro+)
- Onboarding-video (2 min)
- Helpdesk: Intercom eller Zendesk

---

## 8. Juridisk & compliance

- **Personvern:** GDPR-kompatibel datahåndtering, samtykke ved registrering, rett til sletting/portabilitet, DPO utnevnt
- **HIPAA:** BAA med alle underleverandører (Supabase, AWS), kryptert PHI, audit logging
- **Fraskrivelse:** «MindWell er ikke en erstatning for profesjonell psykisk helsehjelp. Kontakt nødnummer ved krise.»
- **Tredjeparts-lisenser:** OpenAI API (bruksvilkår), Stripe (PCI DSS), Supabase (SOC 2)
- **Innholdsmoderering:** AI-output overvåkes for skadelig innhold, krisevarsling aktiveres automatisk

---

## 9. Drift, måling og vekst

### KPIer

| KPI | Mål (6 mnd) | Mål (12 mnd) |
|-----|-------------|--------------|
| DAU | 5 000 | 50 000 |
| MAU | 20 000 | 150 000 |
| Churn (mnd) | < 8 % | < 5 % |
| Free→Pro konvertering | 5 % | 8 % |
| LTV (Pro) | $45 | $65 |
| CAC | $12 | $8 |

### Instrumentering

- **Events:** `signup`, `mood_logged`, `chat_started`, `exercise_completed`, `subscription_started`, `crisis_triggered`
- **Dashboards:** PostHog — daglig aktive, retention kohorter, funnel (signup → first_chat → subscription)

### Skalering

| Brukere | Infra | Kostnad/mnd |
|---------|-------|-------------|
| 0–10K | Vercel + 1 ECS task + Supabase free | $50–200 |
| 10K–100K | Vercel Pro + 2 ECS tasks + Supabase Pro + Redis | $500–2 000 |
| 100K–1M | ECS auto-scaling + RDS + ElastiCache + CDN | $5 000–15 000 |

---

## 10. Salgspakke

### README (How to run locally)

```bash
# Klon repo
git clone https://github.com/yourorg/mindwell.git && cd mindwell

# Backend
cd services/api && npm install && cp .env.example .env
# Fyll inn env-variabler, så:
npm run dev  # http://localhost:3001

# Web
cd packages/web && npm install && cp .env.example .env.local
npm run dev  # http://localhost:3000

# iOS
cd apps/ios && open MindWell.xcodeproj
# Bygg og kjør i simulator
```

### Demo-data

Seed-skript oppretter: 3 testbrukere, 30 dager humørdata, 10 samtalehistorikker, 15 øvelser.

### Marketing-ready screenshots

1. **Hero:** iPhone 15 Pro med chat-skjerm — AI-terapeut gir varm, empatisk respons. Bakgrunn: myk gradient blå→lavendel. Tekst: «Din terapeut er alltid her.»
2. **Dashboard:** Humørgraf med oppadgående trend over 30 dager. Tekst: «Se fremgangen din.»
3. **Øvelser:** Grid med fargerike kort (pusteøvelse, body scan, journaling). Tekst: «Verktøy som faktisk hjelper.»

### Demo-video script (60s)

```
0–5s:   [Svart skjerm, tekst] "1 av 4 mennesker opplever psykisk lidelse."
5–12s:  [Animasjon] "Ventelisten er 6–18 måneder. Kostnaden: $200/time."
12–17s: [Logo] "Møt MindWell."
17–30s: [Skjermopptak] Bruker åpner appen → logger humør → starter AI-chat
30–42s: [Skjermopptak] AI gir CBT-basert respons → foreslår pusteøvelse
42–50s: [Dashboard] Humørgraf viser bedring over tid
50–55s: [Tekst] "Fra $4,99/mnd. Ingen venteliste."
55–60s: [CTA] "Last ned MindWell i dag. mindwell.app"
```

### Investor one-pager

```
MINDWELL — AI-Drevet Mental Helsehjelp

Problem:  785M mangler psykisk helsehjelp. Marked: $537 mrd (2030).
Løsning:  AI-terapeut (CBT) + humørsporing + ekte terapeuter.
Modell:   Freemium → $4,99–14,99/mnd + B2B $8/ansatt/mnd.
Traction: [MVP klar, 500 beta-brukere, 12% konvertering]

Økonomi (12 mnd projeksjon):
  Brukere: 150K MAU, 12K betalende
  MRR: $85K (snitt $7/bruker)
  ARR: $1.02M
  Burn: $35K/mnd (team av 5)
  Runway: 18 mnd med $500K seed

Team: [Founder + CTO + AI Lead]
Ask:  $500K seed for 10% — MVP→PMF→100K brukere
```
