'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, HelpCircle, X } from 'lucide-react'
import { LieAnalysis } from '@rodpille/database'

interface LieBadgeProps {
  score: number
  analysis?: LieAnalysis | null
}

export function LieBadge({ score, analysis }: LieBadgeProps) {
  const [showPopover, setShowPopover] = useState(false)

  const getScoreConfig = (score: number) => {
    if (score >= 70) {
      return {
        label: 'Høy løgn-score',
        className: 'lie-badge-high',
        icon: AlertTriangle,
      }
    } else if (score >= 40) {
      return {
        label: 'Delvis villedende',
        className: 'lie-badge-medium',
        icon: HelpCircle,
      }
    } else {
      return {
        label: 'Fakta-sjekket',
        className: 'lie-badge-low',
        icon: CheckCircle,
      }
    }
  }

  const config = getScoreConfig(score)
  const Icon = config.icon

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        className={`lie-badge ${config.className}`}
      >
        <Icon size={12} />
        <span>{score}%</span>
      </button>

      {/* Popover */}
      {showPopover && analysis && (
        <div className="absolute z-50 left-0 top-full mt-2 w-80 bg-pille-card border border-pille-border rounded shadow-brutal-lg animate-slide-up">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-rod-400">Løgn-analyse</h4>
              <button
                onClick={() => setShowPopover(false)}
                className="text-pille-muted hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-pille-muted">Løgn-score</span>
                  <span className={`font-bold ${score >= 70 ? 'text-rod-500' : score >= 40 ? 'text-orange-500' : 'text-green-500'}`}>
                    {score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-pille-border rounded-full overflow-hidden">
                  <div
                    className={`h-full ${score >= 70 ? 'bg-rod-500' : score >= 40 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <p className="text-pille-muted">{analysis.summary}</p>
              </div>

              {/* Claims */}
              {analysis.claims && analysis.claims.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Påstander:</h5>
                  <ul className="space-y-2">
                    {analysis.claims.slice(0, 3).map((claim, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className={`
                          mt-0.5 px-1.5 py-0.5 text-xs rounded
                          ${claim.verdict === 'false' ? 'bg-rod-900 text-rod-400' :
                            claim.verdict === 'misleading' ? 'bg-orange-900 text-orange-400' :
                            claim.verdict === 'true' ? 'bg-green-900 text-green-400' :
                            'bg-gray-800 text-gray-400'}
                        `}>
                          {claim.verdict === 'false' ? 'USANT' :
                           claim.verdict === 'misleading' ? 'VILLEDENDE' :
                           claim.verdict === 'true' ? 'SANT' : '?'}
                        </span>
                        <span className="text-gray-300">{claim.claim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Known lies match */}
              {analysis.knownLieMatches && analysis.knownLieMatches.length > 0 && (
                <div className="bg-rod-950 border border-rod-900 rounded p-2">
                  <h5 className="font-medium text-rod-400 mb-1">Matcher kjent løgn:</h5>
                  <p className="text-xs text-gray-400">
                    {analysis.knownLieMatches[0].party}: "{analysis.knownLieMatches[0].claim}"
                  </p>
                </div>
              )}

              {/* AI Reasoning */}
              {analysis.aiReasoning && (
                <div className="text-xs text-pille-muted">
                  <strong>AI-resonnering:</strong> {analysis.aiReasoning.substring(0, 200)}...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
