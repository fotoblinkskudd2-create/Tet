# DebtZero — Intelligent Gjeldsnedbetalingsapp

> **Domeneforslag:** debtzero.app, getdebtzero.com  
> **Tagline:** «Gjeldsfri. Raskere.»  
> **Elevator Pitch:** DebtZero bruker AI til å analysere all gjeld, opprette optimale nedbetalingsplaner (snøball/skred), forhandle med kreditorer automatisk, og motivere brukere med milepæler — slik at 340M+ gjeldsrammede blir gjeldfrie opptil 7 år raskere.

---

## 1. Toppopplysninger

### Problemkort

| Felt | Detalj |
|------|--------|
| **Problem** | $17T+ i global husholdningsgjeld. 340M+ mennesker sitter i gjeldsspiral. Gjennomsnittlig amerikansk hushold skylder $104K. Mangel på verktøy og motivasjon for systematisk nedbetaling. |
| **Hvem rammes** | Unge voksne med studielån, familier med boliglån + kredittkort, gig-arbeidere med variabel inntekt, alle med 3+ gjeldskilder |
| **Omfang** | $17T US husholdningsgjeld. $1.1T kredittkortgjeld (ny rekord). 1 av 4 gjeldsfanger mangler plan. Gjeldsstress koster $500B/år i helseproblemer. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
- Koble alle gjeldskilder automatisk (Plaid/Open Banking)
- AI-generert optimal nedbetalingsplan (snøball vs skred vs hybrid)
- Visuell gjeldsnedtelling med milepæler
- Automatisk betalingspåminnelser og scheduling
- «Gjeldsforhandler» — AI-assistert brev til kreditorer for lavere rente

**Nice-to-have:**
- Community (anonym gjeldsstøtte-grupper)
- Gjeldskonsilidering-matching (finn bedre lån)
- Inntektsoptimalisering (sideinntekts-forslag)
- Familiemodus (delt gjeldsplan for par)
- Gamifisert «Debt Destroyer» med XP og badges

### Brukerpersonaer

**Persona 1: Jake (29, Austin, TX)**
- Software dev, $82K studielån + $15K kredittkort + $5K billån
- Mål: Bli gjeldfri på 5 år (i stedet for 20)
- Smertepunkt: Overveldende mange kontoer, vet ikke hva å betale først

**Persona 2: Priya (38, London, UK)**
- To-inntektsfamilie, £250K boliglån + £18K kredittkort + £8K personlig lån
- Mål: Ekstra innbetaling effektivt, spare rentekostnader
- Smertepunkt: Manuell tracking i Excel, glemmer betalinger

**Persona 3: Carlos (45, Mexico City)**
- Selvstendig næringsdrivende, variabel inntekt, 200K MXN i gjeld på 5 kredittkort
- Mål: Slutte å betale minimumsbeløp, ha en konkret plan
- Smertepunkt: Renter spiser opp betalingene hans

### Use Cases

1. **Gjeldskartlegging:** Jake kobler 4 kontoer via Plaid → DebtZero viser total gjeld, renter, minimumsbetalinger i ett dashboard.
2. **Planvalg:** AI analyserer og anbefaler «Avalanche-metoden» — spar $12,400 vs snøball — men Jake velger snøball for motivasjon. Appen respekterer valget.
3. **Renteforhandling:** DebtZero genererer forhandlingsbrev for Jakes kredittkort (24.9% → foreslår 14.9%), med instruksjoner for samtale med banken.
4. **Milepæler:** Priya betaler ned kredittkort #1 → konfetti-animasjon, «£18K → £12K! 33% ned!».
5. **Variabel inntekt:** Carlos har en god måned → DebtZero foreslår «Betal 3000 MXN ekstra til kort #3 — spar 8200 MXN i renter.»

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | DebtZero-differensiering |
|-----------|--------|---------|--------------------------|
| Undebt.it | Gratis, god snøball/skred-kalkulator | Ingen app, ingen banktilkobling, manuelt | Automatisk kobling, AI, mobilapp |
| Tally | Automatisk kredittkortbetaling | Kun USA, kun kredittkort, gebyr | Alle gjeldstyper, globalt, AI-forhandling |
| YNAB | Godt budsjetteringsverktøy | Ikke gjeldsspesifikt, ingen AI-plan | 100% gjeldfokusert, AI-optimert |

---

## 3. Tekniske Spesifikasjoner

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI, WidgetKit (hjemskjerm-widget) |
| Web | Next.js 14, React 18, TypeScript, TailwindCSS, Recharts |
| Backend | Node.js, TypeScript, Express, Prisma |
| Database | PostgreSQL (Supabase), Redis (caching) |
| AI | OpenAI GPT-4o (forhandlingsbrev, planoptimalisering) |
| Banking | Plaid (US/CA/UK), Tink (EU), Salt Edge (global) |
| Payments | Stripe (subscription), automatisk bankoverføring |
| Hosting | Vercel (web), AWS ECS (API) |

### API-Design

```
POST   /auth/register
POST   /auth/login

GET    /debts                  → Hent alle gjeldsposter
POST   /debts                  → Legg til manuelt
POST   /debts/sync             → Synkroniser via Plaid
DELETE /debts/:id              → Fjern gjeldspost

GET    /plans                  → Hent nedbetalingsplaner
POST   /plans/generate         → AI-generer optimal plan
PUT    /plans/:id/select       → Velg plan

POST   /payments/:debtId       → Registrer betaling
GET    /payments/schedule      → Hent betalingsplan

POST   /negotiate/generate     → Generer forhandlingsbrev (AI)
GET    /negotiate/templates    → Ferdige brevmaler

GET    /progress               → Milepæler, total fremgang
GET    /progress/projections   → Fremtidige scenarier
```

### Datamodeller

```
debts
├── id (UUID, PK)
├── user_id (UUID, FK)
├── name (VARCHAR) — «Visa kredittkort», «Studielån Lånekassen»
├── type (ENUM: credit_card, student_loan, mortgage, personal_loan, car_loan, other)
├── balance (DECIMAL)
├── interest_rate (DECIMAL) — årlig %
├── minimum_payment (DECIMAL)
├── due_date_day (INT) — dag i måneden
├── lender (VARCHAR)
├── plaid_account_id (VARCHAR, nullable)
├── status (ENUM: active, paid_off, defaulted)
└── created_at (TIMESTAMP)

repayment_plans
├── id (UUID, PK)
├── user_id (UUID, FK)
├── method (ENUM: avalanche, snowball, hybrid, custom)
├── extra_monthly (DECIMAL) — ekstra utover minimumsbetaling
├── total_interest_saved (DECIMAL)
├── payoff_date (DATE)
├── is_active (BOOLEAN)
├── plan_json (JSONB) — detaljert månedlig plan
└── created_at (TIMESTAMP)

payments
├── id (UUID, PK)
├── debt_id (UUID, FK)
├── amount (DECIMAL)
├── payment_date (DATE)
├── type (ENUM: minimum, extra, lump_sum)
├── source (ENUM: manual, auto, plaid)
└── created_at (TIMESTAMP)

milestones
├── id (UUID, PK)
├── user_id (UUID, FK)
├── type (VARCHAR) — debt_paid_off, 50pct_milestone, first_extra_payment
├── debt_id (UUID, FK, nullable)
├── achieved_at (TIMESTAMP)
└── metadata (JSONB)
```

### Sikkerhet
- Plaid Link for sikker banktilkobling (ingen lagring av credentials)
- AES-256 kryptering av gjeldsdata
- GDPR: full data-eksport og sletting
- Ikke en finansiell rådgiver — disclaimer

---

## 4. Implementasjon

### MVP Sprintplan (10 uker, 3 utviklere)

| Sprint | Uke | Oppgaver |
|--------|-----|----------|
| 1 | 1–2 | Auth, gjeldsmodell, Plaid-integrasjon, manuell innlegging |
| 2 | 3–4 | Snøball/skred-algoritmne, planvisning, visuell nedtelling |
| 3 | 5–7 | AI-forhandlingsbrev, betalingspåminnelser, push-varsler |
| 4 | 8–9 | Milepæler, gamification, iOS-widget |
| 5 | 10 | Beta-test, App Store submission, marketing-prep |

### Estimater

| Scenario | Team | Tid | Kostnad |
|----------|------|-----|---------|
| **Lean** | 2 fullstack + 1 designer | 10 uker | $50,000–70,000 |
| **Standard** | 3 fullstack + 1 iOS + 1 designer + 1 PM | 14 uker | $150,000–220,000 |
| **Full** | 5 dev + 2 designer + 1 PM + 1 QA + 1 finans-rådgiver | 20 uker | $350,000–500,000 |

---

## 5. Kode og Eksempler

Se medfølgende filer for iOS, web og backend implementasjoner.

---

## 6. Design og UX

### Fargepalett
| Rolle | Farge | HEX |
|-------|-------|-----|
| Primary | Indigo | #4F46E5 |
| Secondary | Emerald | #10B981 |
| Accent | Rose | #F43F5E |
| Background | Slate 50 | #F8FAFC |
| Debt (negative) | Red 500 | #EF4444 |
| Paid off (positive) | Green 500 | #22C55E |

### Hovedskjerm
```
┌─────────────────────────────┐
│ DebtZero    [💬] [⚙️]       │
├─────────────────────────────┤
│ Total gjeld                 │
│ $102,000 → $0              │
│ ══════════░░░░ 34% betalt  │
│ Gjeldfri: mars 2029        │
├─────────────────────────────┤
│ 📊 Dine gjelder            │
│ ┌─ Studielån     $82,000 ─┐│
│ │  4.5% · $450/mnd · 2034 ││
│ ├─ Visa           $15,000 ─┤│
│ │  24.9% · $300/mnd · ⚡  ││
│ ├─ Billån          $5,000 ─┤│
│ │  6.0% · $200/mnd · 2027 ││
│ └──────────────────────────┘│
│ ⚡ = neste fokus (skred)    │
├─────────────────────────────┤
│ 🎯 Neste milepæl            │
│ Betal av Visa → spar $8,200 │
│ [Registrer betaling →]      │
├─────────────────────────────┤
│ [🏠] [📊] [💳] [📈] [👤]   │
└─────────────────────────────┘
```

---

## 7. Go-to-Market

### Forretningsmodell
- **Free:** 3 gjeldsposter, grunnleggende snøball/skred-plan
- **Pro ($6.99/mnd):** Ubegrenset gjeld, AI-forhandling, automatisk synkronisering, widget
- **Couples ($9.99/mnd):** Delt gjeldsplan for par

### Investor One-Pager
```
DEBTZERO — Investor One-Pager

Problem:  $17T husholdningsgjeld, 340M i gjeldsspiral
Løsning:  AI-drevet gjeldsnedbetalingsoptimalisering + forhandlingsverktøy
Marked:   TAM $15B (personal debt management)
Modell:   Freemium $7/mnd Pro, $10/mnd Couples
Traksjon: MVP uke 10. Mål: 200K brukere, $3M ARR innen 12 mnd.

Nøkkeltall: Avg bruker sparer $8,200+ i renter, 7 år kortere nedbetaling
Funding: $750K pre-seed
```

---

## 8–10. (Juridisk, Drift, Salgspakke)

- **Juridisk:** Ikke finansiell rådgivning (disclaimer), GDPR-compliant, Plaid PCI-håndtering
- **KPIer:** 200K MAU (12m), churn <6%, avg gjeld redusert $15K/bruker/år
- **Salgspakke:** Demo med 3 brukerprofiler, 30s/60s demovideo-script, App Store-tekster klare
