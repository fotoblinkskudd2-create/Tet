import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vibe {
  id: string;
  userId: string;
  vibeDescription: string;
  colorPalette: string[];
  createdAt: string;
}

export default function MyVibesPage() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const response = await fetch('/api/vibes');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Kunne ikke laste vibes');
        }

        setVibes(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchVibes();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="my-vibes-page loading">
        <p>Laster dine vibes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-vibes-page error">
        <p className="error">{error}</p>
        <Link href="/curator">Tilbake til curator</Link>
      </div>
    );
  }

  return (
    <div className="my-vibes-page">
      <div className="page-header">
        <h1>🎵 Mine Vibes</h1>
        <Link href="/curator" className="create-button">
          ➕ Lag ny vibe
        </Link>
      </div>

      {vibes.length === 0 ? (
        <div className="empty-state">
          <p>Du har ingen lagrede vibes ennå.</p>
          <Link href="/curator">Lag din første vibe</Link>
        </div>
      ) : (
        <div className="vibes-grid">
          {vibes.map((vibe) => (
            <Link href={`/curator/${vibe.id}`} key={vibe.id} className="vibe-card">
              <div className="vibe-card-colors">
                {vibe.colorPalette.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="color-bar"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="vibe-card-content">
                <p className="vibe-card-description">{vibe.vibeDescription}</p>
                <time className="vibe-card-date">{formatDate(vibe.createdAt)}</time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
