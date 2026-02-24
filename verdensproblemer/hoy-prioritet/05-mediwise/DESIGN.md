# 05 — MediWise 💊

> Trygg medisinering for alle — AI-drevet medisinhåndtering som redder liv.

---

## 1. Toppopplysninger

| Felt | Verdi |
|------|-------|
| **App-navn** | MediWise |
| **Domeneforslag** | mediwise.app / getmediwise.com |
| **Tagline** | Aldri gå glipp av en dose. Aldri ta feil medisin. |
| **Elevator pitch** | MediWise bruker AI og bildegjenkjenning til å identifisere medisiner, sjekke interaksjoner, gi påminnelser og forenkle medisinhåndtering — spesielt for eldre, kronisk syke og omsorgspersoner. Reduserer de 250 000 dødsfallene fra feilmedisinering årlig. |

### Problemkort

| | |
|---|---|
| **Problem** | Feilmedisinering er den 3. største dødsårsaken i USA: 250 000 dødsfall/år. 50 % av kroniske pasienter tar medisiner feil. |
| **Hvem rammes** | Eldre (polyfarmasi: 5+ medisiner), kronisk syke, omsorgspersoner, helsepersonell |
| **Omfang** | Medisinsk overholdelse-marked: $8,2 mrd (2025), forventet $16+ mrd i 2032. |

---

## 2. Produktoversikt

### Kjernefunksjoner

**Must-have (MVP):**
1. Medisinliste med dosering, tidspunkt og instruksjoner
2. Smart påminnelser (push + alarm) med bekreftelse
3. Interaksjonssjekker (AI: «Medisin A + B = farlig kombinasjon»)
4. Pillegjenkjenning via kamera (ta bilde → identifiser medisin)
5. Omsorgsperson-tilgang (familien ser om bestemor har tatt medisinene)
6. Historikk og adherence-rapport (del med lege)

**Nice-to-have (v2):**
7. Apotek-integrasjon (automatisk medisinliste fra e-resept)
8. Legemiddeldatabase med bivirkninger og info
9. AI-chatbot for spørsmål om medisiner
10. Smartklokke-app (påminnelse på håndleddet)
11. B2B: Sykehjem-dashboard for medisinrevisjon

### Målgruppe

**Persona 1: «Olav, 78, pensjonist, tar 7 medisiner daglig»**
- Mål: Huske alle medisiner til rett tid, unngå farlige interaksjoner
- Smertepunkt: Glemmer doser, forvirret av komplekst medisinskjema

**Persona 2: «Karin, 48, datter og omsorgsperson»**
- Mål: Følge med på at pappa tar medisinene sine fra avstand
- Smertepunkt: Bor 300 km unna, bekymret daglig

**Persona 3: «Dr. Patel, 55, fastlege»**
- Mål: Se pasienters medisinhistorikk og etterlevelse
- Smertepunkt: Pasienter husker ikke hva de tar, feilrapporterer

### Use Cases

1. **Påminnelse:** Olav får alarm kl. 08 → åpner app → ser «Ta Metformin 500mg med mat» → trykker ✓
2. **Interaksjonssjekk:** Olav legger til ny medisin → AI varsler: «Warfarin + Ibuprofen: økt blødningsrisiko. Kontakt lege.»
3. **Pillegjenkjenning:** Olav finner løs pille → tar bilde → app identifiserer som Atorvastatin 20mg
4. **Omsorgsperson:** Karin ser i appen at pappa ikke har bekreftet kveldsmedisiner → ringer ham
5. **Legerapport:** Dr. Patel ser at Olav har 65 % etterlevelse siste mnd → justerer behandlingsplan

### Konkurrentanalyse

| Konkurrent | Styrke | Svakhet | MediWise diff. |
|------------|--------|---------|----------------|
| Medisafe | Stor brukerbase, påminnelser | Lite AI, ingen pillegjenkjenning | AI interaksjoner + kamera-ID |
| MyTherapy | Enkel, gratis | Begrenset interaksjonssjekk | Omsorgsperson-modus + legerapport |
| PillPack (Amazon) | Fysisk levering | Kun USA, ikke app-first | Global, AI-first, familiefokus |

---

## 3. Tekniske spesifikasjoner

### Teknologistack

| Lag | Teknologi |
|-----|-----------|
| iOS | SwiftUI, AVFoundation (kamera), CoreML (pillegjenkjenning), UserNotifications |
| Web | Next.js 14, TailwindCSS |
| Backend | Node.js + TypeScript, Express |
| Database | PostgreSQL (Supabase) |
| AI/ML | OpenAI GPT-4o (interaksjoner), custom CoreML model (pille-ID), NIH DailyMed API |
| Auth | Supabase Auth + familiedeling |
| Push | APNs + FCM |
| Hosting | Vercel + AWS ECS |

### API-design

```
POST   /auth/signup
POST   /auth/login

GET    /medications             — Brukerens medisinliste
POST   /medications             — Legg til medisin
PUT    /medications/:id         — Oppdater medisin
DELETE /medications/:id         — Fjern medisin

POST   /medications/identify    — Identifiser pille fra bilde (upload)
POST   /medications/interactions — Sjekk interaksjoner

GET    /reminders               — Hent påminnelser
PUT    /reminders/:id/confirm   — Bekreft at dose er tatt
GET    /reminders/history       — Historikk

POST   /caregivers/invite       — Inviter omsorgsperson
GET    /caregivers/dependents   — Se mine avhengige
GET    /caregivers/dependents/:id/status — Status for avhengig

GET    /reports/adherence       — Etterlevelses-rapport (PDF)
```

### Datamodeller

```
users (id, email, name, role[patient|caregiver|doctor], dob, created_at)
medications (id, user_id FK, name, dosage, frequency, instructions,
             rx_number, start_date, end_date, active)
reminders (id, medication_id FK, scheduled_at, confirmed_at, skipped, note)
interactions (id, med_a_id FK, med_b_id FK, severity[low|moderate|severe],
              description, source)
pill_identifications (id, user_id, image_url, identified_name, confidence, created_at)
caregiver_links (id, caregiver_id FK, patient_id FK, permissions, created_at)
```

### Sikkerhet

- **HIPAA-kompatibel:** Kryptert PHI, BAA med alle underleverandører, audit logging
- **Kryptering:** AES-256 at rest, TLS 1.3 in transit
- **Biometrisk auth:** Face ID / Touch ID for å åpne appen
- **Familiedeling:** Invitasjonsbasert, granulerte tillatelser
- **Bildehåndtering:** Pillebilder slettet etter identifisering (lagrer kun resultat)

---

## 4. Implementasjonsleveranser

### MVP Sprintplan

| Sprint | Uker | Leveranse |
|--------|------|-----------|
| 0 | 1 | Repo, DB, auth med biometrisk |
| 1 | 2 | Medisinliste + påminnelser (backend + iOS + web) |
| 2 | 2 | Interaksjonssjekker (GPT-4 + DailyMed API) |
| 3 | 2 | Pillegjenkjenning (CoreML + backend) |
| 4 | 1 | Omsorgsperson-modus + familiedeling |
| 5 | 1 | Rapport-generering + lege-eksport |
| 6 | 1 | Testing, HIPAA-revisjon, App Store |
| **Total** | **10 uker** | |

### Kostnadsestimater

| Scenario | Team | Tid | Kostnad |
|----------|------|-----|---------|
| **Lean** | 1 fullstack + 1 ML | 12 uker | $30 000–45 000 |
| **Standard** | 2 fullstack + 1 iOS + 1 ML + 1 designer | 10 uker | $80 000–120 000 |
| **Full** | 5 devs + ML + designer + PM + compliance | 8 uker | $160 000–240 000 |

*HIPAA-compliance legger til ~$10–20K for audit og juridisk.*

### Miljøvariabler

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
DAILYMED_API_URL=https://dailymed.nlm.nih.gov/dailymed/services/v2
AWS_S3_BUCKET=mediwise-uploads
APNS_KEY_ID=...
APNS_TEAM_ID=...
JWT_SECRET=...
```

---

## 5. Kode og eksempler

Se tilhørende kodefiler:
- [`ios/MedicationsView.swift`](ios/MedicationsView.swift)
- [`web/MedicationDashboard.tsx`](web/MedicationDashboard.tsx)
- [`backend/server.ts`](backend/server.ts)
- [`tests/medications.test.ts`](tests/medications.test.ts)

---

## 6. Design og UX

### Fargepalett

| Rolle | Hex |
|-------|-----|
| Primary (Medisinsk blå) | `#0066CC` |
| Secondary (Trygg grønn) | `#34C759` |
| Warning (Interaksjon-gul) | `#FF9500` |
| Danger (Alvorlig-rød) | `#FF3B30` |
| Background | `#F5F7FA` |

### Hovedskjermer

1. **Hjem:** Dagens medisinoversikt (tidslinje), neste dose med nedtelling
2. **Medisinliste:** Kort med medisinnavn, dosering, neste dose, interaksjons-badge
3. **Kamera:** Rettet mot pille → AI identifiserer → viser info
4. **Historikk:** Kalender med grønn (tatt) / rød (glemt) / grå (fremtidig)
5. **Familie:** Avhengiges status, inviter ny omsorgsperson

### Onboarding

1. «Tryggere medisinering starter her»
2. Legg til dine medisiner (manuelt, skann, eller importer)
3. Sett opp påminnelser
4. Inviter omsorgsperson (valgfritt)
5. Biometrisk innlogging aktivert

### Tilgjengelighet

- **Stor tekst** som standard (eldre brukere)
- VoiceOver-optimalisert (alle knapper med klare labels)
- Høykontrast-modus
- Haptic feedback ved påminnelser
- Enkel navigasjon: maks 2 trykk til noen funksjon

---

## 7. Go-to-market

### Forretningsmodell

| Pakke | Pris | Innhold |
|-------|------|---------|
| Free | $0 | 5 medisiner, påminnelser, grunnleggende interaksjonssjekk |
| Premium | $4,99/mnd | Ubegrensede medisiner, pille-ID, omsorgsperson, rapporter |
| Family | $9,99/mnd | Premium for 5 familiemedlemmer |
| Sykehjem | $15/beboer/mnd | Full plattform + admin dashboard |

### App Store-tekst

**Tittel:** MediWise — Smart Medisinpåminnelse
**Undertittel:** AI-drevet medisinhåndtering for trygghet

> Glem aldri en dose igjen. MediWise holder styr på alle medisinene dine, varsler om farlige interaksjoner, og lar familien følge med — trygt og kryptert.

**Keywords:** medisinpåminnelse, pille, medisin, interaksjoner, helse, eldre, omsorg

### Markedsplan

| Mnd | Aktivitet |
|-----|-----------|
| 1 | Partnerskap med 3 apotek-kjeder (flyers + QR), senior-foreninger |
| 2 | Facebook-kampanje rettet mot 45–65 (omsorgspersoner), blogg + SEO |
| 3 | B2B pilot med 2 sykehjem, PR i helsepublikasjoner |

---

## 8. Juridisk & compliance

- **HIPAA:** Full compliance — BAA, kryptering, audit, tilgangskontroll
- **GDPR:** Samtykke, rett til sletting, dataportabilitet
- **Medisinsk fraskrivelse:** «MediWise gir veiledning, ikke medisinsk råd. Kontakt lege.»
- **FDA:** Appen klassifiseres som «wellness tool», ikke medisinsk utstyr (unngår FDA 510(k))
- **Apoteklisens:** Ikke nødvendig (selger ikke medisiner, kun informasjon)

---

## 9. Drift og vekst

### KPIer

| KPI | 6 mnd | 12 mnd |
|-----|-------|--------|
| MAU | 10 000 | 80 000 |
| Påminnelser bekreftet/dag | 30 000 | 300 000 |
| Interaksjoner oppdaget | 500 | 5 000 |
| Premium-konvertering | 8 % | 12 % |

### Skalering

| Brukere | Infra/mnd |
|---------|-----------|
| 0–10K | $100 |
| 10K–100K | $1 500 (ML inference-kostnad) |
| 100K–1M | $12 000 |

---

## 10. Salgspakke

### Investor one-pager

```
MEDIWISE — AI-Drevet Medisintryghet

Problem:  250K dødsfall/år fra feilmedisinering. 50% tar medisiner feil.
Løsning:  AI interaksjonssjekk + pille-ID + påminnelser + omsorgsperson.
Modell:   Freemium $4,99/mnd + Family $9,99/mnd + B2B $15/beboer.
Regulering: HIPAA-kompatibel, FDA «wellness tool».

Økonomi (12 mnd):
  MAU: 80K, 10K betalende ($6 snitt) = $60K MRR
  B2B: 10 sykehjem × 50 beboere × $15 = $7,5K MRR
  ARR: $810K
  Burn: $40K/mnd
  Ask: $750K seed → break-even mnd 14
```
