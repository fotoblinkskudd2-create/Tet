import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Recommendation {
  id: string;
  score: number;
  reasoning: {
    summary: string;
    pros: string[];
    cons: string[];
    perfect_for: string[];
  };
  match_details: {
    budget_fit: number;
    feature_match: number;
    priority_alignment: number;
    value_score: number;
    overall_fit: number;
  };
  item: {
    id: string;
    name: string;
    description: string;
    monthly_price: number;
    deposit: number;
    specifications: Record<string, any>;
    provider: string;
    rating: number;
  };
}

export default function RecommendationsPage() {
  const router = useRouter();
  const { preference } = router.query;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    if (preference) {
      fetchRecommendations();
    }
  }, [preference]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/leasing/recommendations', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Kunne ikke hente anbefalinger');

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (itemId: string, recommendationId: string) => {
    try {
      const startDate = new Date().toISOString().split('T')[0];

      const response = await fetch('/api/leasing/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          recommendation_id: recommendationId,
          duration_months: 24,
          start_date: startDate,
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Kunne ikke opprette kontrakt');

      alert('Leasingavtale opprettet!');
      router.push('/leasing/dashboard');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Perfekt match!';
    if (score >= 75) return 'Meget godt valg';
    if (score >= 60) return 'Godt valg';
    if (score >= 45) return 'OK valg';
    return 'Mindre ideelt';
  };

  if (loading) {
    return (
      <div className="recommendations-page">
        <div className="loading">🤖 AI analyserer og genererer anbefalinger...</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-page">
        <div className="no-recommendations">
          <h2>Ingen anbefalinger funnet</h2>
          <p>Prøv å justere dine preferanser for å få bedre resultater.</p>
          <Link href="/leasing">Tilbake til hovedsiden</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <header>
        <Link href="/leasing" className="back-link">
          ← Tilbake
        </Link>
        <h1>🤖 AI-anbefalinger</h1>
        <p className="subtitle">
          Basert på dine preferanser har AI-en rangert disse alternativene for deg
        </p>
      </header>

      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div
            key={rec.id}
            className={`recommendation-card ${selectedItem === rec.item.id ? 'selected' : ''}`}
          >
            <div className="rank-badge" style={{ background: getScoreColor(rec.score) }}>
              #{index + 1}
            </div>

            <div className="recommendation-header">
              <div>
                <h2>{rec.item.name}</h2>
                <p className="provider">{rec.item.provider}</p>
              </div>
              <div className="score-badge" style={{ background: getScoreColor(rec.score) }}>
                <div className="score-number">{rec.score.toFixed(0)}</div>
                <div className="score-label">{getScoreLabel(rec.score)}</div>
              </div>
            </div>

            <div className="ai-reasoning">
              <h3>💡 AI-analyse</h3>
              <p className="summary">{rec.reasoning.summary}</p>

              <div className="pros-cons">
                {rec.reasoning.pros.length > 0 && (
                  <div className="pros">
                    <h4>✅ Fordeler:</h4>
                    <ul>
                      {rec.reasoning.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rec.reasoning.cons.length > 0 && (
                  <div className="cons">
                    <h4>⚠️ Ulemper:</h4>
                    <ul>
                      {rec.reasoning.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {rec.reasoning.perfect_for.length > 0 && (
                <div className="perfect-for">
                  <strong>Perfekt for:</strong> {rec.reasoning.perfect_for.join(', ')}
                </div>
              )}
            </div>

            <div className="match-details">
              <h4>Detaljert matching</h4>
              <div className="match-bars">
                <div className="match-bar">
                  <span>Budsjett-match</span>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${rec.match_details.budget_fit}%` }}
                    />
                  </div>
                  <span>{rec.match_details.budget_fit.toFixed(0)}%</span>
                </div>

                <div className="match-bar">
                  <span>Funksjoner</span>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${rec.match_details.feature_match}%` }}
                    />
                  </div>
                  <span>{rec.match_details.feature_match.toFixed(0)}%</span>
                </div>

                <div className="match-bar">
                  <span>Prioriteringer</span>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${rec.match_details.priority_alignment}%` }}
                    />
                  </div>
                  <span>{rec.match_details.priority_alignment.toFixed(0)}%</span>
                </div>

                <div className="match-bar">
                  <span>Verdi for pengene</span>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${rec.match_details.value_score}%` }}
                    />
                  </div>
                  <span>{rec.match_details.value_score.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="pricing-info">
              <div className="price">
                <span className="label">Månedsleie:</span>
                <span className="amount">kr {rec.item.monthly_price.toLocaleString()}</span>
              </div>
              <div className="deposit">
                <span className="label">Depositum:</span>
                <span className="amount">kr {rec.item.deposit.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="lease-button"
              onClick={() => handleCreateContract(rec.item.id, rec.id)}
            >
              Start leasing
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .recommendations-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        header {
          margin-bottom: 3rem;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 1rem;
          color: #667eea;
          text-decoration: none;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }

        .loading,
        .no-recommendations {
          text-align: center;
          padding: 3rem;
        }

        .loading {
          font-size: 1.3rem;
          color: #667eea;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .recommendation-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          transition: all 0.3s ease;
        }

        .recommendation-card:hover {
          border-color: #667eea;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
        }

        .recommendation-card.selected {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .rank-badge {
          position: absolute;
          top: -15px;
          left: 20px;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          margin-top: 1rem;
        }

        .recommendation-header h2 {
          margin: 0 0 0.3rem 0;
        }

        .provider {
          color: #999;
          font-size: 0.9rem;
        }

        .score-badge {
          text-align: center;
          color: white;
          padding: 1rem;
          border-radius: 15px;
          min-width: 120px;
        }

        .score-number {
          font-size: 2.5rem;
          font-weight: bold;
        }

        .score-label {
          font-size: 0.85rem;
          opacity: 0.95;
        }

        .ai-reasoning {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 15px;
          margin-bottom: 1.5rem;
        }

        .ai-reasoning h3 {
          margin-bottom: 1rem;
        }

        .summary {
          font-size: 1.05rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .pros-cons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1rem 0;
        }

        @media (max-width: 768px) {
          .pros-cons {
            grid-template-columns: 1fr;
          }
        }

        .pros h4,
        .cons h4 {
          margin-bottom: 0.5rem;
        }

        .pros ul,
        .cons ul {
          padding-left: 1.2rem;
          margin: 0;
        }

        .pros li {
          color: #2e7d32;
          margin-bottom: 0.3rem;
        }

        .cons li {
          color: #d32f2f;
          margin-bottom: 0.3rem;
        }

        .perfect-for {
          margin-top: 1rem;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        .match-details {
          margin-bottom: 1.5rem;
        }

        .match-details h4 {
          margin-bottom: 1rem;
        }

        .match-bars {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .match-bar {
          display: grid;
          grid-template-columns: 140px 1fr 50px;
          align-items: center;
          gap: 1rem;
          font-size: 0.9rem;
        }

        .bar {
          height: 20px;
          background: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
        }

        .pricing-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .pricing-info .label {
          display: block;
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.3rem;
        }

        .pricing-info .amount {
          display: block;
          font-size: 1.3rem;
          font-weight: bold;
          color: #333;
        }

        .lease-button {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .lease-button:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
