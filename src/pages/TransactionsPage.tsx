import { useState } from 'react'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Search, Upload } from 'lucide-react'
import { useStore } from '@/lib/store'
import { SYSTEM_CATEGORIES, autoCategorize } from '@/lib/categories'
import { parseNorwegianAmount } from '@/lib/format'

export function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const { accounts, addTransaction } = useStore()

  const categoryOptions = [
    { value: '', label: 'Alle kategorier' },
    ...SYSTEM_CATEGORIES.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ]

  function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || accounts.length === 0) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter((l) => l.trim())
      const defaultAccountId = accounts[0].id

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(';').map((p) => p.replace(/"/g, '').trim())
        if (parts.length < 3) continue

        const date = parts[0]
        const description = parts[1]
        const amountStr = parts[2]

        const dateParts = date.split('.')
        let isoDate: string
        if (dateParts.length === 3) {
          isoDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
        } else {
          isoDate = date
        }

        const amount = parseNorwegianAmount(amountStr)
        if (amount === 0) continue

        const categoryId = autoCategorize(description) ?? 'cat-annet'
        const type = amount > 0 ? 'inntekt' : 'utgift'

        addTransaction({
          accountId: defaultAccountId,
          categoryId,
          amount: Math.abs(amount),
          type,
          description,
          date: isoDate,
          tags: [],
        })
      }
      setShowImport(false)
    }
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Transaksjoner</h1>
          <p className="text-sm text-slate-400 mt-1">Oversikt over alle inn- og utbetalinger</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload size={16} />
            Importer
          </Button>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus size={16} />
            Ny transaksjon
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Sok i transaksjoner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fjord-500/50 focus:border-fjord-500"
          />
        </div>
        <Select
          options={categoryOptions}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="sm:w-52"
        />
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-fjord-500/50 sm:w-44"
        />
      </div>

      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 shadow-neu backdrop-blur-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="p-4">
          <TransactionList
            searchQuery={search}
            filterCategory={filterCategory || undefined}
            filterMonth={filterMonth || undefined}
          />
        </div>
      </div>

      <Dialog open={showForm} onClose={() => setShowForm(false)} title="Ny transaksjon">
        <TransactionForm onClose={() => setShowForm(false)} />
      </Dialog>

      <Dialog open={showImport} onClose={() => setShowImport(false)} title="Importer fra CSV">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Last opp en CSV-fil fra banken din (Sbanken, Sparebanken Vest, o.l.).
            Forventet format: Dato;Beskrivelse;Belop (semikolonseparert).
          </p>
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-fjord-500/50 transition-colors">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleCSVImport}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer text-sm text-slate-400 hover:text-slate-200"
            >
              <Upload size={24} className="mx-auto mb-2 text-slate-500" />
              Klikk for aa velge CSV-fil
            </label>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
