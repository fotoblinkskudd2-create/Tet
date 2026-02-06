import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { RecurringTransaction } from '../models';
import { AuthRequest, authRequired } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/recurring
router.get('/', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const recurring = db.prepare(`
    SELECT r.*, c.name as category_name, c.icon as category_icon, a.name as account_name
    FROM recurring_transactions r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN accounts a ON r.account_id = a.id
    WHERE r.user_id = ?
    ORDER BY r.next_date
  `).all(req.userId);

  res.json(recurring);
});

// GET /api/recurring/upcoming?days=7
router.get('/upcoming', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const days = parseInt(String(req.query.days)) || 7;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const upcoming = db.prepare(`
    SELECT r.*, c.name as category_name, c.icon as category_icon, a.name as account_name
    FROM recurring_transactions r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN accounts a ON r.account_id = a.id
    WHERE r.user_id = ? AND r.active = 1 AND r.next_date >= ? AND r.next_date <= ?
    ORDER BY r.next_date
  `).all(req.userId, today, futureDateStr);

  res.json(upcoming);
});

// POST /api/recurring
router.post(
  '/',
  authRequired,
  validate([
    { field: 'account_id', required: true, type: 'string' },
    { field: 'amount', required: true, type: 'number', min: 0.01 },
    { field: 'description', required: true, type: 'string', min: 1, max: 300 },
    { field: 'type', required: true, enum: ['income', 'expense'] },
    { field: 'frequency', required: true, enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'] },
    { field: 'next_date', required: true, type: 'date' },
  ]),
  (req: AuthRequest, res: Response) => {
    const db = getDb();
    const id = uuid();
    const { account_id, amount, description, type, frequency, next_date, end_date, category_id } = req.body;

    // Verify account ownership
    const account = db.prepare('SELECT user_id FROM accounts WHERE id = ? AND user_id = ?').get(account_id, req.userId);
    if (!account) {
      res.status(404).json({ error: 'Konto ikke funnet' });
      return;
    }

    db.prepare(`
      INSERT INTO recurring_transactions (id, user_id, account_id, category_id, amount, description, type, frequency, next_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.userId, account_id, category_id || null, amount, description.trim(), type, frequency, next_date, end_date || null);

    const recurring = db.prepare(`
      SELECT r.*, c.name as category_name, c.icon as category_icon, a.name as account_name
      FROM recurring_transactions r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN accounts a ON r.account_id = a.id
      WHERE r.id = ?
    `).get(id);

    res.status(201).json(recurring);
  }
);

// PUT /api/recurring/:id
router.put('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const rec = db.prepare('SELECT * FROM recurring_transactions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId) as RecurringTransaction | undefined;

  if (!rec) {
    res.status(404).json({ error: 'Fast transaksjon ikke funnet' });
    return;
  }

  const { amount, description, type, frequency, next_date, end_date, category_id, active } = req.body;

  db.prepare(`
    UPDATE recurring_transactions
    SET amount = COALESCE(?, amount),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        frequency = COALESCE(?, frequency),
        next_date = COALESCE(?, next_date),
        end_date = COALESCE(?, end_date),
        category_id = COALESCE(?, category_id),
        active = COALESCE(?, active)
    WHERE id = ?
  `).run(
    amount !== undefined ? amount : null,
    description?.trim() || null,
    type || null,
    frequency || null,
    next_date || null,
    end_date !== undefined ? end_date : null,
    category_id !== undefined ? category_id : null,
    active !== undefined ? (active ? 1 : 0) : null,
    req.params.id
  );

  const updated = db.prepare(`
    SELECT r.*, c.name as category_name, c.icon as category_icon, a.name as account_name
    FROM recurring_transactions r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN accounts a ON r.account_id = a.id
    WHERE r.id = ?
  `).get(req.params.id);

  res.json(updated);
});

// DELETE /api/recurring/:id
router.delete('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const rec = db.prepare('SELECT * FROM recurring_transactions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);

  if (!rec) {
    res.status(404).json({ error: 'Fast transaksjon ikke funnet' });
    return;
  }

  db.prepare('DELETE FROM recurring_transactions WHERE id = ?').run(req.params.id);
  res.json({ message: 'Fast transaksjon slettet' });
});

export default router;
