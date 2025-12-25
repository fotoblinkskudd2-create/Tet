import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface PlaylistTrack {
  title: string;
  artist: string;
  album?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
}

interface Vibe {
  id: string;
  userId: string;
  vibeDescription: string;
  playlistData: PlaylistTrack[];
  coverArtDescription: string;
  gonzoText: string;
  colorPalette: string[];
  createdAt: string;
}

export default function VibePage() {
  const router = useRouter();
  const { id } = router.query;
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchVibe = async () => {
      try {
        const response = await fetch(`/api/vibes/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Kunne ikke laste vibe');
        }

        setVibe(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchVibe();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Kunne ikke kopiere lenke');
    }
  };

  const handleExportPlaylist = () => {
    if (!vibe) return;

    const playlistText = vibe.playlistData
      .map((track, i) => `${i + 1}. ${track.artist} - ${track.title}${track.album ? ` (${track.album})` : ''}`)
      .join('\n');

    const fullText = `${vibe.vibeDescription}\n\n${playlistText}`;

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-${vibe.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="vibe-page loading">
        <p>Laster vibe...</p>
      </div>
    );
  }

  if (error || !vibe) {
    return (
      <div className="vibe-page error">
        <p className="error">{error || 'Vibe ikke funnet'}</p>
        <Link href="/curator">Tilbake til curator</Link>
      </div>
    );
  }

  return (
    <div className="vibe-page" style={{ '--primary-color': vibe.colorPalette[0] } as React.CSSProperties}>
      <div className="vibe-header">
        <h1>🎵 Din Vibe</h1>
        <div className="vibe-actions">
          <button onClick={handleShare} className="share-button">
            {copied ? '✅ Kopiert!' : '🔗 Del'}
          </button>
          <button onClick={handleExportPlaylist} className="export-button">
            💾 Eksporter
          </button>
        </div>
      </div>

      <section className="vibe-description">
        <h2>Viben din:</h2>
        <blockquote>{vibe.vibeDescription}</blockquote>
      </section>

      <section className="color-palette">
        <h2>Fargepalett:</h2>
        <div className="palette-grid">
          {vibe.colorPalette.map((color, index) => (
            <div
              key={index}
              className="color-swatch"
              style={{ backgroundColor: color }}
              title={color}
            >
              <span>{color}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cover-art">
        <h2>Omslagsbilde:</h2>
        <div className="cover-description">
          <p>{vibe.coverArtDescription}</p>
        </div>
      </section>

      <section className="gonzo-text">
        <h2>Stemningen:</h2>
        <div className="gonzo-content">
          <p>{vibe.gonzoText}</p>
        </div>
      </section>

      <section className="playlist">
        <h2>Playlisten ({vibe.playlistData.length} sanger):</h2>
        <ol className="track-list">
          {vibe.playlistData.map((track, index) => (
            <li key={index} className="track-item">
              <div className="track-info">
                <span className="track-title">{track.title}</span>
                <span className="track-artist">{track.artist}</span>
                {track.album && <span className="track-album">{track.album}</span>}
              </div>
              <div className="track-links">
                {track.spotifyUrl && (
                  <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">
                    Spotify
                  </a>
                )}
                {track.youtubeUrl && (
                  <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    YouTube
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="nav-links">
        <Link href="/curator">← Lag ny vibe</Link>
        <Link href="/curator/my-vibes">Se mine vibes</Link>
      </div>
    </div>
  );
}
