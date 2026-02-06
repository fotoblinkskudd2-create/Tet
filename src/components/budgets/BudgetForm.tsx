import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SYSTEM_CATEGORIES } from '@/lib/categories'
import { getCurrentPeriod } from '@/lib/format'

interface BudgetFormProps {
  onClose: () => void
}

export function BudgetForm({ onClose }: BudgetFormProps) {
  const setBudget = useStore((s) => s.setBudget)
  const { month, year } = getCurrentPeriod()

  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(month)
  const [selectedYear, setSelectedYear] = useState(year)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const expenseCategories = SYSTEM_CATEGORIES.filter(
    (c) => c.id !== 'cat-lonn' && c.id !== 'cat-feriepenger'
  )

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.categoryId = 'Velg en kategori'
    if (!amount || parseFloat(amount) <= 0) errs.amount = 'Ugyldig belop'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setBudget({
      categoryId,
      amount: parseFloat(amount),
      month: selectedMonth,
      year: selectedYear,
    })
    onClose()
  }

  const categoryOptions = expenseCategories.map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }))

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2026, i, 1).toLocaleString('nb-NO', { month: 'long' }),
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="category"
        label="Kategori"
        options={categoryOptions}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        placeholder="Velg kategori..."
        error={errors.categoryId}
      />

      <Input
        id="amount"
        label="Manedlig budsjett (kr)"
        type="number"
        step="0.01"
        placeholder="0,00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          id="month"
          label="Maned"
          options={monthOptions}
          value={String(selectedMonth)}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        />
        <Input
          id="year"
          label="Aar"
          type="number"
          value={String(selectedYear)}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Avbryt
        </Button>
        <Button type="submit" className="flex-1">
          Sett budsjett
        </Button>
      </div>
    </form>
  )
}
