import { useState } from 'react';
import Link from 'next/link';

interface CaptionStyle {
  id: string;
  name: string;
  description: string;
  fontStyle: string;
  position: string;
}

interface MusicTrack {
  id: string;
  name: string;
  genre: string;
  mood: string;
  bpm: number;
  duration: string;
}

const CAPTION_STYLES: CaptionStyle[] = [
  { id: 'word-pop', name: 'Word Pop', description: 'Each word pops in with color highlights on key terms.', fontStyle: 'Bold Sans', position: 'Center' },
  { id: 'subtitle-bar', name: 'Subtitle Bar', description: 'Classic subtitle bar at the bottom with dark background.', fontStyle: 'Regular Sans', position: 'Bottom' },
  { id: 'karaoke', name: 'Karaoke Flow', description: 'Words light up sequentially as they are spoken.', fontStyle: 'Bold Rounded', position: 'Center' },
  { id: 'typewriter', name: 'Typewriter', description: 'Characters appear one by one with typing sound.', fontStyle: 'Monospace', position: 'Top' },
  { id: 'minimal', name: 'Minimal', description: 'Clean, small text in the lower third. Non-distracting.', fontStyle: 'Light Sans', position: 'Lower Third' },
  { id: 'big-impact', name: 'Big Impact', description: 'Large bold text filling the screen for emphasis.', fontStyle: 'Extra Bold', position: 'Full Screen' },
];

const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'ambient-lo-fi', name: 'Lo-Fi Study', genre: 'Lo-Fi', mood: 'Chill', bpm: 85, duration: '3:45' },
  { id: 'cinematic-epic', name: 'Epic Rise', genre: 'Cinematic', mood: 'Dramatic', bpm: 120, duration: '4:20' },
  { id: 'upbeat-pop', name: 'Sunny Day', genre: 'Pop', mood: 'Happy', bpm: 128, duration: '3:10' },
  { id: 'dark-trap', name: 'Night Drive', genre: 'Trap', mood: 'Dark', bpm: 140, duration: '2:55' },
  { id: 'corporate-light', name: 'Clean Slate', genre: 'Corporate', mood: 'Professional', bpm: 100, duration: '3:30' },
  { id: 'acoustic-warm', name: 'Morning Coffee', genre: 'Acoustic', mood: 'Warm', bpm: 90, duration: '4:00' },
  { id: 'edm-hype', name: 'Drop Zone', genre: 'EDM', mood: 'Energetic', bpm: 150, duration: '3:15' },
  { id: 'piano-emotional', name: 'Quiet Reflection', genre: 'Piano', mood: 'Emotional', bpm: 72, duration: '5:00' },
  { id: 'hip-hop-smooth', name: 'Street Glow', genre: 'Hip-Hop', mood: 'Smooth', bpm: 95, duration: '3:40' },
  { id: 'ambient-nature', name: 'Forest Rain', genre: 'Ambient', mood: 'Peaceful', bpm: 60, duration: '6:00' },
];

export default function CaptionsMusic() {
  const [selectedCaption, setSelectedCaption] = useState<string>('word-pop');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(30);
  const [captionColor, setCaptionColor] = useState('#3b82f6');

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/vidai" style={styles.backLink}>&larr; VID.AI</Link>
      </nav>

      <h1 style={styles.heading}>Auto Captions & Music</h1>
      <p style={styles.sub}>Generate timed captions and pick background music that matches your content.</p>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Caption Style</h2>
        <div style={styles.captionGrid}>
          {CAPTION_STYLES.map((cs) => (
            <div
              key={cs.id}
              style={{
                ...styles.captionCard,
                ...(selectedCaption === cs.id ? styles.captionSelected : {}),
              }}
              onClick={() => setSelectedCaption(cs.id)}
            >
              <h3 style={styles.captionName}>{cs.name}</h3>
              <p style={styles.captionDesc}>{cs.description}</p>
              <div style={styles.captionMeta}>
                <span>{cs.fontStyle}</span>
                <span>{cs.position}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.colorRow}>
          <label style={styles.colorLabel}>Highlight Color</label>
          <input
            type="color"
            value={captionColor}
            onChange={(e) => setCaptionColor(e.target.value)}
            style={styles.colorInput}
          />
          <span style={{ color: captionColor, fontWeight: 700 }}>{captionColor}</span>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Background Music</h2>

        <div style={styles.volumeRow}>
          <label style={styles.volumeLabel}>Music Volume: {musicVolume}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            style={styles.slider}
          />
        </div>

        <div style={styles.musicGrid}>
          {MUSIC_TRACKS.map((track) => (
            <div
              key={track.id}
              style={{
                ...styles.trackCard,
                ...(selectedTrack === track.id ? styles.trackSelected : {}),
              }}
              onClick={() => setSelectedTrack(track.id)}
            >
              <div style={styles.trackHeader}>
                <span style={styles.trackName}>{track.name}</span>
                <span style={styles.trackBpm}>{track.bpm} BPM</span>
              </div>
              <div style={styles.trackMeta}>
                <span>{track.genre}</span>
                <span>{track.mood}</span>
                <span>{track.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.applyBar}>
        <Link href="/vidai/video">
          <button style={styles.applyBtn}>Apply to Video</button>
        </Link>
      </div>
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
  sub: { color: '#94a3b8', marginBottom: '2rem' },
  section: { marginBottom: '3rem' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' },
  captionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  captionCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  captionSelected: {
    borderColor: '#3b82f6',
    background: 'rgba(59,130,246,0.1)',
  },
  captionName: { fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' },
  captionDesc: { color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0.25rem 0 0.5rem' },
  captionMeta: { display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.8rem' },
  colorRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' },
  colorLabel: { color: '#94a3b8', fontSize: '0.9rem' },
  colorInput: {
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    background: 'transparent',
  },
  volumeRow: { marginBottom: '1rem' },
  volumeLabel: { color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' },
  slider: { width: '100%', maxWidth: '300px' },
  musicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  trackCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  trackSelected: {
    borderColor: '#22c55e',
    background: 'rgba(34,197,94,0.1)',
  },
  trackHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  trackName: { fontWeight: 700 },
  trackBpm: { color: '#64748b', fontSize: '0.8rem' },
  trackMeta: { display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.8rem' },
  applyBar: { textAlign: 'center', marginTop: '2rem' },
  applyBtn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.875rem 2.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
