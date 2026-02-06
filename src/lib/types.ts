export type AccountType = 'brukskonto' | 'sparekonto' | 'kredittkort' | 'bsu'

export type TransactionType = 'inntekt' | 'utgift' | 'overføring'

export type Frequency = 'daglig' | 'ukentlig' | 'månedlig' | 'årlig'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  color: string
  icon: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isSystem: boolean
}

export interface Transaction {
  id: string
  accountId: string
  categoryId: string
  amount: number
  type: TransactionType
  description: string
  date: string
  tags: string[]
  notes?: string
  createdAt: string
}

export interface RecurringTransaction {
  id: string
  accountId: string
  categoryId: string
  amount: number
  type: TransactionType
  description: string
  frequency: Frequency
  dayOfMonth?: number
  nextDate: string
  isActive: boolean
  createdAt: string
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  month: number
  year: number
}

export interface MonthlyStats {
  month: string
  inntekt: number
  utgift: number
  netto: number
}

export interface CategorySpending {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  amount: number
  budgetAmount?: number
}
