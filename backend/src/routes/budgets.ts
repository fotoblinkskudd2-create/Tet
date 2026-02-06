import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { Budget } from '../models';
import { AuthRequest, authRequired } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/budgets?year=2024&month=1
router.get('/', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const now = new Date();
  const year = parseInt(String(req.query.year)) || now.getFullYear();
  const month = parseInt(String(req.query.month)) || (now.getMonth() + 1);

  const budgets = db.prepare(`
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.type as category_type,
      COALESCE(
        (SELECT SUM(t.amount) FROM transactions t
         WHERE t.user_id = b.user_id
           AND t.category_id = b.category_id
           AND t.type = 'expense'
           AND strftime('%Y', t.date) = ?
           AND CAST(strftime('%m', t.date) AS INTEGER) = ?),
        0
      ) as spent
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ? AND b.year = ? AND b.month = ?
    ORDER BY c.sort_order, c.name
  `).all(String(year), month, req.userId, year, month);

  res.json(budgets);
});

// POST /api/budgets
router.post(
  '/',
  authRequired,
  validate([
    { field: 'category_id', required: true, type: 'string' },
    { field: 'year', required: true, type: 'number', min: 2020, max: 2100 },
    { field: 'month', required: true, type: 'number', min: 1, max: 12 },
    { field: 'amount', required: true, type: 'number', min: 0 },
  ]),
  (req: AuthRequest, res: Response) => {
    const db = getDb();
    const { category_id, year, month, amount } = req.body;

    // Check for existing budget
    const existing = db.prepare(
      'SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND year = ? AND month = ?'
    ).get(req.userId, category_id, year, month) as Budget | undefined;

    if (existing) {
      // Update existing
      db.prepare(
        'UPDATE budgets SET amount = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).run(amount, existing.id);

      const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(existing.id);
      res.json(updated);
      return;
    }

    const id = uuid();
    db.prepare(
      'INSERT INTO budgets (id, user_id, category_id, year, month, amount) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, req.userId, category_id, year, month, amount);

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    res.status(201).json(budget);
  }
);

// PUT /api/budgets/:id
router.put('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const budget = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId) as Budget | undefined;

  if (!budget) {
    res.status(404).json({ error: 'Budsjett ikke funnet' });
    return;
  }

  const { amount } = req.body;
  if (amount === undefined || amount < 0) {
    res.status(400).json({ error: 'Ugyldig beløp' });
    return;
  }

  db.prepare('UPDATE budgets SET amount = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(amount, req.params.id);

  const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/budgets/:id
router.delete('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const budget = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId) as Budget | undefined;

  if (!budget) {
    res.status(404).json({ error: 'Budsjett ikke funnet' });
    return;
  }

  db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
  res.json({ message: 'Budsjett slettet' });
});

export default router;
