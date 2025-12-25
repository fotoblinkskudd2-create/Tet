import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  dangerLevel: number;
}

interface Entry {
  id: string;
  categoryId: string;
  title: string;
  question: string;
  dangerLevel: number;
  warningText: string;
  viewCount: number;
  tags: string[];
}

export default function VaultMainPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaultToken, setVaultToken] = useState<string | null>(null);
  const [glitchText, setGlitchText] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vaultToken');
    if (!token) {
      router.push('/vault');
      return;
    }

    setVaultToken(token);
    verifyAndFetchData(token);

    // Periodic glitch effect
    const glitchInterval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 150);
    }, 7000);

    return () => clearInterval(glitchInterval);
  }, []);

  const verifyAndFetchData = async (token: string) => {
    try {
      // Verify token
      const verifyResponse = await fetch(`/api/vault/verify/${token}`);
      const verifyData = await verifyResponse.json();

      if (!verifyData.unlocked) {
        localStorage.removeItem('vaultToken');
        router.push('/vault');
        return;
      }

      // Fetch categories
      const categoriesResponse = await fetch('/api/vault/categories', {
        headers: { 'X-Vault-Token': token },
      });
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      // Fetch all entries
      const entriesResponse = await fetch('/api/vault/entries', {
        headers: { 'X-Vault-Token': token },
      });
      const entriesData = await entriesResponse.json();
      setEntries(entriesData);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch vault data:', error);
      router.push('/vault');
    }
  };

  const handleCategoryClick = async (categoryId: string) => {
    if (!vaultToken) return;

    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);

    if (categoryId !== selectedCategory) {
      try {
        const response = await fetch(`/api/vault/entries?categoryId=${categoryId}`, {
          headers: { 'X-Vault-Token': vaultToken },
        });
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      }
    } else {
      // Reset to all entries
      try {
        const response = await fetch('/api/vault/entries', {
          headers: { 'X-Vault-Token': vaultToken },
        });
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      }
    }
  };

  const getDangerLevelColor = (level: number) => {
    if (level >= 5) return '#ff0000';
    if (level >= 4) return '#ff3300';
    if (level >= 3) return '#ff6600';
    if (level >= 2) return '#ff9900';
    return '#ffcc00';
  };

  const getDangerLevelText = (level: number) => {
    if (level >= 5) return 'EKSTREMT FARLIG';
    if (level >= 4) return 'MEGET FARLIG';
    if (level >= 3) return 'FARLIG';
    if (level >= 2) return 'MODERAT';
    return 'LAV RISIKO';
  };

  if (loading) {
    return (
      <div className="vault-main loading">
        <style jsx>{`
          .loading {
            min-height: 100vh;
            background: #000;
            color: #ff0000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
            font-size: 1.5em;
          }
        `}</style>
        LASTER HVELV...
      </div>
    );
  }

  return (
    <div className="vault-main">
      <style jsx>{`
        .vault-main {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0000 0%, #1a0505 50%, #0a0000 100%);
          color: #ff0000;
          font-family: 'Courier New', monospace;
          padding: 20px;
        }

        .header {
          max-width: 1200px;
          margin: 0 auto 40px;
          text-align: center;
          position: relative;
        }

        .warning-strip {
          background: #ff0000;
          color: #000;
          padding: 10px;
          font-weight: bold;
          text-align: center;
          animation: warningFlash 2s ease-in-out infinite;
          margin-bottom: 20px;
        }

        @keyframes warningFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .title {
          font-size: 3em;
          text-transform: uppercase;
          letter-spacing: 8px;
          margin-bottom: 10px;
          text-shadow: 0 0 20px #ff0000;
          ${glitchText ? 'animation: glitch 0.3s;' : ''}
        }

        @keyframes glitch {
          0% { transform: translate(0); text-shadow: 0 0 20px #ff0000; }
          25% { transform: translate(-3px, 3px); text-shadow: 3px 0 #ff0000, -3px 0 #00ff00; }
          50% { transform: translate(3px, -3px); text-shadow: -3px 0 #ff0000, 3px 0 #0000ff; }
          75% { transform: translate(-3px, -3px); text-shadow: 3px 3px #ff0000; }
          100% { transform: translate(0); text-shadow: 0 0 20px #ff0000; }
        }

        .subtitle {
          font-size: 1.2em;
          color: #cc0000;
          letter-spacing: 3px;
          margin-bottom: 20px;
        }

        .status-lights {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .status-light {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ff0000;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .status-light:nth-child(1) { animation-delay: 0s; }
        .status-light:nth-child(2) { animation-delay: 0.3s; }
        .status-light:nth-child(3) { animation-delay: 0.6s; }
        .status-light:nth-child(4) { animation-delay: 0.9s; }
        .status-light:nth-child(5) { animation-delay: 1.2s; }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; box-shadow: 0 0 5px #ff0000; }
          50% { opacity: 1; box-shadow: 0 0 15px #ff0000; }
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .category-card {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #ff0000;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.2), transparent);
          transition: left 0.5s;
        }

        .category-card:hover::before {
          left: 100%;
        }

        .category-card:hover {
          border-color: #ff3333;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
          transform: translateY(-5px);
        }

        .category-card.active {
          background: rgba(255, 0, 0, 0.1);
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.7);
        }

        .category-icon {
          font-size: 2.5em;
          text-align: center;
          margin-bottom: 10px;
        }

        .category-name {
          font-size: 1.2em;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .category-description {
          font-size: 0.9em;
          text-align: center;
          color: #cc0000;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .danger-badge {
          display: inline-block;
          padding: 5px 10px;
          font-size: 0.7em;
          font-weight: bold;
          text-transform: uppercase;
          border: 1px solid;
          margin: 0 auto;
          display: block;
          width: fit-content;
        }

        .entries {
          display: grid;
          gap: 20px;
        }

        .entry-card {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #ff0000;
          padding: 25px;
          transition: all 0.3s;
          position: relative;
        }

        .entry-card:hover {
          border-color: #ff3333;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }

        .entry-title {
          font-size: 1.3em;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .entry-question {
          color: #cc0000;
          font-style: italic;
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .entry-warning {
          background: rgba(255, 0, 0, 0.1);
          border-left: 3px solid #ff0000;
          padding: 10px;
          margin-bottom: 15px;
          font-size: 0.85em;
        }

        .entry-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85em;
          color: #999;
        }

        .tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff0000;
          padding: 3px 8px;
          font-size: 0.75em;
          text-transform: uppercase;
        }

        .view-button {
          background: #ff0000;
          color: #000;
          border: none;
          padding: 10px 20px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.3s;
        }

        .view-button:hover {
          background: #cc0000;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }

        .section-title {
          font-size: 1.8em;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 20px;
          text-align: center;
          border-bottom: 2px solid #ff0000;
          padding-bottom: 10px;
        }

        .logout-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: transparent;
          border: 1px solid #ff0000;
          color: #ff0000;
          padding: 10px 15px;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.3s;
        }

        .logout-button:hover {
          background: rgba(255, 0, 0, 0.1);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
        }
      `}</style>

      <button
        className="logout-button"
        onClick={() => {
          localStorage.removeItem('vaultToken');
          router.push('/vault');
        }}
      >
        🔒 LÅS HVELV
      </button>

      <div className="warning-strip">
        ⚠️ ADVARSEL: DU HAR TILGANG TIL KLASSIFISERT INFORMASJON ⚠️
      </div>

      <div className="header">
        <div className="status-lights">
          <div className="status-light"></div>
          <div className="status-light"></div>
          <div className="status-light"></div>
          <div className="status-light"></div>
          <div className="status-light"></div>
        </div>

        <h1 className="title">☠️ Hvelvet ☠️</h1>
        <p className="subtitle">Forbudt Kunnskap Arkiv</p>
      </div>

      <div className="content">
        <h2 className="section-title">⚠️ Kategorier ⚠️</h2>
        <div className="categories">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-name">{category.name}</div>
              <div className="category-description">{category.description}</div>
              <div
                className="danger-badge"
                style={{ color: getDangerLevelColor(category.dangerLevel), borderColor: getDangerLevelColor(category.dangerLevel) }}
              >
                {getDangerLevelText(category.dangerLevel)}
              </div>
            </div>
          ))}
        </div>

        <h2 className="section-title">📜 Oppføringer 📜</h2>
        <div className="entries">
          {entries.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div className="entry-header">
                <div style={{ flex: 1 }}>
                  <div className="entry-title">{entry.title}</div>
                  <div className="entry-question">{entry.question}</div>
                </div>
                <div
                  className="danger-badge"
                  style={{
                    color: getDangerLevelColor(entry.dangerLevel),
                    borderColor: getDangerLevelColor(entry.dangerLevel),
                    marginLeft: '15px'
                  }}
                >
                  {getDangerLevelText(entry.dangerLevel)}
                </div>
              </div>

              <div className="entry-warning">{entry.warningText}</div>

              <div className="entry-meta">
                <div className="tags">
                  {entry.tags.map((tag, idx) => (
                    <span key={idx} className="tag">#{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span>👁️ {entry.viewCount}</span>
                  <Link href={`/vault/entry/${entry.id}`}>
                    <button className="view-button">SE SVAR</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
