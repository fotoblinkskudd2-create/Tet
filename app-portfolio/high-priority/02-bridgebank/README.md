# BridgeBank — Neobank for de Ubankede

> **Domeneforslag:** bridgebank.app, getbridgebank.com  
> **Tagline:** «Bank for alle. Overalt.»  
> **Elevator Pitch:** BridgeBank gir 1.4 milliarder ubankede voksne tilgang til digitale kontoer, betalinger, sparing og mikrolån — via mobiltelefon, uten krav om tradisjonell ID eller minsteinnskudd, med USSD-støtte for feature phones.

---

## 1. Toppopplysninger

### Problemkort

| Felt | Detalj |
|------|--------|
| **Problem** | 1.4 mrd voksne globalt har ingen bankkonto. De er utestengt fra sparing, kreditt, forsikring og digital økonomi. De betaler 5-15% ekstra for kontante transaksjoner. |
| **Hvem rammes** | Voksne i Sub-Sahara Afrika, Sør-Asia, Sørøst-Asia. Kvinner (56% av ubankede), rurale befolkning, migranter, uformell sektor. |
| **Omfang** | 1.4 mrd ubankede (Verdensbanken 2024). $380 mrd/år i tapt produktivitet. Mobilpenetrasjon 83% i utviklingsland = distribusjonsmulighet. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
- Digital konto uten tradisjonell ID (biometrisk + telefon-KYC)
- Peer-to-peer betalinger (QR, telefonnummer)
- USSD-grensesnitt for feature phones (intet internett nødvendig)
- Mikro-sparing (rundingsautomatikk, sparemål)
- Agent-nettverk for kontantinnskudd/-uttak
- Flerspråklig med talebasert UI

**Nice-to-have:**
- Mikrolån basert på transakssjonshistorikk (AI credit scoring)
- Mikroforsikring (helse, avling, telefon)
- Merchant-betalinger med QR
- Grensekryssende overføringer
- Spare-grupper (tontine/chama-modell)

### Brukerpersonaer

**Persona 1: Amina (28, Nairobi, Kenya)**
- Grønnsakselger, tjener ~$150/mnd kontant, ingen ID-kort
- Mål: Trygg oppbevaring av penger, betale leverandører digitalt
- Smertepunkt: Mistet $200 i tyveri, M-Pesa krever registrering hun ikke klarte

**Persona 2: Ravi (45, Bihar, India)**
- Bonde, sesongbasert inntekt $50–400/mnd, har Aadhaar men ingen bankkonto
- Mål: Spare til neste sesong, motta statlige subsidier digitalt
- Smertepunkt: Nærmeste bank er 40 km unna, åpningstider passer ikke

**Persona 3: Fatima (35, Dhaka, Bangladesh)**
- Fabrikkarkeider, sender penger til landsby, har feature phone
- Mål: Sende penger hjem billig, bygge sparebuffer
- Smertepunkt: Agenter tar 8% gebyr på overføringer

### Use Cases

1. **Registrering uten ID:** Amina taster *123# → USSD-meny → tar selfie med agentens telefon → biometrisk registrering → konto aktiv på 3 min.
2. **Sparerunding:** Ravi selger ris for ₹247, BridgeBank runder opp til ₹250 → ₹3 flyttes automatisk til sparekonto.
3. **Agent-innskudd:** Fatima gir 500 Tk kontant til lokal agent → agenten skanner QR → beløpet legges på Fatimas digitale konto.
4. **P2P-betaling:** Amina betaler leverandør via telefonnummer — ingen app nødvendig, kun USSD.
5. **Mikrolån:** Etter 6 mnd historikk tilbys Ravi ₹5000 mikrolån basert på AI-scoring.

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | BridgeBank-differensiering |
|-----------|--------|---------|--------------------------|
| M-Pesa | Stor utbredelse, agentnettverk | Kun Øst-Afrika, krever ID, begrensede spareprodukter | Globalt, ID-fri, full bankfunksjonalitet |
| Paytm (India) | Stor brukerbase | Kun India, krever smarttelefon, kompleks | USSD-støtte, enklere UX |
| Wave (Afrika) | Lave avgifter | Begrenset geografi, ingen sparing/lån | Komplett bankplattform med AI-lån |

---

## 3. Tekniske Spesifikasjoner

### Arkitektur

```
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ iOS App     │  │ Web App      │  │ USSD Gateway │
│ (SwiftUI)   │  │ (Next.js)    │  │ (Africa's T) │
└──────┬──────┘  └──────┬───────┘  └──────┬───────┘
       └────────────┬───┘─────────────────┘
                    │
             ┌──────┴──────┐
             │ API Gateway  │
             │ (Kong)       │
             └──────┬──────┘
                    │
   ┌────────┬───────┼────────┬──────────┐
   │        │       │        │          │
┌──┴──┐ ┌───┴──┐ ┌──┴──┐ ┌──┴───┐ ┌───┴────┐
│Auth │ │Core  │ │Loan │ │Notif │ │Agent   │
│KYC  │ │Bank  │ │Svc  │ │Svc   │ │Mgmt    │
│Svc  │ │API   │ │(ML) │ │(SMS) │ │Portal  │
└──┬──┘ └───┬──┘ └──┬──┘ └──┬───┘ └───┬────┘
   └────────┴───────┴───────┴─────────┘
                    │
        ┌───────────┼────────────┐
        │           │            │
   ┌────┴────┐ ┌────┴─────┐ ┌───┴────┐
   │PostgreSQL│ │Redis     │ │S3/Blob │
   │(Ledger) │ │(Sessions)│ │(KYC)   │
   └─────────┘ └──────────┘ └────────┘
```

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI, CryptoKit (device encryption) |
| Web | Next.js 14, React 18, TypeScript, TailwindCSS |
| USSD | Node.js USSD gateway (Africa's Talking API) |
| Backend | Node.js, TypeScript, Express, Prisma |
| Database | PostgreSQL (double-entry ledger), Redis |
| KYC | Onfido/Smile ID (biometri), device fingerprinting |
| Betaling | Visa/Mastercard issuance (Marqeta), SWIFT, local rails |
| SMS | Africa's Talking, Twilio |
| ML | Python (FastAPI) for credit scoring |
| Hosting | AWS (ECS, RDS, S3) med regionale deployments |

### API-Design

```
POST   /auth/register       → Biometrisk registrering
POST   /auth/verify-otp     → SMS OTP-verifisering

GET    /accounts/me          → Hent kontooversikt
GET    /accounts/me/balance  → Sanntidssaldo

POST   /transfers/p2p        → Send penger til telefonnummer
POST   /transfers/agent      → Registrer agent-innskudd/uttak
GET    /transfers/history    → Transaksjonshistorikk

POST   /savings/goal         → Opprett sparemål
PUT    /savings/roundup      → Aktiver/deaktiver spareautomatikk

POST   /loans/apply          → Søk om mikrolån
GET    /loans/status         → Lånestatus og nedbetalingsplan

POST   /ussd/callback        → USSD session handler
```

### Datamodeller

```
accounts
├── id (UUID, PK)
├── user_id (UUID, FK)
├── account_number (VARCHAR, UNIQUE)
├── balance (DECIMAL, precision 18,4)
├── currency (VARCHAR, 3) — KES, INR, BDT, USD
├── status (ENUM: active, frozen, closed)
├── tier (ENUM: basic, standard, premium) — KYC-nivå
└── created_at (TIMESTAMP)

ledger_entries (double-entry bookkeeping)
├── id (UUID, PK)
├── transaction_id (UUID)
├── account_id (UUID, FK)
├── type (ENUM: debit, credit)
├── amount (DECIMAL)
├── balance_after (DECIMAL)
├── description (VARCHAR)
└── created_at (TIMESTAMP)

kyc_records
├── id (UUID, PK)
├── user_id (UUID, FK)
├── verification_type (ENUM: biometric, phone, document, agent)
├── status (ENUM: pending, approved, rejected)
├── data_encrypted (BYTEA) — AES-256 encrypted
└── verified_at (TIMESTAMP)

agents
├── id (UUID, PK)
├── name (VARCHAR)
├── phone (VARCHAR, UNIQUE)
├── location_lat (DECIMAL)
├── location_lng (DECIMAL)
├── float_balance (DECIMAL)
├── status (ENUM: active, suspended)
└── created_at (TIMESTAMP)

loans
├── id (UUID, PK)
├── user_id (UUID, FK)
├── amount (DECIMAL)
├── interest_rate (DECIMAL)
├── term_days (INT)
├── status (ENUM: applied, approved, disbursed, repaid, defaulted)
├── risk_score (DECIMAL) — ML-generated
└── created_at (TIMESTAMP)
```

### Sikkerhet

- **KYC-tiering:** Tier 1 (telefon+selfie, $200/mnd limit), Tier 2 (+dokument, $2000/mnd), Tier 3 (full KYC, ubegrenset)
- **Kryptering:** End-to-end for USSD, AES-256 for KYC-data at rest
- **PCI DSS Level 1:** For kortutstedelse og transaksjoner
- **Anti-fraud:** Real-time transaction monitoring, velocity checks, device fingerprinting
- **Regulering:** E-money license per jurisdiksjon (CBK, RBI, BB)

---

## 4. Implementasjon

### MVP Sprintplan (12 uker, 5 utviklere)

| Sprint | Uke | Oppgaver |
|--------|-----|----------|
| 1 | 1–2 | Konto-oppretting, telefon-KYC, USSD-grensesnitt |
| 2 | 3–4 | Double-entry ledger, P2P-overføringer, SMS-varsler |
| 3 | 5–7 | Agent-portal, innskudd/uttak, QR-betalinger |
| 4 | 8–10 | Mikro-sparing (mål, avrunding), iOS app, web dashboard |
| 5 | 11–12 | Sikkerhet, compliance-review, pilottest med 100 brukere |

### Estimater

| Scenario | Team | Tid | Kostnad |
|----------|------|-----|---------|
| **Lean** | 3 fullstack + 1 fintech-rådgiver | 12 uker | $80,000–120,000 |
| **Standard** | 5 utviklere + 1 iOS + 1 designer + 1 compliance + 1 PM | 20 uker | $250,000–400,000 |
| **Full** | 8 utviklere + 2 ML + 2 designer + 2 compliance + 1 PM + 1 QA | 30 uker | $700,000–1,200,000 |

*Antakelser: Inkluderer e-money lisens ($10K–50K per land), agent-rekruttering, og compliance-arbeid.*

### Miljøvariabler

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AFRICAS_TALKING_API_KEY=...
AFRICAS_TALKING_USERNAME=...
ONFIDO_API_KEY=...
MARQETA_API_KEY=...
SMS_SENDER_ID=BridgeBank
ENCRYPTION_KEY=... (256-bit)
JWT_SECRET=...
```

---

## 5. Kode og Eksempler

Se medfølgende filer:
- `frontend-ios/AccountView.swift`
- `frontend-web/src/app/dashboard/page.tsx`
- `backend/src/index.ts`
- `infra/Dockerfile`, `infra/docker-compose.yml`
- `tests/transfers.test.ts`

---

## 6. Design og UX

### Fargepalett
| Rolle | Farge | HEX |
|-------|-------|-----|
| Primary | Deep Teal | #0D9488 |
| Secondary | Gold | #F59E0B |
| Background | Warm White | #FFFBEB |
| Surface | White | #FFFFFF |
| Text | Gray 900 | #111827 |

### USSD-skjermflyt
```
*123# → Velkommen til BridgeBank
1. Sjekk saldo
2. Send penger
3. Spare
4. Lån
5. Finn agent
0. Hjelp
```

### Tilgjengelighet
- USSD for feature phones (ingen internett)
- Talebasert navigasjon (IVR-støtte)
- Høy kontrast, store ikoner for smarttelefon-app
- RTL-støtte (arabisk, urdu)
- Offline-modus for dårlig dekning

---

## 7. Go-to-Market

### Forretningsmodell
- **Transaksjonsavgift:** 0.5–1% per overføring (vs 5-15% hos agenter)
- **Mikrolånrente:** 2–4%/mnd (vs 10–30% hos uformelle långivere)
- **Merchant-fees:** 1% per betaling
- **Premium-tjenester:** Forsikring, høyere grenser, prioritert support

### Prisstrategi
- Gratis konto-oppretting
- Gratis P2P inntil $100/mnd
- Transakssjonsbasert inntekt deretter
- Ingen månedlige avgifter (kritisk for målgruppen)

### Markedsplan (3 mnd)
| Mnd | Aktivitet |
|-----|-----------|
| 1 | Pilot i 1 distrikt (Kenya/India), rekrutter 50 agenter |
| 2 | Word-of-mouth, community-grupper, lokal radio |
| 3 | Utvid til 5 distrikter, NGO-partnerskap (BRAC, Grameen) |

---

## 8. Juridisk & Compliance
- E-money license påkrevd per jurisdiksjon
- AML/KYC-tiering iht. FATF-anbefalinger
- Data lokalisering (India: data må lagres lokalt)
- Agent-regulering og opplæring
- Forbrukerbeskyttelse: tydeig gebiroversikt, klagekanal

---

## 9. Drift og Vekst

### KPIer
| KPI | 6 mnd | 12 mnd |
|-----|-------|--------|
| Registrerte brukere | 50,000 | 500,000 |
| Aktive kontoer (MAU) | 25,000 | 250,000 |
| Transaksjonsvolum/mnd | $2M | $50M |
| Agent-nettverk | 200 | 2,000 |
| Loan default rate | <5% | <3% |

---

## 10. Salgspakke

### Investor One-Pager
```
BRIDGEBANK — Investor One-Pager

Problem:  1.4 mrd ubankede voksne, $380B/år tapt produktivitet
Løsning:  Mobil neobank med USSD, biometrisk KYC, mikro-sparing/lån
Marked:   TAM $100B+ (global mobile money + neobank)
Modell:   Transakssjonsbasert (0.5-1%) + mikrolån (2-4%/mnd)
Traksjon: Pilot klar uke 12. Mål: 500K brukere innen 12 mnd.

Økonomiske estimater (12 mnd):
- 250K MAU, 10 txn/bruker/mnd, avg $5/txn = $150M volum
- Revenue: $1.5M (fees) + $500K (loans) = $2M ARR
- Agent-nettverk: 2000 agenter i 3 land

Team: 5 utviklere + 2 compliance + 1 ML + 1 PM
Funding: $1.5M seed for 18 mnd + lisenser i 3 land
```
