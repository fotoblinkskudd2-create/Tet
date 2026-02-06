# PerspectivePulse Schema Documentation

## Database Models

### Story
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| title | String | Story headline |
| slug | String (unique) | URL-friendly identifier |
| summary | String | Brief description |
| imageUrl | String? | Optional cover image |
| category | String | e.g., politics, economy, technology |
| region | String | Primary geographic region |
| publishedAt | DateTime | Original publication time |
| status | StoryStatus | PENDING, ANALYZED, PUBLISHED, ARCHIVED |
| sourceCount | Int | Number of source articles |
| consensusFacts | String[] | Facts agreed upon across perspectives |

### Perspective
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| storyId | String | FK to Story |
| type | PerspectiveType | PROGRESSIVE, CONSERVATIVE, INTERNATIONAL |
| headline | String | AI-generated perspective headline |
| body | String | Analysis body text |
| sourceName | String | Original source name |
| sourceUrl | String | Link to original article |
| sourceRegion | String | Source geographic origin |
| biasScore | Float | -1 (progressive) to +1 (conservative) |
| sentimentScore | Float | -1 (negative) to +1 (positive) |
| keyArguments | String[] | Main arguments identified |

### UserDiversityScore
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String (unique) | FK to User |
| overallScore | Float | 0-100 composite diversity score |
| progressiveExposure | Float | % time on progressive content |
| conservativeExposure | Float | % time on conservative content |
| internationalExposure | Float | % time on international content |
| regionDiversity | Float | Geographic diversity metric |
| categoryDiversity | Float | Topic diversity metric |
| streakDays | Int | Consecutive days of diverse reading |

## TypeScript Types

All types are defined in `src/types/index.ts` with corresponding Zod schemas for runtime validation:

- `PerspectiveType` - Union: "PROGRESSIVE" | "CONSERVATIVE" | "INTERNATIONAL"
- `StoryStatus` - Union: "PENDING" | "ANALYZED" | "PUBLISHED" | "ARCHIVED"
- `Story`, `Perspective`, `UserDiversityScore` - Mirror database models
- `RawArticle` - Incoming article from news APIs
- `AIAnalysisResult` - Structured output from AI analysis
- `HeatmapDataPoint` - Data structure for bias heatmap visualization
- `StoryCardData` - Lightweight story type for list views
