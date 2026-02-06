import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getCategoryById } from '@/lib/categories'
import { formatNOK, formatRelativeDate } from '@/lib/format'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function RecentTransactions() {
  const transactions = useStore((s) => s.transactions)
  const accounts = useStore((s) => s.accounts)

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Siste transaksjoner</CardTitle>
          <Link
            to="/transaksjoner"
            className="text-xs text-fjord-400 hover:text-fjord-300 transition-colors"
          >
            Se alle
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Ingen transaksjoner enna</p>
        ) : (
          <div className="space-y-1">
            {recent.map((tx) => {
              const cat = getCategoryById(tx.categoryId)
              const account = accounts.find((a) => a.id === tx.accountId)
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl hover:bg-slate-700/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: `${cat?.color ?? '#94a3b8'}15` }}
                    >
                      {cat?.icon ?? '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{tx.description}</p>
                      <p className="text-xs text-slate-500">
                        {account?.name ?? 'Ukjent konto'} · {formatRelativeDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    {tx.type === 'inntekt' ? (
                      <ArrowUpRight size={14} className="text-emerald-400" />
                    ) : (
                      <ArrowDownRight size={14} className="text-red-400" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        tx.type === 'inntekt' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {tx.type === 'inntekt' ? '+' : '−'}{formatNOK(tx.amount)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
