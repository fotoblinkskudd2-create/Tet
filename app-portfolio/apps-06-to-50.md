# Apper 6–50: Komplette Produktmaler

> Hver app følger full 10-seksjons mal med tilstrekkelig detalj for at et utviklingsteam kan begynne bygging.
> Teknologistack er konsistent: iOS (SwiftUI), Web (Next.js 14/React/TypeScript/TailwindCSS), Backend (Node.js/TypeScript/Express/Prisma), DB (PostgreSQL/Redis), Auth (Clerk), Betaling (Stripe).

---

## App #6: FlowCast — SMB Cashflow-prediksjon

**Tagline:** «Se fremtiden. Redd bedriften.»  
**Pitch:** FlowCast bruker AI til å predikere cashflow 90 dager frem for SMB-er, identifiserer risikosoner og foreslår tiltak — slik at 82% av bedrifter som dør av cashflow-problemer kan overleve.

### 1. Problemkort
- 82% av SMB-er som mislykkes gjør det pga cashflow-problemer
- 500M+ SMB-er globalt, $4.9T SMB-markedsverdi
- Rammet: Alle SMB-er med <50 ansatte, spesielt tjeneste- og varehandelsbedrifter

### 2. Produktoversikt
**Must-have:** Banktilkobling → AI-prediksjon 90 dager → Varslinger ved risiko → Forslag til tiltak (utsett betaling, innkreving, lån)
**Nice-to-have:** Fakturastyring, automatisk innkreving, integrering med regnskap (Xero, QuickBooks)

**Personas:**
1. Sara (34), eier av kafé — variabel inntekt, faste kostnader, trenger forutsigbarhet
2. Tom (52), konsulentselskap — lange betalingsfrister, trenger working capital-prediksjon
3. Mei (28), e-commerce — sesongvariasjoner, trenger bestillingsprediksjon

**Konkurrenter:** Float (UK), Pulse (USA), Agicap (EU) — DebtZero differensierer med AI og enklere UX

### 3. Teknisk
**API-endepunkter:**
```
POST /cashflow/connect-bank     → Koble regnskap/bank
GET  /cashflow/forecast         → 90-dagers prediksjon
GET  /cashflow/alerts           → Risikovarsler
POST /cashflow/scenario         → «Hva om»-scenarier
GET  /invoices                  → Utestående fakturaer
POST /invoices/:id/remind       → Send betalingspåminnelse
```

**Datamodeller:**
```
cashflow_entries: id, business_id, type(income/expense), amount, date, category, recurring, confidence_score
forecasts: id, business_id, date, predicted_balance, actual_balance, model_version
alerts: id, business_id, type(low_balance/late_payment/opportunity), severity, message, resolved
```

### 4. Implementasjon
- MVP: 10 uker, 3 utviklere
- Lean: $60K | Standard: $180K | Full: $350K

### 5. Kodeeksempel (Backend)
```typescript
// FlowCast — 90-day cashflow prediction endpoint
app.get("/v1/cashflow/forecast", auth, async (req, res) => {
  const entries = await getCashflowEntries(req.userId, 180); // 6 mnd historikk
  const recurring = entries.filter(e => e.recurring);
  const forecast = [];
  
  for (let day = 1; day <= 90; day++) {
    const date = new Date(Date.now() + day * 86400000);
    const dayOfMonth = date.getDate();
    const predicted = recurring
      .filter(e => new Date(e.date).getDate() === dayOfMonth)
      .reduce((sum, e) => sum + (e.type === "income" ? e.amount : -e.amount), 0);
    const prevBalance = forecast[day - 2]?.predictedBalance ?? currentBalance;
    forecast.push({ date: date.toISOString().split("T")[0], predictedBalance: prevBalance + predicted, confidence: 0.85 });
  }
  
  const alerts = forecast
    .filter(f => f.predictedBalance < 0)
    .map(f => ({ date: f.date, deficit: f.predictedBalance, severity: "critical" }));
  
  res.json({ forecast, alerts, generatedAt: new Date().toISOString() });
});
```

### 6. Design
- Farger: Primary #0EA5E9 (Sky Blue), Accent #F97316 (Orange for warnings)
- Hovedskjerm: Cashflow-graf med grønn/rød zone, utestående fakturaer, alerts

### 7. Go-to-Market
- Modell: Free (1 konto) → Pro ($29/mnd, 5 kontoer, AI) → Business ($79/mnd, ubegrenset + team)
- KPIer: 10K businesses (12 mnd), $2M ARR, churn <5%

---

## App #7: InvestGate — Demokratisert Investering

**Tagline:** «Invester fra $1. Ingen ekspert nødvendig.»  
**Pitch:** InvestGate gjør investering tilgjengelig for alle med AI-drevet porteføljebygging, fraksjonelle aksjer fra $1, og pedagogisk innhold — slik at de 90% som ikke investerer kan begynne å bygge formue.

### 1. Problemkort
- Kun 10% av verdens befolkning eier aksjer
- $100T+ aksjemarked er utilgjengelig for de fleste
- Rammet: Lavtlønte, unge, utviklingsland, alle uten investeringserfaring

### 2. Produktoversikt
**Must-have:** Fraksjonelle aksjer fra $1, AI-porteføljeforslag, risikoprofil-quiz, automatisk rebalansering, pedagogiske «lær mens du investerer»-moduler
**Nice-to-have:** Sosial trading (følg investorer), thematiske porteføljer (grønn, tech, lokal), skatteoptimalisering

**Personas:**
1. Aisha (22, student) — vil starte, har bare $50/mnd
2. David (38, lærer) — vet lite om investering, vil ha «sett og glem»
3. Wei (55, ingeniør) — trenger å diversifisere fra eiendom

**Konkurrenter:** Robinhood (gamification-problem), Acorns (kun USA), eToro (kompleks)

### 3. Teknisk
```
POST /portfolio/create          → Opprett portefølje basert på risikoprofil
GET  /portfolio                 → Hent portefølje med avkastning
POST /portfolio/invest          → Invester beløp
POST /portfolio/auto-invest     → Sett opp automatisk investering
GET  /assets/search             → Søk aksjer/ETF
GET  /learn/modules             → Investeringsleksjoner
```

**Datamodeller:**
```
portfolios: id, user_id, name, strategy, risk_level, total_value, created_at
holdings: id, portfolio_id, asset_symbol, shares, avg_cost, current_value
orders: id, user_id, asset_symbol, type(buy/sell), amount, shares, status, executed_at
```

### 4–10. Implementasjon, Design, GTM
- MVP: 14 uker (krever brokeragepartner/Alpaca)
- Lean: $100K | Standard: $300K | Full: $700K
- Modell: Free (grunnleggende) → Premium ($3.99/mnd, AI + leksjoner) + AUM 0.25%/år
- Juridisk: Investeringslisens nødvendig per jurisdiksjon

---

## App #8: BudgetBuddy — Personlig Budsjettering for Alle

**Tagline:** «Vet hvor pengene går. Alltid.»  
**Pitch:** BudgetBuddy kobler bankkontoer, kategoriserer transaksjoner med AI, og gir sanntidsoversikt over forbruk mot budsjett — med push-varsler før du overforbruker.

### 1. Problemkort
- 60% lever lønning til lønning, de fleste uten budsjett
- Rammet: Alle med inntekt og utgifter (3.5 mrd voksne)

### 2. Produktoversikt
**Must-have:** Banktilkobling, AI-kategorisering, budsjettoppsett per kategori, sanntidsvarsler, månedlig oppsummering
**Nice-to-have:** Sparemål, delt budsjett for par, abonnement-scanner, bilde av kvittering → auto-registrering

**Konkurrenter:** Mint (avviklet), YNAB ($99/år), Spenderlog — BudgetBuddy: gratis + AI-smartere + globalt

### 3. Teknisk
```
GET  /budget                    → Hent budsjett med forbruksprogress
POST /budget/categories         → Sett budsjett per kategori
GET  /transactions              → Hent transaksjoner (Plaid)
PUT  /transactions/:id/category → Korriger kategori
GET  /insights/monthly          → Månedlig forbruksrapport
GET  /insights/subscriptions    → Finn abonnementer
```

### 4–10. Implementasjon, GTM
- MVP: 8 uker, 2 utviklere — Lean: $40K
- Modell: Free (1 konto) → Pro ($4.99/mnd) → Family ($7.99/mnd)
- KPIer: 500K MAU (12 mnd), avg bruker sparer $200/mnd

---

## App #9: LoanShield — Beskyttelse mot Predatory Lending

**Tagline:** «Aldri et dårlig lån igjen.»  
**Pitch:** LoanShield analyserer lånetilbud med AI, beregner total kostnad, advarer mot predatory vilkår, og foreslår bedre alternativer — slik at millioner unngår payday loan-feller.

### 1. Problemkort
- $90 mrd/år tapt til predatory lending, payday loans har 400%+ effektiv rente
- Rammet: Lavtlønte, credit-invisible, 12M amerikanere bruker payday loans årlig

### 2. Produktoversikt
**Must-have:** Skann lånetilbud (ta bilde/lim inn), AI vurderer: total kostnad, APR-beregning, red flags, forslag til alternativer
**Nice-to-have:** Kredittforbedring, lån-matching, community-advarsler

### 3. Teknisk
```
POST /loans/analyze             → Analyser lånetilbud (bilde/tekst)
GET  /loans/alternatives        → Finn bedre lån
GET  /loans/red-flags           → Vanlige predatory-tegn
POST /credit/score-check        → Sjekk kredittscore
GET  /credit/improve            → Tips for forbedring
```

### 4–10.
- MVP: 8 uker — Lean: $45K
- Modell: Free (3 analyser/mnd) → Pro ($3.99/mnd, ubegrenset + alternativer)
- Partnerskap med kreditforeninger og ansvarlige långivere (affiliate-inntekt)

---

## App #10: TaxEase — Enkel Skatteinnlevering

**Tagline:** «Skatt på 15 minutter. Maks refusjon.»  
**Pitch:** TaxEase bruker AI til å automatisere skatteinnlevering: koble inntekt + fradrag, svar på enkle spørsmål, send direkte til skattemyndigheter.

### 1. Problemkort
- $300 mrd+ brukt globalt på skatteforberedelse
- 150M+ individer i USA alene leverer skatt manuelt

### 2–10. Oversikt
**Must-have:** Koble inntektskilder, AI-fradragsfinner, forhåndsvisning, direkte innlevering
**Konkurrenter:** TurboTax ($), H&R Block — TaxEase: AI-drevet, $0 for enkel + $14.99 for avansert
- MVP: 12 uker — Lean: $80K | Standard: $250K
- Juridisk: Krav om autorisasjon per land for skatteinnlevering

---

## App #11: CoverSafe — Forsikringsgap-analyse

**Tagline:** «Er du riktig forsikret? Finn ut nå.»  
**Pitch:** CoverSafe analyserer dine forsikringer, finner hull, og anbefaler dekning — 40% av husholdninger er underforsikret.

### 2–10. Oversikt
**Must-have:** Koble eksisterende poliser, AI-gapanalyse, anbefalinger, sammenligning
**Modell:** Free analyse → provision fra forsikringsselskaper (lead gen)
- MVP: 10 uker — Lean: $60K

---

## App #12: CryptoGuard — Kryptosvindel-beskyttelse

**Tagline:** «Investér trygt i krypto.»  
**Pitch:** CryptoGuard scanner wallet-adresser, tokens og DeFi-prosjekter for svindelrisiko — $14 mrd+ tapt til kryptosvindel årlig.

### 2–10. Oversikt
**Must-have:** Wallet-scanner, token risk score, smart contract audit (forenklet), phishing-alarm, community-rapportering
**Teknisk:**
```
POST /scan/wallet               → Sjekk wallet-adresse
POST /scan/token                → Token risk-analyse
POST /scan/contract             → Smart contract sjekk
GET  /alerts                    → Aktive svindelvarsler
```
- MVP: 10 uker — Lean: $70K
- Modell: Free (5 scans/dag) → Pro ($5.99/mnd)

---

## App #13: PriceShield — Inflasjonsbeskyttelse for Forbrukere

**Tagline:** «Spar penger når prisene stiger.»  
**Pitch:** PriceShield sporer priser på dagligvarer, energi og essentials, varsler om prisendringer, og finner billigste alternativer.

### 2–10. Oversikt
**Must-have:** Prisovervåking, alternativ-søk, varsler ved prishopp, historikk
**Teknisk:**
```
GET  /prices/track              → Priser på dine varer
GET  /prices/compare            → Sammenlign butikker
GET  /prices/alerts             → Prisendrings-varsler
POST /prices/basket             → Legg til varekurv
```
- MVP: 8 uker — Lean: $50K
- Modell: Free + affiliate-inntekt fra butikker

---

## App #14: StudyDebt — Studentlån-optimalisering

**Tagline:** «Studentlånet under kontroll.»  
**Pitch:** StudyDebt analyserer alle studielån, beregner optimale nedbetalingsstrategier, vurderer refinansiering, og tracker PSLF-kvalifisering.

### 2–10. Oversikt
**Must-have:** Koble alle studielån, nedbetaling (IDR vs standard vs aggressive), refinansierings-sammenligning, PSLF-tracker
**Teknisk:**
```
POST /loans/import              → Importer fra NSLDS/Lånekassen
GET  /loans/plans               → Sammenlign nedbetalingsplaner
GET  /loans/refinance           → Refinansierings-tilbud
GET  /loans/pslf                → PSLF-kvalifiserings-tracker
```
- MVP: 10 uker — Lean: $55K
- Modell: Free + affiliate på refinansiering

---

## App #15: HomeKey — Boligkjøpsplanlegger

**Tagline:** «Fra drøm til nøkkel.»  
**Pitch:** HomeKey hjelper førstegangskjøpere med å beregne kjøpsevne, spare til egenkapital, forstå prosessen, og finne optimal finansiering.

### 2–10. Oversikt
**Must-have:** Kjøpsevne-kalkulator, egenkapital-spareplan, boliglåns-sammenligning, steg-for-steg-guide
**Konkurrenter:** Zillow (kun USA, listinger) — HomeKey: fokus på kjøpsprosessen
- MVP: 10 uker — Lean: $60K
- Modell: Free + boliglåns-referrals

---

## App #16: WageWatch — Lønns-transparensverktøy

**Tagline:** «Kjenner du verdien din?»  
**Pitch:** WageWatch bruker crowdsourced og offentlig lønnsdata for å gi sanntids lønnsinnsikt, forhandlingstips, og markedsbenchmarks.

### 2–10. Oversikt
**Must-have:** Lønns-søk per rolle/by/erfaring, anonym lønnsdeling, forhandlings-AI, trender
**Teknisk:**
```
GET  /salaries/search           → Søk lønn per rolle
POST /salaries/share            → Del din lønn (anonym)
POST /negotiate/prepare         → AI-forhandlingscoach
GET  /market/trends             → Lønns- og jobbtrender
```
- MVP: 8 uker — Lean: $40K
- Modell: Free + B2B (bedrifter betaler for benchmarkdata)

---

## App #17: GigSafe — Sikkerhetsnett for Gig-arbeidere

**Tagline:** «Frihet med sikkerhet.»  
**Pitch:** GigSafe gir gig-arbeidere tilgang til forsikring, pensjonssp., skattehjelp og nødkasse — alt designet for variabel inntekt.

### 2–10. Oversikt
**Must-have:** Inntektssporing, skatteestimat/-avsetning, nødkasse-automatikk, mikroforsikring
**Teknisk:**
```
GET  /income/dashboard          → Inntektsoversikt
GET  /tax/estimate              → Kvartalsvis skatteestimat
POST /savings/emergency         → Auto-avsetning til nødfond
GET  /insurance/options         → Tilgjengelige forsikringer
```
- MVP: 10 uker — Lean: $65K
- Modell: $4.99/mnd + forsikringsprovisjon

---

## App #18: ElderGuard — Beskyttelse mot Finansiell Eldremishandling

**Tagline:** «Beskytt dem som beskyttet deg.»  
**Pitch:** ElderGuard overvåker eldres bankkontoer for mistenkelige transaksjoner, varsler familie ved anomalier, og gir verktøy for trygg økonomisk omsorg.

### 2–10. Oversikt
**Must-have:** Transaksjonsovervåking, anomali-deteksjon (AI), familievarsler, godkjennings-workflow, svindel-database
**Teknisk:**
```
GET  /monitor/alerts            → Mistenkelige transaksjoner
POST /monitor/setup             → Koble eldres konto (med samtykke)
PUT  /transactions/:id/approve  → Godkjenn/avvis transaksjon
GET  /reports/monthly           → Månedlig aktivitetsrapport
```
- MVP: 12 uker — Lean: $75K
- Modell: $9.99/mnd per overvåket person
- Juridisk: Krever eksplisitt samtykke, eldrerett-compliance

---

## App #19: MicroLaunch — Mikrofinansiering for Entreprenører

**Tagline:** «Kapital for alle ideer.»  
**Pitch:** MicroLaunch kobler mikroentreprenører i utviklingsland med mikrolån, mentoring og markedstilgang — 500M+ mangler kapital.

### 2–10. Oversikt
**Must-have:** Lånesøknad (forenklet), AI credit scoring (alternativ data), mentor-matching, markedsplass
**Teknisk:**
```
POST /loans/apply               → Søk mikrolån
GET  /loans/status              → Lånestatus
GET  /mentors                   → Finn mentor
POST /marketplace/list          → List produkt/tjeneste
```
- MVP: 14 uker — Lean: $90K
- Modell: 3% rente + 1% plattformavgift

---

## App #20: SubSweep — Abonnement-opprydding

**Tagline:** «Stopp pengelekkasjen.»  
**Pitch:** SubSweep finner alle dine abonnementer, viser totalkostnad, og lar deg kansellere ubrukte med ett klikk — gjennomsnittlig sparing: $200/mnd.

### 2–10. Oversikt
**Must-have:** Banktilkobling → automatisk abonnement-deteksjon, totalkostnad, bruksfrekvens, enkel kansellering
**Teknisk:**
```
GET  /subscriptions             → Alle funne abonnementer
GET  /subscriptions/unused      → Ubrukte (anbefalt kansellering)
POST /subscriptions/:id/cancel  → Assistert kansellering
GET  /savings/potential         → Potensielle besparelser
```
- MVP: 6 uker — Lean: $30K
- Modell: Gratis oppdagelse → $2.99/mnd for kansellerings-assistanse + 20% av første års sparing

---

## App #21: EmergencyFund — Nødkasse-bygger

**Tagline:** «3 måneder med trygghet.»  
**Pitch:** EmergencyFund automatiserer sparingen til nødkasse gjennom mikro-innskudd, rundingsautomatikk, og challenge-basert motivasjon.

### 2–10. Oversikt
**Must-have:** Beregn nødkasse-behov, automatisk sparing (runding, prosent av inntekt), milepæler, lås-funksjon
**Teknisk:**
```
POST /fund/setup                → Sett opp nødkasse
GET  /fund/progress             → Fremgang mot mål
POST /fund/rules                → Spareregler (runding, %, fast)
POST /fund/withdraw             → Uttak (med «er du sikker?»)
```
- MVP: 6 uker — Lean: $30K
- Modell: Free + $2.99/mnd premium (høyere rente på sparekonto)

---

## App #22: TradeFlow — Handelfinansiering for SMB

**Tagline:** «Handel grenseløst.»  
**Pitch:** TradeFlow lukker $1.7T handelfinansieringsgapet ved å koble SMB-importører/-eksportører med finansiering, dokumenthåndtering og betalingsgarantier.

### 2–10.
**Must-have:** Faktura-finansiering, letter of credit (forenklet), handelsdokumenter, betalingssporing
- MVP: 16 uker — Lean: $120K | Standard: $400K
- Modell: 1-3% av finansiert beløp
- Juridisk: Finanslisens, AML, trade compliance

---

## App #23: PensionWatch — Pensjonsfond-overvåking

**Tagline:** «Følg med på pengene dine.»  
**Pitch:** PensionWatch gir innsikt i hvordan pensjonsfond forvaltes, sammenligner avkastning, og varsler om risiko — $70T+ i underfunderte fond.

### 2–10.
**Must-have:** Porteføljeinnsikt, benchmarking, gebyranalyse, risikoscore
- MVP: 10 uker — Lean: $55K
- Modell: Free for individer → B2B for fund compliance

---

## App #24: BorderBiz — Grensekryssende Forretning

**Tagline:** «Gjør forretning overalt.»  
**Pitch:** BorderBiz forenkler mva, toll, compliance og betaling for bedrifter som selger internasjonalt.

### 2–10.
**Must-have:** MVA-kalkulator per land, tolltariff-søk, compliance-sjekklister, multi-valuta fakturering
- MVP: 12 uker — Lean: $80K
- Modell: $49/mnd (SMB) → $199/mnd (Enterprise)

---

## App #25: HealthCost — Medisinsk Kostnads-transparens

**Tagline:** «Vet hva helsa koster. Før regningen kommer.»  
**Pitch:** HealthCost gir prisestimater for medisinske prosedyrer, sammenligner sykehus, og forhandler regninger — medisinsk gjeld er #1 årsak til konkurs i USA.

### 2–10.
**Must-have:** Prosedyre-prisestimater, sykehussammenligning, forsikringssjekk, regningsforhandling
**Teknisk:**
```
GET  /procedures/estimate       → Prisestimat per prosedyre + postnummer
GET  /providers/compare         → Sammenlign priser
POST /bills/negotiate           → AI-forhandling av regning
GET  /insurance/coverage        → Sjekk dekning
```
- MVP: 12 uker — Lean: $80K
- Modell: Free estimater → $9.99/forhandling → $14.99/mnd premium
- Juridisk: HIPAA-compliance obligatorisk

---

## App #26: FarmFund — Landbruksfinansiering

**Tagline:** «Kapital for de som fôr verden.»  
**Pitch:** FarmFund gir småbønder tilgang til kreditt, avlingsforsikring og markedspriser via mobiltelefon.

### 2–10.
**Must-have:** Mikrolån for sesong, avlingsforsikring, sanntids markedspriser, værdata
- MVP: 14 uker — Lean: $90K
- Modell: 2% låneavgift + forsikringsprovisjon

---

## App #27: EnergiSmart — Energikostnads-optimalisering

**Tagline:** «Kutt strømregningen i to.»  
**Pitch:** EnergiSmart analyserer energiforbruk, foreslår besparelser, sammenligner leverandører, og automatiserer bytte.

### 2–10.
**Must-have:** Forbruksanalyse (smart meter/regning), leverandørbytte, solcelle-kalkulator, sparetips
- MVP: 8 uker — Lean: $45K
- Modell: Free + referral-provisjon fra energileverandører

---

## App #28: FraudStop — Digital Betalingssvindel-beskyttelse

**Tagline:** «Stopp svindel før det skjer.»  
**Pitch:** FraudStop overvåker dine betalingskontoer i sanntid, bruker AI til å detektere uvanlige transaksjoner, og varsler umiddelbart.

### 2–10.
**Must-have:** Sanntidsovervåking, anomali-deteksjon, umiddelbar varsel + fryse-knapp, svindel-rapportering
**Teknisk:**
```
GET  /monitor/status            → Overvåkingsstatus
GET  /monitor/alerts            → Mistenkelige transaksjoner
POST /monitor/freeze            → Frys kort/konto midlertidig
POST /fraud/report              → Rapporter svindel
```
- MVP: 10 uker — Lean: $65K
- Modell: $3.99/mnd per konto

---

## App #29: SkillBridge — Ferdigheter-til-Jobb Matching

**Tagline:** «Riktige ferdigheter. Riktig jobb.»  
**Pitch:** SkillBridge analyserer arbeidsmarkedet, identifiserer ferdighetsgap, og tilbyr personaliserte læringsveier som fører til jobb — 75M+ med feil ferdigheter.

### 2–10.
**Must-have:** Ferdighetsvurdering, arbeidsmarkeds-AI, kurs-matching, jobbsøk med skill-match score
**Teknisk:**
```
POST /skills/assess             → Vurder dine ferdigheter
GET  /market/demand             → Etterspurte ferdigheter per by
GET  /courses/recommended       → Kurs som tetter gap
GET  /jobs/match                → Jobber som matcher ferdighetsnivå
```
- MVP: 12 uker — Lean: $70K
- Modell: Free → B2B (bedrifter betaler for talent-matching)

---

## App #30: FinYouth — Finansapp for Gen Z

**Tagline:** «Penger er chill.»  
**Pitch:** FinYouth lærer Gen Z (16–25) om penger gjennom TikTok-stil videoer, gamification, og sosiale spareutfordringer — 73% er stresset over penger.

### 2–10.
**Must-have:** Korte videoleksjoner (15–60s), quiz-stories, spareutfordringer med venner, debitkort (U18: foreldrekontrollert)
- MVP: 10 uker — Lean: $55K
- Modell: Free + debitkort interchange-inntekt ($0.20/kjøp)

---

## App #31: FairLend — Rettferdig Mikrofinans

**Tagline:** «Lån som hjelper, ikke utnytter.»  
**Pitch:** FairLend kobler sårbare låntakere med ansvarlige mikrofinansinstitusjoner og transparente vilkår — mot renter opptil 200%.

### 2–10.
**Must-have:** Lån-søk med transparente vilkår, APR-kalkulator, lender-rating, klageportal
- MVP: 10 uker — Lean: $60K
- Modell: Plattformavgift fra långivere (1%)

---

## App #32: PropValue — Kommersiell Eiendomsverdi

**Tagline:** «Verdien du kan stole på.»  
**Pitch:** PropValue bruker AI og big data til å verdsette kommersiell eiendom transparent — $33T marked med ugjennomsiktige verdier.

### 2–10.
**Must-have:** AI-verdivurdering, sammenlignbare salg, yield-kalkulator, markedsdata
- MVP: 14 uker — Lean: $100K
- Modell: $99/vurdering → $499/mnd (portefølje)

---

## App #33: ForexShield — Valutarisiko for Emerging Markets

**Tagline:** «Beskytt sparepengene dine mot valutafall.»  
**Pitch:** ForexShield lar individer i volatile valutaer automatisk konvertere deler av sparepenger til stablecoins/USD-indekserte instrumenter.

### 2–10.
**Must-have:** Valutaovervåking, automatisk konvertering ved terskler, stablecoin-sparing, varsler
- MVP: 10 uker — Lean: $70K
- Modell: 0.5% konverteringsavgift

---

## App #34: ImpactTrack — ESG Investerings-måling

**Tagline:** «Mål effekten av pengene dine.»  
**Pitch:** ImpactTrack gir transparent ESG-måling for investeringsporteføljer — mot $35T i grønnvasking.

### 2–10.
**Must-have:** Portefølje ESG-score, selskaps-rating, impact-rapport, grønnvask-detektor
- MVP: 12 uker — Lean: $75K
- Modell: Free (1 portefølje) → Pro ($9.99/mnd) → Institusjonell ($499/mnd)

---

## App #35: CivicBudget — Kommunal Budsjett-transparens

**Tagline:** «Se hvor skattepengene går.»  
**Pitch:** CivicBudget visualiserer kommunale budsjetter, lar innbyggere gi tilbakemelding, og sporer faktisk pengebruk vs. budsjett.

### 2–10.
**Must-have:** Budsjettvisualisering, sammenligninger mellom kommuner, tilbakemeldingsfunksjon, varsel ved avvik
- MVP: 8 uker — Lean: $40K
- Modell: B2G (kommune betaler) → $5K–50K/år per kommune

---

## App #36: FreelanceTax — Skatt for Frilansere

**Tagline:** «Skatt? Lett.»  
**Pitch:** FreelanceTax automatiserer skatteberegning, kvartalsvis innbetaling, fradragssporing, og innlevering for frilansere — som betaler 30%+ mer enn ansatte.

### 2–10.
**Must-have:** Inntektsimport, fradragsscanner (OCR for kvitteringer), kvartalsestimat, direkte innlevering
**Teknisk:**
```
GET  /tax/estimate              → Kvartalsvis skatteestimat
POST /expenses/scan             → OCR kvittering → fradrag
GET  /deductions/available      → Tilgjengelige fradrag
POST /tax/file                  → Lever skattemelding
```
- MVP: 10 uker — Lean: $60K
- Modell: $14.99/mnd eller $99/år

---

## App #37: WealthPass — Generasjonsoverføring

**Tagline:** «Gi videre. Riktig.»  
**Pitch:** WealthPass hjelper familier med den $68T store formuesoverføringen: testamente, fullmakter, skattestrategi, og kommunikasjonsverktøy.

### 2–10.
**Must-have:** Digital testamente-bygger, fullmaktsgenerator, arvefordelingskalkulator, familiedashboard, skatteoptimalisering
- MVP: 12 uker — Lean: $80K
- Modell: $19.99/mnd (familie) + juridisk review $149
- Juridisk: Advokatpartnerskap nødvendig per jurisdiksjon

---

## App #38: CreditFair — Rettferdig Kredittscoring

**Tagline:** «Din virkelige kredittverdighet.»  
**Pitch:** CreditFair bygger alternative kredittscore basert på leie, mobilregninger, og bankhistorikk — for de 1.7 mrd som er «credit invisible».

### 2–10.
**Must-have:** Alternativ kredittscoring, historikk-import (leie, mobilregninger), score-forbedring, deling med långivere
- MVP: 12 uker — Lean: $80K
- Modell: Free for forbrukere → B2B (långivere betaler for tilgang)

---

## App #39: NonprofitCFO — Finanstyring for Nonprofits

**Tagline:** «Mer penger til formålet.»  
**Pitch:** NonprofitCFO gir nonprofits enkle finans-, donor- og rapporteringsverktøy — reduser admin fra 25% til 10% av budsjett.

### 2–10.
**Must-have:** Donorstyring, budsjett-per-prosjekt, automatisk rapportering (årsmelding, skatt), fondssøknads-tracker
- MVP: 10 uker — Lean: $55K
- Modell: Free (<$100K budsjett) → $29/mnd → $99/mnd (enterprise)

---

## App #40: TariffNav — Tollnavigator

**Tagline:** «Import uten overraskelser.»  
**Pitch:** TariffNav beregner toll, mva og importavgifter for alle varer mellom alle land — $500B i compliance-kostnader for SMB-er.

### 2–10.
**Must-have:** Tollberegner per varekode (HS-kode), landpar, FTA-sjekk, dokumentkrav
**Teknisk:**
```
GET  /tariffs/calculate         → Beregn toll + mva
GET  /tariffs/hs-code/:code     → Info om varekode
GET  /fta/check                 → Frihandelsavtale-sjekk
GET  /documents/required        → Nødvendige dokumenter
```
- MVP: 10 uker — Lean: $65K
- Modell: Free (10 søk/mnd) → $29/mnd (business)

---

## App #41: WageGuard — Beskyttelse mot Lønntyveri

**Tagline:** «Din lønn. Din rett.»  
**Pitch:** WageGuard sporer arbeidstimer, beregner korrekt lønn inkl. overtid, og dokumenterer avvik — $50 mrd+ i lønntyveri årlig.

### 2–10.
**Must-have:** Tidsregistrering, lønnsberegner (inkl. overtid, helg, ferie), avvik-varsel, juridisk klageassistent
**Teknisk:**
```
POST /hours/log                 → Registrer arbeidstimer
GET  /wages/calculate           → Beregn korrekt lønn
GET  /wages/discrepancy         → Finn avvik fra lønnslipp
POST /claims/start              → Start klageprosess
```
- MVP: 8 uker — Lean: $40K
- Modell: Free → donasjon/pro bono + B2B (fagforeninger)

---

## App #42: FinAccess — Tilgjengelig Fintech

**Tagline:** «Finans for alle kropper og sinn.»  
**Pitch:** FinAccess er en universelt tilgjengelig finans-app: talebasert, forstørret, forenklet UI — for 15% med funksjonsnedsettelse som er utestengt fra fintech.

### 2–10.
**Must-have:** Talestyring, skjermforstørrelse, forenklede moduser, haptic feedback, blindeskrift-kompatibel
- MVP: 10 uker — Lean: $65K
- Modell: White-label til banker/fintech ($5K-50K/lisens)

---

## App #43: ExpenseZero — Automatisert Utgiftshåndtering

**Tagline:** «Kvitteringer? Ferdig.»  
**Pitch:** ExpenseZero bruker AI til å skanne kvitteringer, kategorisere utgifter, og generere rapporter automatisk — bedrifter bruker $1T+ på manuell utgiftshåndtering.

### 2–10.
**Must-have:** OCR kvitteringsskanning, auto-kategorisering, policy-sjekk, godkjennings-workflow, integrasjon med regnskap
**Teknisk:**
```
POST /expenses/scan             → OCR kvittering
GET  /expenses                  → Alle utgifter med status
POST /expenses/:id/approve      → Godkjenn/avvis
GET  /reports/monthly           → Månedlig rapport
```
- MVP: 8 uker — Lean: $50K
- Modell: Free (10 kvitteringer/mnd) → $9/bruker/mnd (business)

---

## App #44: DataDividend — Persondata-monetisering

**Tagline:** «Dine data. Din inntekt.»  
**Pitch:** DataDividend lar brukere kontrollere og selge sine anonymiserte data til forskere og bedrifter — gjennomsnittlig $200/år per person.

### 2–10.
**Must-have:** Data-dashboard (hva samles), opt-in marketplace, anonymisering, utbetalinger
- MVP: 12 uker — Lean: $80K
- Modell: 30% av datasalg-inntekt
- Juridisk: GDPR Art. 20, sterk samtykke-mekanisme

---

## App #45: InflaSave — Inflasjonsbeskyttet Sparing

**Tagline:** «Spar smartere enn inflasjonen.»  
**Pitch:** InflaSave investerer sparepenger automatisk i inflasjonsbeskyttede instrumenter (TIPS, I-bonds, reelle aktiva) — sparepenger taper 6-15% i kjøpekraft årlig.

### 2–10.
**Must-have:** Inflasjonskalkulator, auto-investering i TIPS/I-bonds, realavkastning-tracker
- MVP: 10 uker — Lean: $60K
- Modell: 0.25% AUM/år
- Juridisk: Investeringslisens

---

## App #46: DebtDefend — Inkassobeskyttelse

**Tagline:** «Kjenn dine rettigheter.»  
**Pitch:** DebtDefend hjelper forbrukere som kontaktes av inkassobyråer: verifiserer gjeld, sjekker lovlighet, genererer klagebrev — 40% av inkassokrav har feil.

### 2–10.
**Must-have:** Gjeldsverifisering, rettighets-guide, klagebrev-generator (AI), samtalelogger, forhandlingsassistent
**Teknisk:**
```
POST /claims/verify             → Verifiser inkassokrav
POST /claims/dispute            → Generer klagebrev
GET  /rights/:country           → Dine rettigheter per land
POST /calls/log                 → Logg inkassosamtale
```
- MVP: 8 uker — Lean: $45K
- Modell: Free guide → $4.99 per klagebrev → $9.99/mnd ubegrenset

---

## App #47: WellPay — Finansiell Wellness for Arbeidsplassen

**Tagline:** «Økonomisk trygghet = bedre jobb.»  
**Pitch:** WellPay er en B2B-plattform som gir ansatte verktøy for økonomisk velvære: budsjett, sparing, gjeldsrådgivning, nødlån fra arbeidsgiver.

### 2–10.
**Must-have:** Ansatt-dashboard (budsjett, sparing, gjeld), EWA (earned wage access), finansiell coaching, anonyme spørsmål
- MVP: 12 uker — Lean: $75K
- Modell: $3/ansatt/mnd (arbeidsgiver betaler)

---

## App #48: CarbonWallet — Personlig Karbonkreditt-handler

**Tagline:** «Tjen på å leve grønt.»  
**Pitch:** CarbonWallet lar individer tjene og handle karbonkreditter basert på sine grønne valg — demokratiserer et $2B marked.

### 2–10.
**Must-have:** Karbonfotavtrykk-kalkulator, grønne handlinger → kreditter, marketplace, utbetaling/donasjon
- MVP: 12 uker — Lean: $70K
- Modell: 5% transaksjonsavgift på kreditthandel

---

## App #49: TrustFund — Crowdfunding med Accountability

**Tagline:** «Fund med tillit.»  
**Pitch:** TrustFund løser crowdfundings tillitsproblem: milestone-basert utbetaling, transparent budsjett, refundering ved brudd — 85% leverer ikke.

### 2–10.
**Must-have:** Milestone-basert utbetaling, prosjektbudsjett-transparens, backer-voting, escrow, automatisk refund
**Teknisk:**
```
POST /projects/create           → Opprett kampanje med milestones
POST /projects/:id/back         → Støtt prosjekt
POST /milestones/:id/complete   → Marker milestone ferdig
POST /milestones/:id/vote       → Backers stemmer om godkjenning
GET  /projects/:id/budget       → Transparent budsjett
```
- MVP: 14 uker — Lean: $85K
- Modell: 3% plattformavgift (vs 5% Kickstarter) + escrow-rente

---

## App #50: FoodSaver — Matsvinns-kostnadsreduksjon

**Tagline:** «Kast mindre. Spar mer.»  
**Pitch:** FoodSaver sporer matinnkjøp, foreslår oppskrifter basert på hva som snart går ut, og beregner besparelser — matsvinn koster husholdninger $1600/år.

### 2–10.
**Must-have:** Kvitteringsskanning → matliste, utløpsvarsler, oppskriftsforslag fra inventar, ukentlig matplan, svinnkalkulator
**Teknisk:**
```
POST /inventory/scan            → Skann kvittering → matliste
GET  /inventory                 → Hva har du hjemme
GET  /inventory/expiring        → Snart utgått
GET  /recipes/suggestions       → Oppskrifter fra inventar
GET  /waste/savings             → Beregnet sparing
```
- MVP: 8 uker — Lean: $40K
- Modell: Free → Pro ($2.99/mnd, avanserte oppskrifter + matplan)

---

## Oppsummeringstabell: Alle 50 Apper

| # | App | MVP-tid | Lean-kostnad | Modell | Risiko |
|---|-----|---------|-------------|--------|--------|
| 1 | CashPilot | 8 uker | $50K | Freemium $5/mnd | Lav |
| 2 | BridgeBank | 12 uker | $100K | Transaksjonsavgift | Høy (lisens) |
| 3 | DebtZero | 10 uker | $50K | Freemium $7/mnd | Lav |
| 4 | NestEgg | 10 uker | $60K | Freemium $8/mnd + AUM | Moderat (lisens) |
| 5 | SendFair | 12 uker | $120K | Flat $0.99 + FX margin | Høy (lisens) |
| 6 | FlowCast | 10 uker | $60K | SaaS $29-79/mnd | Lav |
| 7 | InvestGate | 14 uker | $100K | AUM 0.25% + sub | Høy (lisens) |
| 8 | BudgetBuddy | 8 uker | $40K | Freemium $5/mnd | Lav |
| 9 | LoanShield | 8 uker | $45K | Freemium + affiliate | Lav |
| 10 | TaxEase | 12 uker | $80K | $0-15/innlevering | Moderat |
| 11 | CoverSafe | 10 uker | $60K | Lead gen/provisjon | Lav |
| 12 | CryptoGuard | 10 uker | $70K | Freemium $6/mnd | Lav |
| 13 | PriceShield | 8 uker | $50K | Free + affiliate | Lav |
| 14 | StudyDebt | 10 uker | $55K | Free + affiliate | Lav |
| 15 | HomeKey | 10 uker | $60K | Free + referral | Lav |
| 16 | WageWatch | 8 uker | $40K | Free + B2B data | Lav |
| 17 | GigSafe | 10 uker | $65K | $5/mnd + forsikring | Moderat |
| 18 | ElderGuard | 12 uker | $75K | $10/mnd/person | Lav |
| 19 | MicroLaunch | 14 uker | $90K | 3% rente + 1% avg | Høy (lisens) |
| 20 | SubSweep | 6 uker | $30K | $3/mnd + savings-share | Lav |
| 21 | EmergencyFund | 6 uker | $30K | Free + premium $3/mnd | Lav |
| 22 | TradeFlow | 16 uker | $120K | 1-3% av volum | Høy (lisens) |
| 23 | PensionWatch | 10 uker | $55K | Free + B2B | Moderat |
| 24 | BorderBiz | 12 uker | $80K | SaaS $49-199/mnd | Moderat |
| 25 | HealthCost | 12 uker | $80K | Freemium + per-forhandling | Moderat (HIPAA) |
| 26 | FarmFund | 14 uker | $90K | Låneavgift + forsikring | Høy (lisens) |
| 27 | EnergiSmart | 8 uker | $45K | Free + referral | Lav |
| 28 | FraudStop | 10 uker | $65K | $4/mnd/konto | Lav |
| 29 | SkillBridge | 12 uker | $70K | Free + B2B talent | Moderat |
| 30 | FinYouth | 10 uker | $55K | Free + interchange | Moderat (U18) |
| 31 | FairLend | 10 uker | $60K | 1% plattformavgift | Moderat |
| 32 | PropValue | 14 uker | $100K | Per vurdering + sub | Moderat |
| 33 | ForexShield | 10 uker | $70K | 0.5% konvertering | Moderat (lisens) |
| 34 | ImpactTrack | 12 uker | $75K | Freemium + institusjonell | Lav |
| 35 | CivicBudget | 8 uker | $40K | B2G per kommune | Lav |
| 36 | FreelanceTax | 10 uker | $60K | $15/mnd | Moderat |
| 37 | WealthPass | 12 uker | $80K | $20/mnd (familie) | Moderat (jur.) |
| 38 | CreditFair | 12 uker | $80K | Free → B2B | Moderat |
| 39 | NonprofitCFO | 10 uker | $55K | SaaS tiered | Lav |
| 40 | TariffNav | 10 uker | $65K | Freemium + SaaS | Lav |
| 41 | WageGuard | 8 uker | $40K | Free/donasjon + B2B | Lav |
| 42 | FinAccess | 10 uker | $65K | White-label B2B | Moderat |
| 43 | ExpenseZero | 8 uker | $50K | SaaS $9/bruker/mnd | Lav |
| 44 | DataDividend | 12 uker | $80K | 30% av salg | Høy (GDPR) |
| 45 | InflaSave | 10 uker | $60K | AUM 0.25% | Moderat (lisens) |
| 46 | DebtDefend | 8 uker | $45K | Per klage + sub | Lav |
| 47 | WellPay | 12 uker | $75K | B2B $3/ansatt/mnd | Lav |
| 48 | CarbonWallet | 12 uker | $70K | 5% transaksjonsavgift | Moderat |
| 49 | TrustFund | 14 uker | $85K | 3% plattformavgift | Moderat |
| 50 | FoodSaver | 8 uker | $40K | Freemium $3/mnd | Lav |

**Totalt estimat (lean scenario, alle 50):** ~$3.2M  
**Totalt estimat (standard, alle 50):** ~$10M  
**Anbefalt: Start med 3–5 apper og valider marked før skalering.**
