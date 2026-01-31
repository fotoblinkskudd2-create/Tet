'use client'

import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

// Mock data - in production this would come from the API
const trendingTags = [
  { tag: 'Strømtyveri', count: 142, trending: true },
  { tag: 'NRKPropaganda', count: 98, trending: true },
  { tag: 'InnvandringKostnader', count: 87, trending: false },
  { tag: 'Elitekorrupsjon', count: 76, trending: true },
  { tag: 'Klimabløff', count: 65, trending: false },
  { tag: 'VåknOpp', count: 54, trending: false },
  { tag: 'MediaLøgn', count: 43, trending: true },
]

export function TrendingTags() {
  return (
    <div className="card-brutal p-4">
      <h3 className="font-bold text-rod-400 mb-3 flex items-center gap-2">
        <TrendingUp size={16} />
        TRENDING TAGS
      </h3>
      <div className="space-y-2">
        {trendingTags.map(({ tag, count, trending }) => (
          <Link
            key={tag}
            href={`/tag/${tag}`}
            className="flex items-center justify-between group"
          >
            <span className="text-sm text-pille-muted group-hover:text-white transition-colors">
              #{tag}
            </span>
            <div className="flex items-center gap-2">
              {trending && (
                <TrendingUp size={12} className="text-rod-500" />
              )}
              <span className="text-xs font-mono text-rod-400">{count}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
