import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SYSTEM_CATEGORIES } from '@/lib/categories'
import type { TransactionType, Frequency } from '@/lib/types'

interface RecurringFormProps {
  onClose: () => void
  editId?: string
}

export function RecurringForm({ onClose, editId }: RecurringFormProps) {
  const { accounts, recurrings, addRecurring, updateRecurring } = useStore()
  const existing = editId ? recurrings.find((r) => r.id === editId) : null

  const [description, setDescription] = useState(existing?.description ?? '')
  const [amount, setAmount] = useState(existing?.amount.toString() ?? '')
  const [type, setType] = useState<TransactionType>(existing?.type ?? 'utgift')
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '')
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts[0]?.id ?? '')
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency ?? 'månedlig')
  const [dayOfMonth, setDayOfMonth] = useState(existing?.dayOfMonth?.toString() ?? '1')
  const [nextDate, setNextDate] = useState(existing?.nextDate ?? new Date().toISOString().split('T')[0])
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'Beskrivelse er paakrevd'
    if (!amount || parseFloat(amount) <= 0) errs.amount = 'Ugyldig belop'
    if (!accountId) errs.accountId = 'Velg en konto'
    if (!categoryId) errs.categoryId = 'Velg en kategori'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const data = {
      accountId,
      categoryId,
      amount: parseFloat(amount),
      type: type as 'inntekt' | 'utgift',
      description: description.trim(),
      frequency,
      dayOfMonth: parseInt(dayOfMonth) || undefined,
      nextDate,
      isActive: true,
    }

    if (editId) {
      updateRecurring(editId, data)
    } else {
      addRecurring(data)
    }
    onClose()
  }

  const categoryOptions = SYSTEM_CATEGORIES.map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }))

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.icon} ${a.name}`,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="description"
        label="Beskrivelse"
        placeholder="F.eks. Husleie"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="amount"
          label="Belop (kr)"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
        />
        <Select
          id="type"
          label="Type"
          options={[
            { value: 'utgift', label: 'Utgift' },
            { value: 'inntekt', label: 'Inntekt' },
          ]}
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
        />
      </div>

      <Select
        id="category"
        label="Kategori"
        options={categoryOptions}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        placeholder="Velg kategori..."
        error={errors.categoryId}
      />

      <Select
        id="account"
        label="Konto"
        options={accountOptions}
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        placeholder="Velg konto..."
        error={errors.accountId}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          id="frequency"
          label="Frekvens"
          options={[
            { value: 'daglig', label: 'Daglig' },
            { value: 'ukentlig', label: 'Ukentlig' },
            { value: 'månedlig', label: 'Maanedlig' },
            { value: 'årlig', label: 'Aarlig' },
          ]}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
        />
        <Input
          id="dayOfMonth"
          label="Dag i maneden"
          type="number"
          min="1"
          max="31"
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(e.target.value)}
        />
      </div>

      <Input
        id="nextDate"
        label="Neste dato"
        type="date"
        value={nextDate}
        onChange={(e) => setNextDate(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Avbryt
        </Button>
        <Button type="submit" className="flex-1">
          {editId ? 'Oppdater' : 'Legg til'}
        </Button>
      </div>
    </form>
  )
}
