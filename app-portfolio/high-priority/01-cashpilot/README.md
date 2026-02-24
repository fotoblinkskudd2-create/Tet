# CashPilot — Finansiell Literacy for Alle

> **Domeneforslag:** cashpilot.app, getcashpilot.com  
> **Tagline:** «Lær penger. Mestre livet.»  
> **Elevator Pitch:** CashPilot gjør 1.7 milliarder voksne finansielt kompetente gjennom gamifiserte mikroleksjoner, AI-drevet personlig rådgivning og praktiske budsjettverktøy — tilgjengelig på 40+ språk, designet for mobilbruk i utviklingsland.

---

## 1. Toppopplysninger

### Problemkort

| Felt | Detalj |
|------|--------|
| **Problem** | 1.7 mrd voksne mangler grunnleggende finanskunnskap. De vet ikke hvordan renter, inflasjon, budsjett eller investering fungerer. Dette fører til gjeldsfeller, fattigdom og utnyttelse. |
| **Hvem rammes** | Voksne i utviklingsland, unge voksne (18–30) globalt, lavtutdannede, immigranter, gig-arbeidere |
| **Omfang** | 1.7 mrd uten finanskunnskap (Verdensbanken). Finansiell analfabetisme koster verdensøkonomien $3.5T/år i tapt produktivitet og dårlige beslutninger. Kun 33% av voksne globalt er finansielt literate (S&P Global). |

---

## 2. Produktoversikt

### Hovedidé og kjernefunksjoner

**Must-have (MVP):**
- Mikroleksjoner (3–5 min) med quiz og XP-system
- AI-chatbot for personlige finansspørsmål
- Budsjettverktøy med bankkobling (Plaid/Open Banking)
- Mål- og sparemotivator med push-varsler
- Flerspråklig (starter med EN, ES, HI, AR, PT, FR, ZH)

**Nice-to-have:**
- Sosial læring (grupper, utfordringer, leaderboards)
- Sertifisering med LinkedIn-badge
- Arbeidsgiver-portal (B2B: bedrifter kjøper lisenser til ansatte)
- Integrasjon med betalingsapper (M-Pesa, Venmo, Revolut)
- AR-basert "Penge-skanner" som forklarer finansprodukter

### Målgruppe og brukerpersonaer

**Persona 1: Maria (24, São Paulo, Brasil)**
- Servitør, tjener R$2500/mnd, har 3 kredittkort med gjeld
- Mål: Forstå renter, lage budsjett, bli gjeldfri
- Smertepunkt: Ingen i familien kan lære henne om penger

**Persona 2: Ahmed (32, Lagos, Nigeria)**
- Gig-sjåfør, inntekt varierer mellom $200–600/mnd
- Mål: Spare til nødkasse, forstå investering
- Smertepunkt: Vet ikke forskjellen på sparing og investering

**Persona 3: Emma (19, Oslo, Norge)**
- Student, første gang med egen økonomi, studielån
- Mål: Sette opp budsjett, forstå skatt og pensjon
- Smertepunkt: Kjedelige finansapper, motivasjon

### Use Cases / Brukerreiser

1. **Onboarding → Første leksjon:** Maria laster ned, tar 2-min quiz om finansnivå, får personalisert læringssti, fullører første leksjon om renter på 4 min, tjener 50 XP.

2. **AI-rådgivning:** Ahmed spør chatbotten «Hvordan sparer jeg med variabel inntekt?» Får konkret 50/30/20-plan tilpasset hans situasjon.

3. **Budsjett-kobling:** Emma kobler bankkonto via Open Banking, ser automatisk kategorisert forbruk, får varsling «Du har brukt 80% av matbudsjettet — 12 dager igjen».

4. **Sosial utfordring:** Alle tre deltar i «30-dagers sparekonkurranse» med venner, deler fremgang, heier.

5. **Sertifisering:** Etter 20 fullførte moduler får Maria «CashPilot Certified» badge til LinkedIn.

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | CashPilot-differensiering |
|-----------|--------|---------|--------------------------|
| Khan Academy (Personal Finance) | Gratis, høy kvalitet | Ingen app-verktøy, ikke gamifisert, kun EN | Gamifisert + verktøy + 40 språk |
| Mint / YNAB | Gode budsjettverktøy | Ingen opplæring, kun USA/vestlig, betalt | Opplæring + verktøy integrert |
| Duolingo-modellen | Bevist at gamifisert læring fungerer | Eksisterer ikke for finans | Første «Duolingo for penger» |

---

## 3. Tekniske Spesifikasjoner

### Arkitekturdiagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  iOS App         │     │  Web App          │     │  Admin Portal   │
│  (SwiftUI)       │     │  (Next.js 14)     │     │  (Next.js)      │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                         │
         └───────────┬───────────┘─────────────────────────┘
                     │
              ┌──────┴──────┐
              │  API Gateway │
              │  (Kong/AWS)  │
              └──────┬──────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───┴───┐    ┌──────┴──────┐   ┌────┴────┐
│Auth   │    │ Core API     │   │ AI/ML   │
│Service│    │ (Node.js/TS) │   │ Service │
│(Clerk)│    │ Express      │   │(OpenAI) │
└───┬───┘    └──────┬──────┘   └────┬────┘
    │               │               │
    └───────┬───────┘───────────────┘
            │
     ┌──────┴──────┐
     │ PostgreSQL   │
     │ + Redis      │
     │ (Supabase)   │
     └─────────────┘
```

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| Frontend iOS | SwiftUI, Combine, Swift Package Manager |
| Frontend Web | Next.js 14, React 18, TypeScript, TailwindCSS, Framer Motion |
| Backend | Node.js 20, TypeScript, Express.js, Prisma ORM |
| Database | PostgreSQL (Supabase), Redis (Upstash) |
| Autentisering | Clerk (SSO, OAuth, magic link) |
| Betaling | Stripe (subscriptions, in-app purchases) |
| AI | OpenAI GPT-4o (chatbot), embeddings for personalisering |
| Analytics | PostHog (self-hosted), Mixpanel |
| Push | Firebase Cloud Messaging (FCM), APNs |
| Hosting | Vercel (web), AWS ECS/Fargate (API), Supabase (DB) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry, Datadog |

### API-Design (REST)

**Base URL:** `https://api.cashpilot.app/v1`

#### Viktigste endepunkter

```
POST   /auth/register          → Opprett bruker
POST   /auth/login             → Logg inn
GET    /users/me               → Hent profil
PUT    /users/me               → Oppdater profil

GET    /lessons                → Hent tilgjengelige leksjoner
GET    /lessons/:id            → Hent en leksjon med innhold
POST   /lessons/:id/complete   → Merk leksjon som fullført
GET    /lessons/recommended    → AI-anbefalte neste leksjoner

GET    /progress               → Hent brukerens fremgang (XP, streak, level)
POST   /progress/xp            → Legg til XP

POST   /ai/chat                → Send melding til AI-rådgiver
GET    /ai/chat/history        → Hent chathistorikk

GET    /budget                 → Hent budsjett
POST   /budget                 → Opprett/oppdater budsjett
GET    /budget/transactions    → Hent transaksjoner (via Plaid)
POST   /budget/connect-bank   → Koble bankkonto

GET    /challenges             → Hent aktive utfordringer
POST   /challenges/:id/join   → Bli med i utfordring
```

#### Request/Response-eksempler

**POST /lessons/:id/complete**
```json
// Request
{ "lessonId": "lesson_renter_101", "score": 85, "timeSpentSeconds": 240 }

// Response 200
{
  "xpEarned": 50,
  "totalXp": 1250,
  "level": 5,
  "streak": 7,
  "nextRecommended": { "id": "lesson_inflasjon_101", "title": "Hva er inflasjon?" },
  "achievements": [{ "id": "ach_7day_streak", "title": "7-dagers streak!", "icon": "🔥" }]
}
```

**POST /ai/chat**
```json
// Request
{ "message": "Hvordan sparer jeg med variabel inntekt?", "language": "no" }

// Response 200
{
  "reply": "Med variabel inntekt anbefaler jeg 'pay yourself first'-metoden: ...",
  "suggestedActions": [
    { "type": "lesson", "id": "lesson_variable_income", "title": "Spare med variabel inntekt" },
    { "type": "tool", "id": "budget_setup", "title": "Sett opp fleksibelt budsjett" }
  ],
  "sources": ["lesson_budgeting_101", "lesson_emergency_fund"]
}
```

### Datamodeller / ER-diagram

```
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── name (VARCHAR)
├── language (VARCHAR, default 'en')
├── level (INT, default 1)
├── total_xp (INT, default 0)
├── streak_days (INT, default 0)
├── last_active_at (TIMESTAMP)
├── subscription_tier (ENUM: free, pro, enterprise)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

lessons
├── id (VARCHAR, PK)
├── title (VARCHAR)
├── description (TEXT)
├── content_json (JSONB) — leksjonsinnhold, spørsmål, svar
├── category (VARCHAR) — budgeting, investing, debt, etc.
├── difficulty (ENUM: beginner, intermediate, advanced)
├── language (VARCHAR)
├── xp_reward (INT)
├── duration_minutes (INT)
├── order_index (INT)
└── created_at (TIMESTAMP)

user_progress
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── lesson_id (VARCHAR, FK → lessons)
├── completed (BOOLEAN)
├── score (INT)
├── time_spent_seconds (INT)
├── completed_at (TIMESTAMP)
└── created_at (TIMESTAMP)

budgets
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── name (VARCHAR)
├── amount (DECIMAL)
├── period (ENUM: weekly, monthly)
├── category (VARCHAR)
└── created_at (TIMESTAMP)

transactions
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── amount (DECIMAL)
├── category (VARCHAR)
├── description (VARCHAR)
├── date (DATE)
├── source (VARCHAR) — manual, plaid, etc.
└── created_at (TIMESTAMP)

chat_messages
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── role (ENUM: user, assistant)
├── content (TEXT)
├── metadata (JSONB)
└── created_at (TIMESTAMP)

achievements
├── id (VARCHAR, PK)
├── title (VARCHAR)
├── description (VARCHAR)
├── icon (VARCHAR)
├── xp_required (INT)
└── criteria_json (JSONB)

user_achievements
├── user_id (UUID, FK → users)
├── achievement_id (VARCHAR, FK → achievements)
└── earned_at (TIMESTAMP)
```

### Sikkerhet og personvern

- **Autentisering:** Clerk med JWT tokens, refresh token rotation, MFA støtte
- **Kryptering:** TLS 1.3 i transit, AES-256 at rest for sensitive data
- **Bank-data:** Plaid håndterer PCI-compliance, vi lagrer aldri kontonumre
- **GDPR:** Samtykke-basert, data-eksport, slett-konto funksjon, DPO utnevnt
- **Rate limiting:** 100 req/min per bruker, 1000 req/min per IP
- **Input sanitering:** Zod-validering på alle endepunkter
- **AI-sikkerhet:** Prompt injection-beskyttelse, innholdfiltrering

---

## 4. Implementasjonsleveranser

### Mappe-/filstruktur

```
cashpilot/
├── frontend-ios/
│   ├── CashPilot.xcodeproj
│   ├── CashPilot/
│   │   ├── App/
│   │   │   ├── CashPilotApp.swift
│   │   │   └── ContentView.swift
│   │   ├── Views/
│   │   │   ├── HomeView.swift
│   │   │   ├── LessonView.swift
│   │   │   ├── BudgetView.swift
│   │   │   ├── ChatView.swift
│   │   │   └── ProfileView.swift
│   │   ├── Models/
│   │   │   ├── User.swift
│   │   │   ├── Lesson.swift
│   │   │   └── Budget.swift
│   │   ├── Services/
│   │   │   ├── APIService.swift
│   │   │   ├── AuthService.swift
│   │   │   └── NotificationService.swift
│   │   └── Resources/
│   │       ├── Assets.xcassets
│   │       └── Localizable.strings
│   └── CashPilotTests/
├── frontend-web/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── lessons/[id]/page.tsx
│   │   │   ├── budget/page.tsx
│   │   │   └── chat/page.tsx
│   │   ├── components/
│   │   │   ├── LessonCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── BudgetChart.tsx
│   │   │   └── ChatMessage.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts
│   └── __tests__/
│       └── LessonCard.test.tsx
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── lessons.ts
│   │   │   ├── progress.ts
│   │   │   ├── budget.ts
│   │   │   └── ai.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── rateLimit.ts
│   │   ├── services/
│   │   │   ├── aiService.ts
│   │   │   ├── plaidService.ts
│   │   │   └── notificationService.ts
│   │   └── utils/
│   │       └── validators.ts
│   └── tests/
│       └── lessons.test.ts
├── infra/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .github/
│       └── workflows/
│           ├── ci.yml
│           └── deploy.yml
├── scripts/
│   ├── seed.ts
│   └── migrate.sh
├── .env.example
└── README.md
```

### MVP Funksjonssett og Sprintplan

**MVP (8 uker, 3 utviklere):**

| Sprint | Uke | Oppgaver |
|--------|-----|----------|
| 1 | 1–2 | Auth, brukermodell, CI/CD, prosjektoppsett (alle plattformer) |
| 2 | 3–4 | Leksjonsmotor (CRUD, quiz-engine, XP), 10 startleksjoner |
| 3 | 5–6 | AI-chatbot, budsjettverktøy, banktilkobling (Plaid) |
| 4 | 7–8 | Push-varsler, onboarding, beta-testing, App Store submission |

### Estimater

| Scenario | Team | Tid | Kostnad |
|----------|------|-----|---------|
| **Lean** | 2 fullstack + 1 designer | 8 uker | $40,000–60,000 |
| **Standard** | 3 fullstack + 1 iOS + 1 designer + 1 PM | 12 uker | $120,000–180,000 |
| **Full** | 5 utviklere + 2 designer + 1 PM + 1 QA + 1 innholdsprodusent | 16 uker | $300,000–450,000 |

*Antakelser: US/EU freelancer-rater ($75–150/t). Lean bruker AI-assistert utvikling. Full inkluderer 40 språk og 100+ leksjoner.*

### CI/CD og Deploy

- **Web:** GitHub Actions → Vercel (auto-deploy ved push til main)
- **Backend:** GitHub Actions → Docker build → AWS ECS/Fargate
- **iOS:** GitHub Actions → Fastlane → TestFlight → App Store
- **DB:** Supabase managed PostgreSQL med automatiske backups

### Miljøvariabler

```env
# Auth
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/cashpilot

# Redis
REDIS_URL=redis://default:pass@host:6379

# AI
OPENAI_API_KEY=sk-...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Banking
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=production

# Push
FIREBASE_PROJECT_ID=cashpilot-prod
FIREBASE_PRIVATE_KEY=...

# Analytics
POSTHOG_API_KEY=phc_...
SENTRY_DSN=https://...@sentry.io/...
```

---

## 5. Kode og Eksempler

Se medfølgende filer:
- `frontend-ios/HomeView.swift` — SwiftUI hovedskjerm med auth og API
- `frontend-web/src/app/dashboard/page.tsx` — React dashboard-komponent
- `backend/src/index.ts` — Express-server med leksjons- og AI-endepunkter
- `infra/Dockerfile` og `infra/docker-compose.yml`
- `tests/lessons.test.ts` — Unit-test for leksjonsmotor

---

## 6. Design og UX

### Fargepalett

| Rolle | Farge | HEX |
|-------|-------|-----|
| Primary | Electric Blue | #2563EB |
| Secondary | Emerald Green | #10B981 |
| Accent | Amber | #F59E0B |
| Background | White | #FFFFFF |
| Surface | Cool Gray 50 | #F9FAFB |
| Text | Gray 900 | #111827 |
| Error | Red 500 | #EF4444 |

### Typografi

- **Headlines:** Inter Bold (32/24/20px)
- **Body:** Inter Regular (16px, line-height 1.6)
- **Mono:** JetBrains Mono (tall, beløp)

### Hovedskjermbilder

**1. Dashboard (Home)**
```
┌─────────────────────────────┐
│ God morgen, Maria! 🌤️       │
│ Level 5 · 1250 XP · 🔥 7    │
│ ═══════════════════ 62%     │
├─────────────────────────────┤
│ 📚 Neste leksjon            │
│ ┌─────────────────────────┐ │
│ │ Hva er inflasjon?       │ │
│ │ 5 min · 50 XP · ⭐⭐     │ │
│ │ [Start →]               │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 💰 Budsjett denne måneden   │
│ ██████████░░░ 68% brukt    │
│ kr 13,600 / kr 20,000      │
├─────────────────────────────┤
│ 🏆 Utfordringer             │
│ 30-dagers sparesprint: 12/30│
├─────────────────────────────┤
│ [🏠] [📚] [💬] [💰] [👤]    │
└─────────────────────────────┘
```

### Onboarding-flow

1. Velkomstskjerm med verdiproposisjon (3 sveip)
2. 2-min quiz: «Hvor godt kjenner du din økonomi?» (5 spørsmål)
3. Personalisering: Mål (spare, gjeldfri, investere), språk, inntektsnivå
4. Koble bank (valgfritt, kan hoppes over)
5. Første leksjon starter umiddelbart etter onboarding

### Tilgjengelighet

- ARIA-labels på alle interaktive elementer
- Kontrast ≥ 4.5:1 (WCAG AA)
- Full tastaturnavigasjon
- VoiceOver/TalkBack-støtte
- Reduce Motion-respekt
- Skriftstørrelse skalerbar 100%–200%

---

## 7. Go-to-Market & Salgsklarhet

### Forretningsmodell

**Freemium + B2B:**
- **Free:** 5 leksjoner/mnd, grunnleggende budsjett, begrenset AI-chat (5 meld/dag)
- **Pro ($4.99/mnd):** Ubegrenset leksjoner + AI, avansert budsjett, banktilkobling
- **Enterprise ($2/bruker/mnd, min 100):** Arbeidsgiver-portal, dashboards, sertifiseringer

### Prisstrategi

- Gratis tier er generøs nok til å demonstrere verdi
- Årlig Pro: $39.99 (33% rabatt) → høyere LTV
- Enterprise: Volumrabatt ved 1000+ brukere
- Utviklingsland: Dynamisk prising (PPP-justert, ned til $0.99/mnd)

### App Store-beskrivelser

**Tittel:** CashPilot — Lær penger, mestre livet

**Undertittel:** Finansskole + Budsjett + AI-rådgiver

**Beskrivelse:**
> CashPilot er din personlige finansskole i lomma. Lær om budsjett, sparing, investering og gjeld gjennom korte, gamifiserte leksjoner. Få svar på alle pengespørsmål fra vår AI-rådgiver. Koble bankkontoen din for automatisk budsjettoversikt.
>
> ✅ 100+ mikroleksjoner på 3–5 min  
> ✅ AI-drevet personlig rådgivning  
> ✅ Automatisk budsjett med banktilkobling  
> ✅ XP, streaks og utfordringer med venner  
> ✅ Tilgjengelig på 40+ språk  

**Keywords:** finans, budsjett, sparing, investering, gjeld, pengeapp, finansskole, AI rådgiver

### Markedsføringsplan (3 første måneder)

| Mnd | Aktivitet | Type |
|-----|-----------|------|
| 1 | ProductHunt launch, Hacker News, Reddit r/personalfinance | Organisk |
| 1 | TikTok «Money Myths» serie (3 videoer/uke) | Organisk |
| 2 | Influencer-partnerskap (5 finansbloggere) | Betalt |
| 2 | Google Ads: «financial literacy app» keywords | Betalt |
| 3 | B2B outreach til 100 bedrifter (HR-avdelinger) | Outbound |
| 3 | Partnerskap med NGOer (UNDP, World Bank) | Partnerskap |

### Kundestøtte

- Tier 1: AI-chatbot (24/7)
- Tier 2: E-post support (24t SLA, Free) / 4t SLA (Pro)
- Tier 3: Dedikert account manager (Enterprise)
- Onboarding: Interaktiv in-app guide, video-tutorials, FAQ

---

## 8. Juridisk & Compliance

### Privacy Policy punkter

- Data samles kun med samtykke (GDPR Art. 6(1)(a))
- Bankdata prosesseres av Plaid (PCI DSS Level 1)
- Bruker kan eksportere all data (GDPR Art. 20)
- Bruker kan slette konto og all data (GDPR Art. 17)
- Data lagres i EU (Frankfurt) for EU-brukere
- Tredjeparter: Clerk, Stripe, Plaid, OpenAI — alle med DPA

### Regulatoriske krav

- **Ikke finansiell rådgivning:** Tydelig disclaimer at CashPilot gir generell utdanning, ikke personlig finansrådgivning
- **PCI DSS:** Håndteres av Stripe og Plaid — vi berører aldri kortdata
- **Barns personvern:** COPPA-compliant — 13+ aldersgrense

---

## 9. Drift, Måling og Vekst

### KPIer

| KPI | Mål (6 mnd) | Mål (12 mnd) |
|-----|-------------|--------------|
| DAU | 10,000 | 100,000 |
| MAU | 50,000 | 500,000 |
| Churn (mnd) | <8% | <5% |
| LTV (Pro) | $45 | $60 |
| CAC | <$3 | <$2 |
| Leksjoner fullført/bruker/mnd | 8 | 12 |
| NPS | 40+ | 50+ |

### Analytics Events

```
user_registered, lesson_started, lesson_completed,
quiz_answered, xp_earned, streak_updated,
budget_created, bank_connected, transaction_categorized,
ai_chat_sent, challenge_joined, achievement_earned,
subscription_started, subscription_cancelled
```

### Skalering

| Brukere | Hosting/mnd | DB | Push |
|---------|-------------|-----|------|
| 10K | $200 | Supabase Free | FCM Free |
| 100K | $800 | Supabase Pro ($25) | FCM Free |
| 1M | $3,000 | Supabase Team + read replicas | FCM Free |

---

## 10. Salgspakke

### README: How to Run Locally / How to Deploy

Se `scripts/` for seed-data og migrering. Fullstendig instruksjoner i prosjektets hovedfiler.

### Demo-data

Seed-skript oppretter: 3 demo-brukere, 20 leksjoner, 50 transaksjoner, 5 utfordringer.

### Marketing Screenshots

1. **Hero:** Dashboard med XP-bar, streaks og neste leksjon — tekst: «Din personlige finansskole i lomma»
2. **Feature 1:** AI-chatbot som svarer på pengespørsmål — tekst: «Svar på alle dine pengespørsmål — 24/7»
3. **Feature 2:** Budsjettvisning med piechart — tekst: «Se hvor pengene går — automatisk»

### Demo-video script (60s)

```
0–5s:   Logo + tagline «Lær penger. Mestre livet.»
5–15s:  Problem: «1.7 milliarder voksne vet ikke nok om penger. Det endrer vi.»
15–25s: Onboarding: Quiz → personlig læringssti
25–35s: Leksjon: Kort video om renter, quiz, XP-belønning
35–45s: AI-chatbot: «Hvordan sparer jeg?» → personlig plan
45–55s: Budsjett: Banktilkobling, automatisk oversikt
55–60s: CTA: «Last ned gratis — start din finansreise i dag»
```

### Investor One-Pager

```
CASHPILOT — Investor One-Pager

Problem:  1.7 mrd voksne mangler finanskunnskap → $3.5T tapt/år
Løsning:  Gamifisert finansopplæring + AI-rådgivning + budsjettverktøy
Marked:   TAM $50B (global edtech + personal finance)
Modell:   Freemium ($5/mnd Pro) + B2B ($2/bruker/mnd)
Traksjon: MVP klar uke 8. Mål: 500K MAU innen 12 mnd.

Økonomiske estimater (12 mnd):
- 500K MAU, 5% konvertering = 25,000 betalende
- ARR: $1.5M (Pro) + $500K (Enterprise) = $2M
- CAC: $2, LTV: $60 → LTV/CAC = 30x

Team:     Trenger 2 fullstack + 1 iOS + 1 designer + 1 PM
Funding:  Ser etter $500K pre-seed for 18 mnd runway
```
