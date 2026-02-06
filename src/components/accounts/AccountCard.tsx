import type { Account } from '@/lib/types'
import { formatNOK } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { Trash2, Edit3 } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  brukskonto: 'Brukskonto',
  sparekonto: 'Sparekonto',
  kredittkort: 'Kredittkort',
  bsu: 'BSU',
}

interface AccountCardProps {
  account: Account
  onEdit: () => void
  onDelete: () => void
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${account.color} 0%, transparent 60%)`,
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: `${account.color}20` }}
            >
              {account.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">{account.name}</h3>
              <p className="text-xs text-slate-500">{TYPE_LABELS[account.type] ?? account.type}</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <p
          className="text-2xl font-bold"
          style={{ color: account.color }}
        >
          {formatNOK(account.balance)}
        </p>
      </div>
    </Card>
  )
}
