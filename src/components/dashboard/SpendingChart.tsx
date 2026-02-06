import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getCategoryById, SYSTEM_CATEGORIES } from '@/lib/categories'
import { formatNOK } from '@/lib/format'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useState } from 'react'

export function SpendingChart() {
  const transactions = useStore((s) => s.transactions)
  const [view, setView] = useState<'bar' | 'pie'>('bar')

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthlyExpenses = transactions.filter(
    (t) => t.date.startsWith(thisMonth) && t.type === 'utgift'
  )

  const categoryTotals = new Map<string, number>()
  for (const tx of monthlyExpenses) {
    const current = categoryTotals.get(tx.categoryId) ?? 0
    categoryTotals.set(tx.categoryId, current + tx.amount)
  }

  const chartData = Array.from(categoryTotals.entries())
    .map(([catId, amount]) => {
      const cat = getCategoryById(catId)
      return {
        name: cat?.name ?? 'Ukjent',
        amount,
        color: cat?.color ?? '#94a3b8',
        icon: cat?.icon ?? '',
      }
    })
    .sort((a, b) => b.amount - a.amount)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; amount: number } }> }) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-neu text-sm">
        <p className="text-slate-300">{data.name}</p>
        <p className="text-white font-semibold">{formatNOK(data.amount)}</p>
      </div>
    )
  }

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Utgifter per kategori</CardTitle>
          <div className="flex bg-slate-700/50 rounded-lg p-0.5">
            <button
              onClick={() => setView('bar')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                view === 'bar' ? 'bg-fjord-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stolpe
            </button>
            <button
              onClick={() => setView('pie')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                view === 'pie' ? 'bg-fjord-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kake
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Ingen utgifter denne maneden</p>
        ) : view === 'bar' ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={20}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 min-w-0 shrink-0">
              {chartData.slice(0, 5).map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-400 truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
