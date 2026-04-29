import Anthropic from "@anthropic-ai/sdk";

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
  opus: "claude-opus-4-7" as const,
  sonnet: "claude-sonnet-4-6" as const,
  haiku: "claude-haiku-4-5-20251001" as const,
} satisfies Record<string, Anthropic.Model>;
