import { useState } from 'react';
import Head from 'next/head';

interface StoryResponse {
  session_id: string;
  story: string;
  full_story?: string;
  keywords: string[];
}

export default function GonzoGenerator() {
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');
  const [keyword3, setKeyword3] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [story, setStory] = useState<string>('');
  const [fullStory, setFullStory] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const generateNewStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/gonzo/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: [keyword1, keyword2, keyword3],
          action: 'new'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }

      const data: StoryResponse = await response.json();
      setSessionId(data.session_id);
      setStory(data.story);
      setFullStory(data.story);
      setKeywords(data.keywords);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const continueStory = async (action: 'continue' | 'twist') => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/gonzo/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          action: action
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to continue story');
      }

      const data: StoryResponse = await response.json();
      setStory(data.story);
      setFullStory(data.full_story || data.story);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!sessionId) return;
    window.open(`${API_URL}/api/gonzo/pdf/${sessionId}`, '_blank');
  };

  const resetGenerator = () => {
    setKeyword1('');
    setKeyword2('');
    setKeyword3('');
    setSessionId(null);
    setStory('');
    setFullStory('');
    setKeywords([]);
    setError(null);
  };

  return (
    <>
      <Head>
        <title>Gonzo Story Generator - Uendelig rå historie-maskin</title>
        <meta name="description" content="Generate raw gonzo stories in Hunter S. Thompson style" />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>⚡ GONZO STORY GENERATOR ⚡</h1>
          <p style={styles.subtitle}>
            Uendelig rå historie-maskin i Hunter S. Thompson-stil
          </p>
        </header>

        {!sessionId ? (
          <div style={styles.inputSection}>
            <h2 style={styles.sectionTitle}>Skriv inn 3 stikkord</h2>
            <form onSubmit={generateNewStory} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Stikkord 1 (f.eks. 'speed')"
                  value={keyword1}
                  onChange={(e) => setKeyword1(e.target.value)}
                  required
                  style={styles.input}
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Stikkord 2 (f.eks. 'kannibal')"
                  value={keyword2}
                  onChange={(e) => setKeyword2(e.target.value)}
                  required
                  style={styles.input}
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Stikkord 3 (f.eks. 'Tromsø')"
                  value={keyword3}
                  onChange={(e) => setKeyword3(e.target.value)}
                  required
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...(loading ? styles.buttonDisabled : {})
                }}
              >
                {loading ? '⚡ GENERERER GALSKAP...' : '🔥 GENERER GONZO HISTORIE 🔥'}
              </button>
            </form>

            {error && <div style={styles.error}>❌ {error}</div>}
          </div>
        ) : (
          <div style={styles.storySection}>
            <div style={styles.keywordBadges}>
              {keywords.map((kw, idx) => (
                <span key={idx} style={styles.badge}>{kw}</span>
              ))}
            </div>

            <div style={styles.storyDisplay}>
              <div style={styles.storyText}>
                {fullStory.split('\n').map((paragraph, idx) => (
                  <p key={idx} style={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {story && story !== fullStory && (
                <div style={styles.latestPart}>
                  <h3 style={styles.latestLabel}>Nyeste del:</h3>
                  <div style={styles.latestText}>
                    {story.split('\n').map((paragraph, idx) => (
                      <p key={idx} style={styles.paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.actionButtons}>
              <button
                onClick={() => continueStory('continue')}
                disabled={loading}
                style={{
                  ...styles.button,
                  ...styles.continueButton,
                  ...(loading ? styles.buttonDisabled : {})
                }}
              >
                {loading ? '⚡ LASTER...' : '🎯 MER GALSKAP'}
              </button>

              <button
                onClick={() => continueStory('twist')}
                disabled={loading}
                style={{
                  ...styles.button,
                  ...styles.twistButton,
                  ...(loading ? styles.buttonDisabled : {})
                }}
              >
                {loading ? '⚡ LASTER...' : '🌪️ NY VRI'}
              </button>

              <button
                onClick={downloadPDF}
                disabled={loading}
                style={{
                  ...styles.button,
                  ...styles.pdfButton,
                  ...(loading ? styles.buttonDisabled : {})
                }}
              >
                📄 DEL SOM PDF
              </button>

              <button
                onClick={resetGenerator}
                style={{
                  ...styles.button,
                  ...styles.resetButton
                }}
              >
                🔄 NY HISTORIE
              </button>
            </div>

            {error && <div style={styles.error}>❌ {error}</div>}
          </div>
        )}

        <footer style={styles.footer}>
          <p style={styles.footerText}>
            ⚠️ ADVARSEL: Gonzo-historier kan inneholde eksplisitt innhold,
            galskap og Hunter S. Thompson-nivå av råhet. Ingen sensur.
          </p>
        </footer>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b00 100%)',
    color: '#fff',
    padding: '2rem',
    fontFamily: '"Courier New", monospace',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
    borderBottom: '3px solid #ff6600',
    paddingBottom: '2rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#ff6600',
    textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
    letterSpacing: '3px',
    margin: '0',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#ffcc00',
    marginTop: '1rem',
    fontStyle: 'italic',
  },
  inputSection: {
    maxWidth: '600px',
    margin: '0 auto',
    background: 'rgba(0,0,0,0.5)',
    padding: '2rem',
    borderRadius: '10px',
    border: '2px solid #ff6600',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#ffcc00',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  input: {
    padding: '1rem',
    fontSize: '1.1rem',
    background: '#2a2a2a',
    color: '#fff',
    border: '2px solid #ff6600',
    borderRadius: '5px',
    fontFamily: 'inherit',
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    letterSpacing: '1px',
  },
  primaryButton: {
    background: '#ff6600',
    color: '#000',
  },
  continueButton: {
    background: '#00cc66',
    color: '#000',
  },
  twistButton: {
    background: '#cc00ff',
    color: '#fff',
  },
  pdfButton: {
    background: '#0066ff',
    color: '#fff',
  },
  resetButton: {
    background: '#666',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  error: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(255,0,0,0.2)',
    border: '2px solid #ff0000',
    borderRadius: '5px',
    color: '#ff6666',
    textAlign: 'center' as const,
  },
  storySection: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  keywordBadges: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  badge: {
    background: '#ff6600',
    color: '#000',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  storyDisplay: {
    background: 'rgba(0,0,0,0.5)',
    padding: '2rem',
    borderRadius: '10px',
    border: '2px solid #ff6600',
    marginBottom: '2rem',
    maxHeight: '600px',
    overflowY: 'auto' as const,
  },
  storyText: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#f0f0f0',
  },
  paragraph: {
    marginBottom: '1rem',
  },
  latestPart: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '2px dashed #ff6600',
  },
  latestLabel: {
    color: '#ffcc00',
    marginBottom: '1rem',
  },
  latestText: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#fff',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  footer: {
    marginTop: '4rem',
    paddingTop: '2rem',
    borderTop: '2px solid #ff6600',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#ffcc00',
    fontStyle: 'italic',
    fontSize: '0.9rem',
  },
};
