import { claude, MODELS } from "./client";

export interface VibeProfile {
  dark: number;
  playful: number;
  premium: number;
  weird: number;
}

export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
}

export async function matchProductsToVibe(
  vibe: VibeProfile,
  productCatalog: Array<{ id: string; name: string; description: string; tags: string[] }>
): Promise<ProductRecommendation[]> {
  const catalogStr = productCatalog
    .map((p) => `ID:${p.id} | ${p.name} | ${p.description} | tags:${p.tags.join(",")}`)
    .join("\n");

  const response = await claude.messages.create({
    model: MODELS.haiku,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Du er en vibe-basert produktanbefaler for en underground e-commerce plattform.

Brukerens vibe-profil (0-100):
- Mørk/edgy: ${vibe.dark}
- Leken/quirky: ${vibe.playful}
- Premium/eksklusiv: ${vibe.premium}
- Weird/uvanlig: ${vibe.weird}

Produktkatalog:
${catalogStr}

Ranger produktene etter vibe-match. Svar med JSON:
[{"productId":"...","score":0-100,"reason":"1 setning"}]

Maks 5 anbefalinger.`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "[]";
  return JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
}

export async function generateProductStory(product: {
  name: string;
  description: string;
  origin?: string;
}): Promise<{ backstory: string; whyItExists: string }> {
  const response = await claude.messages.create({
    model: MODELS.haiku,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Lag en ærlıg, litt absurd produkthistorie for dette produktet på Sintra12.

Produkt: ${product.name}
Beskrivelse: ${product.description}
${product.origin ? `Opprinnelse: ${product.origin}` : ""}

Svar med JSON:
{
  "backstory": "<2 setninger, rå og ærlig>",
  "whyItExists": "<1 setning, litt filosofisk>"
}`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  return JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
}
