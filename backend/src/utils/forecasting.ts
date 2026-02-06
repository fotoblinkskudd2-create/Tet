import { getDb } from '../db';

export interface ForecastResult {
  currentBalance: number;
  monthlyNetAvg: number;
  monthsUntilBroke: number | null; // null = not going broke / positive net
  brokeDate: string | null;
  projectedBalances: { month: string; balance: number }[];
  message: string;
}

export function generateForecast(userId: string, months: number = 12): ForecastResult {
  const db = getDb();

  // Get total balance
  const balanceRow = db.prepare(
    'SELECT COALESCE(SUM(balance), 0) as total FROM accounts WHERE user_id = ?'
  ).get(userId) as { total: number };
  const currentBalance = balanceRow.total;

  // Get last 6 months of transactions for averaging
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sinceDate = sixMonthsAgo.toISOString().split('T')[0];

  const monthlyData = db.prepare(`
    SELECT
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ? AND date >= ?
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `).all(userId, sinceDate) as { month: string; income: number; expenses: number }[];

  if (monthlyData.length === 0) {
    return {
      currentBalance,
      monthlyNetAvg: 0,
      monthsUntilBroke: null,
      brokeDate: null,
      projectedBalances: [],
      message: 'Ikke nok transaksjonsdata for prognose. Legg til transaksjoner for å se en prognose.',
    };
  }

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const avgMonthlyIncome = totalIncome / monthlyData.length;
  const avgMonthlyExpenses = totalExpenses / monthlyData.length;
  const monthlyNetAvg = avgMonthlyIncome - avgMonthlyExpenses;

  // Project forward
  const projectedBalances: { month: string; balance: number }[] = [];
  let projBalance = currentBalance;
  let monthsUntilBroke: number | null = null;
  let brokeDate: string | null = null;

  const now = new Date();
  for (let i = 1; i <= months; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthLabel = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;

    projBalance += monthlyNetAvg;
    projectedBalances.push({ month: monthLabel, balance: Math.round(projBalance) });

    if (projBalance <= 0 && monthsUntilBroke === null) {
      monthsUntilBroke = i;
      brokeDate = monthLabel;
    }
  }

  let message: string;
  if (monthlyNetAvg >= 0) {
    const yearlyGrowth = monthlyNetAvg * 12;
    message = `Du sparer i snitt ${formatNOK(monthlyNetAvg)} per måned. Bra jobba! Forventet vekst neste år: ${formatNOK(yearlyGrowth)}.`;
  } else if (monthsUntilBroke !== null) {
    message = `Advarsel: Med nåværende forbruksmønster vil du gå tom for penger om ${monthsUntilBroke} ${monthsUntilBroke === 1 ? 'måned' : 'måneder'} (${formatMonthNO(brokeDate!)}). Vurder å redusere utgiftene.`;
  } else {
    message = `Du bruker mer enn du tjener (${formatNOK(Math.abs(monthlyNetAvg))} per måned), men har fortsatt buffer.`;
  }

  return {
    currentBalance,
    monthlyNetAvg: Math.round(monthlyNetAvg),
    monthsUntilBroke,
    brokeDate,
    projectedBalances,
    message,
  };
}

function formatNOK(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}${formatted} kr`;
}

const monthNames = [
  'januar', 'februar', 'mars', 'april', 'mai', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'desember'
];

function formatMonthNO(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}
