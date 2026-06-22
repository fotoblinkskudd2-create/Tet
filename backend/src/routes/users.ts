import { Router, Request, Response } from 'express';
import { users } from '../store';

const router = Router();

router.get('/:id', (req: Request, res: Response) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Bruker ikke funnet' });
  }

  res.json({
    id: user.id,
    username: user.username,
    rating: user.rating,
    stats: user.stats,
  });
});

export default router;
