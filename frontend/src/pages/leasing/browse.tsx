import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface LeasingItem {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  deposit: number;
  specifications: Record<string, any>;
  provider: string;
  rating: number;
  available: boolean;
}

interface UserPreference {
  id?: string;
  category_id: string;
  budget_min: number;
  budget_max: number;
  preferred_duration: number;
  priorities: Record<string, number>;
  usage_pattern: string;
  must_have_features: string[];
  nice_to_have_features: string[];
}

export default function BrowsePage() {
  const router = useRouter();
  const { category } = router.query;

  const [items, setItems] = useState<LeasingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference state
  const [budgetMax, setBudgetMax] = useState(10000);
  const [budgetMin, setBudgetMin] = useState(0);
  const [duration, setDuration] = useState(24);
  const [usagePattern, setUsagePattern] = useState('');
  const [ecoFriendly, setEcoFriendly] = useState(5);
  const [luxury, setLuxury] = useState(5);
  const [costEffective, setCostEffective] = useState(7);

  useEffect(() => {
    if (category) {
      fetchItems();
    }
  }, [category]);

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/leasing/items?category=${category}`);
      if (!response.ok) throw new Error('Kunne ikke hente produkter');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    try {
      // Save preferences first
      const preferencePayload: UserPreference = {
        category_id: category as string,
        budget_min: budgetMin,
        budget_max: budgetMax,
        preferred_duration: duration,
        priorities: {
          eco_friendly: ecoFriendly,
          luxury: luxury,
          cost_effective: costEffective,
        },
        usage_pattern: usagePattern,
        must_have_features: [],
        nice_to_have_features: [],
      };

      const prefResponse = await fetch('/api/leasing/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencePayload),
        credentials: 'include',
      });

      if (!prefResponse.ok) {
        throw new Error('Kunne ikke lagre preferanser');
      }

      const preference = await prefResponse.json();

      // Get AI recommendations
      const recResponse = await fetch('/api/leasing/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference_id: preference.id }),
        credentials: 'include',
      });

      if (!recResponse.ok) {
        throw new Error('Kunne ikke hente anbefalinger');
      }

      // Navigate to recommendations page
      router.push(`/leasing/recommendations?preference=${preference.id}`);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return <div className="browse-page">Laster...</div>;
  }

  return (
    <div className="browse-page">
      <header>
        <Link href="/leasing" className="back-link">
          ← Tilbake
        </Link>
        <h1>Tilgjengelige produkter</h1>
      </header>

      <div className="actions">
        <button
          className="ai-button"
          onClick={() => setShowPreferences(!showPreferences)}
        >
          🤖 Få AI-anbefalinger
        </button>
      </div>

      {showPreferences && (
        <div className="preferences-panel">
          <h2>Dine preferanser</h2>
          <p>La AI-en finne det beste valget for deg basert på dine behov:</p>

          <div className="preference-form">
            <div className="form-group">
              <label>Budsjett (månedsleie)</label>
              <div className="range-display">
                kr {budgetMin.toLocaleString()} - kr {budgetMax.toLocaleString()}
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Foretrukket leieperiode: {duration} måneder</label>
              <input
                type="range"
                min="6"
                max="48"
                step="6"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Bruksmønster</label>
              <input
                type="text"
                placeholder="F.eks. daglig pendling, familiereiser, arbeid hjemmefra"
                value={usagePattern}
                onChange={(e) => setUsagePattern(e.target.value)}
              />
            </div>

            <div className="priorities">
              <h3>Prioriteringer (1-10)</h3>

              <div className="priority-slider">
                <label>Miljøvennlig: {ecoFriendly}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={ecoFriendly}
                  onChange={(e) => setEcoFriendly(Number(e.target.value))}
                />
              </div>

              <div className="priority-slider">
                <label>Luksus: {luxury}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={luxury}
                  onChange={(e) => setLuxury(Number(e.target.value))}
                />
              </div>

              <div className="priority-slider">
                <label>Prisbevisst: {costEffective}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={costEffective}
                  onChange={(e) => setCostEffective(Number(e.target.value))}
                />
              </div>
            </div>

            <button className="submit-button" onClick={handleGetRecommendations}>
              Se AI-anbefalinger
            </button>
          </div>
        </div>
      )}

      <div className="items-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <h3>{item.name}</h3>
              <div className="rating">⭐ {item.rating}/5</div>
            </div>
            <p className="description">{item.description}</p>

            <div className="specs">
              {Object.entries(item.specifications).slice(0, 4).map(([key, value]) => (
                <div key={key} className="spec">
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>

            <div className="pricing">
              <div className="price">
                <span className="amount">kr {item.monthly_price.toLocaleString()}</span>
                <span className="period">/måned</span>
              </div>
              <div className="deposit">Depositum: kr {item.deposit.toLocaleString()}</div>
            </div>

            <div className="provider">Tilbyder: {item.provider}</div>

            {!item.available && (
              <div className="unavailable">Ikke tilgjengelig</div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="no-items">
          Ingen produkter tilgjengelig i denne kategorien ennå.
        </div>
      )}

      <style jsx>{`
        .browse-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        header {
          margin-bottom: 2rem;
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
        }

        .actions {
          margin-bottom: 2rem;
          text-align: center;
        }

        .ai-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .ai-button:hover {
          transform: scale(1.05);
        }

        .preferences-panel {
          background: #f8f9fa;
          border: 2px solid #667eea;
          border-radius: 15px;
          padding: 2rem;
          margin-bottom: 3rem;
        }

        .preferences-panel h2 {
          margin-bottom: 0.5rem;
        }

        .preference-form {
          margin-top: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .form-group input[type="range"] {
          width: 100%;
        }

        .form-group input[type="text"] {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .range-display {
          font-size: 1.2rem;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .priorities {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .priorities h3 {
          margin-bottom: 1rem;
        }

        .priority-slider {
          margin-bottom: 1rem;
        }

        .priority-slider label {
          display: block;
          margin-bottom: 0.5rem;
        }

        .priority-slider input {
          width: 100%;
        }

        .submit-button {
          width: 100%;
          background: #667eea;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.3s;
        }

        .submit-button:hover {
          background: #5568d3;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .item-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 15px;
          padding: 1.5rem;
          transition: box-shadow 0.3s;
        }

        .item-card:hover {
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .item-header h3 {
          flex: 1;
          margin: 0;
        }

        .rating {
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .description {
          color: #666;
          margin-bottom: 1rem;
        }

        .specs {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .spec {
          font-size: 0.9rem;
          margin-bottom: 0.3rem;
        }

        .spec strong {
          color: #667eea;
        }

        .pricing {
          margin-bottom: 1rem;
        }

        .price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
        }

        .period {
          font-size: 1rem;
          color: #666;
        }

        .deposit {
          font-size: 0.9rem;
          color: #666;
        }

        .provider {
          font-size: 0.85rem;
          color: #999;
        }

        .unavailable {
          margin-top: 1rem;
          padding: 0.5rem;
          background: #ffebee;
          color: #c62828;
          text-align: center;
          border-radius: 5px;
        }

        .no-items {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}
