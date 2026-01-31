'use client'

import { useQuery } from '@tanstack/react-query'
import { createBrowserClient, queries } from '@rodpille/database'
import { Heart } from 'lucide-react'

const GOAL = 100000 * 100 // 100,000 kr in øre

export function DonationProgress() {
  const supabase = createBrowserClient()

  const { data: total = 0 } = useQuery({
    queryKey: ['donations-total'],
    queryFn: () => queries.getTotalDonations(supabase),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const progress = Math.min(100, (total / GOAL) * 100)
  const amountKr = (total / 100).toLocaleString('nb-NO')
  const goalKr = (GOAL / 100).toLocaleString('nb-NO')

  return (
    <div className="card-brutal p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Heart size={14} className="text-rod-500" />
          SAMLET INN FOR Å STYRTE PROPAGANDA-MASKINEN
        </h3>
        <a
          href="/donate"
          className="text-xs text-rod-400 hover:text-rod-300 transition-colors"
        >
          Doner nå →
        </a>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold font-mono text-rod-400">
          {amountKr}
        </span>
        <span className="text-pille-muted">
          av {goalKr} kr
        </span>
      </div>

      <div className="w-full h-3 bg-pille-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rod-700 via-rod-500 to-rod-400 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-pille-muted mt-2">
        {Math.round(progress)}% mot målet • Alle donasjoner er anonyme
      </p>
    </div>
  )
}
