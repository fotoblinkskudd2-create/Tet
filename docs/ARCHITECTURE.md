# Architecture

## Monorepo layout

```
five-app-concepts/
├── apps/
│   ├── gonzo-journal/   Next.js 14  port 3001  Norwegian literary diary
│   ├── u864-tracker/    Next.js 14  port 3002  Fjord pollution monitor
│   │   └── api/         FastAPI     port 8000  Data ingestion
│   ├── openalex/        Next.js 14  port 3003  Multi-agent orchestrator
│   ├── memorybank/      Next.js 14  port 3004  Knowledge graph
│   └── sintra12/        Next.js 14  port 3005  Underground e-commerce
├── packages/
│   ├── ai/              Shared Claude API integration
│   ├── database/        Shared Prisma schema + client
│   └── ui/              Shared React components
└── docker-compose.yml   Postgres, TimescaleDB, Neo4j, Redis, Elasticsearch
```

## Shared AI package

All Claude calls go through `packages/ai`. Each app imports only the
functions it needs:

| Function              | Used by         | Model   |
|-----------------------|-----------------|---------|
| `analyzeGonzoEntry`   | gonzo-journal   | Sonnet  |
| `extractEntities`     | memorybank      | Haiku   |
| `synthesizeTopic`     | memorybank      | Sonnet  |
| `runAgent/runWorkflow`| openalex        | Any     |
| `matchProductsToVibe` | sintra12        | Haiku   |
| `generateProductStory`| sintra12        | Haiku   |

## Data stores

| Store         | Used by                         |
|---------------|---------------------------------|
| PostgreSQL     | gonzo-journal, memorybank, sintra12, openalex |
| TimescaleDB    | u864-tracker (time-series)      |
| Neo4j          | memorybank (graph queries)      |
| Redis          | session cache, job queue        |
| Elasticsearch  | sintra12 product search         |

## Development

```bash
# Start all services
docker compose up -d

# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm --filter @five-apps/gonzo-journal dev
```

## Environment variables

Each app reads from its own `.env.local`. Common vars:

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://five_apps:secret@localhost:5432/five_apps
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_MAPBOX_TOKEN=pk...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
