'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Innlogging feilet');
      }
    } catch (err) {
      setError('Noe gikk galt');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link href="/" className="text-red-500 hover:text-red-400 mb-8 inline-block">
          ← Tilbake
        </Link>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Logg inn</h1>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">E-post</label>
              <input
                type="email"
                className="w-full bg-gray-900 border border-gray-700 rounded p-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Passord</label>
              <input
                type="password"
                className="w-full bg-gray-900 border border-gray-700 rounded p-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded font-semibold"
            >
              {loading ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Har du ikke konto?{' '}
            <Link href="/register" className="text-red-400 hover:text-red-300">
              Registrer deg
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
