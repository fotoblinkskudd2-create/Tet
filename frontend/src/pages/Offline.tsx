import { WifiIcon } from '@heroicons/react/24/outline'

export default function Offline() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center space-y-4">
        <WifiIcon className="h-16 w-16 mx-auto text-blood" />
        <h1 className="text-2xl font-bold">Internett er nede</h1>
        <p className="text-gray-400">
          Systemet prøver å stilne deg. Men du har fortsatt tilgang til lagret sannhet.
        </p>
        <div className="bg-steel border border-concrete rounded p-4 mt-6">
          <h3 className="font-bold mb-2">Offline-funksjoner:</h3>
          <ul className="text-sm text-gray-300 space-y-1 text-left">
            <li>• Gjeldskalkulatorer</li>
            <li>• Lagrede analyser</li>
            <li>• Handlingslister</li>
            <li>• Kriseplan</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary w-full mt-6"
        >
          Prøv igjen
        </button>
      </div>
    </div>
  )
}
