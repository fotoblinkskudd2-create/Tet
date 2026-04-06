import { useState, useEffect } from 'react';
import SocialLayout from '../../components/SocialLayout';
import { PLATFORMS, PlatformConfig, Platform } from '../../types/social';

interface ConnectionState {
  platform: Platform;
  connected: boolean;
  accountName: string;
}

export default function PlatformsPage() {
  const [platformStates, setPlatformStates] = useState<ConnectionState[]>(
    PLATFORMS.map((p) => ({ platform: p.id, connected: false, accountName: '' }))
  );
  const [connecting, setConnecting] = useState<Platform | null>(null);
  const [accountInput, setAccountInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/social/platforms');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setPlatformStates((prev) =>
            prev.map((ps) => {
              const conn = data.find((d: any) => d.platform === ps.platform);
              return conn
                ? { ...ps, connected: conn.connected, accountName: conn.accountName }
                : ps;
            })
          );
        }
      }
    } catch {
      // Use defaults
    }
  };

  const handleConnect = async (platform: Platform) => {
    if (!accountInput.trim()) {
      setMessage('Skriv inn brukernavnet ditt for denne plattformen');
      return;
    }

    try {
      const response = await fetch('/api/social/platforms/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, accountName: accountInput }),
      });

      if (response.ok) {
        setPlatformStates((prev) =>
          prev.map((ps) =>
            ps.platform === platform
              ? { ...ps, connected: true, accountName: accountInput }
              : ps
          )
        );
        setConnecting(null);
        setAccountInput('');
        setMessage(`${PLATFORMS.find((p) => p.id === platform)?.name} tilkoblet!`);
      }
    } catch {
      setMessage('Kunne ikke koble til plattformen');
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      const response = await fetch('/api/social/platforms/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        setPlatformStates((prev) =>
          prev.map((ps) =>
            ps.platform === platform ? { ...ps, connected: false, accountName: '' } : ps
          )
        );
        setMessage('Plattform frakoblet');
      }
    } catch {
      setMessage('Kunne ikke koble fra plattformen');
    }
  };

  const connectedCount = platformStates.filter((p) => p.connected).length;

  return (
    <SocialLayout title="Plattformer">
      <div className="platforms-page">
        <div className="connection-summary">
          <span className="summary-count">{connectedCount}</span>
          <span className="summary-label">
            av {PLATFORMS.length} plattformer tilkoblet
          </span>
        </div>

        {message && (
          <div className="platform-message">
            <p>{message}</p>
            <button onClick={() => setMessage(null)}>✕</button>
          </div>
        )}

        <div className="platform-list">
          {PLATFORMS.map((platform) => {
            const state = platformStates.find((ps) => ps.platform === platform.id);
            const isConnecting = connecting === platform.id;

            return (
              <div key={platform.id} className="platform-card">
                <div className="platform-card-header" style={{ borderLeftColor: platform.color }}>
                  <div className="platform-info">
                    <span className="platform-icon-large">{platform.icon}</span>
                    <div>
                      <h3>{platform.name}</h3>
                      {state?.connected && (
                        <span className="account-name">@{state.accountName}</span>
                      )}
                    </div>
                  </div>
                  <span className={`connection-status ${state?.connected ? 'connected' : 'disconnected'}`}>
                    {state?.connected ? '● Tilkoblet' : '○ Ikke tilkoblet'}
                  </span>
                </div>

                <div className="platform-card-details">
                  <p className="platform-detail">Maks tegn: {platform.maxLength.toLocaleString()}</p>
                </div>

                <div className="platform-card-actions">
                  {state?.connected ? (
                    <button
                      className="btn-disconnect"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      Koble fra
                    </button>
                  ) : isConnecting ? (
                    <div className="connect-form">
                      <input
                        type="text"
                        placeholder="Ditt brukernavn"
                        value={accountInput}
                        onChange={(e) => setAccountInput(e.target.value)}
                        className="connect-input"
                        autoFocus
                      />
                      <div className="connect-buttons">
                        <button
                          className="btn-connect-confirm"
                          onClick={() => handleConnect(platform.id)}
                        >
                          Koble til
                        </button>
                        <button
                          className="btn-connect-cancel"
                          onClick={() => {
                            setConnecting(null);
                            setAccountInput('');
                          }}
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn-connect"
                      style={{ backgroundColor: platform.color }}
                      onClick={() => setConnecting(platform.id)}
                    >
                      Koble til {platform.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <section className="platforms-info">
          <h3>Om SocialPoster</h3>
          <p>
            Koble til kontiene dine og publiser innhold til alle 5 plattformene
            samtidig. Planlegg opptil 4 innlegg per dag for optimal synlighet.
          </p>
          <ul>
            <li>📷 Instagram - Bilder og historier</li>
            <li>👤 Facebook - Innlegg og deling</li>
            <li>𝕏 X (Twitter) - Korte meldinger</li>
            <li>🎵 TikTok - Videoinnhold</li>
            <li>💼 LinkedIn - Profesjonelt nettverk</li>
          </ul>
        </section>
      </div>
    </SocialLayout>
  );
}
