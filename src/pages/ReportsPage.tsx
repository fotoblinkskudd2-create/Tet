import { MonthlyOverview } from '@/components/reports/MonthlyOverview'
import { NetWorthChart } from '@/components/reports/NetWorthChart'
import { ExportButtons } from '@/components/reports/ExportButtons'

export function ReportsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Rapporter</h1>
          <p className="text-sm text-slate-400 mt-1">Analyser og eksporter din okonomi</p>
        </div>
        <ExportButtons />
      </div>

      <div className="space-y-6 animate-slide-up">
        <MonthlyOverview />
        <NetWorthChart />
      </div>
    </div>
  )
}
