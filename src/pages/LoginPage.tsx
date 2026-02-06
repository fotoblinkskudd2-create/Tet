import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const login = useStore((s) => s.login)
  const seedDemoData = useStore((s) => s.seedDemoData)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('E-post er paakrevd')
      return
    }
    if (!password || password.length < 6) {
      setError('Passord maa vaere minst 6 tegn')
      return
    }
    login(email.trim())
    seedDemoData()
  }

  function handleDemo() {
    login('demo@bergenbudget.no')
    seedDemoData()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-fjord-950 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fjord-500 to-fjord-700 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-glow">
            B
          </div>
          <h1 className="text-3xl font-bold text-slate-100">BergenBudget</h1>
          <p className="text-slate-400 mt-2">Din personlige okonomitracker</p>
        </div>

        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-6 shadow-neu backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="E-post"
              type="email"
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
            />
            <Input
              id="password"
              label="Passord"
              type="password"
              placeholder="Minst 6 tegn"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg">
              Logg inn
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <Button onClick={handleDemo} variant="ghost" className="w-full" size="lg">
              Prove med demodata
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Demoversjon - data lagres lokalt i nettleseren
        </p>
      </div>
    </div>
  )
}
