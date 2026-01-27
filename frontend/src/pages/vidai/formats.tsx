import { useState } from 'react';
import Link from 'next/link';

interface ExportFormat {
  id: string;
  name: string;
  platform: string;
  aspectRatio: string;
  maxDuration: string;
  resolution: string;
  description: string;
}

const FORMATS: ExportFormat[] = [
  {
    id: 'yt-long',
    name: 'YouTube Long Form',
    platform: 'YouTube',
    aspectRatio: '16:9',
    maxDuration: '12+ hours',
    resolution: '1920x1080 / 3840x2160',
    description: 'Standard landscape video for YouTube main feed. Supports up to 4K.',
  },
  {
    id: 'yt-short',
    name: 'YouTube Shorts',
    platform: 'YouTube',
    aspectRatio: '9:16',
    maxDuration: '3 min',
    resolution: '1080x1920',
    description: 'Vertical short-form video for YouTube Shorts feed.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok',
    aspectRatio: '9:16',
    maxDuration: '10 min',
    resolution: '1080x1920',
    description: 'Vertical video optimized for TikTok For You page.',
  },
  {
    id: 'ig-reel',
    name: 'Instagram Reels',
    platform: 'Instagram',
    aspectRatio: '9:16',
    maxDuration: '15 min',
    resolution: '1080x1920',
    description: 'Vertical video for Instagram Reels. Supports longer formats.',
  },
  {
    id: 'ig-post',
    name: 'Instagram Post',
    platform: 'Instagram',
    aspectRatio: '1:1',
    maxDuration: '60 sec',
    resolution: '1080x1080',
    description: 'Square video for Instagram main feed posts.',
  },
  {
    id: 'ig-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    aspectRatio: '9:16',
    maxDuration: '60 sec',
    resolution: '1080x1920',
    description: 'Full-screen vertical video for Instagram Stories.',
  },
  {
    id: 'fb-feed',
    name: 'Facebook Feed',
    platform: 'Facebook',
    aspectRatio: '16:9',
    maxDuration: '240 min',
    resolution: '1920x1080',
    description: 'Standard landscape video for Facebook news feed.',
  },
  {
    id: 'fb-reel',
    name: 'Facebook Reels',
    platform: 'Facebook',
    aspectRatio: '9:16',
    maxDuration: '90 sec',
    resolution: '1080x1920',
    description: 'Short vertical video for Facebook Reels.',
  },
  {
    id: 'x-video',
    name: 'X (Twitter) Video',
    platform: 'X',
    aspectRatio: '16:9',
    maxDuration: '140 sec',
    resolution: '1920x1080',
    description: 'Landscape video for X timeline. Keep it punchy.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Video',
    platform: 'LinkedIn',
    aspectRatio: '16:9',
    maxDuration: '10 min',
    resolution: '1920x1080',
    description: 'Professional landscape video for LinkedIn feed.',
  },
];

export default function FormatsExport() {
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [platformFilter, setPlatformFilter] = useState<string>('All');

  const platforms = ['All', ...new Set(FORMATS.map((f) => f.platform))];

  const filtered = FORMATS.filter(
    (f) => platformFilter === 'All' || f.platform === platformFilter
  );

  const toggleFormat = (id: string) => {
    setSelectedFormats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/vidai" style={styles.backLink}>&larr; VID.AI</Link>
      </nav>

      <h1 style={styles.heading}>Short + Long Form Formats</h1>
      <p style={styles.sub}>Export your video to any platform. Select one or multiple formats for batch export.</p>

      <div style={styles.filterRow}>
        {platforms.map((p) => (
          <button
            key={p}
            style={platformFilter === p ? styles.filterActive : styles.filterBtn}
            onClick={() => setPlatformFilter(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {filtered.map((fmt) => (
          <div
            key={fmt.id}
            style={{
              ...styles.formatCard,
              ...(selectedFormats.has(fmt.id) ? styles.formatSelected : {}),
            }}
            onClick={() => toggleFormat(fmt.id)}
          >
            <div style={styles.formatHeader}>
              <span style={styles.formatName}>{fmt.name}</span>
              <span style={styles.formatRatio}>{fmt.aspectRatio}</span>
            </div>
            <p style={styles.formatDesc}>{fmt.description}</p>
            <div style={styles.formatMeta}>
              <span>Max: {fmt.maxDuration}</span>
              <span>{fmt.resolution}</span>
            </div>
            {selectedFormats.has(fmt.id) && (
              <span style={styles.checkmark}>\u2713 Selected</span>
            )}
          </div>
        ))}
      </div>

      {selectedFormats.size > 0 && (
        <div style={styles.exportBar}>
          <span style={styles.exportCount}>
            {selectedFormats.size} format{selectedFormats.size !== 1 ? 's' : ''} selected
          </span>
          <Link href="/vidai/video">
            <button style={styles.exportBtn}>Export Video</button>
          </Link>
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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  nav: { marginBottom: '2rem' },
  backLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: 600 },
  heading: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' },
  sub: { color: '#94a3b8', marginBottom: '1.5rem' },
  filterRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#94a3b8',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  filterActive: {
    background: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '6px',
    color: '#fff',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  formatCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  formatSelected: {
    borderColor: '#22c55e',
    background: 'rgba(34,197,94,0.08)',
  },
  formatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  formatName: { fontWeight: 700, fontSize: '1rem' },
  formatRatio: { color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem' },
  formatDesc: { color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 0.5rem' },
  formatMeta: { display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.8rem' },
  checkmark: { display: 'block', color: '#22c55e', fontWeight: 700, fontSize: '0.8rem', marginTop: '0.5rem' },
  exportBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#1a1a2e',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
  },
  exportCount: { fontSize: '0.95rem' },
  exportBtn: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 1.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};
