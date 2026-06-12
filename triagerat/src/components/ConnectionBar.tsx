'use client';

import { useEffect, useState } from 'react';
import type { RepoRef } from '@/lib/types';

interface ConnectionState {
  connected: boolean;
  repo: RepoRef | null;
}

export default function ConnectionBar() {
  const [state, setState] = useState<ConnectionState | null>(null);
  const [repoInput, setRepoInput] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/connection');
    const data = await res.json();
    setState(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repoInput, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tilkobling feilet');
      setToken('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await fetch('/api/connect', { method: 'DELETE' });
    await load();
  };

  if (!state) return null;

  if (state.connected && state.repo) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm">
        <span>
          Tilkoblet <strong>{state.repo.owner}/{state.repo.repo}</strong>
        </span>
        <button onClick={handleDisconnect} className="rounded-md border border-green-300 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-100">
          Koble fra
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConnect} className="mb-6 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Koble til GitHub-repo</h2>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="owner/repo eller https://github.com/owner/repo"
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <input
          type="password"
          placeholder="GitHub personal access token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Kobler til...' : 'Koble til'}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Token lagres kun i en httpOnly-cookie for denne sesjonen og sendes aldri til Supabase eller LLM.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
