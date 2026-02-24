# 04 — CarbonZero 🌍

> Spor, reduser og kompenser ditt personlige karbonavtrykk — med gamification og ekte handling.

---

## 1. Toppopplysninger

| Felt | Verdi |
|------|-------|
| **App-navn** | CarbonZero |
| **Domeneforslag** | carbonzero.app / getcarbonzero.com |
| **Tagline** | Mål utslippene dine. Kutt dem. Nå null. |
| **Elevator pitch** | CarbonZero tracker automatisk ditt karbonavtrykk fra transport, mat, energi og forbruk — og gir personlige handlingsplaner, utfordringer og karbon-kompensering for å nå netto null. Gamification + fellesskap driver atferdsendring. |

### Problemkort

| | |
|---|---|
| **Problem** | Individer mangler verktøy for å forstå og redusere sitt CO₂-avtrykk. Gjennomsnittlig person slipper ut 4,7 tonn/år. |
| **Hvem rammes** | Alle — spesielt miljøbevisste forbrukere (18–45), bedrifter med klimamål, skoler |
| **Omfang** | Karbon-offset-marked: $2 mrd (2023), forventet $50+ mrd innen 2030. Consumer climate-app-marked i rask vekst. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
1. Karbonavtrykk-kalkulator (transport, mat, energi, shopping)
2. Automatisk sporing via bank-API (kategoriserer kjøp → CO₂)
3. Personlig handlingsplan med ukentlige utfordringer
4. Leaderboard og badges (gamification)
5. Karbon-kompensering (kjøp verifiserte offsets)
6. Dashboard med trender og mål

**Nice-to-have (v2):**
7. Bank-/kortintegrasjon (Plaid/Tink) for automatisk kategorisering
8. Smart hjem-integrasjon (Nest, Hue) for energisporing
9. B2B: Bedrifts-klimadashboard for ansatte
10. Community: Lokale klima-grupper og utfordringer
11. AI-coach: Personlige tips basert på livsstil

### Målgruppe

**Persona 1: «Emma, 22, student, klimaaktivist»**
- Mål: Vite nøyaktig hva som driver hennes utslipp, konkurrer med venner
- Smertepunkt: Uklart hva som faktisk gjør mest forskjell

**Persona 2: «Henrik, 40, familiefar, pendler»**
- Mål: Redusere familiens avtrykk, spare penger på energi
- Smertepunkt: Vet ikke hvor han skal starte, for mange vage tips

**Persona 3: «Sofie, 35, CSO i tech-selskap»**
- Mål: Engasjere 200 ansatte i klimamål, rapportere scope 3
- Smertepunkt: Ingen verktøy som gjør det enkelt og morsomt for ansatte

### Use Cases

1. **Onboarding:** Emma fyller ut 3-min livsstilsquiz → får sitt årlige avtrykk (5,2 tonn) → personlig plan
2. **Automatisk sporing:** Henrik kobler bankkort → app kategoriserer kjøp → viser at bilkjøring = 40 % av avtrykket
3. **Ukentlig utfordring:** «Spis vegetarisk 3 dager denne uken» → logger → sparer 12 kg CO₂ → badge
4. **Kompensering:** Emma kjøper 1 tonn karbon-offset ($15) → verifisert Gold Standard-prosjekt
5. **B2B dashboard:** Sofie ser ansattes samlede reduksjon: 45 tonn siste kvartal → bruker i ESG-rapport

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | CarbonZero diff. |
|------------|--------|---------|-------------------|
| Klima | God UX, offset-kjøp | Kun offset, lite sporing | Helhetlig: sporing + handling + offset |
| Capture | Automatisk bank-sporing | Kun UK, lite gamification | Global + gamification + B2B |
| Pawprint | Kalkulator + tips | Begrenset, lite engasjement | AI-coach + leaderboard + bedrift |

---

## 3. Tekniske spesifikasjoner

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI, HealthKit (steg→transport), WidgetKit |
| Web | Next.js 14, Chart.js/Recharts, TailwindCSS |
| Backend | Node.js + TypeScript, Express |
| Database | PostgreSQL (Supabase) |
| Bank-API | Plaid (USA) / Tink (EU) |
| Offset-API | Gold Standard / Patch.io |
| Auth | Supabase Auth |
| Betaling | Stripe |
| Push | FCM |
| Hosting | Vercel + AWS Lambda |

### API-design

```
POST   /auth/signup
POST   /auth/login

POST   /footprint/calculate    — Kalkuler fra quiz-input
GET    /footprint/summary      — Totalsammendrag
GET    /footprint/breakdown    — Per kategori (transport, mat, energi, etc.)
GET    /footprint/history      — Månedlig historikk

POST   /activities             — Logg aktivitet manuelt
GET    /activities             — Hent loggede aktiviteter

GET    /challenges             — Aktive utfordringer
POST   /challenges/:id/join   — Bli med i utfordring
POST   /challenges/:id/log    — Logg fremgang

GET    /leaderboard            — Topp-rangering
GET    /leaderboard/friends    — Venners rangering

POST   /offsets/purchase       — Kjøp karbon-offset
GET    /offsets/history        — Offsethistorikk

GET    /insights               — AI-genererte tips
```

### Datamodeller

```
users (id, email, name, country, onboarding_data, total_footprint_kg, created_at)
footprint_entries (id, user_id, category[transport|food|energy|shopping|other],
                   co2_kg, source, description, date, created_at)
challenges (id, title, description, co2_saving_kg, duration_days, category)
user_challenges (id, user_id, challenge_id, status, progress, completed_at)
offsets (id, user_id, amount_kg, cost_usd, provider, project_name, certificate_url, created_at)
achievements (id, user_id, badge_type, unlocked_at)
```

### Sikkerhet

- Bank-data via Plaid/Tink (PCI-kompatibelt, aldri lagrer kortnummer)
- GDPR: Full datakontroll, eksport, sletting
- Offset-verifisering: Kun Gold Standard / Verra-sertifiserte prosjekter

---

## 4. Implementasjonsleveranser

### MVP Sprintplan

| Sprint | Uker | Leveranse |
|--------|------|-----------|
| 0 | 1 | Repo, auth, DB |
| 1 | 2 | Karbon-kalkulator + onboarding-quiz |
| 2 | 2 | Dashboard + manuell logging + trender |
| 3 | 1 | Utfordringer + gamification |
| 4 | 1 | Offset-kjøp (Stripe + Patch.io) |
| 5 | 1 | iOS app |
| 6 | 1 | Leaderboard + polish + testing |
| **Total** | **9 uker** | |

### Kostnadsestimater

| Scenario | Team | Tid | Kostnad |
|----------|------|-----|---------|
| **Lean** | 2 fullstack | 10 uker | $25 000–35 000 |
| **Standard** | 2 fullstack + 1 iOS + 1 designer | 9 uker | $65 000–95 000 |
| **Full** | 4 devs + designer + PM | 7 uker | $130 000–180 000 |

### Miljøvariabler

```env
DATABASE_URL=postgresql://...
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PATCH_API_KEY=...
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-... (for AI insights)
```

---

## 5. Kode og eksempler

Se tilhørende kodefiler:
- [`ios/FootprintView.swift`](ios/FootprintView.swift)
- [`web/DashboardPage.tsx`](web/DashboardPage.tsx)
- [`backend/server.ts`](backend/server.ts)
- [`tests/footprint.test.ts`](tests/footprint.test.ts)

---

## 6. Design og UX

### Fargepalett

| Rolle | Hex |
|-------|-----|
| Primary (Natur-grønn) | `#22C55E` |
| Secondary (Jord-brun) | `#92400E` |
| Accent (Sol-gul) | `#FACC15` |
| Background | `#F0FDF4` |
| Danger (Karbon-rød) | `#EF4444` |

### Hovedskjermer

1. **Dashboard:** Stor CO₂-tall (animert ring-graf), kategorifordeling (kakediagram), trend-graf
2. **Logger:** Quick-add knapper (bil, fly, kjøtt, etc.) med estimert CO₂
3. **Utfordringer:** Kortstabel med aktive utfordringer, progresjon, badges
4. **Offset:** Prosjektkort (treplanting, solenergi) med pris og impact
5. **Leaderboard:** Venner og globalt, ukentlig/månedlig

### Onboarding

1. «Hva er ditt karbonavtrykk?» → Quiz (transport, bolig, mat, shopping) → 3 min
2. Resultat: «Du slipper ut X tonn/år — det er [over/under] gjennomsnittet»
3. «La oss lage en plan» → Velg 3 fokusområder
4. Opprett konto → Daglige påminnelser

### Tilgjengelighet

- Fargekoder alltid kombinert med ikoner/tekst
- Skjermleser-vennlige grafer (alt-tekst med tall)
- Redusert bevegelse respekteres

---

## 7. Go-to-market

### Forretningsmodell

| Pakke | Pris | Innhold |
|-------|------|---------|
| Free | $0 | Kalkulator, manuell logging, 1 utfordring/uke |
| Pro | $3,99/mnd | Auto-sporing, AI-tips, ubegrensede utfordringer |
| Teams | $5/ansatt/mnd | Alt + admin dashboard + ESG-rapport |

| Tilleggsinnntekt | |
|---|---|
| Offset-kommisjon | 10 % av offset-salg |
| Affiliate | Miljøvennlige produkter |

### App Store-tekst

**Tittel:** CarbonZero — Klimasporing & Handling
**Undertittel:** Mål, kutt og kompenser ditt CO₂-avtrykk

> Visste du at gjennomsnittspersonen slipper ut 4,7 tonn CO₂ i året? CarbonZero hjelper deg å forstå, redusere og kompensere — med ukentlige utfordringer, smart sporing og verifisert karbon-offsetting.

**Keywords:** karbonavtrykk, klima, CO2, bærekraft, offset, miljø, klimasporing

### Markedsplan

| Mnd | Aktivitet |
|-----|-----------|
| 1 | Lansering på Earth Day, TikTok-kampanje, studentambassadører |
| 2 | B2B pilot med 3 bedrifter, LinkedIn thought leadership |
| 3 | Partnerskap med bank (vise CO₂ i nettbank), PR |

---

## 8. Juridisk & compliance

- GDPR: Bankdata slettet etter kategorisering, kun aggregater lagres
- PCI: Aldri direkte korttilgang, kun via Plaid/Tink tokens
- Offset-transparens: Sertifikatnummer og prosjektlenker alltid synlige
- Greenwashing-risiko: Tydelig kommunikasjon om at offset er supplement, ikke erstatning

---

## 9. Drift og vekst

### KPIer

| KPI | 6 mnd | 12 mnd |
|-----|-------|--------|
| MAU | 20 000 | 150 000 |
| Utfordringer fullført/mnd | 15 000 | 200 000 |
| Offset solgt (tonn) | 500 | 10 000 |
| B2B kunder | 5 | 30 |

---

## 10. Salgspakke

### Investor one-pager

```
CARBONZERO — Personlig klimahandling i lomma

Problem:  Individer mangler verktøy for å spore og kutte CO₂-utslipp.
Løsning:  Auto-sporing + gamification + verifisert offset.
Modell:   Freemium $3,99/mnd + B2B $5/ansatt/mnd + offset-kommisjon.

Økonomi (12 mnd):
  MAU: 150K, 15K betalende = $60K MRR
  Offset: 10K tonn × $15 × 10% = $15K/mnd
  ARR: $900K
  Burn: $30K/mnd
  Ask: $500K seed → break-even mnd 12
```
