import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { Account } from '../models';
import { AuthRequest, authRequired, ownerOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/accounts
router.get('/', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const accounts = db.prepare(
    'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at'
  ).all(req.userId) as Account[];

  res.json(accounts);
});

// GET /api/accounts/:id
router.get('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id) as Account | undefined;

  if (!account) {
    res.status(404).json({ error: 'Konto ikke funnet' });
    return;
  }

  if (!ownerOrAdmin(account.user_id, req)) {
    res.status(403).json({ error: 'Ingen tilgang' });
    return;
  }

  res.json(account);
});

// POST /api/accounts
router.post(
  '/',
  authRequired,
  validate([
    { field: 'name', required: true, type: 'string', min: 1, max: 100 },
    { field: 'type', required: true, enum: ['checking', 'savings', 'credit', 'bsu'] },
    { field: 'balance', required: false, type: 'number' },
  ]),
  (req: AuthRequest, res: Response) => {
    const db = getDb();
    const id = uuid();
    const { name, type, bank_name, balance = 0, currency = 'NOK' } = req.body;

    db.prepare(
      'INSERT INTO accounts (id, user_id, name, type, bank_name, balance, currency) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, req.userId, name.trim(), type, bank_name || null, balance, currency);

    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as Account;
    res.status(201).json(account);
  }
);

// PUT /api/accounts/:id
router.put(
  '/:id',
  authRequired,
  validate([
    { field: 'name', required: false, type: 'string', min: 1, max: 100 },
    { field: 'type', required: false, enum: ['checking', 'savings', 'credit', 'bsu'] },
  ]),
  (req: AuthRequest, res: Response) => {
    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id) as Account | undefined;

    if (!account) {
      res.status(404).json({ error: 'Konto ikke funnet' });
      return;
    }
    if (!ownerOrAdmin(account.user_id, req)) {
      res.status(403).json({ error: 'Ingen tilgang' });
      return;
    }

    const { name, type, bank_name, balance } = req.body;
    db.prepare(`
      UPDATE accounts
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          bank_name = COALESCE(?, bank_name),
          balance = COALESCE(?, balance),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name?.trim() || null,
      type || null,
      bank_name !== undefined ? bank_name : null,
      balance !== undefined ? balance : null,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id) as Account;
    res.json(updated);
  }
);

// DELETE /api/accounts/:id
router.delete('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id) as Account | undefined;

  if (!account) {
    res.status(404).json({ error: 'Konto ikke funnet' });
    return;
  }
  if (!ownerOrAdmin(account.user_id, req)) {
    res.status(403).json({ error: 'Ingen tilgang' });
    return;
  }

  // Check for linked transactions
  const txCount = db.prepare(
    'SELECT COUNT(*) as cnt FROM transactions WHERE account_id = ?'
  ).get(req.params.id) as { cnt: number };

  if (txCount.cnt > 0) {
    res.status(409).json({
      error: `Kontoen har ${txCount.cnt} transaksjoner. Slett eller flytt transaksjonene først.`,
    });
    return;
  }

  db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Konto slettet' });
});

export default router;
