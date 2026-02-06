# BergenBudget

Personlig okonomitracker bygget for Bergensere. Spor inntekter, utgifter, budsjetter og formue - alt paa norsk med norsk tallformat.

## Funksjoner

- **Dashboard** - Oversikt over saldo, inntekt/utgift, budsjettfremdrift og kommende faste utgifter
- **Transaksjoner** - Legg til, rediger, slett og sok i transaksjoner med automatisk kategorisering
- **Kontoer** - Brukskonto, sparekonto, kredittkort og BSU
- **Budsjett** - Sett manedlige budsjetter per kategori med fremdriftsmaling
- **Rapporter** - Manedlig oversikt, formueutvikling og CSV-eksport
- **Faste utgifter** - Administrer husleie, lonn, abonnementer og annet
- **CSV-import** - Importer transaksjoner fra norske banker (Sbanken, Sparebanken Vest)
- **Norsk UI** - Bokmal med norsk tallformat (1 234,56 kr) og datoformat (DD.MM.YYYY)

## Tech stack

- React 19 + TypeScript
- Tailwind CSS v4
- Recharts (diagrammer)
- Zustand (state management med localStorage-persistering)
- React Router v7
- Lucide React (ikoner)
- Supabase-klar (migrasjonsfil inkludert)

## Kom i gang

```bash
npm install
npm run dev
```

Appen kjorer med lokal data (localStorage). For Supabase-integrasjon, sett miljovariabler:

```
VITE_SUPABASE_URL=din-supabase-url
VITE_SUPABASE_ANON_KEY=din-anon-key
```

## Demodata

Klikk "Prove med demodata" paa innloggingssiden for aa laste inn eksempeldata med kontoer, transaksjoner og budsjetter.
