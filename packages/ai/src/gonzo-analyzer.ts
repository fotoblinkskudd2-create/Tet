import { claude, MODELS } from "./client";

export interface GonzoMetrics {
  rawness: number;
  lyricism: number;
  sensoryDetail: number;
  honesty: number;
  danceMetaphors: number;
  totalScore: number;
  feedback: string;
  badge: string | null;
}

const SCORE_THRESHOLDS = {
  "Thompson-disippel": 450,
  "Grytten-lærling": 350,
  "Byrjande Gonzo": 250,
} as const;

function computeBadge(total: number): string | null {
  for (const [badge, threshold] of Object.entries(SCORE_THRESHOLDS)) {
    if (total >= threshold) return badge;
  }
  return null;
}

export async function analyzeGonzoEntry(text: string): Promise<GonzoMetrics> {
  const response = await claude.messages.create({
    model: MODELS.sonnet,
    max_tokens: 512,
    system:
      "Du er litteraturkritiker spesialisert på gonzo-journalistikk og Frode Grytten-stil. Svar alltid med gyldig JSON.",
    messages: [
      {
        role: "user",
        content: `Analyser denne teksten og gi score 0-100 på kvar dimensjon.

Tekst:
"""
${text}
"""

Svar med JSON:
{
  "rawness": <0-100>,
  "lyricism": <0-100>,
  "sensoryDetail": <0-100>,
  "honesty": <0-100>,
  "danceMetaphors": <0-100>,
  "feedback": "<2-3 setninger på norsk>"
}`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());

  const metrics: Omit<GonzoMetrics, "totalScore" | "badge"> = {
    rawness: clamp(parsed.rawness ?? 0),
    lyricism: clamp(parsed.lyricism ?? 0),
    sensoryDetail: clamp(parsed.sensoryDetail ?? 0),
    honesty: clamp(parsed.honesty ?? 0),
    danceMetaphors: clamp(parsed.danceMetaphors ?? 0),
    feedback: parsed.feedback ?? "",
  };

  const totalScore = Object.values(metrics)
    .filter((v) => typeof v === "number")
    .reduce((a, b) => a + (b as number), 0);

  return { ...metrics, totalScore, badge: computeBadge(totalScore) };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
