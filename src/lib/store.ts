import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Account, Transaction, RecurringTransaction, Budget } from './types'
import { generateId } from './utils'

interface AppState {
  accounts: Account[]
  transactions: Transaction[]
  recurrings: RecurringTransaction[]
  budgets: Budget[]
  isAuthenticated: boolean
  userEmail: string | null

  // Auth
  login: (email: string) => void
  logout: () => void

  // Accounts
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Recurrings
  addRecurring: (r: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void
  updateRecurring: (id: string, updates: Partial<RecurringTransaction>) => void
  deleteRecurring: (id: string) => void

  // Budgets
  setBudget: (budget: Omit<Budget, 'id'>) => void
  deleteBudget: (id: string) => void

  // Seed demo data
  seedDemoData: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      transactions: [],
      recurrings: [],
      budgets: [],
      isAuthenticated: false,
      userEmail: null,

      login: (email) => set({ isAuthenticated: true, userEmail: email }),
      logout: () => set({ isAuthenticated: false, userEmail: null }),

      addAccount: (account) =>
        set((s) => ({
          accounts: [...s.accounts, { ...account, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateAccount: (id, updates) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      deleteAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          transactions: s.transactions.filter((t) => t.accountId !== id),
        })),

      addTransaction: (tx) =>
        set((s) => {
          const newTx = { ...tx, id: generateId(), createdAt: new Date().toISOString() }
          const sign = tx.type === 'inntekt' ? 1 : -1
          return {
            transactions: [...s.transactions, newTx],
            accounts: s.accounts.map((a) =>
              a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount * sign } : a
            ),
          }
        }),

      updateTransaction: (id, updates) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTransaction: (id) =>
        set((s) => {
          const tx = s.transactions.find((t) => t.id === id)
          if (!tx) return s
          const sign = tx.type === 'inntekt' ? -1 : 1
          return {
            transactions: s.transactions.filter((t) => t.id !== id),
            accounts: s.accounts.map((a) =>
              a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount * sign } : a
            ),
          }
        }),

      addRecurring: (r) =>
        set((s) => ({
          recurrings: [...s.recurrings, { ...r, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateRecurring: (id, updates) =>
        set((s) => ({
          recurrings: s.recurrings.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRecurring: (id) =>
        set((s) => ({ recurrings: s.recurrings.filter((r) => r.id !== id) })),

      setBudget: (budget) =>
        set((s) => {
          const existing = s.budgets.find(
            (b) => b.categoryId === budget.categoryId && b.month === budget.month && b.year === budget.year
          )
          if (existing) {
            return {
              budgets: s.budgets.map((b) => (b.id === existing.id ? { ...b, amount: budget.amount } : b)),
            }
          }
          return { budgets: [...s.budgets, { ...budget, id: generateId() }] }
        }),

      deleteBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      seedDemoData: () => {
        const state = get()
        if (state.accounts.length > 0) return

        const bruksId = generateId()
        const spareId = generateId()
        const bsuId = generateId()
        const now = new Date()
        const thisMonth = now.toISOString().slice(0, 7)

        const accounts: Account[] = [
          { id: bruksId, name: 'Brukskonto Sparebanken Vest', type: 'brukskonto', balance: 24350.75, color: '#3b82f6', icon: '💳', createdAt: now.toISOString() },
          { id: spareId, name: 'Sparekonto', type: 'sparekonto', balance: 89200.00, color: '#10b981', icon: '🏦', createdAt: now.toISOString() },
          { id: bsuId, name: 'BSU', type: 'bsu', balance: 162500.00, color: '#8b5cf6', icon: '🏡', createdAt: now.toISOString() },
        ]

        const demoTransactions: Transaction[] = [
          { id: generateId(), accountId: bruksId, categoryId: 'cat-lonn', amount: 38500, type: 'inntekt', description: 'Lønn februar', date: `${thisMonth}-01`, tags: ['lønn'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-skattetrekk', amount: 11200, type: 'utgift', description: 'Skattetrekk februar', date: `${thisMonth}-01`, tags: ['skatt'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-bolig', amount: 9500, type: 'utgift', description: 'Husleie Møhlenpris', date: `${thisMonth}-01`, tags: ['bolig'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-mat', amount: 847.50, type: 'utgift', description: 'Meny Galleriet', date: `${thisMonth}-03`, tags: ['mat'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-transport', amount: 790, type: 'utgift', description: 'Skyss månedskort', date: `${thisMonth}-02`, tags: ['transport'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-strom', amount: 1230.40, type: 'utgift', description: 'BKK Strøm januar', date: `${thisMonth}-04`, tags: ['strøm'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-restaurant', amount: 489, type: 'utgift', description: 'Espresso House Bryggen', date: `${thisMonth}-05`, tags: ['kaffe'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-trening', amount: 499, type: 'utgift', description: 'SATS medlemskap', date: `${thisMonth}-01`, tags: ['trening'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-mat', amount: 623.20, type: 'utgift', description: 'Rema 1000 Danmarksplass', date: `${thisMonth}-05`, tags: ['mat'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-abonnement', amount: 199, type: 'utgift', description: 'Spotify Premium', date: `${thisMonth}-03`, tags: ['musikk'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-abonnement', amount: 119, type: 'utgift', description: 'Netflix Standard', date: `${thisMonth}-04`, tags: ['streaming'], createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-klaer', amount: 1299, type: 'utgift', description: 'H&M Lagunen', date: `${thisMonth}-06`, tags: ['klær'], createdAt: now.toISOString() },
        ]

        const demoRecurrings: RecurringTransaction[] = [
          { id: generateId(), accountId: bruksId, categoryId: 'cat-lonn', amount: 38500, type: 'inntekt', description: 'Lønn', frequency: 'månedlig', dayOfMonth: 25, nextDate: `${thisMonth}-25`, isActive: true, createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-bolig', amount: 9500, type: 'utgift', description: 'Husleie Møhlenpris', frequency: 'månedlig', dayOfMonth: 1, nextDate: `${thisMonth}-01`, isActive: true, createdAt: now.toISOString() },
          { id: generateId(), accountId: bruksId, categoryId: 'cat-trening', amount: 499, type: 'utgift', description: 'SATS medlemskap', frequency: 'månedlig', dayOfMonth: 1, nextDate: `${thisMonth}-01`, isActive: true, createdAt: now.toISOString() },
          { id: generateId(), accountId: spareId, categoryId: 'cat-sparing', amount: 2000, type: 'utgift', description: 'Fast sparing', frequency: 'månedlig', dayOfMonth: 25, nextDate: `${thisMonth}-25`, isActive: true, createdAt: now.toISOString() },
        ]

        const month = now.getMonth() + 1
        const year = now.getFullYear()
        const demoBudgets: Budget[] = [
          { id: generateId(), categoryId: 'cat-mat', amount: 4000, month, year },
          { id: generateId(), categoryId: 'cat-transport', amount: 1500, month, year },
          { id: generateId(), categoryId: 'cat-restaurant', amount: 2000, month, year },
          { id: generateId(), categoryId: 'cat-underholdning', amount: 1000, month, year },
          { id: generateId(), categoryId: 'cat-klaer', amount: 1500, month, year },
          { id: generateId(), categoryId: 'cat-abonnement', amount: 500, month, year },
        ]

        set({
          accounts,
          transactions: demoTransactions,
          recurrings: demoRecurrings,
          budgets: demoBudgets,
        })
      },
    }),
    {
      name: 'bergenbudget-storage',
    }
  )
)
