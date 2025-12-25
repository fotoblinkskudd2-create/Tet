import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function GenerateNovelPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/novels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, tone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kunne ikke starte generering');
      }

      const data = await response.json();
      router.push(`/novels/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const examplePresets = [
    {
      title: 'Kannibal-Kristiania',
      genre: 'Historisk horror',
      tone: 'Dekadent og mørk',
    },
    {
      title: 'Trollskauen',
      genre: 'Norsk folklore',
      tone: 'Mystisk og eventyrlig',
    },
    {
      title: 'Blodmånen',
      genre: 'Vampyrroman',
      tone: 'Romantisk gotisk',
    },
  ];

  const applyPreset = (preset: typeof examplePresets[0]) => {
    setTitle(preset.title);
    setGenre(preset.genre);
    setTone(preset.tone);
  };

  return (
    <div className="generate-page">
      <div className="generate-container">
        <Link href="/novels" className="back-link">
          ← Tilbake til mine romaner
        </Link>

        <h1>✍️ One-Click Romanforfatter</h1>
        <p className="subtitle">
          Generer en komplett 70-siders novelle med Claude AI
        </p>

        <form onSubmit={handleSubmit} className="generate-form">
          <div className="form-group">
            <label htmlFor="title">Tittel</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. 'Kannibal-Kristiania'"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="genre">Sjanger</label>
            <input
              id="genre"
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="F.eks. 'Historisk horror'"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tone">Tone</label>
            <input
              id="tone"
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="F.eks. 'Dekadent og mørk'"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-generate"
            disabled={loading}
          >
            {loading ? '⏳ Starter generering...' : '🚀 Generer roman'}
          </button>
        </form>

        <div className="examples">
          <h3>💡 Eksempler:</h3>
          <div className="example-cards">
            {examplePresets.map((preset, idx) => (
              <div
                key={idx}
                className="example-card"
                onClick={() => applyPreset(preset)}
              >
                <h4>{preset.title}</h4>
                <p><strong>Sjanger:</strong> {preset.genre}</p>
                <p><strong>Tone:</strong> {preset.tone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
