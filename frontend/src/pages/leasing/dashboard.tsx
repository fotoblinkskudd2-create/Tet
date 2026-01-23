import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contract {
  id: string;
  monthly_payment: number;
  deposit_paid: number;
  duration_months: number;
  start_date: string;
  end_date: string;
  status: string;
  item: {
    id: string;
    name: string;
    description: string;
    provider: string;
    rating: number;
    specifications: Record<string, any>;
  };
}

export default function DashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/leasing/contracts', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Kunne ikke hente kontrakter');

      const data = await response.json();
      setContracts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    const total = end - start;
    const elapsed = now - start;

    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const totalMonthlyPayment = contracts.reduce(
    (sum, contract) => sum + contract.monthly_payment,
    0
  );

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Laster dine leasingavtaler...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header>
        <Link href="/leasing" className="back-link">
          ← Tilbake til leasing
        </Link>
        <h1>📊 Mine leasingavtaler</h1>
      </header>

      {contracts.length === 0 ? (
        <div className="no-contracts">
          <div className="empty-state">
            <div className="icon">📋</div>
            <h2>Ingen aktive leasingavtaler</h2>
            <p>Start med å utforske våre kategorier og få AI-anbefalinger!</p>
            <Link href="/leasing" className="cta-button">
              Utforsk leasingalternativer
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Aktive avtaler</div>
              <div className="summary-value">{contracts.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total månedsleie</div>
              <div className="summary-value">kr {totalMonthlyPayment.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total depositum betalt</div>
              <div className="summary-value">
                kr{' '}
                {contracts
                  .reduce((sum, c) => sum + c.deposit_paid, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>

          <div className="contracts-list">
            {contracts.map((contract) => {
              const progress = calculateProgress(contract.start_date, contract.end_date);
              const daysRemaining = getDaysRemaining(contract.end_date);

              return (
                <div key={contract.id} className="contract-card">
                  <div className="contract-header">
                    <div>
                      <h3>{contract.item.name}</h3>
                      <p className="provider">{contract.item.provider}</p>
                      <div className="rating">⭐ {contract.item.rating}/5</div>
                    </div>
                    <div className="status-badge active">Aktiv</div>
                  </div>

                  <div className="contract-details">
                    <div className="detail-row">
                      <span className="label">Startdato:</span>
                      <span className="value">
                        {new Date(contract.start_date).toLocaleDateString('nb-NO')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Sluttdato:</span>
                      <span className="value">
                        {new Date(contract.end_date).toLocaleDateString('nb-NO')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Varighet:</span>
                      <span className="value">{contract.duration_months} måneder</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Månedsleie:</span>
                      <span className="value highlight">
                        kr {contract.monthly_payment.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Avtaleperiode</span>
                      <span>
                        {daysRemaining > 0
                          ? `${daysRemaining} dager igjen`
                          : 'Utløpt'}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="progress-percentage">{progress.toFixed(0)}% fullført</div>
                  </div>

                  <div className="specifications">
                    <h4>Spesifikasjoner</h4>
                    <div className="specs-grid">
                      {Object.entries(contract.item.specifications)
                        .slice(0, 6)
                        .map(([key, value]) => (
                          <div key={key} className="spec-item">
                            <span className="spec-key">{key}:</span>
                            <span className="spec-value">{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="actions">
            <Link href="/leasing" className="action-button">
              Legg til ny leasingavtale
            </Link>
          </div>
        </>
      )}

      <style jsx>{`
        .dashboard-page {
          max-width: 1200px;
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

        .loading {
          text-align: center;
          padding: 3rem;
          font-size: 1.2rem;
          color: #667eea;
        }

        .no-contracts {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .empty-state {
          text-align: center;
          max-width: 400px;
        }

        .empty-state .icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .empty-state h2 {
          margin-bottom: 1rem;
          color: #333;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 2rem;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 2rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: bold;
          transition: transform 0.2s;
        }

        .cta-button:hover {
          transform: scale(1.05);
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
        }

        .summary-label {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 2.5rem;
          font-weight: bold;
        }

        .contracts-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .contract-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          padding: 2rem;
          transition: box-shadow 0.3s;
        }

        .contract-card:hover {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .contract-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .contract-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .provider {
          color: #999;
          font-size: 0.9rem;
          margin-bottom: 0.3rem;
        }

        .rating {
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
        }

        .status-badge.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .contract-details {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 15px;
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row .label {
          color: #666;
        }

        .detail-row .value {
          font-weight: 500;
        }

        .detail-row .value.highlight {
          color: #667eea;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .progress-section {
          margin-bottom: 1.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        .progress-bar {
          height: 30px;
          background: #e0e0e0;
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
        }

        .progress-percentage {
          text-align: center;
          font-size: 0.85rem;
          color: #666;
        }

        .specifications {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 15px;
        }

        .specifications h4 {
          margin-bottom: 1rem;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .spec-item {
          font-size: 0.9rem;
        }

        .spec-key {
          color: #667eea;
          font-weight: 500;
        }

        .spec-value {
          margin-left: 0.5rem;
        }

        .actions {
          text-align: center;
          padding: 2rem 0;
        }

        .action-button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 1rem 2rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: bold;
          transition: background 0.3s;
        }

        .action-button:hover {
          background: #5568d3;
        }
      `}</style>
    </div>
  );
}
