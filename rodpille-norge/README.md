# RødPilleNorge

En full-stack anti-establishment plattform for å spre sannheten om Norge.

## Tech Stack

- **Web**: Next.js 14 (App Router) + TailwindCSS + PWA
- **Mobil**: Expo SDK 50 + React Native + NativeWind
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **AI**: OpenAI GPT-4 for faktasjekk og innholdsanalyse
- **Betaling**: Stripe subscriptions og donasjoner
- **Deploy**: Vercel (web) + Expo EAS (mobil)

## Monorepo Struktur

```
rodpille-norge/
├── apps/
│   ├── web/          # Next.js PWA
│   ├── mobile/       # Expo React Native
│   └── admin/        # Admin panel (kommer)
├── packages/
│   ├── database/     # Supabase client + types
│   └── ai-agents/    # AI faktasjekk-system
└── supabase/
    └── migrations/   # Database migrations
```

## Funksjoner

### Core
- **Feed** med uendelig scroll og algoritmisk sortering
- **Rød Pille Score** basert på upvotes, kontroversialitet og AI-analyse
- **AI Løgn-sjekk** multi-agent system som verifiserer påstander
- **Trådet kommentarer** med voting og rage-meter

### AI Agent Chain
1. **Scraper Agent**: Henter og oppsummerer kilder
2. **Data Agent**: Kryssjekker mot SSB og offisielle tall
3. **Lie Checker Agent**: Matcher mot database av kjente løgner
4. **Score Agent**: Gir løgn-score 0-100 med begrunnelse

### Brukerroller
- **Normie**: Kan lese og stemme
- **Rød Pille**: Kan poste innlegg
- **Moderator**: Kan banne og slette
- **Admin**: Full tilgang

### Monetisering
- **Rød Pille Elite**: 99 kr/mnd for premium-funksjoner
- **Donasjoner**: Anonyme bidrag med progress-bar

## Oppsett

### Forutsetninger
- Node.js 20+
- npm 10+
- Supabase-prosjekt
- Stripe-konto
- OpenAI API-nøkkel

### 1. Klon og installer

```bash
git clone <repo-url>
cd rodpille-norge
npm install
```

### 2. Sett opp miljøvariabler

```bash
cp apps/web/.env.example apps/web/.env.local
# Rediger .env.local med dine nøkler
```

### 3. Sett opp Supabase

```bash
# Installer Supabase CLI
npm install -g supabase

# Logg inn
supabase login

# Link til prosjekt
supabase link --project-ref your-project-ref

# Kjør migrations
supabase db push
```

### 4. Start utvikling

```bash
# Web
npm run dev:web

# Mobil
npm run dev:mobile
```

## Deploy

### Web (Vercel)

```bash
# Installer Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

Sett disse miljøvariablene i Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_ELITE_PRICE_ID`

### Mobil (Expo EAS)

```bash
# Installer EAS CLI
npm i -g eas-cli

# Logg inn
eas login

# Build for iOS/Android
cd apps/mobile
eas build --platform all --profile production
```

## API Endepunkter

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Feed
- `GET /api/posts` - Hent feed
- `POST /api/posts` - Opprett post
- `POST /api/posts/:id/vote` - Stem

### AI
- `POST /api/ai/fact-check` - Full faktasjekk
- `GET /api/ai/fact-check/quick` - Hurtigsjekk

### Betalinger
- `POST /api/payments/create-subscription`
- `POST /api/payments/donate`
- `POST /api/webhooks/stripe`

## Database Schema

Se `supabase/migrations/001_initial_schema.sql` for komplett schema.

Hovedtabeller:
- `users` - Brukerprofiler
- `posts` - Innlegg med AI-analyse
- `comments` - Trådete kommentarer
- `votes` - Stemmer
- `known_lies` - Database av kjente løgner

## Kjente Løgner Database

Plattformen inkluderer en database med verifiserte løgner fra norske partier innen:
- Strøm og energi
- Innvandring
- Klima
- Media/NRK
- Økonomi
- Helse
- Kriminalitet

Se `supabase/migrations/002_seed_data.sql` for komplett liste.

## Sikkerhet

- Rate limiting på API
- CAPTCHA på registrering
- AI spam-deteksjon
- Shadow-ban funksjonalitet
- RLS (Row Level Security) på alle tabeller

## Lisens

Privat - Alle rettigheter forbeholdt.

---

**Norge våkner én rød pille om gangen.**
