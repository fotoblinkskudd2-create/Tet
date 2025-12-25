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

// Shared in-memory storage (should be same instance - in production use database)
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userVibes = Array.from(vibes.values())
    .filter((v) => v.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(userVibes);
}
