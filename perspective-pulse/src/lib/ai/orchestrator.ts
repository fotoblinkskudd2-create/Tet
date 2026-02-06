import { newsAggregator } from "@/services/news-aggregator";
import { analyzer } from "@/services/analyzer";
import type { PerspectiveType } from "@/types";

/**
 * Orchestrates the full news analysis pipeline:
 * 1. Fetch articles from multiple sources
 * 2. Group them by story
 * 3. Analyze each group for perspectives and consensus facts
 * 4. Persist to database
 */
export async function processNewsQuery(query: string): Promise<string[]> {
  // Step 1: Fetch articles from multiple sources
  const articles = await newsAggregator.fetchMultiSourceArticles(query);

  if (articles.length === 0) {
    return [];
  }

  // Step 2: Group articles by story
  const storyGroups = newsAggregator.groupArticlesByStory(articles);

  const storyIds: string[] = [];

  // Step 3: Process each story group
  const entries = Array.from(storyGroups.entries());
  for (const [, groupArticles] of entries) {
    if (groupArticles.length < 2) continue; // Need multiple sources

    try {
      // Step 3a: AI analysis
      const { consensus, analyses } =
        await analyzer.analyzeStoryCluster(groupArticles);

      // Step 3b: Save the story
      const storyId = await newsAggregator.saveStory(
        consensus.storyTitle,
        consensus.storySummary,
        consensus.category,
        consensus.region,
        groupArticles,
        consensus.consensusFacts
      );

      // Step 3c: Save each perspective
      for (const { article, analysis } of analyses) {
        await newsAggregator.savePerspective(
          storyId,
          analysis.perspectiveType as PerspectiveType,
          analysis.headline,
          analysis.body,
          article.sourceName,
          article.url,
          article.sourceRegion,
          analysis.biasScore,
          analysis.sentimentScore,
          analysis.keyArguments
        );
      }

      storyIds.push(storyId);
    } catch (error) {
      console.error("Failed to process story group:", error);
    }
  }

  return storyIds;
}
