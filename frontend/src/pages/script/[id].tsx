import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface DialogueLine {
  character: string;
  line: string;
}

interface Scene {
  id: string;
  scene_number: number;
  location: string;
  time_of_day: string;
  description: string;
  camera_angle: string;
  dialogue: DialogueLine[];
}

interface Character {
  id: string;
  name: string;
  description: string;
  actor_name?: string;
}

interface Script {
  id: string;
  title: string;
  genre: string;
  location: string;
  main_conflict: string;
}

interface ScriptData {
  script: Script;
  scenes: Scene[];
  characters: Character[];
}

export default function ScriptViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<ScriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [castingCharacter, setCastingCharacter] = useState<string | null>(null);
  const [actorName, setActorName] = useState('');

  useEffect(() => {
    if (id) {
      fetchScript();
    }
  }, [id]);

  const fetchScript = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/scripts/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch script');
      }

      const scriptData = await response.json();
      setData(scriptData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateScene = async (sceneNumber: number) => {
    setRegeneratingScene(sceneNumber);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/scripts/${id}/scenes/${sceneNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate scene');
      }

      await fetchScript(); // Refresh the data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to regenerate scene');
    } finally {
      setRegeneratingScene(null);
    }
  };

  const handleCastActor = async (characterName: string) => {
    if (!actorName.trim()) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/api/scripts/${id}/characters/${encodeURIComponent(characterName)}/cast`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ actor_name: actorName }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cast actor');
      }

      await fetchScript(); // Refresh the data
      setCastingCharacter(null);
      setActorName('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cast actor');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">✨ Laster manus...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="error-container">
        <div className="error">{error || 'Script not found'}</div>
        <button onClick={() => router.push('/')} className="back-button">
          ← Tilbake
        </button>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <div className="header">
        <button onClick={() => router.push('/')} className="back-button">
          ← Ny manus
        </button>
        <h1 className="script-title">🎬 {data.script.title}</h1>
        <div className="script-meta">
          <span className="meta-tag">{data.script.genre}</span>
          <span className="meta-tag">{data.script.location}</span>
        </div>
      </div>

      <div className="characters-section">
        <h2>🎭 Rollebesetning</h2>
        <div className="characters-grid">
          {data.characters.map((character) => (
            <div key={character.id} className="character-card">
              <h3>{character.name}</h3>
              <p className="character-desc">{character.description}</p>
              {character.actor_name ? (
                <div className="cast-info">
                  <span className="actor-name">⭐ {character.actor_name}</span>
                  <button
                    onClick={() => setCastingCharacter(character.name)}
                    className="recast-button"
                  >
                    Endre
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCastingCharacter(character.name)}
                  className="cast-button"
                >
                  + Cast skuespiller
                </button>
              )}
              {castingCharacter === character.name && (
                <div className="casting-form">
                  <input
                    type="text"
                    value={actorName}
                    onChange={(e) => setActorName(e.target.value)}
                    placeholder="Tom Hardy, Meryl Streep..."
                    autoFocus
                  />
                  <div className="casting-actions">
                    <button onClick={() => handleCastActor(character.name)}>OK</button>
                    <button onClick={() => setCastingCharacter(null)}>Avbryt</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="film-reel">
        <h2>📽️ Scener</h2>
        {data.scenes.map((scene) => (
          <div key={scene.id} className="scene-frame">
            <div className="film-holes">
              <div className="hole"></div>
              <div className="hole"></div>
              <div className="hole"></div>
            </div>

            <div className="scene-content">
              <div className="scene-header">
                <span className="scene-number">Scene {scene.scene_number}</span>
                <button
                  onClick={() => handleRegenerateScene(scene.scene_number)}
                  disabled={regeneratingScene === scene.scene_number}
                  className="regenerate-button"
                >
                  {regeneratingScene === scene.scene_number ? '⏳ Genererer...' : '🔄 Regenerer'}
                </button>
              </div>

              <div className="scene-slug">
                {scene.time_of_day} - {scene.location}
              </div>

              <div className="camera-angle">
                🎥 {scene.camera_angle}
              </div>

              <p className="scene-description">{scene.description}</p>

              {scene.dialogue && scene.dialogue.length > 0 && (
                <div className="dialogue-section">
                  {scene.dialogue.map((line, idx) => (
                    <div key={idx} className="dialogue-line">
                      <span className="character-name">{line.character}</span>
                      <p className="dialogue-text">{line.line}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="film-holes">
              <div className="hole"></div>
              <div className="hole"></div>
              <div className="hole"></div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .viewer-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .loading,
        .error {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }

        .header {
          text-align: center;
          margin-bottom: 50px;
        }

        .back-button {
          background: #f0f0f0;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 20px;
          transition: background 0.2s;
        }

        .back-button:hover {
          background: #e0e0e0;
        }

        .script-title {
          font-size: 2.5rem;
          margin: 20px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .script-meta {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .meta-tag {
          background: #f0f0f0;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #666;
        }

        .characters-section {
          margin-bottom: 50px;
        }

        .characters-section h2 {
          font-size: 1.8rem;
          margin-bottom: 25px;
          color: #333;
        }

        .characters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .character-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .character-card h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.2rem;
        }

        .character-desc {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 0.9rem;
        }

        .cast-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .actor-name {
          font-weight: 600;
          color: #667eea;
        }

        .cast-button,
        .recast-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .recast-button {
          background: #e0e0e0;
          color: #333;
          padding: 4px 12px;
          font-size: 0.8rem;
        }

        .cast-button:hover,
        .recast-button:hover {
          opacity: 0.9;
        }

        .casting-form {
          margin-top: 10px;
        }

        .casting-form input {
          width: 100%;
          padding: 8px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          margin-bottom: 8px;
          box-sizing: border-box;
        }

        .casting-actions {
          display: flex;
          gap: 8px;
        }

        .casting-actions button {
          flex: 1;
          padding: 6px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .casting-actions button:first-child {
          background: #667eea;
          color: white;
        }

        .casting-actions button:last-child {
          background: #e0e0e0;
        }

        .film-reel h2 {
          font-size: 1.8rem;
          margin-bottom: 30px;
          color: #333;
        }

        .scene-frame {
          background: linear-gradient(90deg, #2d2d2d 0%, #1a1a1a 50%, #2d2d2d 100%);
          padding: 30px 0;
          margin-bottom: 30px;
          border-radius: 15px;
          display: flex;
          gap: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .film-holes {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 20px 10px;
        }

        .hole {
          width: 20px;
          height: 20px;
          background: #0a0a0a;
          border-radius: 50%;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .scene-content {
          flex: 1;
          background: white;
          padding: 25px;
          border-radius: 8px;
        }

        .scene-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .scene-number {
          font-size: 1.3rem;
          font-weight: bold;
          color: #667eea;
        }

        .regenerate-button {
          background: #f0f0f0;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .regenerate-button:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .regenerate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .scene-slug {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 10px;
        }

        .camera-angle {
          color: #666;
          font-style: italic;
          margin-bottom: 15px;
          font-size: 0.95rem;
        }

        .scene-description {
          line-height: 1.6;
          color: #444;
          margin-bottom: 20px;
        }

        .dialogue-section {
          border-left: 3px solid #667eea;
          padding-left: 20px;
        }

        .dialogue-line {
          margin-bottom: 15px;
        }

        .character-name {
          font-weight: bold;
          color: #333;
          text-transform: uppercase;
          font-size: 0.9rem;
        }

        .dialogue-text {
          margin: 5px 0 0 0;
          color: #555;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .scene-frame {
            gap: 10px;
            padding: 20px 0;
          }

          .film-holes {
            padding: 10px 5px;
          }

          .hole {
            width: 15px;
            height: 15px;
          }

          .scene-content {
            padding: 20px;
          }

          .characters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
