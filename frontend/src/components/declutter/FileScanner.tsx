import { useState } from 'react';

interface FileScannerProps {
  onScanComplete: (result: any) => void;
  formatBytes: (bytes: number) => string;
}

export default function FileScanner({ onScanComplete, formatBytes }: FileScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [directories, setDirectories] = useState<string[]>(['/Users', '/Downloads']);

  const startScan = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/declutter/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directories })
      });

      const result = await response.json();
      setScanResult(result);
      onScanComplete(result);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="file-scanner">
      <div className="scanner-header">
        <h2>File System Scanner</h2>
        <p>Find duplicates, large unused files, and low-quality photos</p>
      </div>

      <div className="scan-controls">
        <div className="directory-input">
          <label>Scan Directories:</label>
          <input
            type="text"
            value={directories.join(', ')}
            onChange={(e) => setDirectories(e.target.value.split(',').map(d => d.trim()))}
            placeholder="/Users, /Downloads"
          />
        </div>

        <button
          className="scan-button primary"
          onClick={startScan}
          disabled={scanning}
        >
          {scanning ? '🔍 Scanning...' : '🚀 Start Scan'}
        </button>
      </div>

      {scanning && (
        <div className="scanning-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Analyzing your digital footprint...</p>
        </div>
      )}

      {scanResult && !scanning && (
        <div className="scan-results">
          <div className="result-summary">
            <h3>Scan Complete!</h3>
            <div className="summary-card">
              <span className="waste-size">
                {formatBytes(scanResult.totalWasteSize)}
              </span>
              <span className="label">Total digital waste found</span>
            </div>
          </div>

          <div className="result-categories">
            <div className="category-card">
              <div className="card-header">
                <span className="icon">📋</span>
                <h4>Duplicate Files</h4>
              </div>
              <div className="card-content">
                <p className="count">{scanResult.duplicates.length} groups</p>
                <p className="detail">
                  {scanResult.duplicates.reduce((sum: number, d: any) => sum + d.count, 0)} total files
                </p>
                {scanResult.duplicates.slice(0, 3).map((dup: any) => (
                  <div key={dup.id} className="item-preview">
                    <span className="item-name">{dup.paths[0].split('/').pop()}</span>
                    <span className="item-size">{formatBytes(dup.size)} × {dup.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="category-card">
              <div className="card-header">
                <span className="icon">🗂️</span>
                <h4>Large Unused Files</h4>
              </div>
              <div className="card-content">
                <p className="count">{scanResult.largeUnusedFiles.length} files</p>
                <p className="detail">Not accessed in 90+ days</p>
                {scanResult.largeUnusedFiles.slice(0, 3).map((file: any) => (
                  <div key={file.id} className="item-preview">
                    <span className="item-name">{file.path.split('/').pop()}</span>
                    <span className="item-size">{formatBytes(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="category-card">
              <div className="card-header">
                <span className="icon">📸</span>
                <h4>Low-Quality Photos</h4>
              </div>
              <div className="card-content">
                <p className="count">{scanResult.lowQualityPhotos.length} photos</p>
                <p className="detail">Blurry or low-resolution</p>
                {scanResult.lowQualityPhotos.slice(0, 3).map((photo: any) => (
                  <div key={photo.id} className="item-preview">
                    <span className="item-name">{photo.path.split('/').pop()}</span>
                    <span className="item-size">
                      {photo.width}×{photo.height}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
