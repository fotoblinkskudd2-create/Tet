import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCategoryById } from '@/lib/categories'
import { formatNOK, formatDateNO } from '@/lib/format'
import { CalendarClock } from 'lucide-react'

export function UpcomingRecurrings() {
  const recurrings = useStore((s) => s.recurrings)

  const now = new Date()
  const sevenDaysOut = new Date(now)
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7)

  const upcoming = recurrings
    .filter((r) => {
      if (!r.isActive) return false
      const nextDate = new Date(r.nextDate)
      return nextDate >= now && nextDate <= sevenDaysOut
    })
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarClock size={18} className="text-fjord-400" />
          <CardTitle>Kommende faste utgifter</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Ingen faste utgifter de neste 7 dagene
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((r) => {
              const cat = getCategoryById(r.categoryId)
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cat?.icon ?? '📦'}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{r.description}</p>
                      <p className="text-xs text-slate-500">{formatDateNO(r.nextDate)}</p>
                    </div>
                  </div>
                  <Badge variant={r.type === 'inntekt' ? 'success' : 'danger'}>
                    {r.type === 'inntekt' ? '+' : '−'}{formatNOK(r.amount)}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
