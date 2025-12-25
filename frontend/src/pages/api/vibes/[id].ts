import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface PlaylistTrack {
  title: string;
  artist: string;
  album?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
}

interface Vibe {
  id: string;
  userId: string;
  vibeDescription: string;
  playlistData: PlaylistTrack[];
  coverArtDescription: string;
  gonzoText: string;
  colorPalette: string[];
  createdAt: string;
}

// Shared in-memory storage (should be same instance as generate.ts - in production use database)
const vibes = new Map<string, Vibe>();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function getUserIdFromRequest(req: NextApiRequest): string | null {
  const token = req.cookies.session;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (req.method === 'GET') {
    const vibe = vibes.get(id);

    if (!vibe) {
      return res.status(404).json({ error: 'Vibe not found' });
    }

    res.json(vibe);
  } else if (req.method === 'DELETE') {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const vibe = vibes.get(id);

    if (!vibe) {
      return res.status(404).json({ error: 'Vibe not found' });
    }

    if (vibe.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    vibes.delete(id);
    res.status(204).send('');
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
