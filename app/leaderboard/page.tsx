'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Debater {
  username: string;
  rating: number;
  argument_count: number;
  avg_ai_score: number;
}

interface TopClaim {
  id: number;
  title: string;
  author: string;
  argument_count: number;
  pro_count: number;
  con_count: number;
}

export default function LeaderboardPage() {
  const [topDebaters, setTopDebaters] = useState<Debater[]>([]);
  const [topClaims, setTopClaims] = useState<TopClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        setTopDebaters(data.topDebaters || []);
        setTopClaims(data.topClaims || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-red-500 hover:text-red-400">
            ← Tilbake
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Leaderboard</h1>

        {loading ? (
          <div className="text-center text-gray-400">Laster...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Top Debaters */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                🏆 Beste debattanter
              </h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                {topDebaters.length === 0 ? (
                  <p className="p-6 text-gray-400 text-center">
                    Ingen debattanter ennå
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Bruker</th>
                        <th className="px-4 py-3 text-center">Args</th>
                        <th className="px-4 py-3 text-center">AI-score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDebaters.map((debater, index) => (
                        <tr
                          key={debater.username}
                          className="border-t border-gray-700"
                        >
                          <td className="px-4 py-3 font-bold">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">{debater.username}</td>
                          <td className="px-4 py-3 text-center">
                            {debater.argument_count}
                          </td>
                          <td className="px-4 py-3 text-center text-yellow-400 font-bold">
                            {debater.avg_ai_score.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Top Claims */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">
                🔥 Mest kontroversielle
              </h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                {topClaims.length === 0 ? (
                  <p className="text-gray-400 text-center">
                    Ingen påstander ennå
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topClaims.map((claim, index) => (
                      <Link
                        key={claim.id}
                        href={`/claims/${claim.id}`}
                        className="block bg-gray-900 hover:bg-gray-700 rounded-lg p-4 transition"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl font-bold text-gray-600">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2 line-clamp-2">
                              {claim.title}
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">
                                av {claim.author}
                              </span>
                              <div className="flex gap-3">
                                <span className="text-green-400">
                                  {claim.pro_count} FOR
                                </span>
                                <span className="text-red-400">
                                  {claim.con_count} MOT
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
