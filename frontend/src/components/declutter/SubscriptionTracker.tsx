import { useState } from 'react';

interface Subscription {
  id: string;
  name: string;
  provider: string;
  amount: number;
  currency: string;
  billingCycle: string;
  daysUnused: number;
  status: string;
  alternatives?: Alternative[];
}

interface Alternative {
  name: string;
  price: number;
  savings: number;
  description: string;
  url: string;
}

interface SubscriptionTrackerProps {
  subscriptions: Subscription[];
  summary: any;
  onRefresh: () => void;
}

export default function SubscriptionTracker({ subscriptions, summary, onRefresh }: SubscriptionTrackerProps) {
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [cancellationEmail, setCancellationEmail] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const generateCancellationEmail = async (subscription: Subscription) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/cancel-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: 'polite-firm' })
      });

      const data = await response.json();
      setCancellationEmail(data);
      setSelectedSub(subscription);
      setShowEmailModal(true);
    } catch (error) {
      console.error('Failed to generate email:', error);
    }
  };

  const syncSubscriptions = async () => {
    setSyncing(true);
    try {
      await fetch('/api/subscriptions/sync', { method: 'POST' });
      onRefresh();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Email copied to clipboard!');
  };

  const unusedSubscriptions = subscriptions.filter(s => s.daysUnused >= 90);

  return (
    <div className="subscription-tracker">
      <div className="tracker-header">
        <h2>Subscription Tracker</h2>
        <button className="sync-button" onClick={syncSubscriptions} disabled={syncing}>
          {syncing ? '🔄 Syncing...' : '🔄 Sync with Bank'}
        </button>
      </div>

      {summary && (
        <div className="subscription-summary">
          <div className="summary-grid">
            <div className="summary-stat">
              <span className="stat-value">${summary.totalMonthlySpend.toFixed(2)}</span>
              <span className="stat-label">Monthly Spend</span>
            </div>
            <div className="summary-stat highlight">
              <span className="stat-value">${summary.potentialMonthlySavings.toFixed(2)}</span>
              <span className="stat-label">Potential Savings</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{summary.unused}</span>
              <span className="stat-label">Unused (90+ days)</span>
            </div>
          </div>
        </div>
      )}

      <div className="subscription-list">
        <h3>Unused Subscriptions</h3>
        {unusedSubscriptions.length === 0 && (
          <p className="empty-state">No unused subscriptions found. Great job!</p>
        )}

        {unusedSubscriptions.map((sub) => (
          <div key={sub.id} className="subscription-card flagged">
            <div className="subscription-info">
              <div className="sub-header">
                <h4>{sub.name}</h4>
                <span className="provider">{sub.provider}</span>
              </div>
              <div className="sub-details">
                <span className="amount">
                  ${sub.amount.toFixed(2)}/{sub.billingCycle}
                </span>
                <span className="unused-badge">
                  Unused for {sub.daysUnused} days
                </span>
              </div>
            </div>

            <div className="subscription-actions">
              <button
                className="cancel-button"
                onClick={() => generateCancellationEmail(sub)}
              >
                ✉️ Draft Cancellation
              </button>
            </div>

            {sub.alternatives && sub.alternatives.length > 0 && (
              <div className="alternatives">
                <p className="alternatives-label">💡 Cheaper alternatives:</p>
                {sub.alternatives.map((alt, idx) => (
                  <div key={idx} className="alternative-item">
                    <span className="alt-name">{alt.name}</span>
                    <span className="alt-price">${alt.price.toFixed(2)}</span>
                    <span className="alt-savings">Save ${alt.savings.toFixed(2)}/mo</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <h3>Active Subscriptions</h3>
        {subscriptions.filter(s => s.daysUnused < 90).map((sub) => (
          <div key={sub.id} className="subscription-card">
            <div className="subscription-info">
              <div className="sub-header">
                <h4>{sub.name}</h4>
                <span className="provider">{sub.provider}</span>
              </div>
              <div className="sub-details">
                <span className="amount">
                  ${sub.amount.toFixed(2)}/{sub.billingCycle}
                </span>
                <span className="active-badge">Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEmailModal && cancellationEmail && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancellation Email Draft</h3>
              <button className="close-button" onClick={() => setShowEmailModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="email-preview">
                <div className="email-field">
                  <label>To:</label>
                  <input type="text" value={cancellationEmail.email.to} readOnly />
                </div>
                <div className="email-field">
                  <label>Subject:</label>
                  <input type="text" value={cancellationEmail.email.subject} readOnly />
                </div>
                <div className="email-field">
                  <label>Body:</label>
                  <textarea
                    value={cancellationEmail.email.body}
                    readOnly
                    rows={15}
                  />
                </div>
              </div>

              {cancellationEmail.alternatives && cancellationEmail.alternatives.length > 0 && (
                <div className="alternatives-section">
                  <h4>Suggested Alternatives</h4>
                  {cancellationEmail.alternatives.map((alt: Alternative, idx: number) => (
                    <div key={idx} className="alternative-card">
                      <h5>{alt.name}</h5>
                      <p>{alt.description}</p>
                      <p className="savings">Save ${alt.savings.toFixed(2)}/month</p>
                      <a href={alt.url} target="_blank" rel="noopener noreferrer">
                        Learn more →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="copy-button primary"
                onClick={() => copyToClipboard(cancellationEmail.email.body)}
              >
                📋 Copy Email
              </button>
              <button
                className="secondary"
                onClick={() => setShowEmailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
