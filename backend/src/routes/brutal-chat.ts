import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

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

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Melding er påkrevd' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY er ikke konfigurert'
      });
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: BRUTAL_HONESTY_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text');
    const brutalResponse = textContent && 'text' in textContent ? textContent.text : 'Ingen respons';

    res.json({ response: brutalResponse });
  } catch (error) {
    console.error('Brutal chat error:', error);
    res.status(500).json({
      error: 'Kunne ikke få brutal respons fra Claude'
    });
  }
});

export default router;
