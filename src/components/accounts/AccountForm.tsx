import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { AccountType } from '@/lib/types'

interface AccountFormProps {
  onClose: () => void
  editId?: string
}

const ACCOUNT_ICONS = ['💳', '🏦', '💰', '🏡', '📈', '🪙']
const ACCOUNT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

export function AccountForm({ onClose, editId }: AccountFormProps) {
  const { accounts, addAccount, updateAccount } = useStore()
  const existing = editId ? accounts.find((a) => a.id === editId) : null

  const [name, setName] = useState(existing?.name ?? '')
  const [type, setType] = useState<AccountType>(existing?.type ?? 'brukskonto')
  const [balance, setBalance] = useState(existing?.balance.toString() ?? '0')
  const [icon, setIcon] = useState(existing?.icon ?? '💳')
  const [color, setColor] = useState(existing?.color ?? '#3b82f6')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Navn er paakrevd'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const data = {
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      icon,
      color,
    }

    if (editId) {
      updateAccount(editId, data)
    } else {
      addAccount(data)
    }
    onClose()
  }

  const typeOptions = [
    { value: 'brukskonto', label: 'Brukskonto' },
    { value: 'sparekonto', label: 'Sparekonto' },
    { value: 'kredittkort', label: 'Kredittkort' },
    { value: 'bsu', label: 'BSU' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        label="Kontonavn"
        placeholder="F.eks. Brukskonto Sparebanken Vest"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <Select
        id="type"
        label="Kontotype"
        options={typeOptions}
        value={type}
        onChange={(e) => setType(e.target.value as AccountType)}
      />

      <Input
        id="balance"
        label="Startsaldo (kr)"
        type="number"
        step="0.01"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Ikon</label>
        <div className="flex gap-2">
          {ACCOUNT_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                icon === ic
                  ? 'bg-fjord-600/30 border-2 border-fjord-500 scale-110'
                  : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Farge</label>
        <div className="flex gap-2">
          {ACCOUNT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${
                color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Avbryt
        </Button>
        <Button type="submit" className="flex-1">
          {editId ? 'Oppdater' : 'Opprett konto'}
        </Button>
      </div>
    </form>
  )
}
