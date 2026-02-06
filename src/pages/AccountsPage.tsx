import { useState } from 'react'
import { useStore } from '@/lib/store'
import { AccountCard } from '@/components/accounts/AccountCard'
import { AccountForm } from '@/components/accounts/AccountForm'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatNOK } from '@/lib/format'
import { Plus, Wallet } from 'lucide-react'

export function AccountsPage() {
  const { accounts, deleteAccount } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Kontoer</h1>
          <p className="text-sm text-slate-400 mt-1">
            Total saldo: <span className="text-fjord-400 font-semibold">{formatNOK(totalBalance)}</span>
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} />
          Ny konto
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Wallet size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Ingen kontoer enna</h3>
          <p className="text-sm text-slate-500 mt-1">Legg til din forste konto for aa komme i gang</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus size={16} />
            Opprett konto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account, i) => (
            <div key={account.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <AccountCard
                account={account}
                onEdit={() => setEditId(account.id)}
                onDelete={() => deleteAccount(account.id)}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={showForm || !!editId}
        onClose={() => {
          setShowForm(false)
          setEditId(null)
        }}
        title={editId ? 'Rediger konto' : 'Ny konto'}
      >
        <AccountForm
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
