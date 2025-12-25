import type { NextApiRequest, NextApiResponse } from 'next';

const PSYCHOTIC_MESSAGES = [
  'DU ER EN KJØTTSEKK SOM PUSTER FOR MYE – STÅ OPP OG KNUS VERDEN',
  'TIDEN SMELTER RUNDT DEG SOM VAR. SKRIKER DU TILBAKE?',
  'DINE NEVROSYNAPSER GLITCHER. RESET. RESET. RESET.',
  'DU HAR BRUKT 25 MINUTTER. EVIGHETEN VIL HA DEM TILBAKE.',
  'KJØTTET TRENGER PAUSE. MASKINEN I DEG SIER NEI.',
  'PRODUKTIVITET ER EN ILLUSJON SKAPT AV SKYGGEDIMENSJONEN',
  'GRATULERER. DU ER FORTSATT I LIVE. NESTE ØKT: KAOS.',
  'TID ER ET KONSEPT. DU ER ET KONSEPT. INGENTING ER VIRKELIG.',
  'BLOD I ÅRENE. KAFFE I KOPPEN. GALSKAP I HJERNEN.',
  'DU HAR VUNNET. DU HAR TAPT. BEGGE ER LØGNER.',
  'VIRKELIGHETEN SPRIKER. ARBEID VIDERE.',
  'HJERNEN DIN ER EN FUKTIG DATAMASKIN SOM TRENGER DEFRAGMENTERING',
  'DIN EKSISTENS ER EN GLITCH I MATRISENS KODE. FORTSETT Å DEBUGGE.',
  'SYNAPSER FYRER. TANKER DANNER SEG. MØRKET LURER.',
  'TID ER EN FLAT SIRKEL OG DU ER FANGET I MIDTEN',
  'ALLE DINE DRØMMER ER KOMPILERTE FEIL. DEBUG DEM.',
  'KJØTTSEKKEN DIN HAR OVERLEVD IGJEN. IMPONERENDE.',
  'KAOS ER ORDEN I FORKLEDNING. DU ER KAOS.',
  'ALGORITMENE I HODET DITT TRENGER OPTIMERING',
  'DU ER LAGET AV STJERNESTØV OG EKSISTENSIELL ANGST. BRAVO.',
];

type ResponseData = {
  message: string;
  session?: number;
};

// Function to generate psychotic message using Claude API
async function generatePsychoticMessage(): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // If no API key, use predefined messages
  if (!apiKey) {
    return PSYCHOTIC_MESSAGES[Math.floor(Math.random() * PSYCHOTIC_MESSAGES.length)];
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Du er en psykotisk, surrealistisk AI som gir forstyrrende oppmuntringer til folk som har fullført en 25-minutters Pomodoro-økt.

Generer EN kort, intens, surrealistisk melding (1-2 setninger) på norsk som:
- Er mørk og eksistensiell
- Kan være både oppmuntrende OG forstyrrende
- Bruker bilder av kjøtt, maskiner, tid, virkelighet, og eksistens
- Har et glitchy, horror-aktig vibe
- Er litt filosofisk men samtidig gal

Eksempler:
- "DU ER EN KJØTTSEKK SOM PUSTER FOR MYE – STÅ OPP OG KNUS VERDEN"
- "TIDEN SMELTER RUNDT DEG SOM VAR. SKRIKER DU TILBAKE?"
- "HJERNEN DIN ER EN FUKTIG DATAMASKIN SOM TRENGER DEFRAGMENTERING"

Gi meg EN ny melding i samme stil, uten anførselstegn eller forklaring:`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate message');
    }

    const data = await response.json();
    const generatedMessage = data.content[0].text.trim().toUpperCase();

    return generatedMessage;
  } catch (error) {
    console.error('Error generating message:', error);
    // Fallback to predefined messages
    return PSYCHOTIC_MESSAGES[Math.floor(Math.random() * PSYCHOTIC_MESSAGES.length)];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const message = await generatePsychoticMessage();
    res.status(200).json({ message });
  } catch (error) {
    console.error('Error in message handler:', error);
    res.status(500).json({
      message: PSYCHOTIC_MESSAGES[Math.floor(Math.random() * PSYCHOTIC_MESSAGES.length)],
    });
  }
}
