import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

router.post('/interpret', async (req: Request, res: Response) => {
  const { title, content } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({ error: 'Tittel og innhold er påkrevd' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'Anthropic API-nøkkel er ikke konfigurert. Vennligst sett ANTHROPIC_API_KEY miljøvariabel.'
    });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Du er en poetisk drømmetyder med en surrealistisk tilnærming. Analyser følgende drøm og gi en kreativ, mystisk og tankevekkende tolkning. Bruk metaforer, symbolikk og poetisk språk. Skriv på norsk.

Drømmetittel: ${title}

Drømmebeskrivelse:
${content}

Gi en tolkninig som er:
- Poetisk og surrealistisk
- Mellom 3-5 avsnitt
- Fokuserer på symbolikk og underbevisste betydninger
- Inspirerende og tankevekkende
- Skrevet med en mystisk, drømmende tone`
        }
      ]
    });

    const interpretation = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Kunne ikke generere tolkning';

    res.json({ interpretation });
  } catch (error) {
    console.error('Feil ved kall til Anthropic API:', error);
    res.status(500).json({
      error: 'Kunne ikke tolke drømmen. Vennligst prøv igjen senere.'
    });
  }
});

export default router;
