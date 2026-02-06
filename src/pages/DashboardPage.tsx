import { BalanceOverview } from '@/components/dashboard/BalanceOverview'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { BudgetProgress } from '@/components/dashboard/BudgetProgress'
import { UpcomingRecurrings } from '@/components/dashboard/UpcomingRecurrings'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { formatMonthYear, getCurrentPeriod } from '@/lib/format'

export function DashboardPage() {
  const { month, year } = getCurrentPeriod()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-100">Oversikt</h1>
        <p className="text-sm text-slate-400 mt-1 capitalize">{formatMonthYear(month, year)}</p>
      </div>

      <BalanceOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart />
        <RecentTransactions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgress />
        <UpcomingRecurrings />
      </div>
    </div>
  )
}
