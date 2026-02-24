# Veikart: Fra Idé til Salg på 6 Måneder

> Anbefalt 3-trinns plan for å ta 3–5 av disse appene fra konsept til inntekt.

---

## Overordnet Strategi

**Velg 3 apper å starte med.** Anbefalt startportefølje (lavest risiko, raskest til marked):

| Prioritet | App | Hvorfor først |
|-----------|-----|---------------|
| 1 | **CashPilot** | Ingen lisens nødvendig, stort marked, bevist modell (Duolingo), rask MVP |
| 2 | **DebtZero** | Ingen lisens, høy betalingsvillighet, sterk word-of-mouth |
| 3 | **BudgetBuddy** | Enklest MVP, stor brukerbase, naturlig oppsalg til CashPilot/DebtZero |

**Alternativ (høyere risiko, høyere belønning):**
- BridgeBank (krever e-money lisens) + SendFair (krever money transmitter lisens) — start lisenssøknad i trinn 1 parallelt med bygging.

---

## Trinn 1: BYGG (Måned 1–2)

### Uke 1–2: Oppsett og Arkitektur
- [ ] Sett opp monorepo (Turborepo) med delt kode mellom apper
- [ ] Konfigurer CI/CD: GitHub Actions → Vercel (web) + TestFlight (iOS) + AWS ECS (backend)
- [ ] Sett opp PostgreSQL (Supabase), Redis (Upstash), Clerk (auth), Stripe (betaling)
- [ ] Design system i Figma + TailwindCSS tokens (gjenbrukbart for alle apper)
- [ ] Opprett delt komponentbibliotek (React + SwiftUI)

### Uke 3–6: MVP-bygging
- [ ] **CashPilot MVP:** 10 leksjoner, quiz-motor, XP/streak, grunnleggende budsjett, AI-chat
- [ ] **DebtZero MVP:** Gjeldsimport (manuelt + Plaid), snøball/skred-plan, betalingstracker
- [ ] **BudgetBuddy MVP:** Banktilkobling, AI-kategorisering, budsjett-oppsett, varsler

### Uke 7–8: Testing og Polish
- [ ] Beta-testing med 50 brukere per app (recruit via ProductHunt Ship, Betalist)
- [ ] Tilgjengelighets-audit (WCAG AA)
- [ ] Performance-optimering (<2s load, <100ms API)
- [ ] App Store-screenshots og beskrivelser
- [ ] Seed-data og demo-modus

### Teamkrav (Trinn 1)
| Rolle | Antall | Kostnad/mnd |
|-------|--------|-------------|
| Fullstack-utvikler (React + Node) | 2 | $8K–12K/person |
| iOS-utvikler (SwiftUI) | 1 | $8K–12K |
| UI/UX-designer | 1 | $5K–8K |
| **Total/mnd** | **4** | **$29K–44K** |
| **Trinn 1 total (2 mnd)** | | **$58K–88K** |

### Leveranser etter Trinn 1
- 3 fungerende MVP-er (web + iOS)
- CI/CD pipeline
- TestFlight-builds
- 50 beta-brukere med feedback

---

## Trinn 2: LANSER (Måned 3–4)

### Måned 3: Soft Launch
- [ ] Submit til App Store og Google Play (via React Native wrapper eller separat)
- [ ] Lanser web-versjoner på egne domener
- [ ] ProductHunt-launch (én app per uke, tirsdager)
- [ ] Reddit: r/personalfinance, r/financialindependence, r/povertyfinance
- [ ] Hacker News: «Show HN: CashPilot — Duolingo for Financial Literacy»
- [ ] Twitter/X: Tråd om problemet + løsningen (for hver app)

### Måned 4: Vekst og Iterasjon
- [ ] Analyser brukerdata (PostHog/Mixpanel): retention, funnel, churn
- [ ] A/B test priser og onboarding
- [ ] Implementer betalingsmodell (Stripe subscription)
- [ ] Content marketing: blogg om finansiell literacy (SEO)
- [ ] TikTok/Instagram: Korte «money tips»-videoer som driver til app

### Veksttaktikker
| Kanal | Handling | Forventet effekt |
|-------|----------|-----------------|
| ProductHunt | 3 lanseringer (1/app) | 5K–20K besøk per launch |
| SEO/Blogg | 10 artikler om «how to budget» etc. | 2K–5K organisk/mnd etter 3 mnd |
| TikTok | 3 videoer/uke (money myths, tips) | 10K–100K views, 500–5K installs |
| Referral | «Inviter en venn, få 1 mnd gratis» | 20% av vekst |
| Partnerskap | 5 finansbloggere/influencere | 1K–5K installs per partnerskap |

### Leveranser etter Trinn 2
- 3 apper live i App Store + web
- 5,000–25,000 registrerte brukere
- Første betalende kunder
- Brukerdata for videre optimering

---

## Trinn 3: SKALER (Måned 5–6)

### Måned 5: Monetisering og B2B
- [ ] Optimer konvertering free → paid (mål: 5–8%)
- [ ] Lanser B2B-tilbud (CashPilot Enterprise for arbeidsgivere)
- [ ] Inngå 3 bedriftsavtaler (pilotkunder)
- [ ] Oversett til 5 nye språk (ES, PT, HI, AR, FR)
- [ ] Lanser 2 nye apper fra porteføljen (f.eks. SubSweep + EmergencyFund — begge enkle, 6 ukers MVP)

### Måned 6: Salg og Investering
- [ ] Oppdater investor one-pager med reelle tall
- [ ] Bygg pitch deck (10 slides)
- [ ] Søk pre-seed/angel ($250K–500K)
- [ ] Utforsk white-label-salg til banker/fintech
- [ ] Plan for neste 6 måneder basert på traksjon

### Skaleringstaktikker
- **Betalt vekst:** Start Google Ads og Facebook/Instagram ads med CAC < $5
- **Partnerskap:** NGOer (UNDP, World Bank), banker, arbeidsgivere
- **White-label:** Lisenser teknologien til banker i utviklingsland
- **API-first:** Tilby CashPilot/DebtZero-motorer som API (SaaS)

### Leveranser etter Trinn 3
- 25,000–100,000 registrerte brukere
- $5K–50K MRR
- 5 apper live
- Investor-klar med reelle metrics
- White-label pipeline

---

## Budsjettoppsummering (6 måneder)

| Post | Lean | Standard |
|------|------|----------|
| Team (4 personer × 6 mnd) | $174K | $264K |
| Hosting/infra (Vercel, AWS, Supabase) | $3K | $10K |
| Tjenester (Clerk, Stripe, Plaid, OpenAI) | $5K | $15K |
| Marketing (ads, influencere) | $5K | $20K |
| Design (Figma, stock assets) | $1K | $3K |
| Juridisk (personvern, ToS, lisens-forberedelse) | $5K | $15K |
| Buffer (15%) | $29K | $49K |
| **Total 6 måneder** | **$222K** | **$376K** |

*Antakelser: Lean = remote team i blandet geografi. Standard = erfarne utviklere i vestlige land.*

---

## Risikohåndtering

| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|--------|--------------|------------|--------|
| App Store avvisning | Moderat | Forsinkelse | Følg guidelines slavisk, submit tidlig |
| Lav brukeradopsjon | Moderat | Pivoter | A/B test aggressivt, lytt til brukere |
| Plaid/API-endringer | Lav | Feature-tap | Abstrahér integrasjoner, ha fallback |
| Konkurrent-kopiering | Høy | Markedspress | Fokus på UX + community, ikke bare features |
| Regulatorisk endring | Lav | Compliance-kostnad | Hold deg oppdatert, ha juridisk buffer |

---

## Nøkkelmetrikker å Spore

| Metrikk | Mål (6 mnd) |
|---------|-------------|
| Totalt registrerte brukere | 50,000–100,000 |
| MAU (monthly active) | 25,000–50,000 |
| Betalende brukere | 2,500–5,000 |
| MRR | $15K–50K |
| Retention D30 | >25% |
| NPS | >40 |
| CAC | <$5 |
| LTV | >$40 |

---

## Anbefalt Teknologistack (Gjenbrukbar)

All 50 apper bør bygges på denne felles stakken for maksimal gjenbruk:

```
Monorepo (Turborepo)
├── packages/
│   ├── ui/             → Delt React komponentbibliotek (TailwindCSS)
│   ├── api-client/     → Typesafe API-klient (generert fra OpenAPI spec)
│   ├── auth/           → Clerk-wrapper
│   ├── db/             → Prisma schema + migrations
│   └── config/         → Delt ESLint, TS, Tailwind config
├── apps/
│   ├── cashpilot-web/  → Next.js 14
│   ├── debtzero-web/   → Next.js 14
│   ├── budgetbuddy-web/→ Next.js 14
│   └── ...
├── services/
│   ├── api/            → Express.js backend (delt mellom apper)
│   ├── ai/             → OpenAI-tjeneste
│   └── notifications/  → Push/email/SMS
├── ios/
│   ├── CashPilot/
│   ├── DebtZero/
│   └── ...
└── infra/
    ├── terraform/      → AWS infrastruktur
    ├── docker/
    └── .github/workflows/
```

### Verktøyvalg
| Behov | Verktøy | Hvorfor |
|-------|---------|---------|
| Monorepo | Turborepo | Raskest, best DX |
| Frontend | Next.js 14 + TailwindCSS | Best for SEO + SSR + DX |
| Backend | Express + Prisma | Modent, stort økosystem |
| DB | Supabase (PostgreSQL) | Managed, gratis tier, Realtime |
| Auth | Clerk | Raskest å integrere, alle strategier |
| Betaling | Stripe | Standard, global |
| AI | OpenAI API | Best kvalitet for chat/analyse |
| Analytics | PostHog | Open source, self-hosted option |
| Hosting | Vercel + AWS | Best DX + skalerbarhet |
| CI/CD | GitHub Actions | Integrert, gratis for open source |

---

## Konklusjon

**Start med CashPilot + DebtZero + BudgetBuddy.**  
De deler teknologi, målgruppe og distribusjon. En bruker som lærer om finans (CashPilot) trenger budsjett (BudgetBuddy) og gjeldshjelp (DebtZero). Kryss-selg mellom appene.

**Måned 1–2:** Bygg MVPer.  
**Måned 3–4:** Lanser og voks organisk.  
**Måned 5–6:** Monetiser og søk kapital.  

Etter 6 måneder har du reelle data for å bestemme hvilke av de øvrige 47 appene som bør bygges neste.
