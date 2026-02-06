import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { RawArticle, NewsSourceConfig, PerspectiveType } from "@/types";
import { RawArticleSchema } from "@/types";

const NEWS_API_BASE = "https://newsapi.org/v2";

interface FetchOptions {
  category?: string;
  query?: string;
  pageSize?: number;
  page?: number;
}

interface NewsAPIArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

// Default source configurations for multi-perspective coverage
const DEFAULT_SOURCES: NewsSourceConfig[] = [
  {
    name: "AP News",
    url: "https://apnews.com",
    bias: "INTERNATIONAL",
    region: "US",
  },
  {
    name: "Reuters",
    url: "https://reuters.com",
    bias: "INTERNATIONAL",
    region: "Global",
  },
  {
    name: "The Guardian",
    url: "https://theguardian.com",
    bias: "PROGRESSIVE",
    region: "UK",
  },
  {
    name: "NPR",
    url: "https://npr.org",
    bias: "PROGRESSIVE",
    region: "US",
  },
  {
    name: "Wall Street Journal",
    url: "https://wsj.com",
    bias: "CONSERVATIVE",
    region: "US",
  },
  {
    name: "The Economist",
    url: "https://economist.com",
    bias: "INTERNATIONAL",
    region: "UK",
  },
];

export class NewsAggregator {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.NEWS_API_KEY ?? "";
  }

  /**
   * Fetch articles from NewsAPI for a given query/category.
   */
  async fetchFromNewsAPI(options: FetchOptions = {}): Promise<RawArticle[]> {
    const { category, query, pageSize = 20, page = 1 } = options;

    const params = new URLSearchParams({
      pageSize: String(pageSize),
      page: String(page),
      language: "en",
      apiKey: this.apiKey,
    });

    let endpoint: string;
    if (query) {
      endpoint = `${NEWS_API_BASE}/everything`;
      params.set("q", query);
      params.set("sortBy", "publishedAt");
    } else {
      endpoint = `${NEWS_API_BASE}/top-headlines`;
      if (category) params.set("category", category);
      params.set("country", "us");
    }

    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(
        `NewsAPI request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: NewsAPIResponse = await response.json();
    if (data.status !== "ok") {
      throw new Error("NewsAPI returned error status");
    }

    return data.articles
      .filter((a) => a.title && a.description)
      .map((article) => this.mapNewsAPIArticle(article));
  }

  /**
   * Fetch articles from multiple configured sources.
   */
  async fetchMultiSourceArticles(
    query: string,
    limit = 30
  ): Promise<RawArticle[]> {
    const sources = await this.getActiveSources();
    const perSourceLimit = Math.ceil(limit / Math.max(sources.length, 1));

    const fetchPromises = sources.map((source) =>
      this.fetchFromNewsAPI({
        query: `${query} site:${new URL(source.url).hostname}`,
        pageSize: perSourceLimit,
      }).catch((): RawArticle[] => [])
    );

    const results = await Promise.allSettled(fetchPromises);
    const articles: RawArticle[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        articles.push(...result.value);
      }
    }

    return this.deduplicateArticles(articles).slice(0, limit);
  }

  /**
   * Group raw articles into clusters that likely cover the same story.
   */
  groupArticlesByStory(articles: RawArticle[]): Map<string, RawArticle[]> {
    const groups = new Map<string, RawArticle[]>();

    for (const article of articles) {
      const key = this.computeStoryKey(article);
      const existing = groups.get(key);
      if (existing) {
        existing.push(article);
      } else {
        groups.set(key, [article]);
      }
    }

    return groups;
  }

  /**
   * Persist a story and its perspectives to the database.
   */
  async saveStory(
    title: string,
    summary: string,
    category: string,
    region: string,
    articles: RawArticle[],
    consensusFacts: string[]
  ): Promise<string> {
    const slug = slugify(title) + "-" + Date.now().toString(36);

    const story = await prisma.story.create({
      data: {
        title,
        slug,
        summary,
        category,
        region,
        publishedAt: new Date(),
        status: "ANALYZED",
        sourceCount: articles.length,
        consensusFacts,
      },
    });

    return story.id;
  }

  /**
   * Save a perspective for a story.
   */
  async savePerspective(
    storyId: string,
    type: PerspectiveType,
    headline: string,
    body: string,
    sourceName: string,
    sourceUrl: string,
    sourceRegion: string,
    biasScore: number,
    sentimentScore: number,
    keyArguments: string[]
  ): Promise<string> {
    const perspective = await prisma.perspective.create({
      data: {
        storyId,
        type,
        headline,
        body,
        sourceName,
        sourceUrl,
        sourceRegion,
        biasScore,
        sentimentScore,
        keyArguments,
      },
    });

    return perspective.id;
  }

  /**
   * Get stories with their perspectives for the dashboard.
   */
  async getPublishedStories(
    limit = 20,
    offset = 0,
    category?: string
  ): Promise<
    Array<{
      id: string;
      title: string;
      slug: string;
      summary: string;
      imageUrl: string | null;
      category: string;
      region: string;
      publishedAt: Date;
      sourceCount: number;
      perspectives: Array<{ type: string }>;
    }>
  > {
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };
    if (category) {
      where.category = category;
    }

    return prisma.story.findMany({
      where,
      include: {
        perspectives: {
          select: { type: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get a single story with all perspectives.
   */
  async getStoryBySlug(slug: string) {
    return prisma.story.findUnique({
      where: { slug },
      include: {
        perspectives: {
          orderBy: { type: "asc" },
        },
      },
    });
  }

  /**
   * Get a single story by ID with all perspectives.
   */
  async getStoryById(id: string) {
    return prisma.story.findUnique({
      where: { id },
      include: {
        perspectives: {
          orderBy: { type: "asc" },
        },
      },
    });
  }

  // Private helpers

  private mapNewsAPIArticle(article: NewsAPIArticle): RawArticle {
    const sourceBias = this.inferSourceBias(article.source.name);
    const raw = {
      title: article.title,
      description: article.description ?? "",
      content: article.content ?? undefined,
      url: article.url,
      sourceName: article.source.name,
      sourceRegion: this.inferSourceRegion(article.source.name),
      publishedAt: article.publishedAt,
      imageUrl: article.urlToImage ?? undefined,
      category: sourceBias,
    };

    return RawArticleSchema.parse(raw);
  }

  private inferSourceBias(sourceName: string): string {
    const name = sourceName.toLowerCase();
    const progressiveSources = [
      "guardian",
      "npr",
      "msnbc",
      "vox",
      "huffpost",
      "washington post",
    ];
    const conservativeSources = [
      "fox",
      "wsj",
      "wall street",
      "daily mail",
      "new york post",
      "breitbart",
    ];

    if (progressiveSources.some((s) => name.includes(s))) return "progressive";
    if (conservativeSources.some((s) => name.includes(s))) return "conservative";
    return "international";
  }

  private inferSourceRegion(sourceName: string): string {
    const name = sourceName.toLowerCase();
    const regionMap: Record<string, string> = {
      bbc: "UK",
      guardian: "UK",
      "daily mail": "UK",
      reuters: "Global",
      "al jazeera": "Middle East",
      "south china": "Asia",
      "times of india": "Asia",
      abc: "Australia",
      "le monde": "Europe",
      spiegel: "Europe",
    };

    for (const [key, region] of Object.entries(regionMap)) {
      if (name.includes(key)) return region;
    }
    return "US";
  }

  private computeStoryKey(article: RawArticle): string {
    const words = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .sort()
      .slice(0, 5);
    return words.join("-");
  }

  private deduplicateArticles(articles: RawArticle[]): RawArticle[] {
    const seen = new Set<string>();
    return articles.filter((article) => {
      const key = article.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async getActiveSources(): Promise<NewsSourceConfig[]> {
    try {
      const dbSources = await prisma.newsSource.findMany({
        where: { isActive: true },
      });

      if (dbSources.length > 0) {
        return dbSources.map((s) => ({
          name: s.name,
          url: s.url,
          rssUrl: s.rssUrl ?? undefined,
          apiEndpoint: s.apiEndpoint ?? undefined,
          bias: s.bias,
          region: s.region,
        }));
      }
    } catch {
      // DB not available, use defaults
    }

    return DEFAULT_SOURCES;
  }
}

export const newsAggregator = new NewsAggregator();
