import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CuratorPage() {
  const router = useRouter();
  const [vibeDescription, setVibeDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vibes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibeDescription }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke generere vibe');
      }

      // Redirect to the generated vibe page
      router.push(`/curator/${data.id}`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const exampleVibes = [
    'Kjørende gjennom regnvåt Oslo natt kl 03, full av speed og eksistensiell angst',
    'Morgensol gjennom vinduet, kaffe i hånden, alt føles mulig',
    'Alene på fjellet, vind i ansiktet, frihetsfølelse',
    'Nattklubb kl 02, svettig, forelsket, alt er kaos',
    'Søndagsdepresjon, regn mot vinduet, alt er meningsløst',
  ];

  return (
    <div className="curator-page">
      <div className="curator-header">
        <h1>🎵 Ultimate Vibe Playlist Curator</h1>
        <p>Beskriv din vibe superdetaljert, så lager jeg den perfekte playlisten for deg</p>
      </div>

      <form onSubmit={handleSubmit} className="curator-form">
        <div className="form-group">
          <label htmlFor="vibe">
            Beskriv din vibe i detalj
          </label>
          <textarea
            id="vibe"
            value={vibeDescription}
            onChange={(e) => setVibeDescription(e.target.value)}
            placeholder="F.eks: Kjørende gjennom regnvåt Oslo natt kl 03, full av speed og eksistensiell angst"
            rows={6}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading || !vibeDescription.trim()}>
          {loading ? '✨ Genererer magisk playlist...' : '🎨 Generer Vibe'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="examples">
        <h3>Eksempler på vibes:</h3>
        <ul>
          {exampleVibes.map((vibe, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => setVibeDescription(vibe)}
                className="example-button"
                disabled={loading}
              >
                "{vibe}"
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-links">
        <Link href="/curator/my-vibes">Se mine lagrede vibes</Link>
      </div>
    </div>
  );
}
