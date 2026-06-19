# 7 App-MVP-konsepter

Syv selvstendige MVP-konsepter, hver bygget etter samme 20-punkts mal. Felles teknisk
stack på tvers av alle: **Next.js (App Router) + Supabase (Postgres/Auth/Storage) +
OpenAI API + Stripe + Clerk + Vercel**.

| # | App | Kjerneidé | Lønnsomhet | Viralitet | Gjennomførbarhet | Merkevarekraft |
|---|-----|-----------|:---------:|:--------:|:----------------:|:--------------:|
| 1 | [Lumy](01-lumy.md) | Daglig mental klarhet med AI-coach og lysritualer | 7 | 6 | 9 | 8 |
| 2 | [Vindr](02-vindr.md) | Poetisk reise-app som foreslår mikro-eventyr | 6 | 8 | 7 | 9 |
| 3 | [Kortly](03-kortly.md) | "TikTok for tekst" – smart mikroinnhold-feed | 7 | 9 | 8 | 7 |
| 4 | [Bergly](04-bergly.md) | Lokal Bergen-app for vær, kultur og skjulte perler | 6 | 7 | 8 | 8 |
| 5 | [Snabb](05-snabb.md) | Ekstremt rask produktivitet – ferdig på under 60 sek | 8 | 7 | 9 | 7 |
| 6 | [Echo Nord](06-echo-nord.md) | AI-genererte nordiske lydvandringer | 6 | 7 | 6 | 9 |
| 7 | [MiniForge](07-miniforge.md) | AI-oppfinnerlab: idé → ferdig prototypepakke | 8 | 6 | 7 | 8 |

## Hvordan velge

- **Raskest til inntekt:** Snabb og MiniForge (klar B2C/B2B-betalingsvilje, lite innholdsavhengig).
- **Størst viralitet:** Kortly (delbar feed) og Vindr (delbare ruter/skjermbilder).
- **Lavest risiko å bygge på 7 dager:** Snabb, Lumy, Kortly.
- **Sterkest historie/merkevare:** Echo Nord og Vindr.

## Felles arkitekturnotat

Alle syv deler samme grunnmønster, så delene kan gjenbrukes:

- **Auth:** Clerk for innlogging/sesjon, Supabase RLS for datatilgang (`auth.uid()` mappet via Clerk JWT).
- **AI:** Server-side OpenAI-kall i Next.js Route Handlers (`/app/api/...`), aldri nøkler i klient.
- **Betaling:** Stripe Checkout + Customer Portal, webhooks til `/api/stripe/webhook`, abonnementsstatus speilet i Supabase.
- **Deploy:** Vercel (frontend + edge/route handlers), Supabase som managed Postgres.
- **Pris i NOK** med Stripe i `nok`-valuta.

Se hver fil for fullt 20-punkts oppsett.
