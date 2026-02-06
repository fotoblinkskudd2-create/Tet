import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getCategoryById } from '@/lib/categories'
import { formatNOK } from '@/lib/format'
import { getCurrentPeriod } from '@/lib/format'

export function BudgetProgress() {
  const budgets = useStore((s) => s.budgets)
  const transactions = useStore((s) => s.transactions)

  const { month, year } = getCurrentPeriod()
  const thisMonth = `${year}-${String(month).padStart(2, '0')}`

  const currentBudgets = budgets.filter((b) => b.month === month && b.year === year)

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
    }
  })

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
      <CardHeader>
        <CardTitle>Budsjettfremdrift</CardTitle>
      </CardHeader>
      <CardContent>
        {budgetData.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Ingen budsjetter satt opp enna</p>
        ) : (
          <div className="space-y-4">
            {budgetData.map((b) => (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{b.categoryIcon}</span>
                    <span className="text-slate-300">{b.categoryName}</span>
                  </div>
                  <div className="text-slate-400 text-xs">
                    {formatNOK(b.spent)} / {formatNOK(b.budgetAmount)}
                  </div>
                </div>
                <Progress
                  value={b.spent}
                  max={b.budgetAmount}
                  color={b.categoryColor}
                  showLabel
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
