# PerspectivePulse Architecture

## System Overview

PerspectivePulse is a Next.js 14 application that aggregates news from multiple sources, analyzes them for bias and perspective using AI, and presents them in a multi-perspective view to help users break their filter bubbles.

## Data Flow

```
News Sources (RSS/API)
        |
        v
NewsAggregator Service
  - Fetches articles from multiple sources
  - Groups related articles into story clusters
        |
        v
PerspectiveAnalyzer Service (AI)
  - Analyzes each article for bias, sentiment, key arguments
  - Extracts consensus facts across perspectives
  - Classifies into Progressive/Conservative/International
        |
        v
Database (PostgreSQL via Prisma)
  - Stories with consensus facts
  - Perspectives linked to stories
  - User read events for diversity scoring
        |
        v
Next.js App Router
  - Server Components for initial rendering
  - API Routes for dynamic data
  - Client Components for interactivity
```

## Key Components

### NewsAggregator (`src/services/news-aggregator.ts`)
- Fetches from NewsAPI with multi-source support
- Groups articles by computed story key (keyword overlap)
- Deduplicates and persists to database

### PerspectiveAnalyzer (`src/services/analyzer.ts`)
- Uses GPT-4o-mini via LangChain for analysis
- Structured JSON output with Zod validation
- Bias scoring: -1 (progressive) to +1 (conservative)
- Sentiment scoring: -1 (negative) to +1 (positive)
- Diversity score calculation based on reading patterns

### AI Orchestrator (`src/lib/ai/orchestrator.ts`)
- Coordinates the full pipeline: fetch -> group -> analyze -> persist
- Error-resilient with per-story-group error handling

### Tri-Lens View (`src/components/tri-lens/`)
- 3-column responsive layout (stacked on mobile)
- Color-coded perspectives: Blue (Progressive), Red (Conservative), Green (International)
- Key arguments and source attribution

### Fact-Bridge (`src/components/tri-lens/fact-bridge.tsx`)
- Displays verified facts that all perspectives agree on
- Source count attribution

### Bias Heatmap (`src/components/charts/bias-heatmap.tsx`)
- Stacked bar chart (Recharts) showing perspective distribution per region
- Coverage intensity grid

## Database Schema

See `prisma/schema.prisma` for the full schema. Key models:
- **Story**: Core news story with consensus facts
- **Perspective**: Individual perspective analysis linked to a story
- **User**: Application user
- **UserDiversityScore**: Calculated diversity metrics
- **UserReadEvent**: Reading history for diversity calculations
- **NewsSource**: Configured news source endpoints
