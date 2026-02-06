import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatNOK, formatMonthYear } from '@/lib/format'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export function MonthlyOverview() {
  const transactions = useStore((s) => s.transactions)

  const monthlyData = new Map<string, { inntekt: number; utgift: number }>()

  for (const tx of transactions) {
    const monthKey = tx.date.slice(0, 7)
    const current = monthlyData.get(monthKey) ?? { inntekt: 0, utgift: 0 }
    if (tx.type === 'inntekt') {
      current.inntekt += tx.amount
    } else if (tx.type === 'utgift') {
      current.utgift += tx.amount
    }
    monthlyData.set(monthKey, current)
  }

  const chartData = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, data]) => {
      const [y, m] = month.split('-').map(Number)
      return {
        name: formatMonthYear(m, y),
        Inntekt: data.inntekt,
        Utgift: data.utgift,
        Netto: data.inntekt - data.utgift,
      }
    })

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-neu">
        <p className="text-sm font-medium text-slate-300 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm" style={{ color: p.color }}>
            {p.name}: {formatNOK(p.value)}
          </p>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maanedlig oversikt</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Ikke nok data for maanedlig oversikt
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
                />
                <Bar dataKey="Inntekt" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Utgift" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
