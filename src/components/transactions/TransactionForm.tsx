import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SYSTEM_CATEGORIES, autoCategorize } from '@/lib/categories'
import type { TransactionType } from '@/lib/types'

interface TransactionFormProps {
  onClose: () => void
  editId?: string
}

export function TransactionForm({ onClose, editId }: TransactionFormProps) {
  const { accounts, transactions, addTransaction, updateTransaction } = useStore()
  const existing = editId ? transactions.find((t) => t.id === editId) : null

  const [description, setDescription] = useState(existing?.description ?? '')
  const [amount, setAmount] = useState(existing?.amount.toString() ?? '')
  const [type, setType] = useState<TransactionType>(existing?.type ?? 'utgift')
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '')
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts[0]?.id ?? '')
  const [date, setDate] = useState(existing?.date ?? new Date().toISOString().split('T')[0])
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!categoryId && description.length >= 3) {
      const suggested = autoCategorize(description)
      if (suggested) setCategoryId(suggested)
    }
  }, [description, categoryId])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'Beskrivelse er paakrevd'
    if (!amount || parseFloat(amount) <= 0) errs.amount = 'Ugyldig belop'
    if (!accountId) errs.accountId = 'Velg en konto'
    if (!categoryId) errs.categoryId = 'Velg en kategori'
    if (!date) errs.date = 'Velg en dato'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const txData = {
      accountId,
      categoryId,
      amount: parseFloat(amount),
      type,
      description: description.trim(),
      date,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notes: notes.trim() || undefined,
    }

    if (editId) {
      updateTransaction(editId, txData)
    } else {
      addTransaction(txData)
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

  const typeOptions = [
    { value: 'utgift', label: 'Utgift' },
    { value: 'inntekt', label: 'Inntekt' },
    { value: 'overføring', label: 'Overfoering' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="description"
        label="Beskrivelse"
        placeholder="F.eks. Meny Galleriet"
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
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
        />
        <Select
          id="type"
          label="Type"
          options={typeOptions}
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

      <Input
        id="date"
        label="Dato"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />

      <Input
        id="tags"
        label="Tagger (kommaseparert)"
        placeholder="mat, dagligvarer"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <Input
        id="notes"
        label="Notater"
        placeholder="Valgfritt..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
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
