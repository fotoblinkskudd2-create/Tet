'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface Claim {
  id: number;
  title: string;
  description: string;
  author_username: string;
}

interface Argument {
  id: number;
  content: string;
  side: 'pro' | 'con';
  author_username: string;
  vote_count: number;
  ai_score: number | null;
  ai_summary: string | null;
  fallacies: string | null;
  source_url: string | null;
}

export default function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [arguments, setArguments] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(true);
  const [newArgument, setNewArgument] = useState({ side: 'pro', content: '', source_url: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClaim();
  }, [id]);

  const loadClaim = () => {
    fetch(`/api/claims/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setClaim(data.claim);
        setArguments(data.arguments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const submitArgument = async () => {
    if (newArgument.content.length < 20) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/arguments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: parseInt(id),
          ...newArgument,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Trigger AI analysis
        await fetch(`/api/arguments/${data.argument.id}/analyze`, {
          method: 'POST',
        });

        setNewArgument({ side: 'pro', content: '', source_url: '' });
        loadClaim();
      }
    } catch (error) {
      console.error('Failed to submit argument:', error);
    }
    setSubmitting(false);
  };

  const vote = async (argumentId: number, value: number) => {
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argument_id: argumentId, value }),
      });
      loadClaim();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Laster...</div>;
  if (!claim) return <div className="p-8 text-center">Påstand ikke funnet</div>;

  const proArgs = arguments.filter((a) => a.side === 'pro');
  const conArgs = arguments.filter((a) => a.side === 'con');

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
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">{claim.title}</h1>
          <p className="text-gray-300 mb-4">{claim.description}</p>
          <p className="text-sm text-gray-500">av {claim.author_username}</p>
        </div>

        {/* New Argument Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Legg til argument</h2>
          <div className="mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                checked={newArgument.side === 'pro'}
                onChange={() => setNewArgument({ ...newArgument, side: 'pro' })}
              />
              <span className="text-green-400">FOR påstanden</span>
            </label>
            <label className="flex items-center gap-4 mt-2">
              <input
                type="radio"
                checked={newArgument.side === 'con'}
                onChange={() => setNewArgument({ ...newArgument, side: 'con' })}
              />
              <span className="text-red-400">MOT påstanden</span>
            </label>
          </div>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 mb-4"
            rows={4}
            placeholder="Skriv ditt argument (min 20 tegn)..."
            value={newArgument.content}
            onChange={(e) => setNewArgument({ ...newArgument, content: e.target.value })}
          />
          <input
            type="url"
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 mb-4"
            placeholder="Kilde URL (valgfri)"
            value={newArgument.source_url}
            onChange={(e) => setNewArgument({ ...newArgument, source_url: e.target.value })}
          />
          <button
            onClick={submitArgument}
            disabled={submitting || newArgument.content.length < 20}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-2 rounded"
          >
            {submitting ? 'Sender...' : 'Send inn'}
          </button>
        </div>

        {/* Arguments Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* PRO Column */}
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              ✓ FOR ({proArgs.length})
            </h2>
            <div className="space-y-4">
              {proArgs.map((arg) => (
                <ArgumentCard key={arg.id} argument={arg} onVote={vote} />
              ))}
            </div>
          </div>

          {/* CON Column */}
          <div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              ✗ MOT ({conArgs.length})
            </h2>
            <div className="space-y-4">
              {conArgs.map((arg) => (
                <ArgumentCard key={arg.id} argument={arg} onVote={vote} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ArgumentCard({
  argument,
  onVote,
}: {
  argument: Argument;
  onVote: (id: number, value: number) => void;
}) {
  const fallacies = argument.fallacies ? JSON.parse(argument.fallacies) : [];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <p className="mb-3">{argument.content}</p>

      {argument.source_url && (
        <a
          href={argument.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 text-sm hover:underline block mb-3"
        >
          Kilde
        </a>
      )}

      {argument.ai_score !== null && (
        <div className="bg-gray-900 border border-gray-700 rounded p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">AI-analyse</span>
            <span className="text-yellow-400 font-bold">
              {argument.ai_score}/10
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-2">{argument.ai_summary}</p>
          {fallacies.length > 0 && (
            <div className="text-xs text-orange-400">
              Mulige feil: {fallacies.join(', ')}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">av {argument.author_username}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVote(argument.id, 1)}
            className="hover:text-green-400"
          >
            ▲
          </button>
          <span className="font-bold">{argument.vote_count}</span>
          <button
            onClick={() => onVote(argument.id, -1)}
            className="hover:text-red-400"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
