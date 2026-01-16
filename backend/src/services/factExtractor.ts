import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface FactExtractionResult {
  filteredContent: string;
  summary: string;
  category: string;
}

const FACT_EXTRACTION_PROMPT = `Du er en fakta-ekstraktor og bullshit-filter. Din jobb er å analysere nyhetsartikler og:

1. FJERNE alt som er:
   - Subjektive meninger og synspunkter
   - Spekulasjoner og antagelser
   - Følelsesladet språk og overdrivelser
   - Clickbait og sensasjonalisme
   - Annonseinnhold og sponset materiale
   - Irrelevante detaljer

2. BEHOLDE kun:
   - Verifiserbare fakta og hendelser
   - Konkrete tall og statistikk
   - Sitater fra navngitte kilder
   - Datoer, steder og spesifikke detaljer
   - Objektive beskrivelser av hendelser

3. KATEGORISERE artikkelen i en av disse kategoriene:
   - politikk
   - økonomi
   - teknologi
   - helse
   - miljø
   - kriminalitet
   - sport
   - kultur
   - internasjonalt
   - annet

Returner resultatet som JSON med følgende struktur:
{
  "filteredContent": "Kun faktabasert innhold, fjernet alt bullshit",
  "summary": "En kort oppsummering av hovedfaktaene (1-2 setninger)",
  "category": "kategori"
}

Hvis artikkelen er ren bullshit uten fakta, returner tom filteredContent.`;

export async function filterAndExtractFacts(
  title: string,
  content: string
): Promise<FactExtractionResult> {
  // If OpenAI API key is not configured, return basic filtering
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured. Using basic filtering.');
    return {
      filteredContent: content,
      summary: title,
      category: 'annet',
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: FACT_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: `Tittel: ${title}\n\nInnhold: ${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      filteredContent: result.filteredContent || content,
      summary: result.summary || title,
      category: result.category || 'annet',
    };
  } catch (error) {
    console.error('Error extracting facts with OpenAI:', error);

    // Fallback to basic filtering
    return {
      filteredContent: content,
      summary: title.substring(0, 200),
      category: 'annet',
    };
  }
}

// Alternative: Rule-based filtering (backup if OpenAI is not available)
export function basicFactFilter(content: string): string {
  // Remove common opinion phrases
  const opinionPhrases = [
    /mener at/gi,
    /jeg tror/gi,
    /det virker som/gi,
    /kanskje/gi,
    /sannsynligvis/gi,
    /kunne være/gi,
  ];

  let filtered = content;

  opinionPhrases.forEach((phrase) => {
    filtered = filtered.replace(phrase, '');
  });

  return filtered.trim();
}
