'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/providers'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import HCaptcha from '@hcaptcha/react-hcaptcha'

export default function SignupPage() {
  const router = useRouter()
  const { signUp, signInWithOAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const passwordStrength = () => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passordene matcher ikke')
      return
    }

    if (passwordStrength() < 2) {
      setError('Passordet er for svakt. Bruk minst 8 tegn med store bokstaver, tall eller spesialtegn.')
      return
    }

    if (username.length < 3) {
      setError('Brukernavnet må være minst 3 tegn')
      return
    }

    // In production, validate captcha
    // if (!captchaToken) {
    //   setError('Vennligst bekreft at du ikke er en bot')
    //   return
    // }

    setIsLoading(true)

    try {
      await signUp(email, password, username)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Registrering feilet. Prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-black mb-4">VELKOMMEN TIL BEVEGELSEN</h1>
          <p className="text-pille-muted mb-6">
            Vi har sendt en bekreftelseslenke til <strong>{email}</strong>.
            Sjekk innboksen din for å aktivere kontoen.
          </p>
          <Link href="/login" className="btn-brutal">
            Gå til innlogging
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">VÅKN OPP</h1>
          <p className="text-pille-muted">Bli en del av bevegelsen</p>
        </div>

        <div className="card-brutal p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-rod-950 border border-rod-900 rounded text-rod-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Brukernavn
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-pille-muted" size={18} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="input-brutal pl-10"
                  placeholder="rod_pille_kriger"
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>
              <p className="text-xs text-pille-muted mt-1">
                Kun små bokstaver, tall og understrek
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-post
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-pille-muted" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-brutal pl-10"
                  placeholder="din@epost.no"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Passord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-pille-muted" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-brutal pl-10 pr-10"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pille-muted hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          passwordStrength() >= level
                            ? level <= 1 ? 'bg-rod-500' : level <= 2 ? 'bg-orange-500' : 'bg-green-500'
                            : 'bg-pille-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-pille-muted mt-1">
                    {passwordStrength() <= 1 ? 'Svakt' : passwordStrength() <= 2 ? 'OK' : passwordStrength() <= 3 ? 'Sterkt' : 'Veldig sterkt'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Bekreft passord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-pille-muted" size={18} />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-brutal pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-rod-400 mt-1">Passordene matcher ikke</p>
              )}
            </div>

            {/* CAPTCHA - uncomment in production */}
            {/* <div className="flex justify-center">
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                onVerify={setCaptchaToken}
                theme="dark"
              />
            </div> */}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 rounded border-pille-border bg-pille-bg"
              />
              <label htmlFor="terms" className="text-sm text-pille-muted">
                Jeg godtar{' '}
                <Link href="/terms" className="text-rod-400 hover:text-rod-300">
                  vilkårene
                </Link>
                {' '}og{' '}
                <Link href="/privacy" className="text-rod-400 hover:text-rod-300">
                  personvernerklæringen
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-brutal w-full disabled:opacity-50"
            >
              {isLoading ? 'Registrerer...' : 'Bli med i bevegelsen'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pille-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-pille-card px-2 text-pille-muted">Eller</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => signInWithOAuth('google')}
              className="btn-brutal-outline w-full flex items-center justify-center gap-2"
            >
              Fortsett med Google
            </button>
            <button
              onClick={() => signInWithOAuth('twitter')}
              className="btn-brutal-outline w-full flex items-center justify-center gap-2"
            >
              Fortsett med X
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-pille-muted">
          Allerede registrert?{' '}
          <Link href="/login" className="text-rod-400 hover:text-rod-300">
            Logg inn
          </Link>
        </p>
      </div>
    </div>
  )
}
