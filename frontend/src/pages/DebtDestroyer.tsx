import { useState } from 'react'
import { getDebtStrategy } from '../lib/gemini'
import {
  BanknotesIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid'

interface Debt {
  id: string
  name: string
  amount: number
  rate: number
}

export default function DebtDestroyer() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [strategy, setStrategy] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [newDebt, setNewDebt] = useState({
    name: '',
    amount: 0,
    rate: 0
  })

  const addDebt = () => {
    if (newDebt.name && newDebt.amount > 0) {
      setDebts([...debts, {
        ...newDebt,
        id: Date.now().toString()
      }])
      setNewDebt({ name: '', amount: 0, rate: 0 })
    }
  }

  const removeDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id))
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0)
  const totalInterest = debts.reduce((sum, d) => sum + (d.amount * d.rate / 100), 0)

  const generateStrategy = async () => {
    if (debts.length === 0 || monthlyPayment <= 0) return

    setLoading(true)
    try {
      const result = await getDebtStrategy(totalDebt, monthlyPayment, debts)
      setStrategy(result)
    } catch (error) {
      console.error('Failed to generate strategy:', error)
      setStrategy('Kunne ikke generere strategi. Sjekk API-tilkobling.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-blood">Gjeldsknuser</h1>
        <p className="text-gray-400 mt-1">Frihet fra renteslaveriet starter her</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="text-gray-400 text-sm">Total gjeld</div>
          <div className="text-2xl font-bold text-blood">
            {totalDebt.toLocaleString('no-NO')} kr
          </div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">Årlig rente</div>
          <div className="text-2xl font-bold text-yellow-500">
            {totalInterest.toLocaleString('no-NO')} kr
          </div>
        </div>
      </div>

      {/* Add Debt Form */}
      <div className="card space-y-4">
        <h3 className="font-bold text-lg">Legg til gjeld</h3>

        <div>
          <label className="block text-sm font-bold mb-2">Navn</label>
          <input
            type="text"
            value={newDebt.name}
            onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
            placeholder="Kredittkort, lån, etc."
            className="input-field w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Beløp (kr)</label>
            <input
              type="number"
              value={newDebt.amount || ''}
              onChange={(e) => setNewDebt({...newDebt, amount: parseFloat(e.target.value) || 0})}
              placeholder="50000"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Rente (%)</label>
            <input
              type="number"
              step="0.1"
              value={newDebt.rate || ''}
              onChange={(e) => setNewDebt({...newDebt, rate: parseFloat(e.target.value) || 0})}
              placeholder="15.5"
              className="input-field w-full"
            />
          </div>
        </div>

        <button
          onClick={addDebt}
          className="btn-secondary w-full flex items-center justify-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Legg til</span>
        </button>
      </div>

      {/* Debt List */}
      {debts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Dine gjeld</h3>
          {debts.map((debt) => (
            <div key={debt.id} className="card flex items-center justify-between">
              <div>
                <h4 className="font-bold">{debt.name}</h4>
                <p className="text-sm text-gray-400">
                  {debt.amount.toLocaleString('no-NO')} kr @ {debt.rate}%
                </p>
                <p className="text-xs text-yellow-500">
                  Årlig rente: {(debt.amount * debt.rate / 100).toLocaleString('no-NO')} kr
                </p>
              </div>
              <button
                onClick={() => removeDebt(debt.id)}
                className="p-2 hover:bg-blood/20 rounded-lg transition-colors"
              >
                <TrashIcon className="h-5 w-5 text-blood" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Payment */}
      {debts.length > 0 && (
        <div className="card">
          <label className="block text-sm font-bold mb-2">
            Hvor mye kan du betale per måned?
          </label>
          <input
            type="number"
            value={monthlyPayment || ''}
            onChange={(e) => setMonthlyPayment(parseFloat(e.target.value) || 0)}
            placeholder="5000"
            className="input-field w-full"
          />
          <p className="text-xs text-gray-400 mt-2">
            Minimum anbefalt: {(totalDebt * 0.02).toLocaleString('no-NO')} kr
          </p>
        </div>
      )}

      {/* Generate Strategy Button */}
      {debts.length > 0 && monthlyPayment > 0 && (
        <button
          onClick={generateStrategy}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Genererer strategi...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              <span>Få AI-strategi</span>
            </>
          )}
        </button>
      )}

      {/* Strategy Results */}
      {strategy && (
        <div className="card border-2 border-blood bg-blood/5">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-blood" />
            <h3 className="font-bold text-lg">Din frihetsstrategi</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 text-sm font-mono">
              {strategy}
            </pre>
          </div>
        </div>
      )}

      {/* Empty State */}
      {debts.length === 0 && (
        <div className="card text-center py-8">
          <BanknotesIcon className="h-12 w-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">
            Legg til din gjeld for å begynne planleggingen
          </p>
        </div>
      )}

      {/* Motivation */}
      <div className="card bg-gradient-to-br from-blood/20 to-steel border-blood">
        <h4 className="font-bold mb-2">Sannheten om gjeld</h4>
        <p className="text-sm text-gray-300">
          Hver krone du betaler i rente er en krone stjålet fra din fremtid.
          Systemet tjener på din gjeld. Bryt fri. Betal ned. Bli fri.
        </p>
      </div>
    </div>
  )
}
