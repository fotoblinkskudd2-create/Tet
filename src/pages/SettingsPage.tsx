import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Trash2, Database, Info } from 'lucide-react'

export function SettingsPage() {
  const { userEmail, seedDemoData, accounts, transactions } = useStore()

  function clearAllData() {
    if (confirm('Er du sikker paa at du vil slette all data? Dette kan ikke angres.')) {
      localStorage.removeItem('bergenbudget-storage')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-100">Innstillinger</h1>
        <p className="text-sm text-slate-400 mt-1">Administrer din konto og data</p>
      </div>

      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info size={18} className="text-fjord-400" />
            <CardTitle>Kontoinformasjon</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">E-post</span>
              <span className="text-slate-200">{userEmail ?? 'Ikke innlogget'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kontoer</span>
              <span className="text-slate-200">{accounts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Transaksjoner</span>
              <span className="text-slate-200">{transactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Datalagring</span>
              <span className="text-slate-200">Lokal (nettleser)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database size={18} className="text-fjord-400" />
            <CardTitle>Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button onClick={seedDemoData} variant="secondary" className="w-full">
              Last inn demodata
            </Button>
            <Button onClick={clearAllData} variant="danger" className="w-full">
              <Trash2 size={16} />
              Slett all data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-fjord-400" />
            <CardTitle>Om BergenBudget</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            BergenBudget er en personlig okonomitracker bygget for Bergensere.
            All data lagres lokalt i nettleseren din og deles ikke med noen.
          </p>
          <p className="text-xs text-slate-600 mt-3">Versjon 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  )
}
