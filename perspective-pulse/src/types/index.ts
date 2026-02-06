import { z } from "zod";

// Enums
export const PerspectiveTypeEnum = z.enum([
  "PROGRESSIVE",
  "CONSERVATIVE",
  "INTERNATIONAL",
]);
export type PerspectiveType = z.infer<typeof PerspectiveTypeEnum>;

export const StoryStatusEnum = z.enum([
  "PENDING",
  "ANALYZED",
  "PUBLISHED",
  "ARCHIVED",
]);
export type StoryStatus = z.infer<typeof StoryStatusEnum>;

// Zod Schemas
export const PerspectiveSchema = z.object({
  id: z.string(),
  storyId: z.string(),
  type: PerspectiveTypeEnum,
  headline: z.string().min(1),
  body: z.string().min(1),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceRegion: z.string().min(1),
  biasScore: z.number().min(-1).max(1),
  sentimentScore: z.number().min(-1).max(1),
  keyArguments: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Perspective = z.infer<typeof PerspectiveSchema>;

export const StorySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  category: z.string().min(1),
  region: z.string().min(1),
  publishedAt: z.date(),
  status: StoryStatusEnum,
  sourceCount: z.number().int().min(0),
  consensusFacts: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  perspectives: z.array(PerspectiveSchema).optional(),
});
export type Story = z.infer<typeof StorySchema>;

export const UserDiversityScoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  overallScore: z.number().min(0).max(100),
  progressiveExposure: z.number().min(0).max(100),
  conservativeExposure: z.number().min(0).max(100),
  internationalExposure: z.number().min(0).max(100),
  regionDiversity: z.number().min(0).max(100),
  categoryDiversity: z.number().min(0).max(100),
  streakDays: z.number().int().min(0),
  lastCalculatedAt: z.date(),
});
export type UserDiversityScore = z.infer<typeof UserDiversityScoreSchema>;

export const UserReadEventSchema = z.object({
  userId: z.string(),
  storyId: z.string(),
  perspectiveType: PerspectiveTypeEnum,
  readDurationSec: z.number().int().min(0),
});
export type UserReadEvent = z.infer<typeof UserReadEventSchema>;

// API schemas
export const NewsSourceConfigSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  rssUrl: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
  bias: PerspectiveTypeEnum,
  region: z.string().min(1),
});
export type NewsSourceConfig = z.infer<typeof NewsSourceConfigSchema>;

export const RawArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string().optional(),
  url: z.string().url(),
  sourceName: z.string(),
  sourceRegion: z.string(),
  publishedAt: z.string().or(z.date()),
  imageUrl: z.string().url().optional(),
  category: z.string().optional(),
});
export type RawArticle = z.infer<typeof RawArticleSchema>;

export const AIAnalysisResultSchema = z.object({
  perspectiveType: PerspectiveTypeEnum,
  headline: z.string(),
  body: z.string(),
  biasScore: z.number().min(-1).max(1),
  sentimentScore: z.number().min(-1).max(1),
  keyArguments: z.array(z.string()),
  consensusFacts: z.array(z.string()),
});
export type AIAnalysisResult = z.infer<typeof AIAnalysisResultSchema>;

// Heatmap data
export const HeatmapDataPointSchema = z.object({
  region: z.string(),
  lat: z.number(),
  lng: z.number(),
  count: z.number().int().min(0),
  perspectiveBreakdown: z.object({
    progressive: z.number(),
    conservative: z.number(),
    international: z.number(),
  }),
});
export type HeatmapDataPoint = z.infer<typeof HeatmapDataPointSchema>;

// Story card for lists
export interface StoryCardData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  category: string;
  region: string;
  publishedAt: Date;
  sourceCount: number;
  perspectiveTypes: PerspectiveType[];
}
