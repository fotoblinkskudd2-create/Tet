import { useState } from 'react';
import Link from 'next/link';

interface VideoProject {
  id: string;
  title: string;
  status: 'draft' | 'processing' | 'ready';
  format: string;
  duration: string;
  voiceId: string;
  captionsEnabled: boolean;
  musicTrack: string;
  scenes: Scene[];
}

interface Scene {
  order: number;
  narration: string;
  visualType: 'stock' | 'broll' | 'split' | 'text';
  visualQuery: string;
  duration: number;
}

const ASPECT_RATIOS: Record<string, string> = {
  'YouTube Long': '16:9',
  'YouTube Short': '9:16',
  'TikTok': '9:16',
  'Instagram Reel': '9:16',
  'Instagram Post': '1:1',
};

export default function VideoGenerator() {
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('YouTube Long');
  const [scriptText, setScriptText] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<VideoProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAutoSplit = async () => {
    if (!scriptText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vidai/video/split-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptText, format }),
      });
      if (!res.ok) throw new Error('Failed to split scenes');
      const data = await res.json();
      setScenes(data.scenes);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuildVideo = async () => {
    if (scenes.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vidai/video/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          format,
          scenes,
          voiceId: 'emma-neutral',
          captionsEnabled: true,
          musicTrack: 'ambient-lo-fi',
        }),
      });
      if (!res.ok) throw new Error('Failed to build video project');
      const data: VideoProject = await res.json();
      setProject(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateScene = (index: number, updates: Partial<Scene>) => {
    setScenes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/vidai" style={styles.backLink}>&larr; VID.AI</Link>
      </nav>

      <h1 style={styles.heading}>AI Video Generator</h1>
      <p style={styles.sub}>
        Turn scripts into complete videos. Aspect ratio: {ASPECT_RATIOS[format] || '16:9'}
      </p>

      <div style={styles.form}>
        <input
          style={styles.input}
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select style={styles.select} value={format} onChange={(e) => setFormat(e.target.value)}>
          {Object.keys(ASPECT_RATIOS).map((f) => (
            <option key={f} value={f}>{f} ({ASPECT_RATIOS[f]})</option>
          ))}
        </select>

        <textarea
          style={styles.textarea}
          placeholder="Paste your script here, or go to Script Generator to create one..."
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          rows={8}
        />

        <button style={styles.button} onClick={handleAutoSplit} disabled={loading || !scriptText.trim()}>
          {loading && scenes.length === 0 ? 'Splitting...' : 'Auto-Split into Scenes'}
        </button>
      </div>

      {scenes.length > 0 && (
        <div style={styles.scenesContainer}>
          <h2 style={styles.scenesHeading}>Scenes ({scenes.length})</h2>
          {scenes.map((scene, i) => (
            <div key={i} style={styles.sceneCard}>
              <div style={styles.sceneHeader}>
                <span style={styles.sceneNumber}>Scene {scene.order}</span>
                <span style={styles.sceneDuration}>{scene.duration}s</span>
              </div>
              <textarea
                style={styles.sceneNarration}
                value={scene.narration}
                onChange={(e) => updateScene(i, { narration: e.target.value })}
                rows={3}
              />
              <div style={styles.sceneControls}>
                <select
                  style={styles.selectSmall}
                  value={scene.visualType}
                  onChange={(e) => updateScene(i, { visualType: e.target.value as Scene['visualType'] })}
                >
                  <option value="stock">Stock Footage</option>
                  <option value="broll">Game B-Roll</option>
                  <option value="split">Split Screen</option>
                  <option value="text">Text Overlay</option>
                </select>
                <input
                  style={styles.inputSmall}
                  placeholder="Visual search query"
                  value={scene.visualQuery}
                  onChange={(e) => updateScene(i, { visualQuery: e.target.value })}
                />
              </div>
            </div>
          ))}

          <button
            style={styles.buildButton}
            onClick={handleBuildVideo}
            disabled={loading}
          >
            {loading ? 'Building...' : 'Build Video'}
          </button>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      {project && (
        <div style={styles.projectCard}>
          <h2 style={styles.projectTitle}>{project.title}</h2>
          <div style={styles.projectMeta}>
            <span>Status: {project.status}</span>
            <span>Format: {project.format}</span>
            <span>Duration: {project.duration}</span>
            <span>Voice: {project.voiceId}</span>
          </div>
          <p style={styles.projectNote}>
            Video project created. Processing will begin shortly.
          </p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  nav: { marginBottom: '2rem' },
  backLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: 600 },
  heading: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' },
  sub: { color: '#94a3b8', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
  },
  select: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: '#fff',
    padding: '0.5rem',
    fontSize: '0.95rem',
    alignSelf: 'flex-start',
  },
  textarea: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    padding: '1rem',
    fontSize: '1rem',
    resize: 'vertical',
  },
  button: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  scenesContainer: { marginTop: '2rem' },
  scenesHeading: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' },
  sceneCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  sceneHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  sceneNumber: { fontWeight: 700, color: '#3b82f6' },
  sceneDuration: { color: '#64748b', fontSize: '0.85rem' },
  sceneNarration: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#cbd5e1',
    padding: '0.5rem',
    fontSize: '0.9rem',
    width: '100%',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  sceneControls: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  selectSmall: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: '#fff',
    padding: '0.375rem',
    fontSize: '0.8rem',
  },
  inputSmall: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: '#fff',
    padding: '0.375rem 0.5rem',
    fontSize: '0.8rem',
  },
  buildButton: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.875rem 2.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '1rem',
  },
  error: { color: '#ef4444', margin: '1rem 0' },
  projectCard: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '2rem',
  },
  projectTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' },
  projectMeta: { display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.85rem', flexWrap: 'wrap' },
  projectNote: { color: '#22c55e', marginTop: '1rem', fontWeight: 600 },
};
