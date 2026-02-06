import { useState } from 'react'
import { useStore } from '@/lib/store'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getCategoryById } from '@/lib/categories'
import { formatNOK, formatMonthYear, getCurrentPeriod } from '@/lib/format'
import { Plus, Target, Trash2 } from 'lucide-react'

export function BudgetsPage() {
  const { budgets, transactions, deleteBudget } = useStore()
  const [showForm, setShowForm] = useState(false)
  const { month, year } = getCurrentPeriod()

  const currentBudgets = budgets.filter((b) => b.month === month && b.year === year)
  const thisMonth = `${year}-${String(month).padStart(2, '0')}`

  const budgetData = currentBudgets.map((budget) => {
    const cat = getCategoryById(budget.categoryId)
    const spent = transactions
      .filter((t) => t.date.startsWith(thisMonth) && t.categoryId === budget.categoryId && t.type === 'utgift')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      id: budget.id,
      categoryName: cat?.name ?? 'Ukjent',
      categoryIcon: cat?.icon ?? '',
      categoryColor: cat?.color ?? '#94a3b8',
      budgetAmount: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
    }
  })

  const totalBudget = budgetData.reduce((s, b) => s + b.budgetAmount, 0)
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Budsjett</h1>
          <p className="text-sm text-slate-400 mt-1 capitalize">{formatMonthYear(month, year)}</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} />
          Nytt budsjett
        </Button>
      </div>

      {currentBudgets.length > 0 && (
        <Card className="animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-300">Totalt forbruk</p>
            <p className="text-sm text-slate-400">
              {formatNOK(totalSpent)} / {formatNOK(totalBudget)}
            </p>
          </div>
          <Progress
            value={totalSpent}
            max={totalBudget}
            color="#0b85f0"
            showLabel
          />
        </Card>
      )}

      {budgetData.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Target size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Ingen budsjetter satt opp</h3>
          <p className="text-sm text-slate-500 mt-1">Sett opp budsjetter for aa ha kontroll paa forbruket</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus size={16} />
            Opprett budsjett
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgetData.map((b, i) => (
            <Card
              key={b.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
                    style={{ backgroundColor: `${b.categoryColor}15` }}
                  >
                    {b.categoryIcon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{b.categoryName}</p>
                    <p className="text-xs text-slate-500">
                      {b.remaining >= 0
                        ? `${formatNOK(b.remaining)} igjen`
                        : `${formatNOK(Math.abs(b.remaining))} over budsjett`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-400">
                    {formatNOK(b.spent)} / {formatNOK(b.budgetAmount)}
                  </p>
                  <button
                    onClick={() => deleteBudget(b.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <Progress
                value={b.spent}
                max={b.budgetAmount}
                color={b.categoryColor}
                showLabel
              />
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onClose={() => setShowForm(false)} title="Nytt budsjett">
        <BudgetForm onClose={() => setShowForm(false)} />
      </Dialog>
    </div>
  )
}
