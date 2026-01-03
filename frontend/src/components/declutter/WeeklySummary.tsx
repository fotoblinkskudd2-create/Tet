import { useState } from 'react';

interface WeeklySummaryProps {
  scanResult: any;
  subscriptions: any[];
  subscriptionSummary: any;
  onRefresh: () => void;
}

export default function WeeklySummary({
  scanResult,
  subscriptions,
  subscriptionSummary,
  onRefresh
}: WeeklySummaryProps) {
  const [cleaning, setCleaning] = useState(false);
  const [cleanupComplete, setCleanupComplete] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleOneClickCleanup = async () => {
    if (!confirm('This will archive all flagged items. Continue?')) {
      return;
    }

    setCleaning(true);
    try {
      const fileIds: string[] = [];

      if (scanResult) {
        scanResult.duplicates?.forEach((d: any) => fileIds.push(d.id));
        scanResult.largeUnusedFiles?.forEach((f: any) => fileIds.push(f.id));
        scanResult.lowQualityPhotos?.forEach((p: any) => fileIds.push(p.id));
      }

      await fetch('/api/declutter/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds, action: 'archive' })
      });

      setCleanupComplete(true);
      setTimeout(() => {
        setCleanupComplete(false);
        onRefresh();
      }, 3000);
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setCleaning(false);
    }
  };

  const totalFileWaste = scanResult?.totalWasteSize || 0;
  const totalSubSavings = subscriptionSummary?.potentialMonthlySavings || 0;
  const unusedSubCount = subscriptions?.filter((s: any) => s.daysUnused >= 90).length || 0;

  const totalItems =
    (scanResult?.duplicates?.length || 0) +
    (scanResult?.largeUnusedFiles?.length || 0) +
    (scanResult?.lowQualityPhotos?.length || 0) +
    unusedSubCount;

  return (
    <div className="weekly-summary">
      <div className="summary-hero">
        <h2>Your Weekly Digital Cleanup</h2>
        <p className="hero-subtitle">We found some digital clutter you might want to clear</p>
      </div>

      <div className="impact-summary">
        <div className="impact-card primary">
          <div className="impact-icon">💾</div>
          <div className="impact-details">
            <span className="impact-value">{formatBytes(totalFileWaste)}</span>
            <span className="impact-label">Storage to reclaim</span>
          </div>
        </div>

        <div className="impact-card success">
          <div className="impact-icon">💰</div>
          <div className="impact-details">
            <span className="impact-value">${totalSubSavings.toFixed(2)}/mo</span>
            <span className="impact-label">Potential savings</span>
          </div>
        </div>

        <div className="impact-card info">
          <div className="impact-icon">🗑️</div>
          <div className="impact-details">
            <span className="impact-value">{totalItems}</span>
            <span className="impact-label">Items flagged</span>
          </div>
        </div>
      </div>

      <div className="cleanup-breakdown">
        <h3>What We Found</h3>

        <div className="breakdown-list">
          {scanResult?.duplicates && scanResult.duplicates.length > 0 && (
            <div className="breakdown-item">
              <div className="item-icon">📋</div>
              <div className="item-content">
                <h4>Duplicate Files</h4>
                <p>
                  {scanResult.duplicates.length} groups of duplicates taking up unnecessary space
                </p>
              </div>
              <div className="item-stat">
                {scanResult.duplicates.reduce((sum: number, d: any) => sum + d.count, 0)} files
              </div>
            </div>
          )}

          {scanResult?.largeUnusedFiles && scanResult.largeUnusedFiles.length > 0 && (
            <div className="breakdown-item">
              <div className="item-icon">🗂️</div>
              <div className="item-content">
                <h4>Large Unused Files</h4>
                <p>
                  Files over 50MB not accessed in 90+ days
                </p>
              </div>
              <div className="item-stat">
                {formatBytes(
                  scanResult.largeUnusedFiles.reduce((sum: number, f: any) => sum + f.size, 0)
                )}
              </div>
            </div>
          )}

          {scanResult?.lowQualityPhotos && scanResult.lowQualityPhotos.length > 0 && (
            <div className="breakdown-item">
              <div className="item-icon">📸</div>
              <div className="item-content">
                <h4>Low-Quality Photos</h4>
                <p>
                  Blurry or low-resolution images you probably don't need
                </p>
              </div>
              <div className="item-stat">
                {scanResult.lowQualityPhotos.length} photos
              </div>
            </div>
          )}

          {unusedSubCount > 0 && (
            <div className="breakdown-item highlight">
              <div className="item-icon">💳</div>
              <div className="item-content">
                <h4>Unused Subscriptions</h4>
                <p>
                  Services you haven't used in 90+ days
                </p>
              </div>
              <div className="item-stat">
                ${totalSubSavings.toFixed(2)}/mo
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="cleanup-action">
        {!cleanupComplete && (
          <>
            <button
              className="one-click-cleanup"
              onClick={handleOneClickCleanup}
              disabled={cleaning || totalItems === 0}
            >
              {cleaning ? (
                <>
                  <span className="spinner-small"></span>
                  Cleaning up...
                </>
              ) : (
                <>
                  ✨ One-Click Cleanup
                </>
              )}
            </button>
            <p className="cleanup-note">
              This will archive all flagged files and show cancellation emails for unused subscriptions
            </p>
          </>
        )}

        {cleanupComplete && (
          <div className="cleanup-success">
            <div className="success-icon">✅</div>
            <h3>Cleanup Complete!</h3>
            <p>You've reclaimed {formatBytes(totalFileWaste)} of storage</p>
            <p>Don't forget to cancel those unused subscriptions to save ${totalSubSavings.toFixed(2)}/month</p>
          </div>
        )}
      </div>

      <div className="tips-section">
        <h3>💡 Digital Minimalism Tips</h3>
        <ul className="tips-list">
          <li>Review subscriptions monthly to catch unused services early</li>
          <li>Delete screenshots older than 30 days</li>
          <li>Use cloud storage for large files you rarely access</li>
          <li>Enable auto-delete for downloads folder</li>
          <li>Unsubscribe from newsletters you never read</li>
        </ul>
      </div>
    </div>
  );
}
