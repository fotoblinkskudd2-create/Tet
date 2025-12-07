'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Claim {
  id: number;
  title: string;
  description: string;
  author_username: string;
  pro_count: number;
  con_count: number;
  created_at: string;
}

export default function Home() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/claims')
      .then((res) => res.json())
      .then((data) => {
        setClaims(data.claims || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-red-500">
              ⚔️ DebattDome
            </h1>
            <nav className="flex gap-4">
              <Link href="/leaderboard" className="text-gray-300 hover:text-white">
                Leaderboard
              </Link>
              <Link href="/login" className="text-gray-300 hover:text-white">
                Logg inn
              </Link>
              <Link href="/register" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                Registrer
              </Link>
            </nav>
          </div>
          <p className="mt-2 text-gray-400">
            AI-drevet gladiatorarena for argumentasjon
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/claims/new"
            className="inline-block bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
          >
            + Ny påstand
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Laster påstander...</div>
        ) : claims.length === 0 ? (
          <div className="text-center text-gray-400">
            Ingen påstander ennå. Vær den første til å starte en debatt!
          </div>
        ) : (
          <div className="grid gap-4">
            {claims.map((claim) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition"
              >
                <h2 className="text-xl font-bold mb-2">{claim.title}</h2>
                <p className="text-gray-400 mb-4 line-clamp-2">
                  {claim.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    av {claim.author_username}
                  </span>
                  <div className="flex gap-4">
                    <span className="text-green-400">
                      ✓ {claim.pro_count} FOR
                    </span>
                    <span className="text-red-400">
                      ✗ {claim.con_count} MOT
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
