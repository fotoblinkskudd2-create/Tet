'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewClaimPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, tags }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/claims/${data.claim.id}`);
      } else {
        setError(data.error || 'Kunne ikke opprette påstand');
      }
    } catch (err) {
      setError('Noe gikk galt');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-red-500 hover:text-red-400">
            ← Tilbake
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Ny påstand</h1>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Tittel (10-200 tegn)
              </label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded p-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                minLength={10}
                maxLength={200}
                placeholder="f.eks. Universiteter er bortkastet tid for 90% av folk"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Beskrivelse (20-2000 tegn)
              </label>
              <textarea
                className="w-full bg-gray-900 border border-gray-700 rounded p-3"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={20}
                maxLength={2000}
                placeholder="Utdyp påstanden din med kontekst og begrunnelse..."
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Tags (valgfri, kommaseparert)
              </label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded p-3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="politikk, filosofi, tech, kunst"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded font-semibold"
            >
              {loading ? 'Oppretter...' : 'Opprett påstand'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
