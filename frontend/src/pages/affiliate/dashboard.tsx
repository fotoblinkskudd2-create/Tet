import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AffiliateProfile {
  id: string;
  referralCode: string;
  commissionTier: string;
  totalEarnings: number;
  totalReferrals: number;
}

interface AffiliateStats {
  profile: AffiliateProfile;
  totalClicks: number;
  totalConversions: number;
  conversionRate: string;
  pendingEarnings: number;
  paidEarnings: number;
}

export default function AffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileCreating, setProfileCreating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/affiliates/stats');

      if (response.status === 404) {
        setStats(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke hente statistikk');
      }

      setStats(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createAffiliateProfile = async () => {
    setProfileCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/affiliates/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke opprette affiliate-profil');
      }

      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProfileCreating(false);
    }
  };

  const copyReferralLink = () => {
    if (!stats?.profile?.referralCode) return;

    const link = `${window.location.origin}?ref=${stats.profile.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('Henvisningslenke kopiert!');
  };

  if (loading) {
    return (
      <div className="dashboard">
        <style jsx>{`
          .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
        `}</style>
        <p>Laster...</p>
      </div>
    );
  }

  if (!stats && !error) {
    return (
      <div className="dashboard">
        <style jsx>{`
          .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }

          .empty-state {
            text-align: center;
            padding: 60px 20px;
          }

          h1 {
            font-size: 2em;
            margin-bottom: 20px;
            color: #1d1d1f;
          }

          p {
            color: #86868b;
            margin-bottom: 30px;
            font-size: 1.1em;
          }

          button {
            padding: 14px 28px;
            background: #0071e3;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
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
        `}</style>

        <div className="empty-state">
          <h1>🤝 Bli Affiliate-partner</h1>
          <p>Opprett din affiliate-profil og begynn å tjene provisjon</p>

          {error && <div className="error">{error}</div>}

          <button onClick={createAffiliateProfile} disabled={profileCreating}>
            {profileCreating ? 'Oppretter...' : 'Opprett Affiliate-profil'}
          </button>
        </div>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2'
  };

  const tierColor = stats?.profile?.commissionTier
    ? tierColors[stats.profile.commissionTier] || '#d2d2d7'
    : '#d2d2d7';

  return (
    <div className="dashboard">
      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        h1 {
          font-size: 2em;
          margin-bottom: 30px;
          color: #1d1d1f;
        }

        .error {
          background: #ff3b30;
          color: white;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border: 1px solid #d2d2d7;
          border-radius: 12px;
          padding: 20px;
        }

        .stat-label {
          color: #86868b;
          font-size: 0.9em;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 2em;
          font-weight: 600;
          color: #1d1d1f;
        }

        .tier-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.9em;
          background: ${tierColor};
          color: ${stats?.profile?.commissionTier === 'gold' || stats?.profile?.commissionTier === 'platinum' ? '#1d1d1f' : 'white'};
        }

        .referral-section {
          background: #f5f5f7;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
        }

        .referral-code {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 15px;
        }

        .code-display {
          flex: 1;
          padding: 12px;
          background: white;
          border: 1px solid #d2d2d7;
          border-radius: 8px;
          font-family: monospace;
          font-size: 1.2em;
          color: #1d1d1f;
        }

        button {
          padding: 12px 24px;
          background: #0071e3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
        }

        button:hover {
          background: #0077ed;
        }

        .earnings-section {
          background: white;
          border: 1px solid #d2d2d7;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
        }

        .earnings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .earnings-item {
          padding: 15px;
          background: #f5f5f7;
          border-radius: 8px;
        }

        .earnings-label {
          color: #86868b;
          font-size: 0.9em;
          margin-bottom: 8px;
        }

        .earnings-value {
          font-size: 1.5em;
          font-weight: 600;
          color: #1d1d1f;
        }

        .back-link {
          display: inline-block;
          color: #0071e3;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .dashboard {
            padding: 15px;
          }

          h1 {
            font-size: 1.5em;
          }

          .referral-code {
            flex-direction: column;
          }

          button {
            width: 100%;
          }
        }
      `}</style>

      <h1>📊 Affiliate Dashboard</h1>

      {error && <div className="error">{error}</div>}

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Klikk</div>
              <div className="stat-value">{stats.totalClicks}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Konverteringer</div>
              <div className="stat-value">{stats.totalConversions}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Konverteringsrate</div>
              <div className="stat-value">{stats.conversionRate}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Totale henvisninger</div>
              <div className="stat-value">{stats.profile.totalReferrals}</div>
            </div>
          </div>

          <div className="referral-section">
            <h2>Din henvisningskode</h2>
            <p>Din nåværende nivå: <span className="tier-badge">{stats.profile.commissionTier}</span></p>
            <div className="referral-code">
              <div className="code-display">{stats.profile.referralCode}</div>
              <button onClick={copyReferralLink}>📋 Kopier lenke</button>
            </div>
          </div>

          <div className="earnings-section">
            <h2>💰 Inntekter</h2>
            <div className="earnings-grid">
              <div className="earnings-item">
                <div className="earnings-label">Totalt opptjent</div>
                <div className="earnings-value">{stats.profile.totalEarnings.toFixed(2)} NOK</div>
              </div>

              <div className="earnings-item">
                <div className="earnings-label">Ventende</div>
                <div className="earnings-value">{stats.pendingEarnings.toFixed(2)} NOK</div>
              </div>

              <div className="earnings-item">
                <div className="earnings-label">Utbetalt</div>
                <div className="earnings-value">{stats.paidEarnings.toFixed(2)} NOK</div>
              </div>
            </div>
          </div>

          <Link href="/ideas" className="back-link">
            💡 Gå til Idegenerator
          </Link>
        </>
      )}
    </div>
  );
}
