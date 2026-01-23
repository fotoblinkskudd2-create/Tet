import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function LeasingHomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/leasing/categories');
      if (!response.ok) throw new Error('Kunne ikke hente kategorier');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="leasing-page">
        <div className="loading">Laster kategorier...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leasing-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="leasing-page">
      <header className="leasing-header">
        <h1>🤖 AI Leasing</h1>
        <p className="tagline">La kunstig intelligens finne det perfekte valget for deg</p>
      </header>

      <section className="hero">
        <h2>Hvordan fungerer det?</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Velg kategori</h3>
            <p>Biler, leiligheter, elektronikk eller utstyr</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Angi preferanser</h3>
            <p>Budsjett, ønsker og prioriteringer</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>Få AI-anbefalinger</h3>
            <p>Smarte forslag basert på dine behov</p>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <h3>Start leasing</h3>
            <p>Velg det beste alternativet og kom i gang</p>
          </div>
        </div>
      </section>

      <section className="categories">
        <h2>Velg kategori</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/leasing/browse?category=${category.id}`}
              className="category-card"
            >
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="cta">Utforsk →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="my-leasing">
        <Link href="/leasing/dashboard" className="dashboard-link">
          📊 Mine leasingavtaler
        </Link>
      </section>

      <style jsx>{`
        .leasing-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .leasing-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .leasing-header h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tagline {
          font-size: 1.2rem;
          color: #666;
        }

        .hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem;
          border-radius: 20px;
          margin-bottom: 3rem;
        }

        .hero h2 {
          text-align: center;
          margin-bottom: 2rem;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .step {
          text-align: center;
        }

        .step-number {
          display: inline-block;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          line-height: 50px;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .step h3 {
          margin-bottom: 0.5rem;
        }

        .step p {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .categories h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .category-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }

        .category-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .category-card h3 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .category-card p {
          color: #666;
          margin-bottom: 1rem;
        }

        .cta {
          color: #667eea;
          font-weight: bold;
        }

        .my-leasing {
          text-align: center;
          padding: 2rem 0;
        }

        .dashboard-link {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 1rem 2rem;
          border-radius: 10px;
          text-decoration: none;
          font-size: 1.1rem;
          transition: background 0.3s ease;
        }

        .dashboard-link:hover {
          background: #5568d3;
        }

        .loading,
        .error {
          text-align: center;
          padding: 3rem;
          font-size: 1.2rem;
        }

        .error {
          color: #e74c3c;
        }
      `}</style>
    </div>
  );
}
