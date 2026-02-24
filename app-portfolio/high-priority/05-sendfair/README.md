# SendFair — Rettferdige Internasjonale Pengeoverføringer

> **Domeneforslag:** sendfair.app, getsendfair.com  
> **Tagline:** «Send penger hjem. Rettferdig.»  
> **Elevator Pitch:** SendFair bruker blockchain-rails og lokal likviditet til å kutte remitteringsavgifter fra 6.3% til under 1%, slik at de $48 milliarder som går tapt i avgifter årlig i stedet når familier i utviklingsland — via en app så enkel som å sende en SMS.

---

## 1. Toppopplysninger

### Problemkort

| Felt | Detalj |
|------|--------|
| **Problem** | $48 mrd/år kastes bort i remitteringsavgifter. Gjennomsnittlig avgift: 6.3% globalt (opptil 15% i Afrika). 800M+ mennesker er avhengige av remitteringer — de fattigste betaler mest. |
| **Hvem rammes** | Migrantarbeidere (150M+), deres familier i hjemland (800M+), diaspora-samfunn. Spesielt: Latin-Amerika, Sub-Sahara Afrika, Sør-Asia, Filippinene. |
| **Omfang** | $656 mrd i remitteringer til utviklingsland (2023). $48 mrd tapt i avgifter. Gjennomsnittlig overføring: $200 → $12.60 i avgift. UN SDG 10.c: reduser til <3% innen 2030. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
- Overføring til 50+ land med <1% avgift
- Sanntids valutakurs (mid-market rate, ingen markup)
- Utbetaling: bankkonto, mobilpenger (M-Pesa, GCash), kontant (agentnettverk)
- KYC-verifisering (ID + selfie, 3 min)
- Sanntids sporing av overføring
- Flerspråklig (EN, ES, FR, TL, HI, AR + 10)

**Nice-to-have:**
- Recurring/planlagte overføringer
- Multi-mottaker (splitt til flere)
- Regningsbetaling direkte i mottakerland
- Spare-funksjon for mottakere
- Bedrifts-API for arbeidsgivere (lønnsutbetaling til utlandet)

### Brukerpersonaer

**Persona 1: Juan (34, Los Angeles)**
- Mexikaner i USA, sender $400/mnd til mor i Oaxaca
- Mål: Lavest mulig avgift, rask levering
- Smertepunkt: Western Union tar $25 + dårlig kurs

**Persona 2: Grace (28, London)**
- Kenyaner i UK, sender £200/mnd til familie i Kisumu
- Mål: Enkelt, pålitelig, mottaker kan hente i M-Pesa
- Smertepunkt: Nåværende tjeneste tar 3 dager og 8%

**Persona 3: Raj (42, Dubai)**
- Inder i UAE, sender ₹50,000/mnd til familie i Kerala
- Mål: Beste kurs, automatisk månedlig overføring
- Smertepunkt: Bank tar 5% + ₹500 i gebyr

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | SendFair-differensiering |
|-----------|--------|---------|--------------------------|
| Wise (TransferWise) | God kurs, transparent | Dyrt for små beløp, ingen kontant-utbetaling | <1% flat, kontant+M-Pesa |
| Western Union | Enormt agentnettverk | Dyrt (8-15%), treg, dårlig kurs | 10x billigere, like bredt |
| Remitly | God app, rask | Variabel kurs-markup, USA-sentrisk | Bedre kurs, mer globalt |

---

## 3. Tekniske Spesifikasjoner

### Arkitektur

```
┌──────────┐  ┌──────────┐
│ iOS App  │  │ Web App  │
│ SwiftUI  │  │ Next.js  │
└────┬─────┘  └────┬─────┘
     └──────┬──────┘
            │
     ┌──────┴──────┐
     │ API Gateway  │
     │ + WAF        │
     └──────┬──────┘
            │
   ┌────────┼────────┬──────────┐
   │        │        │          │
┌──┴──┐ ┌──┴───┐ ┌──┴──┐ ┌───┴─────┐
│Auth │ │Trans │ │FX    │ │Payout   │
│KYC  │ │Engine│ │Rate  │ │Partners │
│Svc  │ │      │ │Svc   │ │(APIs)   │
└──┬──┘ └──┬───┘ └──┬──┘ └───┬─────┘
   └───────┴────────┴────────┘
           │
    ┌──────┴──────┐
    │ PostgreSQL  │
    │ + Redis     │
    │ + Blockchain│
    │   (Stellar) │
    └─────────────┘
```

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI |
| Web | Next.js 14, TypeScript, TailwindCSS |
| Backend | Node.js, TypeScript, Express |
| Database | PostgreSQL, Redis |
| Blockchain | Stellar Network (settlement) |
| FX | CurrencyLayer API, Wise Business API |
| KYC | Onfido, Jumio |
| Payout | Thunes (global), M-Pesa API, GCash API, bank SWIFT/ACH |
| Compliance | Chainalysis (AML), Sanction screening |
| Hosting | AWS multi-region |

### API-Design

```
POST   /auth/register
POST   /auth/verify-kyc

POST   /transfers/quote         → Få pris og leveringstid
POST   /transfers/create        → Opprett overføring
GET    /transfers/:id/status    → Spor overføring
GET    /transfers/history       → Historikk

GET    /rates/:from/:to         → Sanntids valutakurs
GET    /rates/compare           → Sammenlign med konkurrenter

POST   /recipients              → Legg til mottaker
GET    /recipients              → Hent mottakere

GET    /corridors               → Tilgjengelige land/utbetalingsmetoder
```

### Datamodeller

```
transfers
├── id (UUID, PK)
├── sender_id (UUID, FK → users)
├── recipient_id (UUID, FK → recipients)
├── send_amount (DECIMAL)
├── send_currency (VARCHAR, 3)
├── receive_amount (DECIMAL)
├── receive_currency (VARCHAR, 3)
├── exchange_rate (DECIMAL, precision 10,6)
├── fee (DECIMAL)
├── fee_percentage (DECIMAL)
├── payout_method (ENUM: bank, mobile_money, cash, wallet)
├── status (ENUM: pending, processing, sent, delivered, failed, refunded)
├── stellar_tx_hash (VARCHAR, nullable)
├── estimated_delivery (TIMESTAMP)
├── delivered_at (TIMESTAMP, nullable)
└── created_at (TIMESTAMP)

recipients
├── id (UUID, PK)
├── user_id (UUID, FK)
├── name (VARCHAR)
├── country (VARCHAR, 2)
├── phone (VARCHAR)
├── bank_account (VARCHAR, encrypted)
├── mobile_money_number (VARCHAR)
├── relationship (VARCHAR) — family, friend, business
└── created_at (TIMESTAMP)

exchange_rates (cached, updated every 30s)
├── from_currency (VARCHAR, 3)
├── to_currency (VARCHAR, 3)
├── mid_rate (DECIMAL)
├── our_rate (DECIMAL)
├── competitor_rates (JSONB) — Wise, WU, Remitly rates for comparison
└── updated_at (TIMESTAMP)
```

### Sikkerhet og Compliance

- **Money transmitter licenses** per jurisdiksjon (US: state-by-state, EU: PSD2/EMI, UK: FCA)
- **AML/KYC:** Tiered KYC, sanction screening, transaction monitoring
- **PCI DSS:** Stripe for card payments, aldri lagre kortnummer
- **Blockchain:** Stellar for settlement — irreversible, transparent, auditable
- **Encryption:** AES-256 for PII, TLS 1.3 in transit

---

## 4. Implementasjon

### MVP (12 uker, 4 utviklere)

| Sprint | Uke | Oppgaver |
|--------|-----|----------|
| 1 | 1–3 | KYC-flyt, brukerregistrering, mottaker-CRUD |
| 2 | 4–6 | FX-motor, quote engine, Stellar-integrasjon |
| 3 | 7–9 | Payout-integrasjoner (bank, M-Pesa), sporing |
| 4 | 10–12 | iOS app, web, compliance-review, pilot med 1 korridor |

### Estimater

| Scenario | Tid | Kostnad |
|----------|-----|---------|
| **Lean** (1 korridor) | 12 uker | $100,000–150,000 |
| **Standard** (10 korridorer) | 20 uker | $300,000–500,000 |
| **Full** (50+ korridorer) | 30 uker | $800,000–1,500,000 |

*Antakelser: Lisenskostnader $50K–200K per jurisdiksjon ikke inkludert.*

---

## 5–10. Design, Go-to-Market, Juridisk, Drift, Salgspakke

### Fargepalett
| Rolle | HEX |
|-------|-----|
| Primary (Blue) | #2563EB |
| Secondary (Green) | #059669 |
| Accent (Orange) | #EA580C |
| Background | #F0FDF4 |

### Forretningsmodell
- **Flat avgift:** $0.99 per overføring inntil $500, 0.5% over $500
- **FX margin:** 0.1–0.3% over mid-market (vs 2–5% hos konkurrenter)
- **B2B API:** $0.50/overføring for bedrifter (lønnsutbetalinger)

### Investor One-Pager
```
SENDFAIR — Investor One-Pager

Problem:  $48 mrd/år tapt i remitteringsavgifter
Løsning:  Blockchain-basert overførings-plattform, <1% avgift
Marked:   TAM $40B (global remittance fee market)
Modell:   $0.99 flat + 0.1% FX margin
Mål:      100K brukere, $500M i volum, $5M ARR innen 18 mnd

Nøkkeltall: $200-overføring koster $1.99 hos oss vs $15+ hos WU
Funding:  $2M seed (lisenser + liquidity pool)
```

Se medfølgende kodefiler for iOS, web og backend implementasjoner.
