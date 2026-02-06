"use client";

import { useState, useEffect, useCallback } from "react";
import type { StoryCardData, PerspectiveType } from "@/types";

interface UseStoriesOptions {
  category?: string;
  limit?: number;
}

interface UseStoriesReturn {
  stories: StoryCardData[];
  isLoading: boolean;
  error: string | null;
  fetchMore: () => void;
  hasMore: boolean;
}

interface StoryAPIResponse {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  category: string;
  region: string;
  publishedAt: string;
  sourceCount: number;
  perspectives: Array<{ type: PerspectiveType }>;
}

export function useStories(options: UseStoriesOptions = {}): UseStoriesReturn {
  const { category, limit = 20 } = options;
  const [stories, setStories] = useState<StoryCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchStories = useCallback(
    async (currentOffset: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(currentOffset),
        });
        if (category) params.set("category", category);

        const response = await fetch(`/api/stories?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: { stories: StoryAPIResponse[] } = await response.json();

        const mapped: StoryCardData[] = data.stories.map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          summary: s.summary,
          imageUrl: s.imageUrl,
          category: s.category,
          region: s.region,
          publishedAt: new Date(s.publishedAt),
          sourceCount: s.sourceCount,
          perspectiveTypes: s.perspectives.map((p) => p.type),
        }));

        if (currentOffset === 0) {
          setStories(mapped);
        } else {
          setStories((prev) => [...prev, ...mapped]);
        }

        setHasMore(mapped.length === limit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stories");
      } finally {
        setIsLoading(false);
      }
    },
    [category, limit]
  );

  useEffect(() => {
    setOffset(0);
    fetchStories(0);
  }, [fetchStories]);

  const fetchMore = useCallback(() => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchStories(newOffset);
  }, [offset, limit, fetchStories]);

  return { stories, isLoading, error, fetchMore, hasMore };
}
