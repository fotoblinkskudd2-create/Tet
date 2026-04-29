import { claude, MODELS } from "./client";

export type EntityType =
  | "person"
  | "concept"
  | "place"
  | "book"
  | "event"
  | "idea";

export interface Entity {
  text: string;
  type: EntityType;
  confidence: number;
}

export interface ExtractionResult {
  entities: Entity[];
  suggestedLinks: string[];
  summary: string;
}

export async function extractEntities(
  noteContent: string,
  existingNodes: string[] = []
): Promise<ExtractionResult> {
  const existingCtx =
    existingNodes.length > 0
      ? `\n\nEksisterende noder i grafen (for link-forslag):\n${existingNodes.slice(0, 50).join(", ")}`
      : "";

  const response = await claude.messages.create({
    model: MODELS.haiku,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Ekstraher entiteter og lag en kort sammendrag fra dette notatet.${existingCtx}

Notat:
"""
${noteContent}
"""

Svar med JSON:
{
  "entities": [
    {"text": "...", "type": "person|concept|place|book|event|idea", "confidence": 0.0-1.0}
  ],
  "suggestedLinks": ["<noder fra den eksisterende listen som er relevante>"],
  "summary": "<1 setning>"
}`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());

  return {
    entities: (parsed.entities ?? []).map((e: Entity) => ({
      text: e.text,
      type: e.type as EntityType,
      confidence: Math.max(0, Math.min(1, e.confidence ?? 0.5)),
    })),
    suggestedLinks: parsed.suggestedLinks ?? [],
    summary: parsed.summary ?? "",
  };
}

export async function synthesizeTopic(
  topic: string,
  relevantNotes: string[]
): Promise<string> {
  const response = await claude.messages.create({
    model: MODELS.sonnet,
    max_tokens: 2048,
    system:
      "Du er en intellektuell assistent som hjelper brukere å forstå sine egne tanker dypere.",
    messages: [
      {
        role: "user",
        content: `Lag en sammenhengende syntese om temaet "${topic}" basert på disse notatene:

${relevantNotes.map((n, i) => `[${i + 1}] ${n}`).join("\n\n")}

Skriv en essay-aktig tekst på 300-500 ord som fletter ideene sammen.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
