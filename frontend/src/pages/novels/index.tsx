import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Novel {
  id: string;
  title: string;
  genre: string;
  tone: string;
  status: 'generating' | 'completed' | 'failed';
  totalChapters: number;
  currentChapter: number;
  createdAt: string;
  updatedAt: string;
}

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const response = await fetch('/api/novels');
      if (response.ok) {
        const data = await response.json();
        setNovels(data);
      }
    } catch (error) {
      console.error('Feil ved henting av romaner:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNovel = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne romanen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/novels/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNovels(novels.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Feil ved sletting av roman:', error);
    }
  };

  const getStatusText = (novel: Novel) => {
    if (novel.status === 'generating') {
      return `Genererer kapittel ${novel.currentChapter} av ${novel.totalChapters}...`;
    }
    if (novel.status === 'completed') {
      return `Ferdig (${novel.totalChapters} kapitler)`;
    }
    return 'Feilet';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'generating': return 'status-generating';
      case 'completed': return 'status-completed';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="novels-page">
        <h1>Mine Romaner</h1>
        <p>Laster...</p>
      </div>
    );
  }

  return (
    <div className="novels-page">
      <div className="header">
        <h1>Mine Romaner</h1>
        <Link href="/novels/generate" className="btn-primary">
          ✍️ Skriv ny roman
        </Link>
      </div>

      {novels.length === 0 ? (
        <div className="empty-state">
          <p>Du har ingen romaner ennå.</p>
          <Link href="/novels/generate" className="btn-primary">
            Skriv din første roman
          </Link>
        </div>
      ) : (
        <div className="novels-grid">
          {novels.map(novel => (
            <div key={novel.id} className="novel-card">
              <div className="novel-header">
                <h2>{novel.title}</h2>
                <span className={`status-badge ${getStatusClass(novel.status)}`}>
                  {getStatusText(novel)}
                </span>
              </div>
              <div className="novel-meta">
                <span className="genre">{novel.genre}</span>
                <span className="tone">{novel.tone}</span>
              </div>
              <div className="novel-actions">
                {novel.status === 'completed' && (
                  <Link href={`/novels/${novel.id}`} className="btn-view">
                    📖 Les roman
                  </Link>
                )}
                {novel.status === 'generating' && (
                  <Link href={`/novels/${novel.id}`} className="btn-view">
                    👁️ Se fremdrift
                  </Link>
                )}
                <button
                  onClick={() => deleteNovel(novel.id)}
                  className="btn-delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
