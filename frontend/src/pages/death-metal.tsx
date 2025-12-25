import { useState } from 'react';
import Head from 'next/head';

interface LyricsResponse {
  lyrics: string;
  language: string;
  themes: string[];
  youtubeId: string;
}

export default function DeathMetalGenerator() {
  const [themes, setThemes] = useState('');
  const [language, setLanguage] = useState<'no' | 'en'>('no');
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setLyrics(null);
    setYoutubeId(null);

    try {
      const response = await fetch('/api/lyrics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themes, language }),
      });

      const data: LyricsResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.lyrics || 'Kunne ikke generere tekster');
      }

      setLyrics(data.lyrics);
      setYoutubeId(data.youtubeId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLyrics(null);
    setYoutubeId(null);
    setError(null);
    setThemes('');
  };

  return (
    <>
      <Head>
        <title>Dødsmetal Lyrikk Generator 🔥💀</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Metal+Mania&family=Creepster&family=Nosifer&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="death-metal-container">
        <div className="blood-overlay"></div>
        <div className="fire-overlay"></div>

        <div className="content-wrapper">
          <h1 className="metal-title">
            🔥 DØDSMETAL LYRIKK GENERATOR 💀
          </h1>

          <p className="subtitle">
            {language === 'no'
              ? 'Utløs mørkets kraft! Skriv inn dine temaer og motta tekster fra helvetes dypeste avgrunn...'
              : 'Unleash the power of darkness! Enter your themes and receive lyrics from the deepest abyss of hell...'}
          </p>

          {!lyrics ? (
            <form onSubmit={handleGenerate} className="metal-form">
              <div className="form-group">
                <label htmlFor="themes" className="metal-label">
                  {language === 'no' ? 'TEMAER (f.eks. "apokalypse, isbjørn, ensomhet")' : 'THEMES (e.g. "apocalypse, polar bear, solitude")'}
                </label>
                <input
                  id="themes"
                  type="text"
                  value={themes}
                  onChange={(e) => setThemes(e.target.value)}
                  placeholder={language === 'no' ? 'apokalypse, isbjørn, ensomhet' : 'apocalypse, polar bear, solitude'}
                  required
                  className="metal-input"
                />
              </div>

              <div className="form-group">
                <label className="metal-label">SPRÅK / LANGUAGE</label>
                <div className="language-selector">
                  <button
                    type="button"
                    onClick={() => setLanguage('no')}
                    className={`lang-btn ${language === 'no' ? 'active' : ''}`}
                  >
                    🇳🇴 NORSK
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                  >
                    🇬🇧 ENGLISH
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="metal-button">
                {loading ? (
                  <span className="loading">⚡ BESVERGER... ⚡</span>
                ) : (
                  <span>🔥 GENERER DØDSMETAL TEKSTER 🔥</span>
                )}
              </button>
            </form>
          ) : (
            <div className="lyrics-display">
              <div className="lyrics-header">
                <h2 className="lyrics-title">
                  {language === 'no' ? '💀 TEKSTER FRA MØRKET 💀' : '💀 LYRICS FROM DARKNESS 💀'}
                </h2>
                <button onClick={handleReset} className="reset-button">
                  🔄 {language === 'no' ? 'NY BESVERGING' : 'NEW CONJURATION'}
                </button>
              </div>

              <pre className="lyrics-text">{lyrics}</pre>

              {youtubeId && (
                <div className="youtube-player">
                  <h3 className="player-title">
                    {language === 'no' ? '🎸 BRUTAL METAL SOUNDTRACK 🎸' : '🎸 BRUTAL METAL SOUNDTRACK 🎸'}
                  </h3>
                  <div className="video-wrapper">
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                      title="Brutal Metal Music"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        <style jsx>{`
          .death-metal-container {
            min-height: 100vh;
            background: linear-gradient(180deg, #0a0000 0%, #1a0505 50%, #0a0000 100%);
            position: relative;
            overflow: hidden;
            padding: 2rem;
          }

          .blood-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
              radial-gradient(circle at 20% 30%, rgba(139, 0, 0, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(139, 0, 0, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 40% 80%, rgba(139, 0, 0, 0.25) 0%, transparent 35%);
            pointer-events: none;
            animation: bloodPulse 4s ease-in-out infinite;
          }

          @keyframes bloodPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.9; }
          }

          .fire-overlay {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 200px;
            background: linear-gradient(0deg,
              rgba(255, 69, 0, 0.4) 0%,
              rgba(255, 140, 0, 0.3) 30%,
              rgba(255, 215, 0, 0.1) 60%,
              transparent 100%
            );
            pointer-events: none;
            animation: fireFlicker 2s ease-in-out infinite;
          }

          @keyframes fireFlicker {
            0%, 100% { opacity: 0.7; transform: scaleY(1); }
            25% { opacity: 0.9; transform: scaleY(1.1); }
            50% { opacity: 0.6; transform: scaleY(0.95); }
            75% { opacity: 0.85; transform: scaleY(1.05); }
          }

          .content-wrapper {
            position: relative;
            z-index: 1;
            max-width: 900px;
            margin: 0 auto;
          }

          .metal-title {
            font-family: 'Nosifer', cursive;
            font-size: 3rem;
            color: #ff0000;
            text-align: center;
            text-shadow:
              0 0 20px rgba(255, 0, 0, 0.8),
              0 0 40px rgba(255, 0, 0, 0.6),
              0 0 60px rgba(255, 0, 0, 0.4),
              3px 3px 0 #000,
              -3px -3px 0 #000,
              3px -3px 0 #000,
              -3px 3px 0 #000;
            margin-bottom: 1rem;
            animation: titlePulse 3s ease-in-out infinite;
            letter-spacing: 3px;
          }

          @keyframes titlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          @media (max-width: 768px) {
            .metal-title {
              font-size: 2rem;
            }
          }

          .subtitle {
            font-family: 'Metal Mania', cursive;
            color: #cc0000;
            text-align: center;
            font-size: 1.2rem;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          }

          .metal-form {
            background: rgba(20, 0, 0, 0.9);
            border: 3px solid #8b0000;
            border-radius: 10px;
            padding: 2rem;
            box-shadow:
              0 0 30px rgba(139, 0, 0, 0.5),
              inset 0 0 20px rgba(0, 0, 0, 0.5);
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .metal-label {
            font-family: 'Metal Mania', cursive;
            color: #ff4444;
            display: block;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            letter-spacing: 1px;
          }

          .metal-input {
            width: 100%;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #8b0000;
            border-radius: 5px;
            color: #ff6666;
            font-size: 1rem;
            font-family: 'Metal Mania', cursive;
            transition: all 0.3s ease;
          }

          .metal-input:focus {
            outline: none;
            border-color: #ff0000;
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
          }

          .metal-input::placeholder {
            color: #663333;
          }

          .language-selector {
            display: flex;
            gap: 1rem;
          }

          .lang-btn {
            flex: 1;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #8b0000;
            border-radius: 5px;
            color: #ff6666;
            font-family: 'Metal Mania', cursive;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .lang-btn:hover {
            background: rgba(139, 0, 0, 0.5);
            border-color: #ff0000;
          }

          .lang-btn.active {
            background: #8b0000;
            color: #fff;
            border-color: #ff0000;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.6);
          }

          .metal-button {
            width: 100%;
            padding: 1.2rem;
            background: linear-gradient(135deg, #8b0000 0%, #ff0000 50%, #8b0000 100%);
            border: 3px solid #ff0000;
            border-radius: 8px;
            color: #fff;
            font-family: 'Metal Mania', cursive;
            font-size: 1.3rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            box-shadow: 0 5px 20px rgba(255, 0, 0, 0.4);
          }

          .metal-button:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 8px 30px rgba(255, 0, 0, 0.6);
            animation: buttonPulse 1s ease-in-out infinite;
          }

          @keyframes buttonPulse {
            0%, 100% { box-shadow: 0 8px 30px rgba(255, 0, 0, 0.6); }
            50% { box-shadow: 0 8px 40px rgba(255, 0, 0, 0.9); }
          }

          .metal-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .loading {
            animation: pulse 1s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }

          .lyrics-display {
            background: rgba(20, 0, 0, 0.95);
            border: 3px solid #8b0000;
            border-radius: 10px;
            padding: 2rem;
            box-shadow:
              0 0 40px rgba(139, 0, 0, 0.6),
              inset 0 0 30px rgba(0, 0, 0, 0.7);
          }

          .lyrics-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .lyrics-title {
            font-family: 'Creepster', cursive;
            font-size: 2rem;
            color: #ff0000;
            text-shadow:
              0 0 15px rgba(255, 0, 0, 0.8),
              3px 3px 0 #000;
            margin: 0;
          }

          .reset-button {
            padding: 0.75rem 1.5rem;
            background: rgba(139, 0, 0, 0.8);
            border: 2px solid #ff0000;
            border-radius: 5px;
            color: #fff;
            font-family: 'Metal Mania', cursive;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .reset-button:hover {
            background: #8b0000;
            transform: scale(1.05);
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
          }

          .lyrics-text {
            font-family: 'Metal Mania', cursive;
            color: #ffcccc;
            font-size: 1.1rem;
            line-height: 1.8;
            white-space: pre-wrap;
            word-wrap: break-word;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
            background: rgba(0, 0, 0, 0.5);
            padding: 1.5rem;
            border-radius: 5px;
            border: 1px solid #660000;
          }

          .youtube-player {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid #8b0000;
          }

          .player-title {
            font-family: 'Metal Mania', cursive;
            color: #ff4444;
            text-align: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          }

          .video-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: 8px;
            border: 2px solid #8b0000;
            box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
          }

          .video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .error-message {
            background: rgba(139, 0, 0, 0.3);
            border: 2px solid #ff0000;
            border-radius: 5px;
            padding: 1rem;
            color: #ff6666;
            font-family: 'Metal Mania', cursive;
            text-align: center;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    </>
  );
}
