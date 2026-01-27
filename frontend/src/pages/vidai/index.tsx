import { useState } from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
}

const tools: Tool[] = [
  {
    id: 'script',
    name: 'AI Script Generator',
    description: 'Drop a prompt, get a full video script with hooks, body, and CTA.',
    icon: '📝',
    href: '/vidai/script',
  },
  {
    id: 'video',
    name: 'AI Video Generator',
    description: 'Turn scripts into complete videos with visuals, voice, and captions.',
    icon: '🎬',
    href: '/vidai/video',
  },
  {
    id: 'voice',
    name: 'Voice Selector',
    description: '40+ human-like voices across accents, tones, and styles.',
    icon: '🎙️',
    href: '/vidai/voice',
  },
  {
    id: 'captions',
    name: 'Auto Captions & Music',
    description: 'Generate timed captions and background music that match your content.',
    icon: '🎵',
    href: '/vidai/captions',
  },
  {
    id: 'visuals',
    name: 'Faceless Stock Visuals',
    description: 'Browse and auto-match stock footage for faceless channel content.',
    icon: '🖼️',
    href: '/vidai/visuals',
  },
  {
    id: 'layout',
    name: 'Split Screen & B-Roll',
    description: 'Game B-roll, split screen layouts, and overlay compositions.',
    icon: '🎮',
    href: '/vidai/layout',
  },
  {
    id: 'textmsg',
    name: 'Viral Text Messages',
    description: 'Generate fake text message conversations for storytelling videos.',
    icon: '💬',
    href: '/vidai/textmsg',
  },
  {
    id: 'formats',
    name: 'Short + Long Form',
    description: 'Export in YouTube Shorts, TikTok, Reels, or full-length formats.',
    icon: '📐',
    href: '/vidai/formats',
  },
];

export default function VidAILanding() {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoVid}>VID</span>
          <span style={styles.logoDot}>.</span>
          <span style={styles.logoAi}>AI</span>
        </div>
        <p style={styles.tagline}>8 tools in 1. Build systems, not stress.</p>
        <p style={styles.subtitle}>
          Set up once &rarr; output forever. Make faceless long form videos fast,
          post consistently, and let the compounding do its thing.
        </p>
      </header>

      <section style={styles.grid}>
        {tools.map((tool) => (
          <Link key={tool.id} href={tool.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                ...styles.card,
                ...(hoveredTool === tool.id ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
            >
              <span style={styles.cardIcon}>{tool.icon}</span>
              <h3 style={styles.cardTitle}>{tool.name}</h3>
              <p style={styles.cardDesc}>{tool.description}</p>
            </div>
          </Link>
        ))}
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaHeading}>Idea to Script (No Blank Page)</h2>
        <p style={styles.ctaText}>
          Drop a prompt, get a script. Instant viral videos with AI.
        </p>
        <Link href="/vidai/script">
          <button style={styles.ctaButton}>Start Creating</button>
        </Link>
      </section>
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
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  logo: {
    fontSize: '3rem',
    fontWeight: 800,
    marginBottom: '0.5rem',
  },
  logoVid: { color: '#ffffff' },
  logoDot: { color: '#3b82f6' },
  logoAi: { color: '#3b82f6' },
  tagline: {
    fontSize: '1.25rem',
    color: '#94a3b8',
    margin: '0.5rem 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0.5rem auto',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto 3rem',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardHover: {
    background: 'rgba(59,130,246,0.1)',
    borderColor: '#3b82f6',
    transform: 'translateY(-2px)',
  },
  cardIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: '0 0 0.5rem',
    color: '#ffffff',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.5,
  },
  cta: {
    textAlign: 'center',
    background: 'linear-gradient(180deg, #1e3a5f 0%, #0a0a1a 100%)',
    borderRadius: '16px',
    padding: '3rem 2rem',
    maxWidth: '700px',
    margin: '0 auto',
  },
  ctaHeading: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '0.75rem',
  },
  ctaText: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    marginBottom: '1.5rem',
  },
  ctaButton: {
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.875rem 2.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
