# 02 — SaverPlate 🍽️

> Kobler matoverskudd med sultne mennesker og spareglade forbrukere — i sanntid.

---

## 1. Toppopplysninger

| Felt | Verdi |
|------|-------|
| **App-navn** | SaverPlate |
| **Domeneforslag** | saverplate.com / saverplate.app |
| **Tagline** | Redd mat. Spar penger. Fôr verden. |
| **Elevator pitch** | SaverPlate kobler restauranter, butikker og bakeri med forbrukere og veldedigheter for å selge overskuddsmat til 50–70 % rabatt. Reduserer matsvinn, gir billig mat og kutter CO₂ — vinn-vinn-vinn. |

### Problemkort

| | |
|---|---|
| **Problem** | 1,3 mrd tonn mat kastes hvert år — verdt $1 trillion. Samtidig sulter 828 M mennesker. |
| **Hvem rammes** | Restauranter (marginpress), forbrukere (matpriser stiger), klima (8–10 % av globale utslipp) |
| **Omfang** | Globalt matsvinn-marked: $50 mrd TAM. Too Good To Go har vist modellen fungerer i Europa. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
1. Kart med nærliggende tilbud på overskuddsmat (geolokasjon)
2. Butikk-/restaurantprofiler med «surprise bags» og spesifikke produkter
3. Bestilling og betaling i appen (Stripe)
4. Push-varsling ved nye tilbud i nærheten
5. Bruker- og selger-registrering med verifisering
6. Rating/anmeldelsessystem

**Nice-to-have (v2):**
7. B2B: Koble overskudd til matbanker/veldedigheter (logistikk-matching)
8. AI-prediksjon for butikker: «Du kommer til å ha overskudd i morgen — lag tilbud nå»
9. Gamification: «CO₂ spart»-badge, leaderboard
10. Abonnement: «SaverPlate Plus» — tidlig tilgang + gratis levering
11. API for POS-systemer (integrasjon med kassasystemer)

### Målgruppe og brukerpersonaer

**Persona 1: «Lise, 24, student, Oslo»**
- Mål: Spise rimelig og bærekraftig
- Smertepunkt: Stram økonomi, vil ikke kaste mat, liker variasjon

**Persona 2: «Anders, 52, bakerieier, Bergen»**
- Mål: Tjene noe på brød som ellers kastes, redusere svinn
- Smertepunkt: 20 % av daglig produksjon kastes, dårlig samvittighet

**Persona 3: «Fatima, 38, leder av matbank, Trondheim»**
- Mål: Få stabil tilgang til overskuddsmat for 500 familier
- Smertepunkt: Uforutsigbar donasjon, logistikk-kaos

### Use Cases / Brukerreiser

1. **Student-kjøp:** Lise åpner appen kl. 20 → ser bakeri 300m unna med «Brød-bag» til 29 kr (verdi 90 kr) → bestiller → henter innen 30 min
2. **Bakeri publiserer:** Anders legger ut «5 baguetter + 3 kanelboller» kl. 17 → 3 kjøpere bestiller innen 10 min → nullsvinn
3. **Matbank-matching:** Fatima abonnerer på «B2B-feed» → cateringfirma har 200 porsjoner over → logistikk arrangeres automatisk
4. **Gamification:** Lise har reddet 50 kg mat → får «Planet Hero»-badge → deler på Instagram
5. **AI-varsling:** Anders får push kl. 14: «Basert på salgsdata forventer vi 15 usolgte croissanter. Opprett tilbud nå?»

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | SaverPlate differensiering |
|------------|--------|---------|----------------------------|
| Too Good To Go | Sterk merkevare, 80M brukere | Kun «surprise bags», lite kontroll | Spesifikke produkter + B2B-matching |
| Karma (Sverige) | God UX, spesifikke produkter | Kun Sverige, lite skalerbart | Global ambisjon + AI-prediksjon |
| Olio | Community-drevet | Mest privat mat, ikke kommersiell | Profesjonell B2C + B2B plattform |

---

## 3. Tekniske spesifikasjoner

### Arkitekturdiagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  iOS App      │     │  Web App      │     │  Seller Dashboard │
│  (SwiftUI)    │     │  (Next.js)    │     │  (Next.js)        │
└──────┬───────┘     └──────┬───────┘     └────────┬─────────┘
       │                     │                       │
       └─────────┬───────────┴───────────────────────┘
                 │ HTTPS
       ┌─────────▼──────────┐
       │  API (Node/Express) │──── PostGIS (geo-queries)
       └─────────┬──────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌──────────┐
│PostgreSQL│ │ Redis  │ │ S3/CDN   │
│+ PostGIS │ │(Queue) │ │(Images)  │
└────────┘ └────────┘ └──────────┘
```

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI, MapKit, CoreLocation |
| Web | Next.js 14, React, TailwindCSS, Mapbox GL |
| Backend | Node.js + TypeScript, Express |
| Database | PostgreSQL + PostGIS (Supabase) |
| Cache/Queue | Redis (Upstash) + BullMQ |
| Auth | Supabase Auth + rolle-basert (buyer/seller/admin) |
| Betaling | Stripe Connect (markedsplass-modell) |
| Push | Firebase Cloud Messaging |
| Bilder | Cloudflare R2 + resizing |
| Analytics | PostHog |
| Hosting | Vercel (web) + AWS ECS (API) |

### API-design

```
POST   /auth/signup              — Registrer (rolle: buyer|seller)
POST   /auth/login               — Logg inn

GET    /listings?lat=&lng=&r=    — Hent tilbud innen radius (km)
GET    /listings/:id             — Hent spesifikt tilbud
POST   /listings                 — Opprett tilbud (seller)
PUT    /listings/:id             — Oppdater tilbud
DELETE /listings/:id             — Slett tilbud

POST   /orders                   — Bestill (reserverer + betaling)
GET    /orders                   — Mine bestillinger
PUT    /orders/:id/pickup        — Marker som hentet
PUT    /orders/:id/cancel        — Kanseller

GET    /stores/:id               — Butikkprofil
GET    /stores/:id/stats         — Butikkstatistikk (svinn redusert, inntekt)

POST   /reviews                  — Gi anmeldelse
GET    /reviews?store=           — Hent anmeldelser

POST   /billing/connect          — Stripe Connect onboarding (seller)
POST   /billing/webhook          — Stripe webhooks
```

#### Request/Response

```json
// GET /listings?lat=59.91&lng=10.75&r=3
// Response:
{
  "listings": [
    {
      "id": "lst_abc123",
      "store": { "id": "str_1", "name": "Baker Hansen", "lat": 59.912, "lng": 10.752 },
      "title": "Brød-bag",
      "description": "3 baguetter + 2 kanelboller",
      "original_price": 120,
      "price": 39,
      "quantity_available": 5,
      "pickup_start": "2026-02-24T17:00:00Z",
      "pickup_end": "2026-02-24T19:00:00Z",
      "image_url": "https://cdn.saverplate.com/img/lst_abc123.jpg",
      "distance_km": 0.3
    }
  ],
  "total": 12
}
```

### Datamodeller

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ users         │     │ stores         │     │ listings       │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ id PK         │◄────│ owner_id FK    │◄────│ store_id FK    │
│ email         │     │ id PK          │     │ id PK          │
│ name          │     │ name           │     │ title          │
│ role          │     │ address        │     │ description    │
│ stripe_cust   │     │ location(geo)  │     │ original_price │
│ created_at    │     │ category       │     │ price          │
└──────┬──────┘     │ rating         │     │ qty_available  │
       │            │ stripe_acct    │     │ pickup_start   │
       │            └──────────────┘     │ pickup_end     │
       │                                  │ image_url      │
       │            ┌──────────────┐     │ status (enum)  │
       │            │ orders         │     └──────────────┘
       │            ├──────────────┤
       └────────────│ buyer_id FK    │
                    │ listing_id FK  │
                    │ id PK          │
                    │ quantity       │
                    │ total_price    │
                    │ status (enum)  │
                    │ stripe_pi      │
                    │ picked_up_at   │
                    └──────────────┘

                    ┌──────────────┐
                    │ reviews        │
                    ├──────────────┤
                    │ id PK          │
                    │ order_id FK    │
                    │ user_id FK     │
                    │ store_id FK    │
                    │ rating (1-5)   │
                    │ comment        │
                    └──────────────┘
```

### Sikkerhet

- Stripe Connect for markedsplass (PCI DSS-kompatibel)
- Geo-data anonymisert for analyser
- GDPR: Samtykke, sletting, portabilitet
- Rate limiting per IP og bruker
- Bildemoderering (AWS Rekognition)

---

## 4. Implementasjonsleveranser

### MVP Sprintplan

| Sprint | Uker | Leveranse |
|--------|------|-----------|
| 0 | 1 | Repo, CI/CD, DB med PostGIS, auth |
| 1 | 2 | Kart + listings CRUD (backend + web) |
| 2 | 2 | Bestilling + Stripe Connect betaling |
| 3 | 1 | iOS app (kart, bestilling, profil) |
| 4 | 1 | Push-varsling + rating-system |
| 5 | 1 | Seller dashboard + statistikk |
| 6 | 1 | Testing, polish, App Store |
| **Total** | **9 uker** | |

### Kostnadsestimater

| Scenario | Team | Tid | Kostnad |
|----------|------|-----|---------|
| **Lean** | 2 fullstack | 10 uker | $30 000–45 000 |
| **Standard** | 2 fullstack + 1 iOS + 1 designer | 9 uker | $70 000–100 000 |
| **Full** | 5 devs + designer + PM | 7 uker | $140 000–200 000 |

*Antakelser: Stripe Connect tar 0,5 % + selgers gebyr. Markedsplass-avgift: 15 % per transaksjon.*

### CI/CD

- GitHub Actions: lint → test → build → deploy
- Web → Vercel (preview per PR, prod på main)
- Backend → AWS ECS med auto-scaling
- iOS → Fastlane → TestFlight → App Store

### Miljøvariabler

```env
DATABASE_URL=postgresql://...?sslmode=require
REDIS_URL=redis://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_WEBHOOK_SECRET=whsec_...
MAPBOX_TOKEN=pk.ey...
FCM_SERVER_KEY=...
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET=saverplate-images
```

---

## 5. Kode og eksempler

Se tilhørende kodefiler:
- [`ios/MapListingsView.swift`](ios/MapListingsView.swift)
- [`web/ListingsPage.tsx`](web/ListingsPage.tsx)
- [`backend/server.ts`](backend/server.ts)
- [`backend/Dockerfile`](backend/Dockerfile)
- [`tests/listings.test.ts`](tests/listings.test.ts)

---

## 6. Design og UX

### Fargepalett

| Rolle | Hex |
|-------|-----|
| Primary (Grønn) | `#34C759` |
| Secondary (Varm oransje) | `#FF9500` |
| Background | `#F5F5F0` |
| Card | `#FFFFFF` |
| Text | `#1C1C1E` |

### Typografi

- Overskrifter: SF Pro Rounded (iOS) / Plus Jakarta Sans (web)
- Body: 16px, regular

### Hovedskjermer

1. **Kart:** Fullskjerm-kart med pins for tilbud, bunnark med listekort
2. **Listing-kort:** Bilde, butikknavn, tittel, pris (gjennomstreket original), avstand, hentetid
3. **Bestillingsflow:** Velg antall → Bekreft → Betal → QR-kode for henting
4. **Seller Dashboard:** Aktive tilbud, ordrehistorikk, inntekt/svinn-graf

### Onboarding

1. «Redd mat nær deg» → vis kart med eksempel-tilbud
2. Velg rolle: Kjøper eller Selger
3. Tillat lokasjon
4. Opprett konto
5. Første tilbud synlig → konverteringsmoment

### Tilgjengelighet

- Kartalternativ: listevisning for skjermlesere
- Alle bilder med alt-tekst
- Kontrast ≥ 4.5:1
- Keyboard-navigasjon for hele bestillingsflow

---

## 7. Go-to-market

### Forretningsmodell

**Markedsplass-avgift + Abonnement**

| Inntektskilde | Modell |
|---------------|--------|
| Transaksjonsavgift | 15 % av hver ordre (fra selger) |
| SaverPlate Plus | $3,99/mnd — tidlig tilgang, gratis levering |
| B2B Matbank | $99/mnd per organisasjon |
| Annonsering | Promoted listings $5/dag |

### App Store-tekst

**Tittel:** SaverPlate — Redd Mat & Spar Penger
**Undertittel:** Overskuddsmat fra restauranter nær deg

> Kjøp mat som ellers ville blitt kastet — til 50–70 % rabatt! Restauranter, bakerier og butikker i nærheten din legger ut fersk mat hver dag. Du redder planeten, én porsjon av gangen.

**Keywords:** matsvinn, billig mat, bærekraftig, overskuddsmat, redd mat, restaurant, bakeri

### Markedsplan

| Mnd | Aktivitet |
|-----|-----------|
| 1 | Pilot i 1 by (50 butikker), PR-lansering, influencer-kampanje |
| 2 | Utvid til 3 byer, Google Ads, samarbeid med studentorganisasjoner |
| 3 | B2B matbank-pilot, referral-program (gi 50 kr, få 50 kr) |

---

## 8. Juridisk & compliance

- Mattrygghetsregler: Selger er ansvarlig for matmerking og holdbarhet
- GDPR: Lokasjonsdata slettet etter 30 dager for kjøpere
- Stripe Connect: Markedsplass-lisens kreves i noen jurisdiksjoner
- Vilkår som dekker ansvar ved allergier/matbårne sykdommer

---

## 9. Drift, måling og vekst

### KPIer

| KPI | 6 mnd | 12 mnd |
|-----|-------|--------|
| Aktive butikker | 200 | 1 000 |
| MAU (kjøpere) | 15 000 | 100 000 |
| Ordre/mnd | 5 000 | 50 000 |
| GMV/mnd | $150K | $1,5M |
| Mat reddet (tonn) | 50 | 500 |

### Skalering

| Brukere | Infra-kostnad/mnd |
|---------|-------------------|
| 0–10K | $100 |
| 10K–100K | $1 000 |
| 100K–1M | $8 000 |

---

## 10. Salgspakke

### Investor one-pager

```
SAVERPLATE — Markedsplass for overskuddsmat

Problem:  1,3 mrd tonn mat kastes/år ($1T verdi). 828M sulter.
Løsning:  Geo-basert markedsplass: butikker → forbrukere/veldedigheter.
Modell:   15% transaksjonsavgift + abonnement + B2B.
Traction: [Pilot: 50 butikker, 2 000 brukere, 500 ordrer/mnd]

Økonomi (12 mnd):
  GMV: $1,5M/mnd → $270K revenue/mnd
  Butikker: 1 000 aktive
  LTV/kjøper: $35, CAC: $5
  Burn: $40K/mnd
  Ask: $750K seed → 15% → break-even mnd 10
```

### Demo-video (30s)

```
0–5s:  [Fakta] "33% av all mat kastes. Samtidig sulter 828 millioner."
5–10s: [Logo] "SaverPlate."
10–20s: [Skjermopptak] Åpne kart → se tilbud → bestill brød-bag → betal
20–25s: [Stats] "50% rabatt. 0% matsvinn."
25–30s: [CTA] "Last ned SaverPlate — redd mat i dag."
```
