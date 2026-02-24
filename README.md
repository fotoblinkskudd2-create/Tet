# LeanLife 🏃‍♂️

**Din personlige vei til varig, sunn vekt.**

LeanLife er en AI-drevet vekthåndteringsapp (iOS + web) som kombinerer smart kaloritracking, personlige måltidsplaner og motivasjonscoaching for å hjelpe overvektige med å oppnå varig vekttap.

## Repo-struktur

```
leanlife/
├── docs/                 # Spesifikasjon, API-docs, investor one-pager
├── frontend-web/         # Next.js 14 / React / TypeScript / Tailwind
├── frontend-ios/         # SwiftUI iOS-app
├── backend/              # Node.js / Express / TypeScript / Prisma
├── infra/                # Docker, CI/CD, terraform
├── scripts/              # Seed-data, demo-generering, setup
└── tests/                # Backend unit-tester + E2E (Playwright)
```

## Forutsetninger

- **Node.js** 20+
- **PostgreSQL** 16+
- **Redis** 7+
- **Docker** & **Docker Compose** (anbefalt for lokal utvikling)

## Hurtigstart (lokal utvikling)

### Alternativ 1: Docker Compose (anbefalt)

```bash
# Klon og start
git clone https://github.com/your-org/leanlife.git
cd leanlife
cp backend/.env.example backend/.env
docker-compose -f infra/docker-compose.yml up -d

# Kjør database-migrasjoner og seed
cd backend
npx prisma migrate dev
npx ts-node prisma/seed.ts
```

### Alternativ 2: Manuell

```bash
# 1. Start PostgreSQL og Redis lokalt

# 2. Backend
cd backend
cp .env.example .env  # Rediger med dine verdier
npm install
npx prisma migrate dev
npx prisma generate
npm run dev

# 3. Frontend (web)
cd frontend-web
npm install
npm run dev

# 4. iOS
open frontend-ios/LeanLife.xcodeproj
# Bygg og kjør i Xcode (Simulator eller enhet)
```

### Miljøvariabler

Se `backend/.env.example` for nødvendige variabler:

| Variabel | Beskrivelse |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Hemmelig nøkkel for JWT signing |
| `OPENAI_API_KEY` | API-nøkkel for AI-funksjoner |
| `STRIPE_SECRET_KEY` | Stripe-nøkkel for betalinger |

## Deploy

### Web (Vercel)
```bash
cd frontend-web
vercel --prod
```

### Backend (Docker → Fly.io)
```bash
cd infra
fly deploy
```

### iOS (App Store)
1. Arkiver i Xcode
2. Upload til App Store Connect
3. Submit for review

## Testing

```bash
# Backend unit-tester
cd backend && npm test

# E2E-tester
cd tests/e2e && npx playwright test
```

## Dokumentasjon

- [Full spesifikasjon](docs/SPECIFICATION.md)
- [Investor One-Pager](docs/INVESTOR_ONE_PAGER.md)

## Lisens

Proprietær — alle rettigheter forbeholdt.
