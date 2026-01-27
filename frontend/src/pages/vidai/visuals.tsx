import { useState } from 'react';
import Link from 'next/link';

interface StockClip {
  id: string;
  title: string;
  category: string;
  tags: string[];
  duration: string;
  resolution: string;
}

const CATEGORIES = ['All', 'Nature', 'City', 'Technology', 'People', 'Food', 'Business', 'Abstract', 'Travel', 'Fitness'] as const;

const SAMPLE_CLIPS: StockClip[] = [
  { id: 'c1', title: 'Aerial Mountain Sunrise', category: 'Nature', tags: ['drone', 'mountains', 'sunrise'], duration: '15s', resolution: '4K' },
  { id: 'c2', title: 'City Traffic Timelapse', category: 'City', tags: ['traffic', 'night', 'timelapse'], duration: '20s', resolution: '4K' },
  { id: 'c3', title: 'Typing on Laptop', category: 'Technology', tags: ['laptop', 'hands', 'work'], duration: '10s', resolution: '1080p' },
  { id: 'c4', title: 'Walking Through Forest', category: 'Nature', tags: ['forest', 'walk', 'peaceful'], duration: '12s', resolution: '4K' },
  { id: 'c5', title: 'Coffee Pour Close-up', category: 'Food', tags: ['coffee', 'closeup', 'morning'], duration: '8s', resolution: '4K' },
  { id: 'c6', title: 'Office Meeting Room', category: 'Business', tags: ['office', 'meeting', 'corporate'], duration: '15s', resolution: '1080p' },
  { id: 'c7', title: 'Abstract Light Particles', category: 'Abstract', tags: ['particles', 'light', 'motion'], duration: '10s', resolution: '4K' },
  { id: 'c8', title: 'Beach Sunset Waves', category: 'Travel', tags: ['beach', 'sunset', 'waves'], duration: '18s', resolution: '4K' },
  { id: 'c9', title: 'Gym Workout Montage', category: 'Fitness', tags: ['gym', 'workout', 'strength'], duration: '25s', resolution: '1080p' },
  { id: 'c10', title: 'Smartphone Scrolling', category: 'Technology', tags: ['phone', 'scroll', 'social'], duration: '8s', resolution: '1080p' },
  { id: 'c11', title: 'Rain on Window', category: 'Nature', tags: ['rain', 'window', 'moody'], duration: '15s', resolution: '4K' },
  { id: 'c12', title: 'Street Food Market', category: 'Food', tags: ['street food', 'market', 'cooking'], duration: '20s', resolution: '4K' },
  { id: 'c13', title: 'Data Center Server Racks', category: 'Technology', tags: ['servers', 'data', 'tech'], duration: '12s', resolution: '4K' },
  { id: 'c14', title: 'Airplane Window View', category: 'Travel', tags: ['airplane', 'clouds', 'flying'], duration: '10s', resolution: '1080p' },
  { id: 'c15', title: 'Neon City Night', category: 'City', tags: ['neon', 'night', 'urban'], duration: '14s', resolution: '4K' },
];

export default function FacelessVisuals() {
  const [category, setCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());

  const filtered = SAMPLE_CLIPS.filter((clip) => {
    if (category !== 'All' && clip.category !== category) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return clip.title.toLowerCase().includes(q) ||
        clip.tags.some((t) => t.includes(q)) ||
        clip.category.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleClip = (id: string) => {
    setSelectedClips((prev) => {
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

      <h1 style={styles.heading}>Faceless Stock Visuals</h1>
      <p style={styles.sub}>Browse and select stock footage for faceless channel content. No face needed.</p>

      <div style={styles.filters}>
        <input
          style={styles.search}
          placeholder="Search clips by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={styles.catRow}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              style={category === c ? styles.catActive : styles.catBtn}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p style={styles.count}>
        {filtered.length} clips {selectedClips.size > 0 && `| ${selectedClips.size} selected`}
      </p>

      <div style={styles.grid}>
        {filtered.map((clip) => (
          <div
            key={clip.id}
            style={{
              ...styles.clipCard,
              ...(selectedClips.has(clip.id) ? styles.clipSelected : {}),
            }}
            onClick={() => toggleClip(clip.id)}
          >
            <div style={styles.clipPreview}>
              <span style={styles.clipIcon}>
                {selectedClips.has(clip.id) ? '\u2713' : '\u25B6'}
              </span>
            </div>
            <h3 style={styles.clipTitle}>{clip.title}</h3>
            <div style={styles.clipMeta}>
              <span>{clip.category}</span>
              <span>{clip.duration}</span>
              <span>{clip.resolution}</span>
            </div>
            <div style={styles.tagRow}>
              {clip.tags.map((tag) => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedClips.size > 0 && (
        <div style={styles.selectionBar}>
          {selectedClips.size} clip{selectedClips.size !== 1 ? 's' : ''} selected
          <Link href="/vidai/video">
            <button style={styles.useBtn}>Add to Video</button>
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
    maxWidth: '1100px',
    margin: '0 auto',
  },
  nav: { marginBottom: '2rem' },
  backLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: 600 },
  heading: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' },
  sub: { color: '#94a3b8', marginBottom: '1.5rem' },
  filters: { marginBottom: '1rem' },
  search: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    padding: '0.625rem 1rem',
    fontSize: '0.95rem',
    marginBottom: '0.75rem',
    boxSizing: 'border-box',
  },
  catRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  catBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    color: '#94a3b8',
    padding: '0.375rem 0.875rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  catActive: {
    background: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '20px',
    color: '#fff',
    padding: '0.375rem 0.875rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: 700,
  },
  count: { color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  clipCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  clipSelected: {
    borderColor: '#22c55e',
    background: 'rgba(34,197,94,0.1)',
  },
  clipPreview: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  clipIcon: { fontSize: '1.5rem', color: '#64748b' },
  clipTitle: { fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' },
  clipMeta: { display: 'flex', gap: '0.75rem', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' },
  tagRow: { display: 'flex', gap: '0.375rem', flexWrap: 'wrap' },
  tag: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding: '0.125rem 0.5rem',
    fontSize: '0.7rem',
    color: '#94a3b8',
  },
  selectionBar: {
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
    fontSize: '0.95rem',
  },
  useBtn: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1.25rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
