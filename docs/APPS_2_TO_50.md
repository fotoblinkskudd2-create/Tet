# LeanLife Platform — Apper #2–#50: Produktmaler

Hver app følger samme teknologistack (Next.js + SwiftUI + Node.js/TypeScript + PostgreSQL) og kan gjenbrukes som white-label via LeanLife-plattformen.

---

## HØY PRIORITET (#2–#5): Full implementeringsplan

### App #2: MindWell — Psykisk helse

- **Tagline:** «Din daglige dose mental styrke.»
- **Problem:** 350M+ med depresjon; mangel på tilgjengelig terapi.
- **Kjernefunksjoner:** Daglig humørtracker, guidede meditasjoner, CBT-øvelser, krise-knapp, journalføring, AI-terapeut-chat.
- **Personaer:** Student (23, eksamensangst), Forelder (40, utbrenthet), Pensjonist (67, ensomhet).
- **Differensiering vs Headspace/Calm:** Klinisk fundert (CBT), norsk, integrert krisetjeneste, lavere pris.
- **MVP:** 6 uker, 2 dev + 1 designer. Kostnad: 400–700k NOK.
- **Forretningsmodell:** Freemium + 69 kr/mnd Pro, B2B (bedriftshelse).
- **Regulatorisk:** Velvære, IKKE medisinsk utstyr. Tydelig disclaimer.

```typescript
// Backend: POST /v1/mood — Logger daglig humør
router.post("/mood", authenticate, async (req, res) => {
  const { score, note, date } = req.body; // score: 1-10
  const entry = await prisma.moodEntry.create({
    data: { userId: req.user.userId, score, note, date: new Date(date) },
  });
  res.status(201).json(entry);
});
```

```swift
// iOS: MoodTrackerView — Daglig humørlogging
struct MoodTrackerView: View {
    @State private var mood: Double = 5
    var body: some View {
        VStack {
            Text("Hvordan har du det i dag?").font(.title2)
            Slider(value: $mood, in: 1...10, step: 1)
            Text(moodEmoji(mood)).font(.system(size: 60))
            Button("Lagre") { Task { await saveMood(Int(mood)) } }
                .buttonStyle(.borderedProminent).tint(.indigo)
        }
    }
    func moodEmoji(_ score: Double) -> String {
        switch score {
        case 1...3: return "😞"; case 4...6: return "😐"
        case 7...8: return "😊"; default: return "🤩"
        }
    }
}
```

---

### App #3: GlucoTrack — Diabetes type 2

- **Tagline:** «Hold blodsukkeret i balanse, automatisk.»
- **Problem:** 537M diabetikere; kontinuerlig glukosestyring er krevende.
- **Kjernefunksjoner:** Blodsukkerdagbok, mat→glukose-prediksjon (AI), medikamentpåminnelser, HbA1c-trend, integrasjon med CGM (Dexcom/Libre), lege-eksport.
- **Differensiering vs mySugr/Glooko:** AI-prediksjoner, norsk matdatabase, enklere UX.
- **MVP:** 8 uker, 2 dev + 1 designer + 1 helse-rådgiver. Kostnad: 600k–1M NOK.
- **Regulatorisk:** Potensielt medisinsk utstyr Class I — krever CE-merking for prediksjoner. Start som dagbok (ikke medisinsk).
- **Forretningsmodell:** 99 kr/mnd Pro, B2B til helseforetak.

```typescript
// Backend: POST /v1/glucose — Logger blodsukkermåling
router.post("/glucose", authenticate, async (req, res) => {
  const { value, unit, timestamp, context } = req.body;
  const entry = await prisma.glucoseEntry.create({
    data: { userId: req.user.userId, valueMmol: value, unit, measuredAt: new Date(timestamp), context },
  });
  res.status(201).json(entry);
});
```

---

### App #4: AquaPure — Vannkvalitet og -tilgang

- **Tagline:** «Vet du hva du drikker?»
- **Problem:** 2 mrd. uten trygt drikkevann; 785M uten grunnleggende tilgang.
- **Kjernefunksjoner:** Crowd-sourced vannkvalitetskart, rapportering av forurensning, integrasjon med offentlige data (EPA/WHO), filter-anbefalinger, daglig vanninntak-tracker.
- **Differensiering:** Eneste global, crowd-sourced plattform; kombiner test + track + alert.
- **MVP:** 6 uker, 2 dev. Kostnad: 300–500k NOK.
- **Forretningsmodell:** Gratis app, B2B (vannverk, kommuner), affiliate (vannfiltre).

---

### App #5: FoodRescue — Matsvinn

- **Tagline:** «Redd mat, spar penger, redd planeten.»
- **Problem:** 1/3 av all mat kastes; 1,3 mrd. tonn/år.
- **Kjernefunksjoner:** Kjøleskapsscanner (foto-AI), utløpsdato-varsler, oppskriftsforslag basert på det du har, måltidsplanlegger (bruk opp det du har), community-deling av overskuddsmat.
- **Differensiering vs Too Good To Go:** Fokus på hjemmet (ikke restaurant), AI-oppskrifter, svinnemåler.
- **MVP:** 6 uker, 2 dev + 1 designer. Kostnad: 400–650k NOK.
- **Forretningsmodell:** Freemium + 49 kr/mnd, affiliate (matbutikker), B2B (kantiner).

```typescript
// Backend: POST /v1/fridge/scan — AI-gjenkjenning av kjøleskapsinnhold
router.post("/fridge/scan", authenticate, async (req, res) => {
  const { imageBase64 } = req.body;
  const items = await aiService.recognizeFoodItems(imageBase64);
  const recipes = await recipeService.suggestFromIngredients(items);
  res.json({ items, recipes });
});
```

---

## Apper #6–#50: Kompakte produktmaler

### #6: CarbonMe — Personlig klimafotavtrykk
- **Kjerne:** CO₂-kalkulator for reise/mat/shopping, utfordringsbasert reduksjon, offsetting
- **Modell:** Freemium + B2B (ESG-rapportering)
- **Stack:** Next.js, Node.js, OpenAI for transport-klassifisering

### #7: SleepSync — Søvnoptimering
- **Kjerne:** Smart alarm, søvnlogger, miljøoptimering (lyd, lys, temperatur-tips), søvnhygiene-coach
- **Modell:** 59 kr/mnd, integrasjon Apple Watch

### #8: BridgeUp — Ensomhetsbekjempelse
- **Kjerne:** Lokale aktivitets-match, interesse-grupper, trygge chat-rom, community-events
- **Modell:** Gratis + premium (59 kr/mnd for avansert matching), B2B (kommuner)

### #9: MoneyWise — Finansiell literacy
- **Kjerne:** Gamified pengelæring, budsjettverktøy, investeringssimulator, gjeldsnedbetalingsplan
- **Modell:** Freemium + 79 kr/mnd, B2B (banker, skoler)

### #10: LearnGlobal — Utdanningstilgang
- **Kjerne:** Offline-first læring, mikro-kurs, peer-tutoring, sertifiseringer
- **Modell:** Freemium, B2B (NGOer, regjeringer), sponset innhold

### #11: PainTrack — Kronisk smerte
- **Kjerne:** Smertedagbok, triggerkartlegging, meditasjon/øvelser, lege-rapporter
- **Modell:** 69 kr/mnd, B2B (smerteklinikker)

### #12: QuitNow — Røykeslutt
- **Kjerne:** Sluttdato-tracker, nikotincrave-timer, helseforbedring-tidslinje, sparekalkulator, community
- **Modell:** Freemium + 49 kr/mnd, B2B (forsikring, helse)

### #13: SoberPath — Rusavhengighet
- **Kjerne:** Daglig sjekk-in, tømmetid-tracker, anonym støttegruppe, kriseknapp, terapi-matching
- **Modell:** Gratis (basis) + 89 kr/mnd, B2B (behandlingssentre)

### #14: HeartGuard — Hypertensjon
- **Kjerne:** Blodtrykksdagbok, medikamentpåminnelser, DASH-diett-plan, stressreduksjon, lege-deling
- **Modell:** 69 kr/mnd, B2B (helseforetak)

### #15: AirQ — Luftkvalitet
- **Kjerne:** Sanntids luftkvalitetskart, personlige varsler, anbefalinger (jog vs innendørs), historikk
- **Modell:** Gratis + premium API, B2B (byer, sykehus)

### #16: SmileCare — Tannhelse
- **Kjerne:** Pussetimer med teknikk-coaching, tannlege-påminnelser, foto-tracking av tenner
- **Modell:** Freemium + 39 kr/mnd, B2B (tannlegekontor)

### #17: ReadRise — Lese- og skriveferdigheter
- **Kjerne:** AI-tilpasset lesetrening, daglige øvelser, fremgangs-tracker, barnevennlig UI
- **Modell:** Freemium + 59 kr/mnd, B2B (skoler, NGOer)

### #18: MedSafe — Medisinhåndtering
- **Kjerne:** Medisinliste, doseringstidspunkter med alarm, interaksjonssjekk, apotekfinne, deling med pårørende
- **Modell:** Freemium + 49 kr/mnd, B2B (apotek, helse)

### #19: CareConnect — Eldrepleie og demens
- **Kjerne:** Pårørendeportal, daglig sjekk-in, medisinpåminnelser, GPS-trygghet, aktivitetsforslag
- **Modell:** 99 kr/mnd (familiepakke), B2B (sykehjem)

### #20: BabyBump — Fertilitets- og graviditetshelse
- **Kjerne:** Syklusovervåking, fertilitetsvindu, graviditets-tracker uke-for-uke, ernæring, legeavtaler
- **Modell:** Freemium + 79 kr/mnd

### #21: FocusFlow — ADHD-håndtering
- **Kjerne:** Pomodoro med ADHD-tilpasninger, oppgavestyring, vanedannelse, body-doubling, medisinlogg
- **Modell:** 69 kr/mnd

### #22: AllergyGuard — Allergi og astma
- **Kjerne:** Pollenvarsler, matallergiscanner (strekkode), symptomlogg, nødprotokoll
- **Modell:** Freemium + 49 kr/mnd

### #23: BackFix — Rygg og ergonomi
- **Kjerne:** Stå-opp-påminnelser, ergonomisk sjekkliste, øvelsesbibliotek, smertelogg
- **Modell:** 49 kr/mnd, B2B (arbeidsgivere)

### #24: SkinAI — Hudhelsesjekk
- **Kjerne:** Foto-analyse av hudtilstander (AI), behandlingsanbefalinger, logg, hudlege-matching
- **Modell:** 69 kr/mnd

### #25: TapCheck — Vannovervåking hjemme
- **Kjerne:** DIY-testsett-guide, resultat-logger, varsel ved farlige nivåer, rørlegger-matching
- **Modell:** Freemium + testkit-salg (affiliate)

### #26: PrivacyVault — Personvernskontroll
- **Kjerne:** Datalekkasje-skanner, passordstyrke-audit, personvern-score, opt-out-automatisering
- **Modell:** 59 kr/mnd

### #27: HireReady — Jobbsøk og karriere
- **Kjerne:** AI CV-bygger, intervjutrener, jobbmatching, lønnsforhandlings-coach
- **Modell:** Freemium + 99 kr/mnd

### #28: ScreenBalance — Barns skjermtid
- **Kjerne:** Foreldrekontroll, aktivitets-baserte belønninger, innholdsfilter, familieavtaler
- **Modell:** 79 kr/mnd (familieplan)

### #29: DriveSafe — Trafikksikkerhet
- **Kjerne:** Kjørestilanalyse (akselerometer), distraksjonsdeteksjon, sikkerhetsscore, forsikringsrabatt
- **Modell:** Freemium, B2B (forsikring)

### #30: HomeMatch — Boligmarked
- **Kjerne:** AI-boligsøk, prisestimat, nabolagsscore, lånekalkulator, budrunde-assistent
- **Modell:** Freemium + premium (129 kr/mnd), B2B (eiendomsmeglere)

### #31: FoodTrace — Matvaresikkerhet
- **Kjerne:** Strekkode → opprinnelse/sporbarhet, tilbakekallingsvarsel, allergensjekk
- **Modell:** Freemium, B2B (dagligvare)

### #32: VaxTrack — Vaksinasjonssporing
- **Kjerne:** Digital vaksinekort, påminnelser, reisevaksine-guide, familieversikt
- **Modell:** Gratis (offentlig helse-samarbeid), premium for reise-features

### #33: MigraineMap — Migrenehåndtering
- **Kjerne:** Anfallslogg, triggerkartlegging (vær, mat, søvn, stress), medisineffekt-tracking
- **Modell:** 49 kr/mnd

### #34: ParkSmart — Parkering
- **Kjerne:** Sanntids parkeringstilgjengelighet, reservasjon, betaling, EV-lading
- **Modell:** Transaksjonsavgift 5%, B2B (parkeringshus)

### #35: PetCare — Dyrehelse
- **Kjerne:** Vaksinasjonsplan, vektlogg, fôring-tracker, vet-chat, GPS-sporing
- **Modell:** 59 kr/mnd, B2B (dyreklinikker)

### #36: EcoHome — Energisparing
- **Kjerne:** Strømmåler-integrasjon, sparetips, solcelle-ROI-kalkulator, smart-home-kontroll
- **Modell:** Freemium + 49 kr/mnd, B2B (energiselskap)

### #37: TimeZen — Tidsplanlegging
- **Kjerne:** AI-kalenderoptimering, energikurve-matching, fokustider, pauser, ukentlig rapport
- **Modell:** 69 kr/mnd

### #38: TransitPulse — Kollektivtransport
- **Kjerne:** Sanntidssporing, forsinkelsesvarsel, ruteoptimering, crowd-data om fullhet
- **Modell:** Gratis + B2B (transportselskap)

### #39: FreshFind — Mattilgang i food deserts
- **Kjerne:** Lokalt mat-kart, leveringssamarbeid, gårdsutsalg, community-hage
- **Modell:** Gratis + leveringsavgift, B2B (kommuner)

### #40: LingoBoost — Språklæring for flyktninger
- **Kjerne:** Kontekstuell språklæring (jobb, helse, skole), offline-mode, kulturguide
- **Modell:** Gratis (NGO-sponset) + premium

### #41: Plantify — Planteskjøtsel
- **Kjerne:** Foto-ID av plante, vanningsplan, sykdomsdeteksjon, sesongguide
- **Modell:** Freemium + 39 kr/mnd

### #42: HomeKeep — Boligvedlikehold
- **Kjerne:** Vedlikeholdskalender, DIY-guider, håndverker-matching, kostnadsestimater
- **Modell:** 49 kr/mnd

### #43: SortRight — Resirkulering
- **Kjerne:** Foto → sorteringsguide (AI), lokal avfallskalender, gamification, statistikk
- **Modell:** Gratis, B2B (kommuner, renovasjon)

### #44: VolunteerHub — Frivilligarbeid
- **Kjerne:** Matching org↔frivillig, tidslogg, sertifiseringer, community
- **Modell:** Gratis + B2B (organisasjoner)

### #45: SilenceMap — Støyforurensning
- **Kjerne:** Desibelmåler, støykart (crowd-sourced), stille steder-guide, søvn-impactanalyse
- **Modell:** Gratis + B2B (kommuner, helse)

### #46: AccessNow — Tilgjengelighet
- **Kjerne:** Crowd-sourced tilgjengelighetskart, navigasjon for rullestol, kontrastmodus, talenavigasjon
- **Modell:** Gratis, B2B (kommuner, kjøpesentre)

### #47: BloodLink — Bloddonasjon
- **Kjerne:** Donasjons-matcher (blodtype + lokasjon), påminnelser, blodbank-status, donasjonslogg
- **Modell:** Gratis (samarbeid med blodbankene)

### #48: SunSafe — Soleksponering
- **Kjerne:** UV-indeks-varsler, solkrem-påminnelser, hudkartlegging (føflekk-tracking), personlig risikoprofil
- **Modell:** Freemium + 39 kr/mnd

### #49: CycleWell — Menstruell helse
- **Kjerne:** Syklustracker, symptomlogg, prediksjon, påminnelser, innhold om PCOS/endometriose
- **Modell:** Freemium + 49 kr/mnd

### #50: EyeGuard — Syns- og øyehelse
- **Kjerne:** Skjermpause-påminnelser, syntest (enkel), blålysfilter-guide, optiker-matching
- **Modell:** Freemium + 39 kr/mnd

---

## Gjenbrukbar tech-stack for alle 50 apper

| Komponent | Teknologi |
|-----------|-----------|
| Mobil | SwiftUI (iOS), React Native / Kotlin (Android) |
| Web | Next.js 14, Tailwind CSS, TypeScript |
| Backend | Node.js + Express / Fastify, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT, OAuth2 (Apple/Google) |
| AI | OpenAI API (gpt-4o-mini) |
| Betaling | Stripe (web), StoreKit 2 (iOS) |
| Push | Firebase Cloud Messaging |
| CI/CD | GitHub Actions |
| Hosting | Vercel (web), Fly.io / AWS ECS (backend) |

**White-label arkitektur:** Alle apper deler felles auth-, betaling- og analytics-moduler. Domene- og tema-konfigurasjon via miljøvariabler. Kan deployes som separate instanser eller som multi-tenant plattform.
