# BergenBudget

Personlig okonomiapp for nordmenn i Bergen. Hold oversikt over bankkontoer, transaksjoner, budsjetter og skatterelevante kategorier - alt pa norsk med NOK-formatering.

## Funksjoner

- **Autentisering** - E-post/passord + Google OAuth (placeholder), rollebasert tilgang (admin/bruker)
- **Kontoer** - Brukskonto, sparekonto, kredittkort, BSU
- **Transaksjoner** - CRUD med auto-kategorisering, delte transaksjoner, etiketter, kvitteringsopplasting
- **Budsjetter** - Manedlige budsjetter per kategori med fremdriftsvisning
- **Rapporter** - Maneds-/arsrapporter, skattesammendrag, nettoverdi over tid, CSV-eksport
- **Prognose** - "Hvis du fortsetter slik, gar du tom for penger innen X"
- **CSV-import** - Stotter Sbanken, Sparebanken Vest og generisk norsk bankformat
- **Norske skattekategorier** - Skattetrekk, feriepenger, BSU-sparing, fagforeningsfradrag
- **Mork modus** - Bytt mellom lys og mork tema
- **Responsivt design** - Fungerer pa mobil, nettbrett og desktop

## Teknisk stack

- **Frontend:** React 18 + TypeScript + Vite + Chart.js
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite (better-sqlite3) - enkelt a bytte til PostgreSQL
- **Sikkerhet:** bcrypt, JWT, helmet, CORS, rate limiting, input-validering

## Kom i gang

```bash
# Installer avhengigheter
npm run install:all

# Start utvikling (backend + frontend)
npm run dev

# Eller start separat
npm run dev:backend   # Port 3001
npm run dev:frontend  # Port 5173
```

## API-endepunkter

| Rute | Metode | Beskrivelse |
|------|--------|-------------|
| `/api/auth/register` | POST | Registrer bruker |
| `/api/auth/login` | POST | Logg inn |
| `/api/auth/me` | GET | Hent innlogget bruker |
| `/api/accounts` | GET/POST | Kontoer |
| `/api/transactions` | GET/POST | Transaksjoner (paginert) |
| `/api/transactions/split` | POST | Del transaksjon |
| `/api/transactions/import-csv` | POST | Importer fra CSV |
| `/api/categories` | GET/POST | Kategorier |
| `/api/budgets` | GET/POST | Budsjetter |
| `/api/recurring` | GET/POST | Faste transaksjoner |
| `/api/dashboard` | GET | Dashboard-data |
| `/api/reports/monthly` | GET | Manedsrapport |
| `/api/reports/annual` | GET | Arsrapport |
| `/api/reports/net-worth` | GET | Nettoverdi |
| `/api/reports/forecast` | GET | Prognose |
| `/api/reports/export` | GET | Eksporter CSV |

## Produksjon

```bash
# Bygg frontend
npm run build

# Start server (serverer bade API og frontend)
npm start
```
