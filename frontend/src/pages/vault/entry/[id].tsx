import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Entry {
  id: string;
  categoryId: string;
  title: string;
  question: string;
  answer: string;
  dangerLevel: number;
  warningText: string;
  viewCount: number;
  tags: string[];
}

export default function EntryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(true);
  const [vaultToken, setVaultToken] = useState<string | null>(null);
  const [glitchActive, setGlitchActive] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vaultToken');
    if (!token) {
      router.push('/vault');
      return;
    }

    setVaultToken(token);

    if (id) {
      fetchEntry(token, id as string);
    }

    // Random glitch effects
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 6000);

    return () => clearInterval(glitchInterval);
  }, [id]);

  const fetchEntry = async (token: string, entryId: string) => {
    try {
      const response = await fetch(`/api/vault/entries/${entryId}`, {
        headers: { 'X-Vault-Token': token },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entry');
      }

      const data = await response.json();
      setEntry(data);
      setLoading(false);

      // Simulate decryption animation
      setTimeout(() => {
        setDecrypting(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to fetch entry:', error);
      router.push('/vault/main');
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
      <div className="loading-screen">
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            background: #000;
            color: #ff0000;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            font-family: 'Courier New', monospace;
            gap: 20px;
          }
          .spinner {
            border: 3px solid rgba(255, 0, 0, 0.3);
            border-top: 3px solid #ff0000;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinner"></div>
        <div>HENTER DATA...</div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <div className="entry-detail">
      <style jsx>{`
        .entry-detail {
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #0a0000 50%, #000000 100%);
          color: #ff0000;
          font-family: 'Courier New', monospace;
          padding: 20px;
          position: relative;
          overflow-x: hidden;
        }

        .entry-detail::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            repeating-linear-gradient(
              0deg,
              rgba(255, 0, 0, 0.02) 0px,
              transparent 1px,
              transparent 2px,
              rgba(255, 0, 0, 0.02) 3px
            );
          pointer-events: none;
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
        }

        .warning-banner {
          background: #ff0000;
          color: #000;
          padding: 15px;
          text-align: center;
          font-weight: bold;
          font-size: 1.1em;
          animation: warningPulse 2s ease-in-out infinite;
          margin-bottom: 30px;
          border: 3px solid #cc0000;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        }

        @keyframes warningPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .alert-lights {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .alert-light {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ff0000;
          box-shadow: 0 0 15px #ff0000;
          animation: blink 1s ease-in-out infinite;
        }

        .alert-light:nth-child(2) { animation-delay: 0.25s; }
        .alert-light:nth-child(3) { animation-delay: 0.5s; }
        .alert-light:nth-child(4) { animation-delay: 0.75s; }

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }

        .back-button {
          background: transparent;
          border: 1px solid #ff0000;
          color: #ff0000;
          padding: 10px 20px;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          margin-bottom: 30px;
          transition: all 0.3s;
        }

        .back-button:hover {
          background: rgba(255, 0, 0, 0.1);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
        }

        .header {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid #ff0000;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
        }

        .title {
          font-size: 2.2em;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 3px;
          ${glitchActive ? 'animation: glitch 0.3s;' : ''}
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); color: #ff0000; }
          40% { transform: translate(-2px, -2px); color: #00ff00; }
          60% { transform: translate(2px, 2px); color: #0000ff; }
          80% { transform: translate(2px, -2px); color: #ff0000; }
          100% { transform: translate(0); }
        }

        .question {
          font-size: 1.2em;
          color: #cc0000;
          font-style: italic;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .metadata {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid #ff0000;
        }

        .tags {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .tag {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff0000;
          padding: 5px 10px;
          font-size: 0.85em;
        }

        .danger-badge {
          padding: 8px 15px;
          border: 2px solid;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.9em;
        }

        .warning-section {
          background: rgba(255, 0, 0, 0.05);
          border: 2px solid #ff0000;
          padding: 25px;
          margin-bottom: 30px;
          position: relative;
        }

        .warning-section::before {
          content: '⚠️';
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 2em;
          opacity: 0.3;
          animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .warning-text {
          font-size: 1.1em;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .acknowledge-button {
          background: #ff0000;
          color: #000;
          border: none;
          padding: 15px 30px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          font-size: 1em;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.3s;
          width: 100%;
        }

        .acknowledge-button:hover {
          background: #cc0000;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        }

        .answer-section {
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid #ff0000;
          padding: 40px;
          box-shadow: 0 0 40px rgba(255, 0, 0, 0.4);
        }

        .answer-header {
          text-align: center;
          font-size: 1.5em;
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: 5px;
          padding-bottom: 15px;
          border-bottom: 2px solid #ff0000;
        }

        .decrypting {
          text-align: center;
          font-size: 1.2em;
          padding: 60px 20px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .answer-text {
          font-size: 1.1em;
          line-height: 1.8;
          color: #ff3333;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5px;
          text-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
          animation: fadeIn 1s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .answer-text::first-letter {
          font-size: 1.5em;
          font-weight: bold;
          color: #ff0000;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          padding: 20px;
          border-top: 1px solid #ff0000;
          color: #999;
          font-size: 0.9em;
        }

        .view-count {
          display: inline-block;
          margin-top: 10px;
          color: #cc0000;
        }

        .locked-overlay {
          position: relative;
        }

        .locked-overlay::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.8),
            rgba(0, 0, 0, 0.8) 10px,
            rgba(255, 0, 0, 0.1) 10px,
            rgba(255, 0, 0, 0.1) 20px
          );
          filter: blur(2px);
        }
      `}</style>

      <div className="content">
        <Link href="/vault/main">
          <button className="back-button">← TILBAKE TIL HVELV</button>
        </Link>

        <div className="warning-banner">
          ⚠️⚠️⚠️ KLASSIFISERT INFORMASJON - NIVÅ {entry.dangerLevel} ⚠️⚠️⚠️
        </div>

        <div className="alert-lights">
          <div className="alert-light"></div>
          <div className="alert-light"></div>
          <div className="alert-light"></div>
          <div className="alert-light"></div>
        </div>

        <div className="header">
          <h1 className="title">{entry.title}</h1>
          <div className="question">❓ {entry.question}</div>

          <div className="metadata">
            <div className="tags">
              {entry.tags.map((tag, idx) => (
                <span key={idx} className="tag">#{tag}</span>
              ))}
            </div>
            <div
              className="danger-badge"
              style={{
                color: getDangerLevelColor(entry.dangerLevel),
                borderColor: getDangerLevelColor(entry.dangerLevel),
              }}
            >
              {getDangerLevelText(entry.dangerLevel)}
            </div>
          </div>
        </div>

        {!acknowledged ? (
          <div className="warning-section">
            <div className="warning-text">
              {entry.warningText}
            </div>
            <div className="warning-text" style={{ marginTop: '20px', fontSize: '0.95em' }}>
              Ved å fortsette bekrefter du at du forstår at dette innholdet kan være
              kontroversielt, utfordrende eller provoserende. Dette er kun til
              informasjons- og utdanningsformål.
            </div>
            <button
              className="acknowledge-button"
              onClick={() => setAcknowledged(true)}
            >
              ✓ JEG FORSTÅR OG AKSEPTERER RISIKOEN
            </button>
          </div>
        ) : (
          <div className="answer-section">
            <div className="answer-header">
              🔓 DEKRYPTERT SVAR 🔓
            </div>

            {decrypting ? (
              <div className="decrypting">
                DEKRYPTERER DATA...<br />
                ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░
              </div>
            ) : (
              <>
                <div className="answer-text">
                  {entry.answer}
                </div>

                <div className="footer">
                  <div>⚠️ Denne informasjonen er kun til utdanningsformål ⚠️</div>
                  <div className="view-count">
                    👁️ Sett av {entry.viewCount} brukere
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
