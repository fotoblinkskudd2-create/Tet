import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { RawArticle, AIAnalysisResult, PerspectiveType } from "@/types";
import { AIAnalysisResultSchema } from "@/types";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a media analysis AI that evaluates news articles for perspective, bias, and factual content.
You identify whether coverage aligns with progressive, conservative, or international viewpoints.
You extract key arguments, assign bias and sentiment scores, and identify consensus facts.

Scoring guidelines:
- biasScore: -1 (strong progressive) to +1 (strong conservative), 0 = neutral/balanced
- sentimentScore: -1 (very negative) to +1 (very positive), 0 = neutral

Always respond with valid JSON matching the requested schema.`;

const ANALYSIS_PROMPT = `Analyze the following news article and provide a structured analysis.

Title: {title}
Source: {sourceName} ({sourceRegion})
Description: {description}
Content: {content}

Respond with a JSON object containing:
- perspectiveType: "PROGRESSIVE" | "CONSERVATIVE" | "INTERNATIONAL"
- headline: A neutral, factual rewrite of the headline
- body: A 2-3 paragraph analysis of the article's framing and perspective
- biasScore: Float from -1 to 1
- sentimentScore: Float from -1 to 1
- keyArguments: Array of 3-5 key arguments or framings used
- consensusFacts: Array of verifiable facts that would be agreed upon across perspectives`;

const CONSENSUS_PROMPT = `Given the following articles covering the same story from different perspectives, identify the consensus facts - verifiable claims that all sources agree on regardless of political leaning.

Articles:
{articles}

Respond with a JSON object containing:
- consensusFacts: Array of 5-10 factual statements agreed upon across all perspectives
- storyTitle: A neutral, balanced title for this story cluster
- storySummary: A 2-3 sentence neutral summary
- category: One of: "politics", "economy", "technology", "health", "environment", "world", "science", "culture"
- region: Primary geographic region of the story`;

const ConsensusResponseSchema = z.object({
  consensusFacts: z.array(z.string()),
  storyTitle: z.string(),
  storySummary: z.string(),
  category: z.string(),
  region: z.string(),
});

export class PerspectiveAnalyzer {
  private model: ChatOpenAI;

  constructor(apiKey?: string) {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.3,
      openAIApiKey: apiKey ?? process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze a single article for perspective, bias, and facts.
   */
  async analyzeArticle(article: RawArticle): Promise<AIAnalysisResult> {
    const prompt = ANALYSIS_PROMPT.replace("{title}", article.title)
      .replace("{sourceName}", article.sourceName)
      .replace("{sourceRegion}", article.sourceRegion)
      .replace("{description}", article.description)
      .replace("{content}", article.content ?? article.description);

    const response = await this.model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }

    const parsed: unknown = JSON.parse(jsonMatch[0]);
    return AIAnalysisResultSchema.parse(parsed);
  }

  /**
   * Extract consensus facts from a group of articles covering the same story.
   */
  async extractConsensus(articles: RawArticle[]): Promise<{
    consensusFacts: string[];
    storyTitle: string;
    storySummary: string;
    category: string;
    region: string;
  }> {
    const articlesText = articles
      .map(
        (a, i) =>
          `[${i + 1}] "${a.title}" - ${a.sourceName} (${a.sourceRegion})\n${a.description}`
      )
      .join("\n\n");

    const prompt = CONSENSUS_PROMPT.replace("{articles}", articlesText);

    const response = await this.model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }

    const parsed: unknown = JSON.parse(jsonMatch[0]);
    return ConsensusResponseSchema.parse(parsed);
  }

  /**
   * Full pipeline: analyze articles, extract consensus, and determine perspectives.
   */
  async analyzeStoryCluster(articles: RawArticle[]): Promise<{
    consensus: {
      consensusFacts: string[];
      storyTitle: string;
      storySummary: string;
      category: string;
      region: string;
    };
    analyses: Array<{
      article: RawArticle;
      analysis: AIAnalysisResult;
    }>;
  }> {
    // Extract consensus first
    const consensus = await this.extractConsensus(articles);

    // Analyze each article individually
    const analysisPromises = articles.map(async (article) => {
      const analysis = await this.analyzeArticle(article);
      return { article, analysis };
    });

    const analyses = await Promise.allSettled(analysisPromises);
    const successfulAnalyses = analyses
      .filter(
        (
          r
        ): r is PromiseFulfilledResult<{
          article: RawArticle;
          analysis: AIAnalysisResult;
        }> => r.status === "fulfilled"
      )
      .map((r) => r.value);

    return {
      consensus,
      analyses: successfulAnalyses,
    };
  }

  /**
   * Calculate a user's diversity score based on their reading patterns.
   */
  calculateDiversityScore(readEvents: Array<{ perspectiveType: PerspectiveType; readDurationSec: number }>): {
    overallScore: number;
    progressiveExposure: number;
    conservativeExposure: number;
    internationalExposure: number;
  } {
    if (readEvents.length === 0) {
      return {
        overallScore: 0,
        progressiveExposure: 0,
        conservativeExposure: 0,
        internationalExposure: 0,
      };
    }

    const totalTime = readEvents.reduce((sum, e) => sum + e.readDurationSec, 0);
    if (totalTime === 0) {
      return {
        overallScore: 0,
        progressiveExposure: 0,
        conservativeExposure: 0,
        internationalExposure: 0,
      };
    }

    const timeByType: Record<string, number> = {
      PROGRESSIVE: 0,
      CONSERVATIVE: 0,
      INTERNATIONAL: 0,
    };

    for (const event of readEvents) {
      timeByType[event.perspectiveType] += event.readDurationSec;
    }

    const progressiveExposure = (timeByType.PROGRESSIVE / totalTime) * 100;
    const conservativeExposure = (timeByType.CONSERVATIVE / totalTime) * 100;
    const internationalExposure = (timeByType.INTERNATIONAL / totalTime) * 100;

    // Diversity score: how evenly distributed is reading across perspectives
    // Perfect score (100) = equal time across all three perspectives (33.3% each)
    const idealPct = 100 / 3;
    const deviations = [
      Math.abs(progressiveExposure - idealPct),
      Math.abs(conservativeExposure - idealPct),
      Math.abs(internationalExposure - idealPct),
    ];
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / 3;
    const overallScore = Math.max(0, 100 - avgDeviation * 1.5);

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      progressiveExposure: Math.round(progressiveExposure * 10) / 10,
      conservativeExposure: Math.round(conservativeExposure * 10) / 10,
      internationalExposure: Math.round(internationalExposure * 10) / 10,
    };
  }
}

export const analyzer = new PerspectiveAnalyzer();
