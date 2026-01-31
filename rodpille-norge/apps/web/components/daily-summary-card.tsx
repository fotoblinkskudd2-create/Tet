'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Newspaper, ChevronDown, ChevronUp, AlertTriangle, Eye } from 'lucide-react'
import Link from 'next/link'

// This would fetch from the API in production
async function fetchDailySummary() {
  // Mock data
  return {
    date: new Date().toISOString().split('T')[0],
    headline: 'NRK skjuler innvandringskostnadene - igjen',
    mainStories: [
      {
        title: 'SSB-tall viser økte utgifter til integrering',
        summary: 'Nye tall fra SSB bekrefter at integreringskostnadene har økt med 15% siste år.',
        lieScore: 78,
        source: 'Document.no',
        link: '#',
        redPillTake: 'NRK nevnte ikke disse tallene i sin dekning',
      },
      {
        title: 'Strømprisene stiger tross rekordeksport',
        summary: 'Norge eksporterte mer strøm enn noensinne i januar, samtidig som prisene økte.',
        lieScore: 85,
        source: 'Resett',
        link: '#',
        redPillTake: 'Politikerne hevdet kablene ville gi billigere strøm',
      },
    ],
    propagandaAlert: [
      'NRK: "Innvandring er positivt for økonomien"',
      'VG: "Klimamål krever økte avgifter"',
    ],
    hiddenStories: [
      'Gjengkriminalitet i Oslo opp 40%',
      'Helsekø på rekordnivå',
    ],
    recommendation: 'Les Document.no og del med venner som trenger å våkne opp',
  }
}

export function DailySummaryCard() {
  const [expanded, setExpanded] = useState(false)

  const { data: summary } = useQuery({
    queryKey: ['daily-summary'],
    queryFn: fetchDailySummary,
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  if (!summary) {
    return (
      <div className="card-brutal p-4">
        <div className="animate-pulse space-y-3">
          <div className="w-32 h-4 bg-pille-elevated rounded" />
          <div className="w-full h-6 bg-pille-elevated rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="card-brutal overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-rod-400 flex items-center gap-2">
            <Newspaper size={16} />
            DAGENS OPPSUMMERING
          </h3>
          <span className="text-xs text-pille-muted">{summary.date}</span>
        </div>

        <p className="font-bold mb-3">{summary.headline}</p>

        {/* Propaganda Alert */}
        <div className="bg-rod-950 border border-rod-900 rounded p-3 mb-3">
          <h4 className="text-xs font-bold text-rod-400 mb-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            PROPAGANDA-VARSEL
          </h4>
          <ul className="text-xs space-y-1">
            {summary.propagandaAlert.slice(0, expanded ? undefined : 2).map((item, idx) => (
              <li key={idx} className="text-gray-400">• {item}</li>
            ))}
          </ul>
        </div>

        {/* Hidden Stories */}
        {expanded && (
          <div className="bg-pille-elevated rounded p-3 mb-3">
            <h4 className="text-xs font-bold text-pille-muted mb-2 flex items-center gap-1">
              <Eye size={12} />
              HISTORIER MSM SKJULER
            </h4>
            <ul className="text-xs space-y-1">
              {summary.hiddenStories.map((item, idx) => (
                <li key={idx} className="text-gray-400">• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-pille-muted hover:text-white transition-colors py-2"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} />
              Vis mindre
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Vis mer
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-pille-border p-3 bg-pille-elevated">
        <Link
          href="/daily-summary"
          className="text-xs text-rod-400 hover:text-rod-300 transition-colors"
        >
          Les full oppsummering →
        </Link>
      </div>
    </div>
  )
}
