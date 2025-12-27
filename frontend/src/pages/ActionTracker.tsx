import { useState } from 'react'
import { CheckCircleIcon, XCircleIcon, FireIcon } from '@heroicons/react/24/solid'

interface Action {
  id: string
  title: string
  description: string
  completed: boolean
  category: 'physical' | 'mental' | 'political' | 'financial'
}

const defaultActions: Action[] = [
  {
    id: '1',
    title: 'Tren kroppen',
    description: '30 min fysisk aktivitet. Ingen unnskyldninger.',
    completed: false,
    category: 'physical'
  },
  {
    id: '2',
    title: 'Les sannhet',
    description: 'Les minst én alternativ nyhetskilde',
    completed: false,
    category: 'mental'
  },
  {
    id: '3',
    title: 'Betal ekstra på gjeld',
    description: 'Selv 50kr er fremgang',
    completed: false,
    category: 'financial'
  },
  {
    id: '4',
    title: 'Kontakt politiker',
    description: 'Send epost, ring, krev svar',
    completed: false,
    category: 'political'
  }
]

export default function ActionTracker() {
  const [actions, setActions] = useState<Action[]>(defaultActions)
  const [streak] = useState(1)

  const toggleAction = (id: string) => {
    setActions(actions.map(a =>
      a.id === id ? { ...a, completed: !a.completed } : a
    ))
  }

  const completedCount = actions.filter(a => a.completed).length
  const totalCount = actions.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'physical': return 'bg-green-600'
      case 'mental': return 'bg-blue-600'
      case 'political': return 'bg-purple-600'
      case 'financial': return 'bg-yellow-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-blood">Handlingstracker</h1>
        <p className="text-gray-400 mt-1">Hver handling er en seier mot apati</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center space-x-2">
            <FireIcon className="h-5 w-5 text-blood" />
            <span className="text-gray-400 text-sm">Streak</span>
          </div>
          <div className="text-3xl font-bold text-blood">{streak}</div>
          <div className="text-xs text-gray-500">dager i strekk</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">I dag</div>
          <div className="text-3xl font-bold">{completedCount}/{totalCount}</div>
          <div className="w-full bg-concrete rounded-full h-2 mt-2">
            <div
              className="bg-blood h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Warning */}
      {completedCount === 0 && (
        <div className="card border-2 border-blood bg-blood/10">
          <p className="text-sm text-blood font-bold">
            ⚠️ Du har ikke fullført noen oppgaver i dag. Systemet vinner hvis du gir opp.
          </p>
        </div>
      )}

      {/* Actions List */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold">Dagens oppgaver</h3>
        {actions.map(action => (
          <div
            key={action.id}
            onClick={() => toggleAction(action.id)}
            className={`card cursor-pointer transition-all ${
              action.completed
                ? 'border-green-500 bg-green-500/10'
                : 'border-concrete hover:border-blood'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {action.completed ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-bold ${action.completed ? 'line-through text-gray-500' : ''}`}>
                    {action.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(action.category)}`}>
                    {action.category}
                  </span>
                </div>
                <p className={`text-sm ${action.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                  {action.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motivation */}
      {completedCount === totalCount && (
        <div className="card border-2 border-green-500 bg-green-500/10">
          <h4 className="font-bold text-green-400 mb-2">🔥 Fullført!</h4>
          <p className="text-sm text-gray-300">
            Du har knust dagens mål. Fortsett slik. Systemet har ingen makt over deg nå.
          </p>
        </div>
      )}
    </div>
  )
}
