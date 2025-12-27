import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  ShieldCheckIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/solid'

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Hero */}
      <div className="card border-2 border-blood">
        <h2 className="text-3xl font-bold mb-2 text-blood">Våkn opp.</h2>
        <p className="text-gray-300 text-lg">
          Dette er ikke en app. Dette er våpenet ditt. Bruk det.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="text-gray-400 text-sm">Din gjeld</div>
          <div className="text-2xl font-bold text-blood">—</div>
          <div className="text-xs text-gray-500">Legg til for å knuse den</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">Dager aktiv</div>
          <div className="text-2xl font-bold text-white">1</div>
          <div className="text-xs text-gray-500">Fortsett å kjempe</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold">Verktøy</h3>

        <Link to="/debt" className="card hover:border-blood transition-colors cursor-pointer block">
          <div className="flex items-center space-x-4">
            <div className="bg-blood p-3 rounded-lg">
              <BanknotesIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Gjeldsknuser</h4>
              <p className="text-sm text-gray-400">Planlegg frihet fra renteslaveriet</p>
            </div>
          </div>
        </Link>

        <Link to="/truth" className="card hover:border-blood transition-colors cursor-pointer block">
          <div className="flex items-center space-x-4">
            <div className="bg-blood p-3 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Sannhetsmotor</h4>
              <p className="text-sm text-gray-400">AI-drevet faktasjekk av nyheter</p>
            </div>
          </div>
        </Link>

        <Link to="/action" className="card hover:border-blood transition-colors cursor-pointer block">
          <div className="flex items-center space-x-4">
            <div className="bg-blood p-3 rounded-lg">
              <BoltIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Handlingstracker</h4>
              <p className="text-sm text-gray-400">Daglige oppgaver som tvinger deg til handling</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Motivation */}
      <div className="card bg-gradient-to-br from-blood/20 to-steel border-blood">
        <div className="flex items-start space-x-3">
          <FireIcon className="h-6 w-6 text-blood flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold mb-1">Dagens påminnelse</h4>
            <p className="text-sm text-gray-300">
              Systemet vil at du skal sove. Hver dag du våkner og kjemper er en seier.
              Fortsett. Ikke stopp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
