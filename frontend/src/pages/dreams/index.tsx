import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Dream {
  id: string;
  title: string;
  content: string;
  interpretation?: string;
  timestamp: number;
}

export default function DreamJournalPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showInterpretation, setShowInterpretation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dreams');
    if (saved) {
      setDreams(JSON.parse(saved));
    }
  }, []);

  const saveDreams = (newDreams: Dream[]) => {
    setDreams(newDreams);
    localStorage.setItem('dreams', JSON.stringify(newDreams));
  };

  const handleSaveDream = () => {
    if (!title.trim() || !content.trim()) return;

    const newDream: Dream = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      timestamp: Date.now(),
    };

    saveDreams([newDream, ...dreams]);
    setTitle('');
    setContent('');
  };

  const handleInterpretDream = async (dream: Dream) => {
    setLoading(true);
    setSelectedDream(dream);
    setShowInterpretation(true);

    try {
      const response = await fetch('/api/dreams/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dream.title,
          content: dream.content
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke tolke drømmen');
      }

      const updatedDreams = dreams.map(d =>
        d.id === dream.id
          ? { ...d, interpretation: data.interpretation }
          : d
      );
      saveDreams(updatedDreams);
      setSelectedDream({ ...dream, interpretation: data.interpretation });
    } catch (error) {
      console.error('Feil ved tolkning:', error);
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDream = (id: string) => {
    saveDreams(dreams.filter(d => d.id !== id));
    if (selectedDream?.id === id) {
      setSelectedDream(null);
      setShowInterpretation(false);
    }
  };

  return (
    <>
      <Head>
        <title>Neon Dream Journal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`dream-journal ${darkMode ? 'dark' : 'light'}`}>
        <div className="stars"></div>

        <header className="dream-header">
          <h1 className="glitch" data-text="✨ NEON DREAM JOURNAL ✨">
            ✨ NEON DREAM JOURNAL ✨
          </h1>
          <button
            className="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="dream-container">
          <div className="dream-input-section">
            <h2>Skriv ned drømmen din</h2>
            <input
              type="text"
              placeholder="Drømmetittel..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dream-title-input"
            />
            <textarea
              placeholder="Beskriv drømmen din i detalj..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="dream-content-input"
              rows={8}
            />
            <button
              onClick={handleSaveDream}
              className="save-btn neon-btn"
              disabled={!title.trim() || !content.trim()}
            >
              💾 Lagre Drøm
            </button>
          </div>

          <div className="dreams-list-section">
            <h2>Dine Drømmer ({dreams.length})</h2>
            <div className="dreams-list">
              {dreams.length === 0 ? (
                <p className="empty-state">Ingen drømmer ennå... Skriv ned din første drøm! ✨</p>
              ) : (
                dreams.map(dream => (
                  <div key={dream.id} className="dream-card">
                    <h3>{dream.title}</h3>
                    <p className="dream-preview">
                      {dream.content.substring(0, 100)}
                      {dream.content.length > 100 ? '...' : ''}
                    </p>
                    <p className="dream-date">
                      {new Date(dream.timestamp).toLocaleDateString('no-NO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <div className="dream-actions">
                      <button
                        onClick={() => handleInterpretDream(dream)}
                        className="interpret-btn neon-btn"
                        disabled={loading}
                      >
                        🔮 Tolk Drømmen
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDream(dream);
                          setShowInterpretation(false);
                        }}
                        className="view-btn"
                      >
                        👁️ Se
                      </button>
                      <button
                        onClick={() => handleDeleteDream(dream.id)}
                        className="delete-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {showInterpretation && selectedDream && (
          <div className="interpretation-modal" onClick={() => setShowInterpretation(false)}>
            <div className="interpretation-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-btn"
                onClick={() => setShowInterpretation(false)}
              >
                ✕
              </button>

              <div className="interpretation-header">
                <h2 className="glitch" data-text="🌙 DRØMMETOLKNING 🌙">
                  🌙 DRØMMETOLKNING 🌙
                </h2>
              </div>

              <div className="interpretation-body">
                <h3>{selectedDream.title}</h3>

                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Analyserer drømmen din...</p>
                  </div>
                ) : selectedDream.interpretation ? (
                  <>
                    <div className="dream-image-placeholder">
                      <img
                        src={`https://picsum.photos/seed/${selectedDream.id}/600/400`}
                        alt="Dream visualization"
                        className="dream-image"
                      />
                      <div className="image-overlay"></div>
                    </div>
                    <div className="interpretation-text">
                      {selectedDream.interpretation}
                    </div>
                  </>
                ) : (
                  <p>Ingen tolkning ennå. Klikk "Tolk Drømmen" for å få en AI-tolkning.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedDream && !showInterpretation && (
          <div className="dream-detail-modal" onClick={() => setSelectedDream(null)}>
            <div className="dream-detail-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-btn"
                onClick={() => setSelectedDream(null)}
              >
                ✕
              </button>
              <h2>{selectedDream.title}</h2>
              <p className="dream-date">
                {new Date(selectedDream.timestamp).toLocaleDateString('no-NO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className="dream-full-content">
                {selectedDream.content}
              </div>
              <button
                onClick={() => {
                  handleInterpretDream(selectedDream);
                }}
                className="interpret-btn neon-btn"
                disabled={loading}
              >
                🔮 Tolk Drømmen
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          .dream-journal {
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
            transition: all 0.3s ease;
          }

          .dream-journal.dark {
            background: linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0f0a1a 100%);
            color: #fff;
          }

          .dream-journal.light {
            background: linear-gradient(135deg, #f0f0ff 0%, #e0d0ff 50%, #f0e0ff 100%);
            color: #1a0a2e;
          }

          .stars {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background-image:
              radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 50px 50px, #ddd, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 90px 10px, #eee, rgba(0,0,0,0));
            background-repeat: repeat;
            background-size: 200px 200px;
            animation: twinkle 5s ease-in-out infinite;
            opacity: 0.5;
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
          }

          .dream-header {
            text-align: center;
            padding: 2rem 1rem;
            position: relative;
          }

          .dream-header h1 {
            font-size: 2.5rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3rem;
            margin: 0;
            background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: neon-glow 2s ease-in-out infinite alternate;
          }

          .glitch {
            position: relative;
          }

          .glitch::before,
          .glitch::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .glitch::before {
            left: 2px;
            text-shadow: -2px 0 #ff00ff;
            clip: rect(24px, 550px, 90px, 0);
            animation: glitch-anim-1 2s infinite linear alternate-reverse;
          }

          .glitch::after {
            left: -2px;
            text-shadow: -2px 0 #00ffff;
            clip: rect(85px, 550px, 140px, 0);
            animation: glitch-anim-2 2s infinite linear alternate-reverse;
          }

          @keyframes glitch-anim-1 {
            0% { clip: rect(random(100) + px, 9999px, random(100) + px, 0); }
            100% { clip: rect(random(100) + px, 9999px, random(100) + px, 0); }
          }

          @keyframes glitch-anim-2 {
            0% { clip: rect(random(100) + px, 9999px, random(100) + px, 0); }
            100% { clip: rect(random(100) + px, 9999px, random(100) + px, 0); }
          }

          @keyframes neon-glow {
            from {
              text-shadow:
                0 0 10px #fff,
                0 0 20px #fff,
                0 0 30px #fff,
                0 0 40px #ff00ff,
                0 0 70px #ff00ff,
                0 0 80px #ff00ff,
                0 0 100px #ff00ff,
                0 0 150px #ff00ff;
            }
            to {
              text-shadow:
                0 0 5px #fff,
                0 0 10px #fff,
                0 0 15px #fff,
                0 0 20px #00ffff,
                0 0 35px #00ffff,
                0 0 40px #00ffff,
                0 0 50px #00ffff,
                0 0 75px #00ffff;
            }
          }

          .mode-toggle {
            position: absolute;
            top: 2rem;
            right: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid #ff00ff;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .mode-toggle:hover {
            transform: scale(1.1) rotate(20deg);
            box-shadow: 0 0 20px #ff00ff;
          }

          .dream-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          @media (max-width: 768px) {
            .dream-container {
              grid-template-columns: 1fr;
            }
          }

          .dream-input-section,
          .dreams-list-section {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 0, 255, 0.3);
            border-radius: 20px;
            padding: 2rem;
            box-shadow:
              0 8px 32px 0 rgba(255, 0, 255, 0.2),
              inset 0 0 20px rgba(0, 255, 255, 0.1);
          }

          .dream-input-section h2,
          .dreams-list-section h2 {
            color: #ff00ff;
            margin-top: 0;
            font-size: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.2rem;
          }

          .dream-title-input,
          .dream-content-input {
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid #00ffff;
            border-radius: 10px;
            padding: 1rem;
            color: #fff;
            font-size: 1rem;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
          }

          .dream-title-input:focus,
          .dream-content-input:focus {
            outline: none;
            border-color: #ff00ff;
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
          }

          .dream-content-input {
            resize: vertical;
            font-family: inherit;
          }

          .neon-btn {
            background: linear-gradient(45deg, #ff00ff, #00ffff);
            border: none;
            border-radius: 10px;
            padding: 1rem 2rem;
            color: #fff;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.1rem;
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
          }

          .neon-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
          }

          .neon-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .save-btn {
            width: 100%;
          }

          .dreams-list {
            max-height: 600px;
            overflow-y: auto;
            padding-right: 1rem;
          }

          .dreams-list::-webkit-scrollbar {
            width: 8px;
          }

          .dreams-list::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
          }

          .dreams-list::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #ff00ff, #00ffff);
            border-radius: 10px;
          }

          .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: rgba(255, 255, 255, 0.5);
            font-style: italic;
          }

          .dream-card {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
          }

          .dream-card:hover {
            border-color: #ff00ff;
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
            transform: translateX(5px);
          }

          .dream-card h3 {
            margin: 0 0 0.5rem 0;
            color: #00ffff;
          }

          .dream-preview {
            color: rgba(255, 255, 255, 0.8);
            margin: 0.5rem 0;
            line-height: 1.5;
          }

          .dream-date {
            color: rgba(255, 0, 255, 0.7);
            font-size: 0.85rem;
            margin: 0.5rem 0;
          }

          .dream-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
          }

          .interpret-btn,
          .view-btn,
          .delete-btn {
            flex: 1;
            padding: 0.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          }

          .view-btn {
            background: rgba(0, 255, 255, 0.2);
            color: #00ffff;
            border: 1px solid #00ffff;
          }

          .view-btn:hover {
            background: rgba(0, 255, 255, 0.4);
          }

          .delete-btn {
            background: rgba(255, 0, 100, 0.2);
            color: #ff0064;
            border: 1px solid #ff0064;
            flex: 0 0 auto;
            padding: 0.5rem 1rem;
          }

          .delete-btn:hover {
            background: rgba(255, 0, 100, 0.4);
          }

          .interpretation-modal,
          .dream-detail-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 2rem;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .interpretation-content,
          .dream-detail-content {
            background: linear-gradient(135deg, #1a0a2e 0%, #2a1a4e 100%);
            border: 2px solid #ff00ff;
            border-radius: 20px;
            padding: 2rem;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow:
              0 0 50px rgba(255, 0, 255, 0.5),
              inset 0 0 30px rgba(0, 255, 255, 0.1);
            animation: slideUp 0.3s ease;
          }

          @keyframes slideUp {
            from {
              transform: translateY(50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 0, 100, 0.3);
            border: 2px solid #ff0064;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
            color: #ff0064;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .close-btn:hover {
            background: rgba(255, 0, 100, 0.6);
            transform: rotate(90deg);
          }

          .interpretation-header h2 {
            text-align: center;
            margin: 0 0 2rem 0;
          }

          .interpretation-body h3 {
            color: #00ffff;
            margin-bottom: 1rem;
          }

          .loading-spinner {
            text-align: center;
            padding: 3rem;
          }

          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid #ff00ff;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .dream-image-placeholder {
            position: relative;
            width: 100%;
            margin: 1rem 0;
            border-radius: 15px;
            overflow: hidden;
          }

          .dream-image {
            width: 100%;
            height: auto;
            display: block;
            filter: saturate(1.5) contrast(1.2);
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2));
            mix-blend-mode: overlay;
          }

          .interpretation-text {
            background: rgba(0, 0, 0, 0.3);
            border-left: 4px solid #ff00ff;
            padding: 1.5rem;
            border-radius: 10px;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
            white-space: pre-wrap;
          }

          .dream-full-content {
            background: rgba(0, 0, 0, 0.3);
            padding: 1.5rem;
            border-radius: 10px;
            line-height: 1.8;
            margin: 1rem 0;
            white-space: pre-wrap;
          }
        `}</style>
      </div>
    </>
  );
}
