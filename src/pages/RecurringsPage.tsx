import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecurringForm } from '@/components/recurring/RecurringForm'
import { getCategoryById } from '@/lib/categories'
import { formatNOK, formatDateNO } from '@/lib/format'
import { Plus, Repeat, Trash2, Edit3, Pause, Play } from 'lucide-react'

const FREQ_LABELS: Record<string, string> = {
  daglig: 'Daglig',
  ukentlig: 'Ukentlig',
  'månedlig': 'Maanedlig',
  'årlig': 'Aarlig',
}

export function RecurringsPage() {
  const { recurrings, deleteRecurring, updateRecurring } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const sorted = [...recurrings].sort(
    (a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()
  )

  const totalMonthly = recurrings
    .filter((r) => r.isActive && r.frequency === 'månedlig')
    .reduce((sum, r) => sum + (r.type === 'utgift' ? r.amount : -r.amount), 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Faste utgifter</h1>
          <p className="text-sm text-slate-400 mt-1">
            Maanedlig fast: <span className="text-red-400 font-semibold">{formatNOK(totalMonthly)}</span>
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} />
          Ny fast utgift
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Repeat size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Ingen faste utgifter registrert</h3>
          <p className="text-sm text-slate-500 mt-1">Legg til husleie, lonn, abonnementer og annet</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus size={16} />
            Legg til
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r, i) => {
            const cat = getCategoryById(r.categoryId)
            return (
              <Card
                key={r.id}
                className={`animate-slide-up ${!r.isActive ? 'opacity-50' : ''}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                      style={{ backgroundColor: `${cat?.color ?? '#94a3b8'}15` }}
                    >
                      {cat?.icon ?? '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{r.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge>{FREQ_LABELS[r.frequency] ?? r.frequency}</Badge>
                        <span className="text-xs text-slate-500">
                          Neste: {formatDateNO(r.nextDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span
                      className={`text-sm font-semibold ${
                        r.type === 'inntekt' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {r.type === 'inntekt' ? '+' : '−'}{formatNOK(r.amount)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateRecurring(r.id, { isActive: !r.isActive })}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                        title={r.isActive ? 'Sett paa pause' : 'Aktiver'}
                      >
                        {r.isActive ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={() => setEditId(r.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteRecurring(r.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={showForm || !!editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
        }}
        title={editId ? 'Rediger fast utgift' : 'Ny fast utgift'}
      >
        <RecurringForm
          editId={editId ?? undefined}
          onClose={() => {
            setShowForm(false)
            setEditId(null)
          }}
        />
      </Dialog>
    </div>
  )
}
