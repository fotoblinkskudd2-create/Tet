import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    genre: '',
    location: '',
    main_conflict: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();

      // Redirect to the script viewer page
      router.push(`/script/${data.script.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>🎬 AI Regissør</h1>
        <p className="tagline">Filmmanus på sekunder</p>
      </div>

      <form onSubmit={handleSubmit} className="script-form">
        <div className="form-group">
          <label htmlFor="genre">Sjanger</label>
          <input
            type="text"
            id="genre"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            placeholder="Horror, Action, Drama, Sci-Fi..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Sted</label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Oslo, New York, Mars..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="conflict">Hovedkonflikt</label>
          <textarea
            id="conflict"
            value={formData.main_conflict}
            onChange={(e) => setFormData({ ...formData, main_conflict: e.target.value })}
            placeholder="En programmerer må redde verden fra en ondsinnet AI..."
            rows={4}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? '✨ Genererer manus...' : '🎬 Generer Filmmanus'}
        </button>
      </form>

      <div className="features">
        <div className="feature">
          <span className="feature-icon">📝</span>
          <h3>10-15 Scener</h3>
          <p>Komplett manus med dialog og scenebeskrivelser</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🎥</span>
          <h3>Kameravinkler</h3>
          <p>Profesjonelle kamerateknikker inkludert</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🎭</span>
          <h3>Cast Skuespillere</h3>
          <p>Velg dine favorittskuespillere til rollene</p>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .hero {
          text-align: center;
          margin-bottom: 50px;
        }

        .hero h1 {
          font-size: 3rem;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tagline {
          font-size: 1.2rem;
          color: #666;
          margin-top: 10px;
        }

        .script-form {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          margin-bottom: 50px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        input,
        textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .submit-button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-message {
          color: #e53e3e;
          background: #fff5f5;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-top: 50px;
        }

        .feature {
          text-align: center;
          padding: 20px;
        }

        .feature-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 15px;
        }

        .feature h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .feature p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        @media (max-width: 600px) {
          .hero h1 {
            font-size: 2rem;
          }

          .script-form {
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
}
