import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { Transaction, PaginatedResult } from '../models';
import { AuthRequest, authRequired, ownerOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { suggestCategory } from '../utils/categorizer';
import { parseCsv } from '../utils/csvImporter';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Receipt upload setup
const uploadDir = path.join(__dirname, '..', '..', 'data', 'receipts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// GET /api/transactions
router.get('/', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const page = Math.max(1, parseInt(String(req.query.page)) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize)) || 25));
  const offset = (page - 1) * pageSize;

  let where = 'WHERE t.user_id = ?';
  const params: any[] = [req.userId];

  if (req.query.startDate) {
    where += ' AND t.date >= ?';
    params.push(req.query.startDate);
  }
  if (req.query.endDate) {
    where += ' AND t.date <= ?';
    params.push(req.query.endDate);
  }
  if (req.query.categoryId) {
    where += ' AND t.category_id = ?';
    params.push(req.query.categoryId);
  }
  if (req.query.accountId) {
    where += ' AND t.account_id = ?';
    params.push(req.query.accountId);
  }
  if (req.query.type) {
    where += ' AND t.type = ?';
    params.push(req.query.type);
  }
  if (req.query.search) {
    where += ' AND t.description LIKE ?';
    params.push(`%${req.query.search}%`);
  }

  const countRow = db.prepare(
    `SELECT COUNT(*) as cnt FROM transactions t ${where}`
  ).get(...params) as { cnt: number };

  const transactions = db.prepare(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, a.name as account_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
    ${where}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset);

  const result: PaginatedResult<any> = {
    data: transactions,
    total: countRow.cnt,
    page,
    pageSize,
    totalPages: Math.ceil(countRow.cnt / pageSize),
  };

  res.json(result);
});

// POST /api/transactions
router.post(
  '/',
  authRequired,
  validate([
    { field: 'account_id', required: true, type: 'string' },
    { field: 'amount', required: true, type: 'number', min: 0.01 },
    { field: 'description', required: true, type: 'string', min: 1, max: 500 },
    { field: 'date', required: true, type: 'date' },
    { field: 'type', required: true, enum: ['income', 'expense', 'transfer'] },
  ]),
  (req: AuthRequest, res: Response) => {
    const db = getDb();
    const id = uuid();
    const { account_id, amount, description, date, type, category_id, notes, tags } = req.body;

    // Verify account ownership
    const account = db.prepare('SELECT user_id FROM accounts WHERE id = ? AND user_id = ?').get(account_id, req.userId);
    if (!account) {
      res.status(404).json({ error: 'Konto ikke funnet' });
      return;
    }

    // Auto-categorize if no category provided
    const finalCategoryId = category_id || suggestCategory(description);

    db.prepare(`
      INSERT INTO transactions (id, user_id, account_id, category_id, amount, description, date, type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.userId, account_id, finalCategoryId, amount, description.trim(), date, type, notes || null);

    // Update account balance
    const balanceChange = type === 'income' ? amount : -amount;
    db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(balanceChange, account_id);

    // Handle tags
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        let tag = db.prepare('SELECT id FROM tags WHERE user_id = ? AND name = ?').get(req.userId, tagName) as any;
        if (!tag) {
          const tagId = uuid();
          db.prepare('INSERT INTO tags (id, user_id, name) VALUES (?, ?, ?)').run(tagId, req.userId, tagName);
          tag = { id: tagId };
        }
        db.prepare('INSERT OR IGNORE INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)').run(id, tag.id);
      }
    }

    const transaction = db.prepare(`
      SELECT t.*, c.name as category_name, c.icon as category_icon, a.name as account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.id = ?
    `).get(id);

    res.status(201).json(transaction);
  }
);

// POST /api/transactions/split
router.post(
  '/split',
  authRequired,
  validate([
    { field: 'account_id', required: true, type: 'string' },
    { field: 'date', required: true, type: 'date' },
    { field: 'description', required: true, type: 'string' },
    { field: 'splits', required: true },
  ]),
  (req: AuthRequest, res: Response) => {
    const db = getDb();
    const { account_id, date, description, splits } = req.body;

    if (!Array.isArray(splits) || splits.length < 2) {
      res.status(400).json({ error: 'Delt transaksjon krever minst 2 deler' });
      return;
    }

    const account = db.prepare('SELECT user_id FROM accounts WHERE id = ? AND user_id = ?').get(account_id, req.userId);
    if (!account) {
      res.status(404).json({ error: 'Konto ikke funnet' });
      return;
    }

    const totalAmount = splits.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
    const parentId = uuid();

    const insertSplit = db.transaction(() => {
      // Create parent transaction
      db.prepare(`
        INSERT INTO transactions (id, user_id, account_id, amount, description, date, type, is_split)
        VALUES (?, ?, ?, ?, ?, ?, 'expense', 1)
      `).run(parentId, req.userId, account_id, totalAmount, description.trim(), date);

      // Create child transactions
      for (const split of splits) {
        const childId = uuid();
        const catId = split.category_id || suggestCategory(split.description || description);
        db.prepare(`
          INSERT INTO transactions (id, user_id, account_id, category_id, amount, description, date, type, parent_transaction_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'expense', ?)
        `).run(childId, req.userId, account_id, catId, split.amount, (split.description || description).trim(), date, parentId);
      }

      // Update account balance
      db.prepare('UPDATE accounts SET balance = balance - ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(totalAmount, account_id);
    });

    insertSplit();

    const parent = db.prepare(`
      SELECT t.*, c.name as category_name, a.name as account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.id = ?
    `).get(parentId);

    const children = db.prepare(`
      SELECT t.*, c.name as category_name, c.icon as category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.parent_transaction_id = ?
    `).all(parentId);

    res.status(201).json({ parent, splits: children });
  }
);

// PUT /api/transactions/:id
router.put('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as Transaction | undefined;

  if (!tx) {
    res.status(404).json({ error: 'Transaksjon ikke funnet' });
    return;
  }
  if (!ownerOrAdmin(tx.user_id, req)) {
    res.status(403).json({ error: 'Ingen tilgang' });
    return;
  }

  const { category_id, amount, description, date, type, notes } = req.body;

  // If amount or type changed, update account balance
  if ((amount !== undefined && amount !== tx.amount) || (type !== undefined && type !== tx.type)) {
    const oldEffect = tx.type === 'income' ? tx.amount : -tx.amount;
    const newAmount = amount !== undefined ? amount : tx.amount;
    const newType = type !== undefined ? type : tx.type;
    const newEffect = newType === 'income' ? newAmount : -newAmount;
    const diff = newEffect - oldEffect;

    db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(diff, tx.account_id);
  }

  db.prepare(`
    UPDATE transactions
    SET category_id = COALESCE(?, category_id),
        amount = COALESCE(?, amount),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        type = COALESCE(?, type),
        notes = COALESCE(?, notes),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(
    category_id !== undefined ? category_id : null,
    amount !== undefined ? amount : null,
    description?.trim() || null,
    date || null,
    type || null,
    notes !== undefined ? notes : null,
    req.params.id
  );

  const updated = db.prepare(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, a.name as account_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
    WHERE t.id = ?
  `).get(req.params.id);

  res.json(updated);
});

// DELETE /api/transactions/:id
router.delete('/:id', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as Transaction | undefined;

  if (!tx) {
    res.status(404).json({ error: 'Transaksjon ikke funnet' });
    return;
  }
  if (!ownerOrAdmin(tx.user_id, req)) {
    res.status(403).json({ error: 'Ingen tilgang' });
    return;
  }

  // Reverse balance effect
  const balanceReverse = tx.type === 'income' ? -tx.amount : tx.amount;
  db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(balanceReverse, tx.account_id);

  // Delete children if split
  if (tx.is_split) {
    db.prepare('DELETE FROM transactions WHERE parent_transaction_id = ?').run(tx.id);
  }

  db.prepare('DELETE FROM transaction_tags WHERE transaction_id = ?').run(tx.id);
  db.prepare('DELETE FROM transactions WHERE id = ?').run(tx.id);

  res.json({ message: 'Transaksjon slettet' });
});

// POST /api/transactions/upload-receipt/:id
router.post(
  '/upload-receipt/:id',
  authRequired,
  upload.single('receipt'),
  (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'Ingen fil lastet opp' });
      return;
    }

    const db = getDb();
    const tx = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId) as Transaction | undefined;

    if (!tx) {
      res.status(404).json({ error: 'Transaksjon ikke funnet' });
      return;
    }

    const receiptPath = `/receipts/${req.file.filename}`;
    db.prepare('UPDATE transactions SET receipt_path = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(receiptPath, req.params.id);

    // Simulated OCR response
    const ocrResult = {
      success: true,
      message: 'OCR-behandling simulert. I produksjon ville dette brukt Google Vision API eller Tesseract.',
      extractedData: {
        vendor: 'Simulert butikk',
        total: tx.amount,
        date: tx.date,
      },
    };

    res.json({ receiptPath, ocr: ocrResult });
  }
);

// POST /api/transactions/import-csv
router.post(
  '/import-csv',
  authRequired,
  upload.single('file'),
  (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'Ingen CSV-fil lastet opp' });
      return;
    }

    const accountId = req.body.account_id;
    if (!accountId) {
      res.status(400).json({ error: 'Konto-ID er påkrevd' });
      return;
    }

    const db = getDb();
    const account = db.prepare('SELECT user_id FROM accounts WHERE id = ? AND user_id = ?')
      .get(accountId, req.userId);
    if (!account) {
      res.status(404).json({ error: 'Konto ikke funnet' });
      return;
    }

    const csvContent = fs.readFileSync(req.file.path, 'utf-8');
    const result = parseCsv(csvContent);

    const inserted: string[] = [];
    const insertTx = db.transaction(() => {
      for (const tx of result.transactions) {
        const id = uuid();
        db.prepare(`
          INSERT INTO transactions (id, user_id, account_id, category_id, amount, description, date, type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, req.userId, accountId, tx.categoryId, tx.amount, tx.description, tx.date, tx.type);

        const balanceChange = tx.type === 'income' ? tx.amount : -tx.amount;
        db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(balanceChange, accountId);

        inserted.push(id);
      }
    });

    insertTx();

    // Clean up uploaded CSV
    fs.unlinkSync(req.file.path);

    res.json({
      imported: inserted.length,
      errors: result.errors,
      format: result.format,
      message: `${inserted.length} transaksjoner importert fra ${result.format}-format`,
    });
  }
);

// GET /api/transactions/suggest-category?description=...
router.get('/suggest-category', authRequired, (req: AuthRequest, res: Response) => {
  const description = String(req.query.description || '');
  const categoryId = suggestCategory(description);

  if (!categoryId) {
    res.json({ suggestion: null });
    return;
  }

  const db = getDb();
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
  res.json({ suggestion: category });
});

export default router;
