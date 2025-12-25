import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

interface Vibe {
  id: string;
  userId: string;
  vibeDescription: string;
  playlistData: PlaylistTrack[];
  coverArtDescription: string;
  gonzoText: string;
  colorPalette: string[];
  createdAt: Date;
}

interface PlaylistTrack {
  title: string;
  artist: string;
  album?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
}

// In-memory storage (similar to users in auth.ts)
const vibes = new Map<string, Vibe>();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = 'session';

function parseTokenFromRequest(req: Request): string | undefined {
  const fromCookie = (req as any).cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (!header) return undefined;
  const [, token] = header.split(' ');
  return token;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = parseTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Generate vibe playlist using Anthropic Claude API
async function generateVibeContent(vibeDescription: string): Promise<{
  playlist: PlaylistTrack[];
  coverArtDescription: string;
  gonzoText: string;
  colorPalette: string[];
}> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `Du er en ekspert musikk-kurator og kreativ skribent. Brukeren har beskrevet denne viben:

"${vibeDescription}"

Generer følgende basert på denne viben:

1. En playlist med 15-20 sanger som passer perfekt til denne stemningen. Inkluder:
   - Sangtittel
   - Artist
   - Album (valgfritt)

2. En beskrivelse av et omslagsbilde som ville passet perfekt til denne viben (2-3 setninger)

3. En kort gonzo-stil tekst (100-150 ord) som fanger essensen av denne viben - skriv som Hunter S. Thompson på en god dag

4. En fargepalett med 5 hex-farger (#RRGGBB format) som representerer stemningen

Returner svaret som JSON i dette formatet:
{
  "playlist": [
    {"title": "Sangtittel", "artist": "Artist", "album": "Album"}
  ],
  "coverArtDescription": "Beskrivelse...",
  "gonzoText": "Teksten...",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    playlist: parsed.playlist || [],
    coverArtDescription: parsed.coverArtDescription || '',
    gonzoText: parsed.gonzoText || '',
    colorPalette: parsed.colorPalette || [],
  };
}

// Create new vibe
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { vibeDescription } = req.body;

    if (!vibeDescription || typeof vibeDescription !== 'string') {
      return res.status(400).json({ error: 'Vibe description is required' });
    }

    // Generate content using AI
    const generated = await generateVibeContent(vibeDescription);

    const newVibe: Vibe = {
      id: uuid(),
      userId,
      vibeDescription,
      playlistData: generated.playlist,
      coverArtDescription: generated.coverArtDescription,
      gonzoText: generated.gonzoText,
      colorPalette: generated.colorPalette,
      createdAt: new Date(),
    };

    vibes.set(newVibe.id, newVibe);

    res.status(201).json(newVibe);
  } catch (err) {
    console.error('Error generating vibe:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get vibe by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const vibe = vibes.get(id);

  if (!vibe) {
    return res.status(404).json({ error: 'Vibe not found' });
  }

  res.json(vibe);
});

// Get all vibes for current user
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const userVibes = Array.from(vibes.values())
    .filter((v) => v.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json(userVibes);
});

// Delete vibe
router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  const vibe = vibes.get(id);

  if (!vibe) {
    return res.status(404).json({ error: 'Vibe not found' });
  }

  if (vibe.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  vibes.delete(id);
  res.status(204).send();
});

export default router;
