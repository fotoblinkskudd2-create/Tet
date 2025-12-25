import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Puzzle {
  type: string;
  question: string;
  hint: string;
}

export default function VaultLandingPage() {
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [solution, setSolution] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  useEffect(() => {
    // Check if already unlocked
    const token = localStorage.getItem('vaultToken');
    if (token) {
      verifyToken(token);
    }

    // Fetch puzzle
    fetchPuzzle();

    // Glitch effect on mount
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 5000);

    return () => clearInterval(glitchInterval);
  }, []);

  const fetchPuzzle = async () => {
    try {
      const response = await fetch('/api/vault/puzzle');
      const data = await response.json();
      setPuzzle(data);
    } catch (error) {
      console.error('Failed to fetch puzzle:', error);
    }
  };

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/vault/verify/${token}`);
      const data = await response.json();
      if (data.unlocked) {
        router.push('/vault/main');
      }
    } catch (error) {
      console.error('Failed to verify token:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/vault/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solution, puzzleType: puzzle?.type }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('vaultToken', data.sessionToken);
        setMessage(data.message);

        // Dramatic unlock sequence
        setTimeout(() => {
          router.push('/vault/main');
        }, 2000);
      } else {
        setMessage(data.message);
        // Shake effect on wrong answer
        const container = document.querySelector('.vault-container');
        container?.classList.add('shake');
        setTimeout(() => container?.classList.remove('shake'), 500);
      }
    } catch (error) {
      setMessage('En feil oppstod. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vault-landing">
      <style jsx>{`
        .vault-landing {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%);
          color: #ff0000;
          font-family: 'Courier New', monospace;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .vault-landing::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            repeating-linear-gradient(
              0deg,
              rgba(255, 0, 0, 0.03) 0px,
              transparent 1px,
              transparent 2px,
              rgba(255, 0, 0, 0.03) 3px
            );
          pointer-events: none;
          animation: scanlines 8s linear infinite;
        }

        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(20px); }
        }

        .vault-container {
          max-width: 600px;
          width: 100%;
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid #ff0000;
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.5), inset 0 0 30px rgba(255, 0, 0, 0.1);
          padding: 40px;
          position: relative;
          z-index: 1;
        }

        .vault-container.shake {
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .warning-lights {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .warning-light {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ff0000;
          box-shadow: 0 0 10px #ff0000;
          animation: pulse 1s ease-in-out infinite;
        }

        .warning-light:nth-child(2) {
          animation-delay: 0.33s;
        }

        .warning-light:nth-child(3) {
          animation-delay: 0.66s;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .title {
          text-align: center;
          font-size: 2.5em;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 5px;
          text-shadow: 0 0 10px #ff0000;
          ${glitchEffect ? 'animation: glitch 0.3s;' : ''}
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        .subtitle {
          text-align: center;
          font-size: 1em;
          margin-bottom: 30px;
          color: #cc0000;
          letter-spacing: 2px;
        }

        .warning-banner {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid #ff0000;
          padding: 15px;
          margin-bottom: 30px;
          text-align: center;
          font-size: 0.9em;
          line-height: 1.6;
        }

        .puzzle-section {
          margin-bottom: 30px;
        }

        .puzzle-question {
          background: rgba(255, 0, 0, 0.05);
          border-left: 3px solid #ff0000;
          padding: 20px;
          margin-bottom: 20px;
          font-size: 1.1em;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 10px;
          font-size: 0.9em;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        input {
          width: 100%;
          padding: 15px;
          background: #000;
          border: 1px solid #ff0000;
          color: #ff0000;
          font-family: 'Courier New', monospace;
          font-size: 1.1em;
          box-sizing: border-box;
        }

        input:focus {
          outline: none;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }

        .button-group {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        button {
          flex: 1;
          padding: 15px;
          background: #ff0000;
          border: none;
          color: #000;
          font-family: 'Courier New', monospace;
          font-size: 1em;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }

        button:hover:not(:disabled) {
          background: #cc0000;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hint-button {
          background: transparent;
          border: 1px solid #ff0000;
          color: #ff0000;
        }

        .hint-button:hover {
          background: rgba(255, 0, 0, 0.1);
        }

        .hint {
          background: rgba(255, 0, 0, 0.05);
          border: 1px dashed #ff0000;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 0.9em;
          font-style: italic;
        }

        .message {
          padding: 15px;
          text-align: center;
          margin-top: 20px;
          border: 1px solid #ff0000;
          background: rgba(255, 0, 0, 0.1);
          font-weight: bold;
        }

        .message.success {
          animation: successFlash 0.5s ease-in-out 3;
        }

        @keyframes successFlash {
          0%, 100% { background: rgba(255, 0, 0, 0.1); }
          50% { background: rgba(0, 255, 0, 0.3); border-color: #00ff00; }
        }

        .skull {
          text-align: center;
          font-size: 3em;
          margin-bottom: 20px;
          opacity: 0.5;
        }
      `}</style>

      <div className="vault-container">
        <div className="warning-lights">
          <div className="warning-light"></div>
          <div className="warning-light"></div>
          <div className="warning-light"></div>
        </div>

        <div className="skull">☠️</div>

        <h1 className="title">Forbudt Kunnskap</h1>
        <p className="subtitle">Hvelvet</p>

        <div className="warning-banner">
          ⚠️ ADVARSEL ⚠️<br />
          Dette hvelvet inneholder kontroversiell og utfordrende informasjon.<br />
          Løs puslespillet for å få tilgang.<br />
          ⚠️ FORTSETT PÅ EGET ANSVAR ⚠️
        </div>

        {puzzle && (
          <div className="puzzle-section">
            <div className="puzzle-question">
              <strong>PUSLESPILL:</strong><br />
              {puzzle.question}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>SVAR:</label>
                <input
                  type="text"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Skriv inn ditt svar..."
                  required
                  autoComplete="off"
                />
              </div>

              <div className="button-group">
                <button type="submit" disabled={loading || !solution}>
                  {loading ? 'LÅSER OPP...' : '🔓 LÅS OPP'}
                </button>
                <button
                  type="button"
                  className="hint-button"
                  onClick={() => setShowHint(!showHint)}
                >
                  💡 HINT
                </button>
              </div>
            </form>

            {showHint && (
              <div className="hint">
                💡 {puzzle.hint}
              </div>
            )}
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('INNVILGET') ? 'success' : ''}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
