import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { Category } from '../models';
import { AuthRequest, authRequired } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/categories
router.get('/', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const categories = db.prepare(
    'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY sort_order, name'
  ).all(req.userId) as Category[];

  res.json(categories);
});

// POST /api/categories
router.post(
  '/',
  authRequired,
  validate([
    { field: 'name', required: true, type: 'string', min: 1, max: 50 },
    { field: 'type', required: true, enum: ['income', 'expense'] },
  ]),
  (req: AuthRequest, res: Response) => {
    const db = getDb();
    const id = uuid();
    const { name, type, icon = '📁', is_tax_relevant = false, tax_code = null, parent_id = null } = req.body;

    db.prepare(
      'INSERT INTO categories (id, user_id, name, type, icon, is_tax_relevant, tax_code, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, req.userId, name.trim(), type, icon, is_tax_relevant ? 1 : 0, tax_code, parent_id, 50);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category;
    res.status(201).json(category);
  }
);

// PUT /api/categories/:id
router.put('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as Category | undefined;

  if (!cat) {
    res.status(404).json({ error: 'Kategori ikke funnet' });
    return;
  }
  if (cat.user_id !== null && cat.user_id !== req.userId) {
    res.status(403).json({ error: 'Ingen tilgang' });
    return;
  }
  if (cat.user_id === null) {
    res.status(403).json({ error: 'Kan ikke endre standardkategorier' });
    return;
  }

  const { name, type, icon, is_tax_relevant, tax_code } = req.body;
  db.prepare(`
    UPDATE categories
    SET name = COALESCE(?, name),
        type = COALESCE(?, type),
        icon = COALESCE(?, icon),
        is_tax_relevant = COALESCE(?, is_tax_relevant),
        tax_code = COALESCE(?, tax_code)
    WHERE id = ?
  `).run(
    name?.trim() || null,
    type || null,
    icon || null,
    is_tax_relevant !== undefined ? (is_tax_relevant ? 1 : 0) : null,
    tax_code !== undefined ? tax_code : null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as Category;
  res.json(updated);
});

// GET /api/categories/suggest?description=...
router.get('/suggest', authRequired, (req: AuthRequest, res: Response) => {
  const { suggestCategories } = require('../utils/categorizer');
  const description = String(req.query.description || '');
  const suggestions = suggestCategories(description);

  const db = getDb();
  const categories = suggestions.map((id: string) => {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category;
  }).filter(Boolean);

  res.json(categories);
});

export default router;
