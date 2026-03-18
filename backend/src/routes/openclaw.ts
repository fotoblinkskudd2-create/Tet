import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

interface PromoEntry {
  id: string;
  title: string;
  description: string;
  medium: string;
  tags: string[];
  createdAt: string;
}

const promotions: PromoEntry[] = [];
const router = Router();

const VALID_MEDIUMS = new Set(['photo', 'video', 'music', 'art', 'poem']);

/**
 * POST /api/openclaw/promote
 *
 * Submit a new promotional entry for a Grafset idea.
 */
router.post('/promote', (req: Request, res: Response) => {
  const { title, description, medium, tags } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const safeMedium = VALID_MEDIUMS.has(medium) ? medium : 'art';
  const safeTags = Array.isArray(tags)
    ? tags.filter((t: unknown) => typeof t === 'string').map((t: string) => t.trim().slice(0, 40))
    : [];

  const entry: PromoEntry = {
    id: uuid(),
    title: title.trim().slice(0, 200),
    description: description.trim().slice(0, 2000),
    medium: safeMedium,
    tags: safeTags.slice(0, 10),
    createdAt: new Date().toISOString(),
  };

  promotions.unshift(entry);

  res.status(201).json({ entry });
});

/**
 * GET /api/openclaw/feed
 *
 * Retrieve the most recent promotions.
 */
router.get('/feed', (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  res.json({ entries: promotions.slice(0, limit) });
});

export default router;
