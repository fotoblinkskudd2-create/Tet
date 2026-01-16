import { useState } from 'react';
import Link from 'next/link';

interface IdeaCategory {
  name: string;
  description: string;
}

interface GeneratedIdea {
  id: string;
  title: string;
  description: string;
  categories: IdeaCategory[];
  details: {
    targetAudience: string;
    implementation: string[];
    monetization: string[];
    timeline: string;
    resources: string[];
  };
  affiliateOpportunities: {
    platforms: string[];
    strategies: string[];
    estimatedCommission: string;
  };
  createdAt: string;
}

export default function IdeaGeneratorPage() {
  const [keywords, setKeywords] = useState('');
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedIdea(null);

    try {
      const keywordArray = keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywordArray.length === 0) {
        throw new Error('Vennligst legg til minst ett søkeord');
      }

      const response = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywordArray }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke generere idé');
      }

      setGeneratedIdea(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="idea-generator-page">
      <style jsx>{`
        .idea-generator-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        h1 {
          font-size: 2em;
          margin-bottom: 10px;
          color: #1d1d1f;
        }

        .subtitle {
          color: #86868b;
          margin-bottom: 30px;
          font-size: 1.1em;
        }

        form {
          background: #f5f5f7;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
        }

        label {
          display: block;
          margin-bottom: 10px;
          font-weight: 500;
          color: #1d1d1f;
        }

        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d2d2d7;
          border-radius: 8px;
          font-size: 16px;
          margin-top: 5px;
          box-sizing: border-box;
          -webkit-appearance: none;
        }

        input:focus {
          outline: none;
          border-color: #0071e3;
        }

        .hint {
          font-size: 0.9em;
          color: #86868b;
          margin-top: 5px;
        }

        button {
          width: 100%;
          padding: 14px;
          background: #0071e3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 15px;
          -webkit-appearance: none;
        }

        button:hover:not(:disabled) {
          background: #0077ed;
        }

        button:disabled {
          background: #d2d2d7;
          cursor: not-allowed;
        }

        .error {
          background: #ff3b30;
          color: white;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .idea-result {
          background: white;
          border: 1px solid #d2d2d7;
          border-radius: 12px;
          padding: 25px;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .idea-title {
          font-size: 1.8em;
          margin-bottom: 15px;
          color: #1d1d1f;
        }

        .idea-description {
          color: #1d1d1f;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 1.1em;
        }

        .categories {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }

        .category-badge {
          background: #e8f4fd;
          color: #0071e3;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 500;
        }

        .section {
          margin-bottom: 25px;
        }

        .section-title {
          font-size: 1.3em;
          margin-bottom: 12px;
          color: #1d1d1f;
          font-weight: 600;
        }

        .section-content {
          color: #515154;
          line-height: 1.6;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        li {
          padding: 8px 0;
          border-bottom: 1px solid #f5f5f7;
        }

        li:last-child {
          border-bottom: none;
        }

        li:before {
          content: "✓ ";
          color: #34c759;
          font-weight: bold;
          margin-right: 8px;
        }

        .affiliate-section {
          background: #f5f5f7;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .back-link {
          display: inline-block;
          margin-top: 20px;
          color: #0071e3;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .idea-generator-page {
            padding: 15px;
          }

          h1 {
            font-size: 1.5em;
          }

          .idea-title {
            font-size: 1.4em;
          }
        }
      `}</style>

      <h1>💡 Idegenerator</h1>
      <p className="subtitle">
        Skriv inn nøkkelord og få rike, detaljerte ideer med affiliate-muligheter
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Nøkkelord
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="React, iOS, app, innovasjon"
            required
          />
          <span className="hint">
            Skill med komma for flere nøkkelord
          </span>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? '🔄 Genererer idé...' : '✨ Generer Idé'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {generatedIdea && (
        <div className="idea-result">
          <h2 className="idea-title">{generatedIdea.title}</h2>

          <div className="categories">
            {generatedIdea.categories.map((cat, idx) => (
              <span key={idx} className="category-badge" title={cat.description}>
                {cat.name}
              </span>
            ))}
          </div>

          <p className="idea-description">{generatedIdea.description}</p>

          <div className="section">
            <h3 className="section-title">🎯 Målgruppe</h3>
            <p className="section-content">{generatedIdea.details.targetAudience}</p>
          </div>

          <div className="section">
            <h3 className="section-title">🛠 Implementering</h3>
            <ul>
              {generatedIdea.details.implementation.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h3 className="section-title">💰 Inntektsmodeller</h3>
            <ul>
              {generatedIdea.details.monetization.map((model, idx) => (
                <li key={idx}>{model}</li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h3 className="section-title">📅 Tidslinje</h3>
            <p className="section-content">{generatedIdea.details.timeline}</p>
          </div>

          <div className="section">
            <h3 className="section-title">📦 Ressurser</h3>
            <ul>
              {generatedIdea.details.resources.map((resource, idx) => (
                <li key={idx}>{resource}</li>
              ))}
            </ul>
          </div>

          <div className="affiliate-section">
            <h3 className="section-title">🤝 Affiliate-muligheter</h3>

            <div className="section">
              <h4>Plattformer:</h4>
              <ul>
                {generatedIdea.affiliateOpportunities.platforms.map((platform, idx) => (
                  <li key={idx}>{platform}</li>
                ))}
              </ul>
            </div>

            <div className="section">
              <h4>Strategier:</h4>
              <ul>
                {generatedIdea.affiliateOpportunities.strategies.map((strategy, idx) => (
                  <li key={idx}>{strategy}</li>
                ))}
              </ul>
            </div>

            <div className="section">
              <h4>Estimert provisjon:</h4>
              <p className="section-content">
                {generatedIdea.affiliateOpportunities.estimatedCommission}
              </p>
            </div>
          </div>

          <Link href="/ideas" className="back-link">
            ← Tilbake til oversikt
          </Link>
        </div>
      )}
    </div>
  );
}
