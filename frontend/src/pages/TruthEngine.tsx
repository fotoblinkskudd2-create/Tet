import { useState } from 'react'
import { analyzeNews, type NewsAnalysis } from '../lib/gemini'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid'

export default function TruthEngine() {
  const [articleText, setArticleText] = useState('')
  const [source, setSource] = useState('')
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!articleText.trim()) return

    setLoading(true)
    try {
      const result = await analyzeNews(articleText, source || 'Ukjent kilde')
      setAnalysis(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'truthful':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />
      case 'misleading':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
      case 'false':
        return <XCircleIcon className="h-8 w-8 text-red-500" />
      default:
        return <ShieldCheckIcon className="h-8 w-8 text-gray-500" />
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'truthful': return 'border-green-500 bg-green-500/10'
      case 'misleading': return 'border-yellow-500 bg-yellow-500/10'
      case 'false': return 'border-red-500 bg-red-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-blood">Sannhetsmotor</h1>
        <p className="text-gray-400 mt-1">AI-drevet faktasjekk. Ingen løgner slipper gjennom.</p>
      </div>

      {/* Input Section */}
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">
            Kilde (valgfritt)
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="VG, NRK, Aftenposten, etc."
            className="input-field w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">
            Artikkel eller påstand
          </label>
          <textarea
            value={articleText}
            onChange={(e) => setArticleText(e.target.value)}
            placeholder="Lim inn artikkeltekst eller en påstand du vil faktasjekke..."
            rows={8}
            className="input-field w-full resize-none"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !articleText.trim()}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Analyserer...</span>
            </>
          ) : (
            <>
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Analyser sannhet</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Verdict */}
          <div className={`card border-2 ${getVerdictColor(analysis.verdict)}`}>
            <div className="flex items-center space-x-4 mb-4">
              {getVerdictIcon(analysis.verdict)}
              <div>
                <h3 className="text-xl font-bold uppercase">{analysis.verdict}</h3>
                <p className="text-sm text-gray-400">
                  Sikkerhet: {analysis.confidence}%
                </p>
              </div>
            </div>

            <div className="w-full bg-steel rounded-full h-2">
              <div
                className="bg-blood h-2 rounded-full transition-all"
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="card">
            <h4 className="font-bold mb-2">Oppsummering</h4>
            <p className="text-gray-300 text-sm">{analysis.summary}</p>
          </div>

          {/* Ownership */}
          <div className="card">
            <h4 className="font-bold mb-2">Eierskap & Interesser</h4>
            <p className="text-gray-300 text-sm">{analysis.ownership}</p>
          </div>

          {/* Bias */}
          {analysis.biasDetected.length > 0 && (
            <div className="card border-yellow-500">
              <h4 className="font-bold mb-2 text-yellow-500">⚠️ Bias funnet</h4>
              <ul className="space-y-1">
                {analysis.biasDetected.map((bias, i) => (
                  <li key={i} className="text-sm text-gray-300">• {bias}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="card border-red-500 bg-red-500/10">
              <h4 className="font-bold mb-2 text-red-500">🚨 Advarsler</h4>
              <ul className="space-y-1">
                {analysis.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-gray-300">• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {analysis.sources.length > 0 && (
            <div className="card">
              <h4 className="font-bold mb-2">Kilder</h4>
              <ul className="space-y-1">
                {analysis.sources.map((source, i) => (
                  <li key={i} className="text-sm text-gray-300">• {source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!analysis && !loading && (
        <div className="card text-center py-8">
          <ShieldCheckIcon className="h-12 w-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">
            Lim inn en artikkel eller påstand for å starte analysen
          </p>
        </div>
      )}

      {/* Info */}
      <div className="card bg-steel/50">
        <h4 className="font-bold mb-2 text-sm">Hvordan det fungerer</h4>
        <p className="text-xs text-gray-400">
          Sannhetsmotoren bruker Gemini AI til å analysere nyheter for bias, eierskap,
          og faktasjekke påstander mot kjente kilder. Ingen algoritme er perfekt - bruk
          din egen dømmekraft også.
        </p>
      </div>
    </div>
  )
}
