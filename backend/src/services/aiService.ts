import { config } from "../config";

interface MealSuggestion {
  name: string;
  ingredients: string[];
  instructions: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMin: number;
}

/**
 * Generates meal suggestions using OpenAI API.
 * Falls back to template-based suggestions if API key is not configured.
 */
export async function generateMealSuggestions(
  dailyTarget: number,
  preferences: string[] = [],
  restrictions: string[] = []
): Promise<MealSuggestion[]> {
  if (!config.openai.apiKey) {
    return getTemplateMeals(dailyTarget);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Du er en ernæringsfysiolog. Generer sunne, norske måltidsforslag med nøyaktig næringsinnhold. Returner JSON-array.",
          },
          {
            role: "user",
            content: `Lag 3 måltidsforslag (frokost, lunsj, middag) for en dag med totalt ${dailyTarget} kalorier. Preferanser: ${preferences.join(", ") || "ingen"}. Restriksjoner: ${restrictions.join(", ") || "ingen"}. Returner som JSON med felter: name, ingredients, instructions, calories, protein, carbs, fat, prepTimeMin.`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return content.meals || content;
  } catch (error) {
    console.error("AI meal generation failed, using templates:", error);
    return getTemplateMeals(dailyTarget);
  }
}

function getTemplateMeals(dailyTarget: number): MealSuggestion[] {
  return [
    {
      name: "Havregrøt med bær",
      ingredients: ["80g havregryn", "200ml melk", "100g blåbær", "1 ts honning"],
      instructions: "Kok havregryn i melk. Topp med bær og honning.",
      calories: Math.round(dailyTarget * 0.25),
      protein: 12,
      carbs: 45,
      fat: 8,
      prepTimeMin: 10,
    },
    {
      name: "Kylling- og avokadowrap",
      ingredients: ["150g kyllingbryst", "1 fullkornswrap", "1/2 avokado", "salat", "tomat"],
      instructions: "Stek kylling. Fyll wrap med alle ingredienser.",
      calories: Math.round(dailyTarget * 0.35),
      protein: 35,
      carbs: 30,
      fat: 15,
      prepTimeMin: 20,
    },
    {
      name: "Laks med søtpotet",
      ingredients: ["150g laksfilet", "200g søtpotet", "150g brokkoli", "1 ss olivenolje"],
      instructions: "Bak laks og søtpotet på 200°C i 20 min. Damp brokkoli.",
      calories: Math.round(dailyTarget * 0.30),
      protein: 30,
      carbs: 35,
      fat: 12,
      prepTimeMin: 30,
    },
  ];
}
