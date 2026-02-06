# PerspectivePulse - AI Context Guide

## Project Overview
PerspectivePulse is a Next.js 14 news aggregator that breaks filter bubbles by presenting every story from progressive, conservative, and international viewpoints using AI-powered analysis.

## Tech Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with Shadcn UI components
- **Database**: Supabase PostgreSQL via Prisma ORM
- **AI**: OpenAI GPT-4o-mini via LangChain for news analysis
- **Charts**: Recharts for data visualization
- **Validation**: Zod for runtime type checking

## Key Architecture Decisions
- **Strict TypeScript**: No `any` types. All data flows validated with Zod schemas.
- **Server Components by default**: Only use `"use client"` when interactivity is needed.
- **Prisma Client singleton**: Shared via `src/lib/prisma.ts` to avoid connection pool exhaustion.
- **AI Pipeline**: Fetch -> Group -> Analyze -> Persist. Orchestrated in `src/lib/ai/orchestrator.ts`.

## Directory Structure
```
perspective-pulse/
├── prisma/schema.prisma       # Database models
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/               # API route handlers
│   │   ├── (dashboard)/       # User dashboard
│   │   └── story/[id]/        # Story detail with Tri-Lens
│   ├── components/
│   │   ├── ui/                # Shadcn primitives (Card, Badge, etc.)
│   │   ├── shared/            # StoryCard, DiversityGauge
│   │   ├── tri-lens/          # TriLensView, PerspectiveColumn, FactBridge
│   │   └── charts/            # BiasHeatmap
│   ├── hooks/                 # useStories custom hook
│   ├── lib/                   # Utilities, Prisma client, AI orchestrator
│   ├── services/              # NewsAggregator, PerspectiveAnalyzer
│   └── types/                 # Zod schemas and TypeScript types
```

## Core Features
1. **Tri-Lens View**: 3-column layout showing Progressive, Conservative, International perspectives
2. **Fact-Bridge**: Central panel highlighting consensus facts across all sources
3. **Bias Heatmap**: Recharts stacked bar chart showing geographic coverage distribution
4. **News Engine**: Multi-source fetcher with AI categorization pipeline
5. **Diversity Score**: Tracks user reading patterns and calculates balance metrics

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
npx prisma db push   # Sync schema to database
npx prisma generate  # Regenerate Prisma client
```

## Environment Variables
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI analysis
- `NEWS_API_KEY` - NewsAPI.org key for article fetching

## Coding Standards
- Use TypeScript strictly; no `any` types
- Validate all external data with Zod schemas
- Use `cn()` utility for conditional Tailwind classes
- Follow Next.js App Router conventions
- Components are server-first; add `"use client"` only when needed
