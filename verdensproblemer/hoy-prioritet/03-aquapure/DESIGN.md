# 03 — AquaPure 💧

> Rent vann til alle — gjennom smart overvåking, filtrering og community-rapportering.

---

## 1. Toppopplysninger

| Felt | Verdi |
|------|-------|
| **App-navn** | AquaPure |
| **Domeneforslag** | aquapure.io / getaquapure.com |
| **Tagline** | Rent vann, overvåket i sanntid. |
| **Elevator pitch** | AquaPure kobler IoT-sensorer, crowdsourced rapportering og AI-analyse for å gi sanntids vannkvalitetsdata til 2,2 milliarder mennesker uten trygt drikkevann — og hjelper myndigheter og NGOer med å prioritere innsats. |

### Problemkort

| | |
|---|---|
| **Problem** | 2,2 mrd mennesker mangler trygt drikkevann. 485 000 dør årlig av diaré grunnet forurenset vann. |
| **Hvem rammes** | Landsbygda i Afrika, Asia, Latin-Amerika; urbane slumområder; katastrofe-rammede regioner |
| **Omfang** | Globalt vannrensingsmarked: $45 mrd. Smart water management: $21 mrd innen 2030. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
1. Vannkvalitetskart med crowdsourced rapporter (turbiditet, smak, sykdomsutbrudd)
2. IoT-sensor-dashboard (pH, klorin, turbiditet, bakterier) for vannverk/NGOer
3. Push-varsling ved forurensningshendelser i brukerens område
4. Rapporteringssystem: brukere rapporterer vannproblemer med foto + GPS
5. Informasjonsbibliotek: vannrensingsmetoder, DIY-filtre
6. Admin-panel for myndigheter/NGOer med prioriteringsalgoritme

**Nice-to-have (v2):**
7. AI-prediksjon: forurensningsrisiko basert på vær, industri, sesong
8. Markedsplass for vannfiltre og renseutstyr
9. Blockchain-verifisert vannkvalitetslogg for transparens
10. Integrasjon med UNICEF/WHO-databaser

### Målgruppe og brukerpersonaer

**Persona 1: «Amina, 30, lærer, landsby i Tanzania»**
- Mål: Vite om brønnvannet er trygt for barna
- Smertepunkt: Ingen informasjon om vannkvalitet, barn blir ofte syke

**Persona 2: «Dr. Chen, 45, UNICEF vannspesialist»**
- Mål: Prioritere vannprosjekter i 50 landsbyer effektivt
- Smertepunkt: Utdaterte rapporter, manuell datainnsamling, 6 mnd forsinkelse

**Persona 3: «Raj, 35, leder av vannverk, India»**
- Mål: Overvåke 200 vannpunkter i sanntid
- Smertepunkt: Manuell prøvetaking 1x/mnd, kan ikke oppdage akutt forurensning

### Use Cases

1. **Crowdsource-rapport:** Amina oppdager misfarget vann → tar foto → rapporterer i appen med GPS → nærliggende brukere varsles
2. **NGO-prioritering:** Dr. Chen ser dashboard med 50 landsbyer rangert etter vannkvalitetsrisiko → fokuserer ressurser på de 10 verste
3. **IoT-overvåking:** Rajs sensorer oppdager pH-fall kl. 03:00 → automatisk varsling → vannverk stenger tilførsel → hindrer sykdomsutbrudd
4. **DIY-filter:** Amina ser video om SODIS (solar disinfection) → bygger filter med lokale materialer
5. **Katastrofe-respons:** Flom i regionen → appen viser berørte vannpunkter → nødhjelp-team dirigeres dit

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | AquaPure differensiering |
|------------|--------|---------|--------------------------|
| mWater | NGO-fokus, åpne data | Dårlig UX, ingen forbruker-app | Consumer + B2G hybrid |
| Hach (Veolia) | Enterprise IoT-sensorer | Dyrt, kun B2B | Crowdsourced + IoT hybrid, lav kostnad |
| Water.org | Sterk merkevare | Ikke tech-plattform | Tech-first med actionable data |

---

## 3. Tekniske spesifikasjoner

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI, MapKit, CoreLocation, Camera |
| Web | Next.js 14, Mapbox GL, TailwindCSS |
| Backend | Node.js + TypeScript, Express |
| Database | PostgreSQL + PostGIS (TimescaleDB for tidsserie-sensordata) |
| IoT | MQTT broker (AWS IoT Core) → Lambda → TimescaleDB |
| Auth | Supabase Auth |
| Storage | Cloudflare R2 (bilder fra rapporter) |
| Push | FCM + APNs |
| Analytics | PostHog |
| Hosting | Vercel (web) + AWS ECS (API) + AWS IoT Core |

### API-design

```
POST   /reports               — Rapporter vannproblem (foto + GPS + type)
GET    /reports?lat=&lng=&r=  — Hent rapporter i nærheten
GET    /reports/:id           — Hent rapport-detaljer

GET    /quality?lat=&lng=     — Hent vannkvalitetsdata for punkt/område
GET    /sensors               — Liste over IoT-sensorer (admin)
GET    /sensors/:id/readings  — Sensoravlesninger (tidsserie)

GET    /alerts                — Aktive varsler i brukerens område
POST   /alerts/subscribe      — Abonner på varslinger for område

GET    /resources             — Informasjonsbibliotek (filtre, tips)
GET    /resources/:id         — Hent spesifikk artikkel

GET    /admin/dashboard       — Prioriterings-dashboard (NGO/myndigheter)
GET    /admin/heatmap         — Risikovarmekart
```

### Datamodeller

```
users (id, email, name, role, location, created_at)
water_reports (id, user_id FK, lat, lng, type[contamination|taste|odor|disease],
              severity, description, photo_url, verified, created_at)
sensors (id, name, lat, lng, installed_by, status, created_at)
sensor_readings (sensor_id FK, timestamp, ph, chlorine, turbidity, bacteria_count, temp)
alerts (id, region_polygon, severity, message, active, created_at)
resources (id, title, content, category, language, created_at)
```

### Sikkerhet

- Rapporter kan være anonyme (beskytter varslere i autoritære regimer)
- Sensordata kryptert i transit (TLS) og lagret med RBAC
- GDPR for europeiske brukere, generell personvern-policy globalt
- API rate limiting, bildemoderering

---

## 4. Implementasjonsleveranser

### MVP Sprintplan

| Sprint | Uker | Leveranse |
|--------|------|-----------|
| 0 | 1 | Repo, DB (PostGIS + TimescaleDB), auth |
| 1 | 2 | Crowdsource-rapportering (backend + web + iOS) |
| 2 | 2 | Kart + vannkvalitetsvisning + varslinger |
| 3 | 2 | IoT-integrasjon (MQTT → TimescaleDB) |
| 4 | 1 | Admin-dashboard + prioriteringsalgoritme |
| 5 | 1 | Informasjonsbibliotek + offline-modus |
| 6 | 1 | Testing, polish, App Store |
| **Total** | **10 uker** | |

### Kostnadsestimater

| Scenario | Team | Tid | Kostnad |
|----------|------|-----|---------|
| **Lean** | 2 fullstack + 1 IoT | 12 uker | $35 000–50 000 |
| **Standard** | 3 fullstack + 1 iOS + 1 designer | 10 uker | $80 000–120 000 |
| **Full** | 6 devs + designer + PM + IoT-spesialist | 8 uker | $160 000–220 000 |

### Miljøvariabler

```env
DATABASE_URL=postgresql://...
TIMESCALE_URL=postgresql://...
AWS_IOT_ENDPOINT=xxx.iot.eu-west-1.amazonaws.com
MQTT_TOPIC_PREFIX=aquapure/sensors/
MAPBOX_TOKEN=pk.ey...
CLOUDFLARE_R2_BUCKET=aquapure-reports
FCM_SERVER_KEY=...
```

---

## 5. Kode og eksempler

Se tilhørende kodefiler:
- [`ios/WaterMapView.swift`](ios/WaterMapView.swift)
- [`web/QualityDashboard.tsx`](web/QualityDashboard.tsx)
- [`backend/server.ts`](backend/server.ts)
- [`backend/Dockerfile`](backend/Dockerfile)
- [`tests/reports.test.ts`](tests/reports.test.ts)

---

## 6. Design og UX

### Fargepalett

| Rolle | Hex |
|-------|-----|
| Primary (Vann-blå) | `#0A84FF` |
| Secondary (Sjøgrønn) | `#30D5C8` |
| Danger (Rød) | `#FF3B30` |
| Warning (Gul) | `#FFCC00` |
| Background | `#F0F8FF` |
| Text | `#1C1C1E` |

### Hovedskjermer

1. **Kart:** Varmekart over vannkvalitet (grønn → rød), brukere kan trykke for detaljer
2. **Rapporter:** Liste med brukerrapporter, foto, severitet-badge
3. **Sensor-dashboard:** Sanntidsgrafer (pH, turbiditet, etc.) per sensor
4. **Varslinger:** Push-feed med aktive advarsler
5. **Ressurser:** Artikler/videoer om vannrensing

### Tilgjengelighet

- Offline-modus for områder med dårlig nett (rapporter synkroniseres når tilkoblet)
- Flerspråklig fra dag 1 (engelsk, swahili, hindi, spansk, fransk)
- Lav databruk-modus (komprimerte bilder, tekst-first)

---

## 7. Go-to-market

### Forretningsmodell

| Inntektskilde | Modell |
|---------------|--------|
| B2G SaaS | $500–5 000/mnd per myndighet/NGO (dashboard + API) |
| IoT hardware | Sensorpakke $199 + $19/mnd data |
| Markedsplass | Vannfiltre med affiliate-inntekt (10 %) |
| Donasjon | «Sponsor rent vann»-funksjon |

### Markedsplan

| Mnd | Aktivitet |
|-----|-----------|
| 1 | Pilot med 1 NGO i Tanzania, 500 brukere, 10 sensorer |
| 2 | Publiser åpne data → PR → WHO/UNICEF-oppmerksomhet |
| 3 | Utvid til India, partnerskap med Water.org |

---

## 8. Juridisk & compliance

- Anonym rapportering for brukersikkerhet
- Sensordata eid av kunde (myndighet/NGO), AquaPure er databehandler
- Open data-lisens for aggregerte, anonymiserte data
- Medisinsk fraskrivelse: «Vannkvalitetsdata er veiledende, ikke laboratorie-sertifisert»

---

## 9. Drift, måling og vekst

### KPIer

| KPI | 6 mnd | 12 mnd |
|-----|-------|--------|
| Rapporter/mnd | 5 000 | 50 000 |
| Aktive sensorer | 100 | 1 000 |
| NGO-kunder | 5 | 25 |
| Varsler sendt | 10 000 | 200 000 |

---

## 10. Salgspakke

### Investor one-pager

```
AQUAPURE — Rent vann, overvåket i sanntid

Problem:  2,2 mrd uten trygt drikkevann. 485K dødsfall/år.
Løsning:  Crowdsourced rapporter + IoT-sensorer + AI-prioritering.
Modell:   B2G SaaS + IoT hardware + markedsplass.
Impact:   Forhindre sykdomsutbrudd, prioritere vannprosjekter.

Økonomi (12 mnd):
  NGO-kunder: 25 ($5K/mnd snitt) = $125K MRR
  IoT-enheter: 1 000 ($19/mnd) = $19K MRR
  Total ARR: ~$1.7M
  Burn: $50K/mnd
  Ask: $1M seed (impact investors + grants)
```
