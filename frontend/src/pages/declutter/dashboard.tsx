import { useState, useEffect } from 'react';
import FileScanner from '../../components/declutter/FileScanner';
import SubscriptionTracker from '../../components/declutter/SubscriptionTracker';
import WeeklySummary from '../../components/declutter/WeeklySummary';
import '../../styles/declutter.css';

interface ScanResult {
  duplicates: any[];
  largeUnusedFiles: any[];
  lowQualityPhotos: any[];
  totalWasteSize: number;
  scannedAt: Date;
}

interface SubscriptionSummary {
  total: number;
  active: number;
  unused: number;
  totalMonthlySpend: number;
  potentialMonthlySavings: number;
}

export default function DeclutterDashboard() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionSummary, setSubscriptionSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'subscriptions' | 'summary'>('summary');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSubscriptions(),
        loadLastScan()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions?unusedDaysThreshold=90');
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      setSubscriptionSummary(data.summary || null);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const loadLastScan = async () => {
    try {
      const response = await fetch('/api/declutter/scan/history');
      const data = await response.json();
      // Would load the most recent scan result
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    setActiveTab('summary');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="declutter-dashboard">
      <header className="dashboard-header">
        <h1>✨ Digital Minimalism Enforcer</h1>
        <p className="tagline">Effortless cleanup, guilt-free living</p>
      </header>

      <nav className="dashboard-tabs">
        <button
          className={activeTab === 'summary' ? 'active' : ''}
          onClick={() => setActiveTab('summary')}
        >
          📊 Weekly Summary
        </button>
        <button
          className={activeTab === 'files' ? 'active' : ''}
          onClick={() => setActiveTab('files')}
        >
          📁 File Scanner
        </button>
        <button
          className={activeTab === 'subscriptions' ? 'active' : ''}
          onClick={() => setActiveTab('subscriptions')}
        >
          💳 Subscriptions
        </button>
      </nav>

      <main className="dashboard-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your digital footprint...</p>
          </div>
        )}

        {!loading && activeTab === 'summary' && (
          <WeeklySummary
            scanResult={scanResult}
            subscriptions={subscriptions}
            subscriptionSummary={subscriptionSummary}
            onRefresh={loadData}
          />
        )}

        {!loading && activeTab === 'files' && (
          <FileScanner
            onScanComplete={handleScanComplete}
            formatBytes={formatBytes}
          />
        )}

        {!loading && activeTab === 'subscriptions' && (
          <SubscriptionTracker
            subscriptions={subscriptions}
            summary={subscriptionSummary}
            onRefresh={loadSubscriptions}
          />
        )}
      </main>

      <footer className="dashboard-footer">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}
