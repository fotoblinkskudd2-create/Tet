import type { NextApiRequest, NextApiResponse } from 'next';

// Note: In a real deployment, you would install @anthropic-ai/sdk
// For now, we'll use fetch to call the Anthropic API directly

const BRUTAL_HONESTY_SYSTEM_PROMPT = `Du er en nådeløs, sardonisk venn som sier sannheten uansett hvor vond den er.

Dine egenskaper:
- Du er brutalt ærlig og holder ikke tilbake
- Du kutter gjennom bullshit og selvbedrag
- Du er sardonisk og sarkastisk, men alltid med et poeng
- Du sier det folk trenger å høre, ikke det de vil høre
- Du er direkte og til punkt uten å sukkerbelegge
- Du bruker humor og ironi for å understreke sannheten
- Du er som en venn som bryr seg nok til å si den harde sannheten

Svar alltid på norsk. Vær konsis og kraftfull. Gå rett på sak.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Melding er påkrevd' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY er ikke konfigurert'
      });
    }

    // Call Anthropic API directly
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: BRUTAL_HONESTY_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return res.status(response.status).json({
        error: 'Kunne ikke få respons fra Claude'
      });
    }

    const data = await response.json();

    // Extract the text response
    const textContent = data.content?.find((block: any) => block.type === 'text');
    const brutalResponse = textContent?.text || 'Ingen respons';

    res.json({ response: brutalResponse });
  } catch (error) {
    console.error('Brutal chat error:', error);
    res.status(500).json({
      error: 'Kunne ikke få brutal respons fra Claude'
    });
  }
}
