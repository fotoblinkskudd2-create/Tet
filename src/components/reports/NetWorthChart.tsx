import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatNOK } from '@/lib/format'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

export function NetWorthChart() {
  const transactions = useStore((s) => s.transactions)
  const accounts = useStore((s) => s.accounts)

  const initialBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  const totalTransactionEffect = transactions.reduce((sum, t) => {
    return sum + (t.type === 'inntekt' ? t.amount : -t.amount)
  }, 0)
  const baseBalance = initialBalance - totalTransactionEffect

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let running = baseBalance
  const dataPoints = sorted.map((tx) => {
    running += tx.type === 'inntekt' ? tx.amount : -tx.amount
    return {
      date: tx.date,
      balance: running,
    }
  })

  const monthlyPoints = new Map<string, number>()
  for (const dp of dataPoints) {
    const monthKey = dp.date.slice(0, 7)
    monthlyPoints.set(monthKey, dp.balance)
  }

  const chartData = Array.from(monthlyPoints.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, balance]) => ({
      name: month,
      Formue: balance,
    }))

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-neu">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-fjord-400">{formatNOK(payload[0].value)}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formueutvikling</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length < 2 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Trenger minst 2 maaneders data for trendlinje
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="fjordGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b85f0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0b85f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Formue"
                  stroke="#0b85f0"
                  strokeWidth={2}
                  fill="url(#fjordGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
