import { useState, useCallback } from 'react';

// Word banks organized by syllable count and type
const WORD_BANKS = {
  nature: {
    1: ['sun', 'moon', 'rain', 'wind', 'leaf', 'tree', 'bird', 'sky', 'stone', 'pond', 'snow', 'dew', 'mist', 'frog', 'fish'],
    2: ['water', 'flower', 'mountain', 'river', 'autumn', 'winter', 'summer', 'spring', 'silence', 'whisper', 'shadows', 'sunset', 'moonlight', 'bamboo', 'cherry'],
    3: ['beautiful', 'silently', 'hovering', 'wandering', 'waterfall', 'butterfly', 'dragonfly', 'melody', 'universe', 'awakening'],
    4: ['everlasting', 'illuminated', 'meditation', 'contemplation'],
  },
  actions: {
    1: ['falls', 'floats', 'glows', 'flows', 'drifts', 'rests', 'calls', 'blooms', 'fades', 'shines'],
    2: ['dancing', 'flowing', 'glowing', 'drifting', 'floating', 'falling', 'rising', 'singing', 'waiting', 'moving'],
    3: ['reflecting', 'dissolving', 'remembering', 'discovering', 'embracing'],
  },
  feelings: {
    1: ['peace', 'calm', 'joy', 'hope', 'love', 'light', 'dream', 'soul', 'heart', 'grace'],
    2: ['gentle', 'tranquil', 'peaceful', 'sacred', 'ancient', 'timeless', 'endless', 'moment', 'stillness'],
    3: ['harmony', 'serenity', 'eternity', 'memory', 'solitude'],
  },
  descriptors: {
    1: ['soft', 'cool', 'warm', 'bright', 'still', 'deep', 'old', 'new', 'pure', 'wild'],
    2: ['golden', 'silver', 'purple', 'crimson', 'azure', 'silent', 'distant', 'lonely', 'fading', 'sacred'],
    3: ['delicate', 'whispering', 'shimmering', 'eternal', 'infinite'],
  },
};

// Haiku templates with syllable patterns
const TEMPLATES = [
  // Template 1: Nature observation
  { line1: [{ type: 'descriptors', syllables: 2 }, { type: 'nature', syllables: 2 }, { type: 'actions', syllables: 1 }],
    line2: [{ type: 'nature', syllables: 3 }, { type: 'actions', syllables: 2 }, { type: 'descriptors', syllables: 2 }],
    line3: [{ type: 'feelings', syllables: 2 }, { type: 'nature', syllables: 2 }, { type: 'actions', syllables: 1 }] },
  // Template 2: Moment in time
  { line1: [{ type: 'descriptors', syllables: 1 }, { type: 'nature', syllables: 2 }, { type: 'actions', syllables: 2 }],
    line2: [{ type: 'nature', syllables: 2 }, { type: 'feelings', syllables: 3 }, { type: 'actions', syllables: 2 }],
    line3: [{ type: 'feelings', syllables: 3 }, { type: 'actions', syllables: 2 }] },
  // Template 3: Simple beauty
  { line1: [{ type: 'nature', syllables: 3 }, { type: 'actions', syllables: 2 }],
    line2: [{ type: 'descriptors', syllables: 2 }, { type: 'nature', syllables: 2 }, { type: 'feelings', syllables: 3 }],
    line3: [{ type: 'nature', syllables: 2 }, { type: 'feelings', syllables: 3 }] },
  // Template 4: Reflection
  { line1: [{ type: 'descriptors', syllables: 3 }, { type: 'nature', syllables: 2 }],
    line2: [{ type: 'feelings', syllables: 2 }, { type: 'nature', syllables: 2 }, { type: 'actions', syllables: 3 }],
    line3: [{ type: 'nature', syllables: 1 }, { type: 'feelings', syllables: 2 }, { type: 'actions', syllables: 2 }] },
];

function getRandomWord(type: keyof typeof WORD_BANKS, syllables: number): string {
  const words = WORD_BANKS[type][syllables as keyof typeof WORD_BANKS[typeof type]] || WORD_BANKS[type][2];
  return words[Math.floor(Math.random() * words.length)];
}

function generateLine(parts: { type: keyof typeof WORD_BANKS; syllables: number }[]): string {
  return parts.map(part => getRandomWord(part.type, part.syllables)).join(' ');
}

function generateHaiku(): { line1: string; line2: string; line3: string } {
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  return {
    line1: generateLine(template.line1),
    line2: generateLine(template.line2),
    line3: generateLine(template.line3),
  };
}

export default function HaikuGeneratorPage() {
  const [haiku, setHaiku] = useState<{ line1: string; line2: string; line3: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [savedHaikus, setSavedHaikus] = useState<{ line1: string; line2: string; line3: string }[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setHaiku(generateHaiku());
      setIsAnimating(false);
    }, 300);
  }, []);

  const handleSave = useCallback(() => {
    if (haiku) {
      setSavedHaikus(prev => [haiku, ...prev]);
    }
  }, [haiku]);

  const handleShare = useCallback(async () => {
    if (haiku && navigator.share) {
      try {
        await navigator.share({
          title: 'Haiku',
          text: `${haiku.line1}\n${haiku.line2}\n${haiku.line3}`,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else if (haiku) {
      navigator.clipboard.writeText(`${haiku.line1}\n${haiku.line2}\n${haiku.line3}`);
    }
  }, [haiku]);

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(180deg, #f2f2f7 0%, #e5e5ea 100%);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0;
          background: linear-gradient(180deg, #f2f2f7 0%, #e5e5ea 100%);
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }

        .ios-header {
          background: rgba(242, 242, 247, 0.72);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 12px 16px;
          padding-top: max(env(safe-area-inset-top, 12px), 12px);
          border-bottom: 0.5px solid rgba(60, 60, 67, 0.12);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title {
          font-size: 17px;
          font-weight: 600;
          color: #000;
          letter-spacing: -0.4px;
        }

        .header-button {
          font-size: 17px;
          color: #007aff;
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          font-weight: 400;
        }

        .main-content {
          padding: 20px 16px;
          max-width: 500px;
          margin: 0 auto;
        }

        .haiku-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 32px 24px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .haiku-card.animating {
          transform: scale(0.98);
          opacity: 0.6;
        }

        .haiku-placeholder {
          color: #8e8e93;
          font-size: 17px;
          text-align: center;
          line-height: 1.5;
        }

        .haiku-text {
          text-align: center;
        }

        .haiku-line {
          font-size: 20px;
          color: #1c1c1e;
          line-height: 1.8;
          letter-spacing: 0.3px;
          font-weight: 400;
        }

        .haiku-line:first-letter {
          text-transform: capitalize;
        }

        .generate-button {
          width: 100%;
          background: #007aff;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
          margin-bottom: 12px;
        }

        .generate-button:active {
          background: #0056b3;
          transform: scale(0.98);
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .action-button {
          flex: 1;
          background: #ffffff;
          color: #007aff;
          border: none;
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .action-button:disabled {
          color: #c7c7cc;
          cursor: not-allowed;
        }

        .action-button:not(:disabled):active {
          background: #f2f2f7;
        }

        .icon {
          font-size: 18px;
        }

        .saved-section {
          margin-top: 32px;
        }

        .section-header {
          font-size: 13px;
          font-weight: 600;
          color: #6d6d72;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0 16px;
          margin-bottom: 8px;
        }

        .saved-list {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
        }

        .saved-item {
          padding: 16px;
          border-bottom: 0.5px solid rgba(60, 60, 67, 0.12);
        }

        .saved-item:last-child {
          border-bottom: none;
        }

        .saved-haiku-line {
          font-size: 15px;
          color: #1c1c1e;
          line-height: 1.6;
        }

        .saved-haiku-line:first-letter {
          text-transform: capitalize;
        }

        .empty-saved {
          padding: 24px 16px;
          text-align: center;
          color: #8e8e93;
          font-size: 15px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 200;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: #f2f2f7;
          width: 100%;
          max-width: 500px;
          border-radius: 12px 12px 0 0;
          max-height: 70vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 0.5px solid rgba(60, 60, 67, 0.12);
          background: rgba(242, 242, 247, 0.72);
          backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
        }

        .modal-title {
          font-size: 17px;
          font-weight: 600;
          color: #000;
        }

        .modal-close {
          font-size: 17px;
          color: #007aff;
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
        }

        .modal-body {
          padding: 16px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @media (prefers-color-scheme: dark) {
          body {
            background: linear-gradient(180deg, #000000 0%, #1c1c1e 100%);
          }

          .container {
            background: linear-gradient(180deg, #000000 0%, #1c1c1e 100%);
          }

          .ios-header {
            background: rgba(28, 28, 30, 0.72);
            border-bottom-color: rgba(255, 255, 255, 0.1);
          }

          .header-title {
            color: #fff;
          }

          .haiku-card {
            background: #1c1c1e;
          }

          .haiku-line {
            color: #fff;
          }

          .action-button {
            background: #1c1c1e;
          }

          .action-button:not(:disabled):active {
            background: #2c2c2e;
          }

          .saved-list {
            background: #1c1c1e;
          }

          .saved-haiku-line {
            color: #fff;
          }

          .section-header {
            color: #8e8e93;
          }

          .modal-content {
            background: #1c1c1e;
          }

          .modal-header {
            background: rgba(28, 28, 30, 0.72);
            border-bottom-color: rgba(255, 255, 255, 0.1);
          }

          .modal-title {
            color: #fff;
          }
        }
      `}</style>

      <div className="container">
        <header className="ios-header">
          <div className="header-content">
            <button className="header-button" onClick={() => setShowSaved(true)}>
              Saved
            </button>
            <h1 className="header-title">Haiku Generator</h1>
            <button className="header-button" onClick={handleShare} disabled={!haiku}>
              Share
            </button>
          </div>
        </header>

        <main className="main-content">
          <div className={`haiku-card ${isAnimating ? 'animating' : ''}`}>
            {haiku ? (
              <div className="haiku-text">
                <p className="haiku-line">{haiku.line1}</p>
                <p className="haiku-line">{haiku.line2}</p>
                <p className="haiku-line">{haiku.line3}</p>
              </div>
            ) : (
              <p className="haiku-placeholder">
                Tap the button below to generate<br />a beautiful haiku
              </p>
            )}
          </div>

          <button className="generate-button" onClick={handleGenerate}>
            Generate Haiku
          </button>

          <div className="action-buttons">
            <button className="action-button" onClick={handleSave} disabled={!haiku}>
              <span className="icon">&#9825;</span>
              Save
            </button>
            <button className="action-button" onClick={handleGenerate}>
              <span className="icon">&#8635;</span>
              New
            </button>
          </div>
        </main>

        {showSaved && (
          <div className="modal-overlay" onClick={() => setShowSaved(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span></span>
                <span className="modal-title">Saved Haikus</span>
                <button className="modal-close" onClick={() => setShowSaved(false)}>
                  Done
                </button>
              </div>
              <div className="modal-body">
                {savedHaikus.length > 0 ? (
                  <div className="saved-list">
                    {savedHaikus.map((saved, index) => (
                      <div key={index} className="saved-item">
                        <p className="saved-haiku-line">{saved.line1}</p>
                        <p className="saved-haiku-line">{saved.line2}</p>
                        <p className="saved-haiku-line">{saved.line3}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-saved">No saved haikus yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
