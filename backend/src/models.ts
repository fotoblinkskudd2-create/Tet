export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  google_id: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'bsu';
  bank_name: string | null;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  is_tax_relevant: number;
  tax_code: string | null;
  parent_id: string | null;
  sort_order: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  receipt_path: string | null;
  is_split: number;
  parent_transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  next_date: string;
  end_date: string | null;
  active: number;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  year: number;
  month: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

// API response types
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DashboardData {
  totalBalance: number;
  accounts: Account[];
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetProgress: BudgetProgress[];
  upcomingRecurring: RecurringTransaction[];
  recentTransactions: Transaction[];
  monthlyChart: MonthlyChartData;
}

export interface BudgetProgress {
  category: Category;
  budgeted: number;
  spent: number;
  percentage: number;
}

export interface MonthlyChartData {
  labels: string[];
  income: number[];
  expenses: number[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  accountId?: string;
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
