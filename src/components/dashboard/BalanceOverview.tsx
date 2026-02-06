import { useStore } from '@/lib/store'
import { formatNOK } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'

export function BalanceOverview() {
  const accounts = useStore((s) => s.accounts)
  const transactions = useStore((s) => s.transactions)

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthlyTransactions = transactions.filter((t) => t.date.startsWith(thisMonth))
  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'inntekt')
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === 'utgift')
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyNet = monthlyIncome - monthlyExpenses

  const stats = [
    {
      label: 'Total saldo',
      value: formatNOK(totalBalance),
      icon: Wallet,
      color: 'text-fjord-400',
      bgColor: 'bg-fjord-500/10',
    },
    {
      label: 'Inntekt denne mnd',
      value: formatNOK(monthlyIncome),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Utgifter denne mnd',
      value: formatNOK(monthlyExpenses),
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Netto denne mnd',
      value: formatNOK(monthlyNet),
      icon: PiggyBank,
      color: monthlyNet >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: monthlyNet >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
