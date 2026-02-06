import { useState } from 'react'
import { useStore } from '@/lib/store'
import { getCategoryById } from '@/lib/categories'
import { formatNOK, formatDateNO } from '@/lib/format'
import { ArrowUpRight, ArrowDownRight, Trash2, Edit3 } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { TransactionForm } from './TransactionForm'
import { Button } from '@/components/ui/button'

interface TransactionListProps {
  filterMonth?: string
  filterCategory?: string
  filterAccount?: string
  searchQuery?: string
}

export function TransactionList({ filterMonth, filterCategory, filterAccount, searchQuery }: TransactionListProps) {
  const { transactions, accounts, deleteTransaction } = useStore()
  const [editId, setEditId] = useState<string | null>(null)

  let filtered = [...transactions]

  if (filterMonth) {
    filtered = filtered.filter((t) => t.date.startsWith(filterMonth))
  }
  if (filterCategory) {
    filtered = filtered.filter((t) => t.categoryId === filterCategory)
  }
  if (filterAccount) {
    filtered = filtered.filter((t) => t.accountId === filterAccount)
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }

  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const grouped = new Map<string, typeof filtered>()
  for (const tx of filtered) {
    const dateKey = tx.date
    if (!grouped.has(dateKey)) grouped.set(dateKey, [])
    grouped.get(dateKey)!.push(tx)
  }

  return (
    <>
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          Ingen transaksjoner funnet
        </p>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([dateKey, txs]) => (
            <div key={dateKey}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">
                {formatDateNO(dateKey)}
              </p>
              <div className="space-y-1">
                {txs.map((tx) => {
                  const cat = getCategoryById(tx.categoryId)
                  const account = accounts.find((a) => a.id === tx.accountId)
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                          style={{ backgroundColor: `${cat?.color ?? '#94a3b8'}15` }}
                        >
                          {cat?.icon ?? '📦'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{tx.description}</p>
                          <p className="text-xs text-slate-500">
                            {cat?.name ?? 'Ukjent'} · {account?.name ?? 'Ukjent konto'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <div className="flex items-center gap-1">
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
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditId(tx.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editId} onClose={() => setEditId(null)} title="Rediger transaksjon">
        {editId && <TransactionForm editId={editId} onClose={() => setEditId(null)} />}
      </Dialog>
    </>
  )
}
