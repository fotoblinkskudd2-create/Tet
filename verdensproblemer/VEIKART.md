# Veikart: Idé → Salg på 6 Måneder

> 3-trinns plan for å ta én (eller flere) av disse 50 appene fra konsept til salgsklar produkt.

---

## Trinn 1: Valider & Bygg MVP (Måned 1–2)

### Mål
Ship en fungerende MVP med kjernebrukerverdien bevist.

### Handlinger

| Uke | Aktivitet | Leveranse |
|-----|-----------|-----------|
| 1 | **Problemvalidering:** 20 brukerintervjuer, konkurrentanalyse, markedsstørrelse-bekreftelse | Validert problem + persona-dokumenter |
| 1 | **Tech setup:** Monorepo, CI/CD, database, auth, hosting | Fungerende pipeline (push → deploy) |
| 2–3 | **Backend MVP:** Kjerneendepunkter, datamodeller, seed-data | API med Swagger-docs, kjørbar lokalt |
| 2–3 | **Web MVP:** Landing page + 2–3 kjerneskjermer | Deployert på Vercel |
| 3–4 | **iOS MVP:** Hovedskjerm + 1–2 kjernefunksjoner | TestFlight-bygg |
| 5–6 | **Betaling:** Stripe-integrasjon, freemium-gate | Fungerende betalingsflow |
| 7 | **Testing + polish:** E2E-tester, bug-fixing, UX-forbedring | Stabil app |
| 8 | **Soft launch:** 50–200 beta-brukere, feedback-loop | Beta med reelle brukere |

### Teamsammensetning (Lean)
- 1 fullstack-utvikler (60 %)
- 1 iOS-utvikler (40 %)
- 1 designer (20 %, kan være freelance)
- Founder = PM + markedsføring + brukerintervjuer

### Budsjett: Lean

| Post | Kostnad |
|------|---------|
| Utvikling (2 mnd) | $15 000–25 000 |
| Hosting/infra (Vercel free, Supabase free, AWS minimal) | $50–200/mnd |
| Design (freelance) | $2 000–5 000 |
| Apple Developer + diverse | $500 |
| **Total** | **$18 000–31 000** |

### Leveranser etter Trinn 1
- [ ] Fungerende web-app (deployert)
- [ ] Fungerende iOS-app (TestFlight)
- [ ] Backend API (deployert)
- [ ] 50+ beta-brukere
- [ ] Betalingsintegrasjon aktiv
- [ ] 10+ betalende brukere (bevis på betalingsvilje)

---

## Trinn 2: Iterer & Voks (Måned 3–4)

### Mål
Product-market fit (PMF) bekreftet, 1 000+ aktive brukere, positiv retention.

### Handlinger

| Uke | Aktivitet | Leveranse |
|-----|-----------|-----------|
| 9–10 | **Analyse:** Brukerdata (PostHog), churn-analyse, NPS-survey | Data-drevet innsikt |
| 9–10 | **Iterasjon:** Fiks topp 5 brukerproblemer, bygg #1 etterspurt funksjon | Oppdatert app |
| 11 | **App Store-lansering:** Screenshots, beskrivelser, ASO | Live i App Store |
| 11 | **Content marketing:** 10 blogginnlegg, SEO-strategi | Organisk trafikk starter |
| 12 | **Growth experiments:** Referral-program, social sharing, influencer (3–5 micro) | 500+ nye brukere |
| 13–14 | **B2B pilot (hvis relevant):** 3 bedrifts-kunder, pilot-kontrakter | $5K+ MRR |
| 15–16 | **Skalering:** Auto-scaling infra, performance-optimalisering | Stabil ved 5K+ brukere |

### Nøkkelmetrikker for PMF

| Metrikk | Mål for PMF |
|---------|------------|
| Retention D7 | > 40 % |
| Retention D30 | > 20 % |
| NPS | > 40 |
| Organisk vekst | > 30 % av nye brukere |
| Free→Paid konvertering | > 5 % |

### Budsjett: Trinn 2

| Post | Kostnad |
|------|---------|
| Utvikling (2 mnd) | $15 000–25 000 |
| Marketing (betalt + influencer) | $3 000–8 000 |
| Hosting (vekst) | $200–500/mnd |
| Juridisk (personvern, vilkår) | $1 000–3 000 |
| **Total** | **$20 000–38 000** |

### Leveranser etter Trinn 2
- [ ] 1 000+ MAU
- [ ] App live i App Store + Product Hunt-lansering
- [ ] NPS > 40
- [ ] $5K+ MRR (eller tydelig betalingsvilje)
- [ ] 3+ B2B piloter (hvis relevant)
- [ ] Content + SEO produserer trafikk

---

## Trinn 3: Salgsklar & Skaler (Måned 5–6)

### Mål
Appen er klar for salg (til kunder, investorer, eller acquirer) med bevisbar traction og skalerbar arkitektur.

### Handlinger

| Uke | Aktivitet | Leveranse |
|-----|-----------|-----------|
| 17–18 | **Salgsmaterialer:** Investordeck, one-pager, demo-video (60s), 3 marketing-screenshots | Komplett salgspakke |
| 17–18 | **Forretningsutvikling:** Outreach til 50 potensielle kunder/partnere | Pipeline |
| 19 | **Juridisk sluttføring:** Personvern-policy, ToS, eventuell compliance (HIPAA, etc.) | Juridisk klar |
| 19 | **Dokumentasjon:** README, API-docs, onboarding-guider | Dev-ready repo |
| 20 | **Pris-optimalisering:** A/B-test priser, pakker | Optimal prismodell |
| 21–22 | **Skaler markedsføring:** Betalt akquisjon (Google/Meta/TikTok $5K–15K/mnd), PR | 5K+ MAU |
| 23–24 | **Fundraise ELLER salgsprosess:** Seed-runde pitch ($500K–1M) eller app-salg-plattform | Funding eller salg |

### Salgsklar sjekkliste

| Kategori | Krav | Status |
|----------|------|--------|
| **Produkt** | Stabil app (iOS + web), <1 % crash rate | ☐ |
| **Brukerbase** | 5K+ MAU, positiv retention | ☐ |
| **Revenue** | $10K+ MRR eller tydelig path til monetisering | ☐ |
| **Tech** | Clean codebase, CI/CD, dokumentasjon, tester | ☐ |
| **Juridisk** | Privacy policy, ToS, compliance | ☐ |
| **Marketing** | App Store live, 10+ reviews, screenshots | ☐ |
| **Salgspakke** | Investordeck, demo-video, one-pager, seed-data | ☐ |
| **Team** | 2–4 personer, clear roles | ☐ |

### Budsjett: Trinn 3

| Post | Kostnad |
|------|---------|
| Utvikling (2 mnd, ny funksjonalitet + stabilisering) | $15 000–25 000 |
| Marketing (skala) | $10 000–30 000 |
| Hosting (5K+ brukere) | $500–2 000/mnd |
| Juridisk (compliance) | $2 000–10 000 |
| Salg & demo-produksjon | $1 000–3 000 |
| **Total** | **$30 000–73 000** |

---

## Totalbudsjett (6 mnd)

| Scenario | Total kostnad | Nødvendig team |
|----------|--------------|----------------|
| **Bootstrapped/Lean** | $70 000–140 000 | 2–3 personer |
| **Standard (angel-funded)** | $150 000–300 000 | 4–6 personer |
| **Full (seed-funded)** | $300 000–500 000 | 6–10 personer |

*Antakelser: Vestlige utviklerlønninger. Med outsourcing til Øst-Europa/Asia kan kostnadene halveres.*

---

## Teknologiske gjenbruksmuligheter

Alle 50 apper deler felles moduler som bør bygges **én gang** og gjenbrukes:

| Modul | Beskrivelse | Gjenbruk |
|-------|-------------|----------|
| **Auth-modul** | Supabase Auth + JWT + OAuth + passkeys | Alle 50 apper |
| **Betalingsmodul** | Stripe subscriptions + webhook-håndtering | Alle B2C apper |
| **Push-modul** | FCM + APNs abstrahert | Alle 50 apper |
| **AI-chat-modul** | OpenAI GPT-4 streaming wrapper | 15+ apper (MindWell, GlucoCoach, JusticeBot, etc.) |
| **Kart-modul** | Mapbox/MapKit + PostGIS geo-queries | 20+ apper |
| **Admin-dashboard** | Next.js + Recharts generisk dashboard | Alle B2B apper |
| **Analytics-modul** | PostHog event tracking wrapper | Alle 50 apper |

### Estimert besparelse ved gjenbruk
Bygge 5 apper med gjenbrukbare moduler vs. fra scratch:
- **Uten gjenbruk:** 5 × $80K = $400K
- **Med gjenbruk:** $80K + 4 × $50K = $280K
- **Besparelse: ~30 %**

---

## Anbefalte neste steg

1. **Velg 1 app** fra topp 5 (HØY PRIORITET) basert på ditt teams kompetanse og marked
2. **Kjør 20 brukerintervjuer** i uke 1 for å validere problemet
3. **Ship MVP i 8 uker** — ikke perfekt, men funksjonelt og betalbart
4. **Mål PMF** (retention > 40 % D7, NPS > 40)
5. **Bygg salgspakke** og enten fundraise eller selg

> **Gullregelen:** Ship fort, iterer basert på data, og husk at den beste appen er den folk faktisk bruker.

---

## Appendix: Felles repo-struktur (white-label template)

```
super-app-template/
├── apps/
│   └── ios/                    # SwiftUI iOS-app
│       ├── App.swift
│       ├── Views/
│       ├── ViewModels/
│       ├── Models/
│       └── Services/
├── packages/
│   ├── web/                    # Next.js 14 web-app
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── ui/                     # Delt komponentbibliotek
│   └── config/                 # Delt config (tailwind, tsconfig)
├── services/
│   └── api/                    # Node.js/Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── models/
│       ├── Dockerfile
│       └── tests/
├── infra/
│   ├── docker-compose.yml
│   ├── .github/workflows/
│   └── terraform/              # IaC (valgfritt)
├── scripts/
│   ├── seed.ts
│   └── migrate.ts
├── .env.example
├── package.json                # Monorepo root (npm workspaces)
├── turbo.json                  # Turborepo config
└── README.md
```

### docker-compose.yml (utviklingsmiljø)

```yaml
version: "3.8"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  api:
    build: ./services/api
    ports: ["3001:3001"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/appdb
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret
    depends_on: [db, redis]

  web:
    build: ./packages/web
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/v1
    depends_on: [api]

volumes:
  pgdata:
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy-web:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: packages/web

  deploy-api:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_KEY }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET }}
          aws-region: eu-west-1
      - run: |
          cd services/api
          docker build -t api .
          docker tag api:latest ${{ secrets.ECR_REPO }}:latest
          docker push ${{ secrets.ECR_REPO }}:latest
          aws ecs update-service --cluster prod --service api --force-new-deployment
```

### Seed-skript

```typescript
// scripts/seed.ts — genererer demo-data for enhver app
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function seed() {
  console.log("Seeding demo data...");

  // Demo-brukere
  const users = [
    { email: "demo@example.com", name: "Demo User", plan: "pro" },
    { email: "admin@example.com", name: "Admin", plan: "admin" },
    { email: "test@example.com", name: "Test User", plan: "free" },
  ];

  for (const user of users) {
    await supabase.from("users").upsert(user, { onConflict: "email" });
  }

  // Generer 30 dager med dummy-data (tilpasses per app)
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86400000);
    await supabase.from("activity_logs").insert({
      user_email: "demo@example.com",
      date: date.toISOString().split("T")[0],
      value: Math.floor(Math.random() * 100),
      category: ["primary", "secondary", "tertiary"][Math.floor(Math.random() * 3)],
    });
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
```
