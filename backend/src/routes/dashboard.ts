import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = Router();

// GET /api/dashboard
router.get('/', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  // Accounts and total balance
  const accounts = db.prepare(
    'SELECT * FROM accounts WHERE user_id = ? ORDER BY type, name'
  ).all(req.userId) as any[];

  const totalBalance = accounts.reduce((sum: number, a: any) => sum + a.balance, 0);

  // Monthly income/expenses
  const monthlySummary = db.prepare(`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ? AND date >= ? AND date < ?
  `).get(req.userId, startDate, endDate) as any;

  // Budget progress for current month
  const budgetProgress = db.prepare(`
    SELECT b.id, b.amount as budgeted, c.name as category_name, c.icon as category_icon,
      COALESCE(
        (SELECT SUM(t.amount) FROM transactions t
         WHERE t.user_id = b.user_id
           AND t.category_id = b.category_id
           AND t.type = 'expense'
           AND t.date >= ? AND t.date < ?),
        0
      ) as spent
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ? AND b.year = ? AND b.month = ?
    ORDER BY c.sort_order
  `).all(startDate, endDate, req.userId, year, month) as any[];

  // Add percentage to budget progress
  const budgetWithProgress = budgetProgress.map((b: any) => ({
    ...b,
    percentage: b.budgeted > 0 ? Math.round((b.spent / b.budgeted) * 100) : 0,
  }));

  // Upcoming recurring (next 7 days)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const today = now.toISOString().split('T')[0];
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const upcomingRecurring = db.prepare(`
    SELECT r.*, c.name as category_name, c.icon as category_icon, a.name as account_name
    FROM recurring_transactions r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN accounts a ON r.account_id = a.id
    WHERE r.user_id = ? AND r.active = 1 AND r.next_date >= ? AND r.next_date <= ?
    ORDER BY r.next_date
  `).all(req.userId, today, futureDateStr);

  // Recent transactions (last 10)
  const recentTransactions = db.prepare(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, a.name as account_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
    WHERE t.user_id = ?
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT 10
  `).all(req.userId);

  // Monthly chart data (last 6 months)
  const chartLabels: string[] = [];
  const chartIncome: number[] = [];
  const chartExpenses: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const chartDate = new Date(year, month - 1 - i, 1);
    const chartYear = chartDate.getFullYear();
    const chartMonth = chartDate.getMonth() + 1;
    const chartStart = `${chartYear}-${String(chartMonth).padStart(2, '0')}-01`;
    const nextMonth = chartMonth === 12 ? 1 : chartMonth + 1;
    const nextYear = chartMonth === 12 ? chartYear + 1 : chartYear;
    const chartEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const monthNames = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    chartLabels.push(`${monthNames[chartMonth - 1]} ${chartYear}`);

    const chartData = db.prepare(`
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE user_id = ? AND date >= ? AND date < ?
    `).get(req.userId, chartStart, chartEnd) as any;

    chartIncome.push(Math.round(chartData?.income || 0));
    chartExpenses.push(Math.round(chartData?.expenses || 0));
  }

  res.json({
    totalBalance,
    accounts,
    monthlyIncome: monthlySummary?.income || 0,
    monthlyExpenses: monthlySummary?.expenses || 0,
    budgetProgress: budgetWithProgress,
    upcomingRecurring,
    recentTransactions,
    monthlyChart: {
      labels: chartLabels,
      income: chartIncome,
      expenses: chartExpenses,
    },
  });
});

export default router;
