'use client';

import { useEffect, useState } from 'react';
import ConnectionBar from '@/components/ConnectionBar';
import type { ActionHistoryRecord } from '@/lib/types';

export default function HistoryPage() {
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState<ActionHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    const res = await fetch('/api/connection');
    const data = await res.json();
    setConnected(Boolean(data.connected));
    return data.connected;
  };

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunne ikke hente historikk');
      setHistory(data.history);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection().then((isConnected) => {
      if (isConnected) loadHistory();
    });
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">History</h1>
      <ConnectionBar />

      {connected && (
        <>
          <button
            onClick={loadHistory}
            disabled={loading}
            className="mb-3 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Laster...' : 'Oppdater'}
          </button>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            {history.length === 0 && !loading && (
              <p className="p-6 text-center text-sm text-gray-500">Ingen handlinger utført ennå.</p>
            )}
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">Tid</th>
                  <th className="px-4 py-2">Issue</th>
                  <th className="px-4 py-2">Handling</th>
                  <th className="px-4 py-2">Modus</th>
                  <th className="px-4 py-2">Resultat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-4 py-2 text-gray-500">{new Date(h.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 font-medium">#{h.issue_number}</td>
                    <td className="px-4 py-2">{h.action_type}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${h.dry_run ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {h.dry_run ? 'dry-run' : 'live'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{h.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
