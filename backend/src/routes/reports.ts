import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthRequest, authRequired } from '../middleware/auth';
import { generateForecast } from '../utils/forecasting';

const router = Router();

// GET /api/reports/monthly?year=2024&month=1
router.get('/monthly', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const now = new Date();
  const year = parseInt(String(req.query.year)) || now.getFullYear();
  const month = parseInt(String(req.query.month)) || (now.getMonth() + 1);

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  // Summary
  const summary = db.prepare(`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(*) as transaction_count
    FROM transactions
    WHERE user_id = ? AND date >= ? AND date < ?
  `).get(req.userId, startDate, endDate) as any;

  // By category
  const byCategory = db.prepare(`
    SELECT
      c.id, c.name, c.icon, c.type as category_type, c.is_tax_relevant, c.tax_code,
      SUM(t.amount) as total,
      COUNT(t.id) as count
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.date >= ? AND t.date < ?
    GROUP BY c.id
    ORDER BY total DESC
  `).all(req.userId, startDate, endDate);

  // Daily breakdown
  const daily = db.prepare(`
    SELECT
      date,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ? AND date >= ? AND date < ?
    GROUP BY date
    ORDER BY date
  `).all(req.userId, startDate, endDate);

  // Tax-relevant items
  const taxItems = db.prepare(`
    SELECT
      c.name as category_name, c.tax_code,
      SUM(t.amount) as total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.date >= ? AND t.date < ? AND c.is_tax_relevant = 1
    GROUP BY c.id
  `).all(req.userId, startDate, endDate);

  res.json({
    year,
    month,
    summary: {
      totalIncome: summary.total_income || 0,
      totalExpenses: summary.total_expenses || 0,
      net: (summary.total_income || 0) - (summary.total_expenses || 0),
      transactionCount: summary.transaction_count || 0,
    },
    byCategory,
    daily,
    taxItems,
  });
});

// GET /api/reports/annual?year=2024
router.get('/annual', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const year = parseInt(String(req.query.year)) || new Date().getFullYear();

  const monthly = db.prepare(`
    SELECT
      CAST(strftime('%m', date) AS INTEGER) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ? AND strftime('%Y', date) = ?
    GROUP BY strftime('%m', date)
    ORDER BY month
  `).all(req.userId, String(year));

  // Fill in missing months
  const monthlyData = [];
  for (let m = 1; m <= 12; m++) {
    const found = (monthly as any[]).find(row => row.month === m);
    monthlyData.push({
      month: m,
      income: found?.income || 0,
      expenses: found?.expenses || 0,
      net: (found?.income || 0) - (found?.expenses || 0),
    });
  }

  const totals = monthlyData.reduce(
    (acc, m) => ({
      income: acc.income + m.income,
      expenses: acc.expenses + m.expenses,
      net: acc.net + m.net,
    }),
    { income: 0, expenses: 0, net: 0 }
  );

  // Annual tax summary
  const taxSummary = db.prepare(`
    SELECT
      c.name as category_name, c.tax_code,
      SUM(t.amount) as total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND strftime('%Y', t.date) = ? AND c.is_tax_relevant = 1
    GROUP BY c.id
    ORDER BY c.tax_code
  `).all(req.userId, String(year));

  res.json({
    year,
    monthly: monthlyData,
    totals,
    taxSummary,
  });
});

// GET /api/reports/net-worth
router.get('/net-worth', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();

  // Current net worth from accounts
  const accounts = db.prepare(
    'SELECT name, type, balance FROM accounts WHERE user_id = ? ORDER BY type, name'
  ).all(req.userId) as any[];

  const totalAssets = accounts
    .filter(a => a.type !== 'credit')
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter(a => a.type === 'credit')
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  // Historical net worth (monthly snapshots from transactions)
  const monthlyHistory = db.prepare(`
    SELECT
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_flow
    FROM transactions
    WHERE user_id = ?
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `).all(req.userId) as any[];

  // Build cumulative net worth over time
  let cumulative = 0;
  const history = monthlyHistory.map(row => {
    cumulative += row.net_flow;
    return { month: row.month, netWorth: Math.round(cumulative) };
  });

  res.json({
    current: {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    },
    accounts,
    history,
  });
});

// GET /api/reports/forecast
router.get('/forecast', authRequired, (req: AuthRequest, res: Response) => {
  const months = parseInt(String(req.query.months)) || 12;
  const forecast = generateForecast(req.userId!, months);
  res.json(forecast);
});

// GET /api/reports/export?format=csv&year=2024&month=1
router.get('/export', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const format = String(req.query.format || 'csv');
  const year = req.query.year ? parseInt(String(req.query.year)) : undefined;
  const month = req.query.month ? parseInt(String(req.query.month)) : undefined;

  let where = 'WHERE t.user_id = ?';
  const params: any[] = [req.userId];

  if (year) {
    where += ' AND strftime(\'%Y\', t.date) = ?';
    params.push(String(year));
  }
  if (month) {
    where += ' AND CAST(strftime(\'%m\', t.date) AS INTEGER) = ?';
    params.push(month);
  }

  const transactions = db.prepare(`
    SELECT t.date, t.description, t.amount, t.type,
           c.name as category, a.name as account
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
    ${where}
    ORDER BY t.date DESC
  `).all(...params) as any[];

  if (format === 'csv') {
    // Build CSV with Norwegian headers and formatting
    const header = 'Dato;Beskrivelse;Beløp;Type;Kategori;Konto';
    const rows = transactions.map(t => {
      const [y, m, d] = t.date.split('-');
      const dateNO = `${d}.${m}.${y}`;
      const amountNO = t.amount.toFixed(2).replace('.', ',');
      const typeNO = t.type === 'income' ? 'Inntekt' : t.type === 'expense' ? 'Utgift' : 'Overføring';
      return `${dateNO};${t.description};${amountNO};${typeNO};${t.category || ''};${t.account || ''}`;
    });

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="bergenbudget-eksport${year ? `-${year}` : ''}${month ? `-${month}` : ''}.csv"`);
    // BOM for Excel to recognize UTF-8
    res.send('\uFEFF' + csv);
  } else {
    // For PDF, return JSON that the frontend can render to PDF
    res.json({
      title: `BergenBudget Rapport${year ? ` ${year}` : ''}${month ? `/${month}` : ''}`,
      transactions,
      generated: new Date().toISOString(),
    });
  }
});

export default router;
