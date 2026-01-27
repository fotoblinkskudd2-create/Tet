import { useState } from 'react';
import Link from 'next/link';

interface ScriptSection {
  label: string;
  text: string;
}

interface GeneratedScript {
  title: string;
  hook: string;
  sections: ScriptSection[];
  cta: string;
  estimatedDuration: string;
}

const TONES = ['Casual', 'Professional', 'Dramatic', 'Humorous', 'Inspirational'] as const;
const FORMATS = ['YouTube Long', 'YouTube Short', 'TikTok', 'Instagram Reel'] as const;

export default function ScriptGenerator() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<string>('Casual');
  const [format, setFormat] = useState<string>('YouTube Long');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/vidai/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone, format }),
      });
      if (!res.ok) throw new Error('Failed to generate script');
      const data: GeneratedScript = await res.json();
      setScript(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/vidai" style={styles.backLink}>&larr; VID.AI</Link>
      </nav>

      <h1 style={styles.heading}>AI Script Generator</h1>
      <p style={styles.sub}>Drop a prompt. Get a full video script with hook, body, and CTA.</p>

      <div style={styles.form}>
        <textarea
          style={styles.textarea}
          placeholder="Describe your video idea... e.g. 'Top 5 passive income ideas for 2026'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />

        <div style={styles.row}>
          <label style={styles.label}>
            Tone
            <select style={styles.select} value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label style={styles.label}>
            Format
            <select style={styles.select} value={format} onChange={(e) => setFormat(e.target.value)}>
              {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        </div>

        <button
          style={styles.button}
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'Generating...' : 'Generate Script'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {script && (
        <div style={styles.result}>
          <h2 style={styles.scriptTitle}>{script.title}</h2>
          <span style={styles.duration}>{script.estimatedDuration}</span>

          <div style={styles.section}>
            <h3 style={styles.sectionLabel}>Hook</h3>
            <p style={styles.sectionText}>{script.hook}</p>
          </div>

          {script.sections.map((s, i) => (
            <div key={i} style={styles.section}>
              <h3 style={styles.sectionLabel}>{s.label}</h3>
              <p style={styles.sectionText}>{s.text}</p>
            </div>
          ))}

          <div style={styles.section}>
            <h3 style={styles.sectionLabel}>Call to Action</h3>
            <p style={styles.sectionText}>{script.cta}</p>
          </div>

          <div style={styles.actions}>
            <button style={styles.actionBtn} onClick={() => navigator.clipboard.writeText(
              `${script.title}\n\n[Hook]\n${script.hook}\n\n` +
              script.sections.map(s => `[${s.label}]\n${s.text}`).join('\n\n') +
              `\n\n[CTA]\n${script.cta}`
            )}>
              Copy Script
            </button>
            <Link href="/vidai/video">
              <button style={styles.actionBtnPrimary}>Send to Video Generator</button>
            </Link>
          </div>
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
    maxWidth: '800px',
    margin: '0 auto',
  },
  nav: { marginBottom: '2rem' },
  backLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: 600 },
  heading: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' },
  sub: { color: '#94a3b8', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  textarea: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    padding: '1rem',
    fontSize: '1rem',
    resize: 'vertical',
  },
  row: { display: 'flex', gap: '1rem' },
  label: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', color: '#94a3b8', fontSize: '0.85rem' },
  select: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: '#fff',
    padding: '0.5rem',
    fontSize: '0.95rem',
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
  error: { color: '#ef4444', margin: '1rem 0' },
  result: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '2rem',
  },
  scriptTitle: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  duration: { color: '#64748b', fontSize: '0.85rem' },
  section: { marginTop: '1.5rem' },
  sectionLabel: { color: '#3b82f6', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' },
  sectionText: { color: '#cbd5e1', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' },
  actions: { display: 'flex', gap: '1rem', marginTop: '2rem' },
  actionBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  actionBtnPrimary: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
