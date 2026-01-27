import { useState } from 'react';
import Link from 'next/link';

interface Voice {
  id: string;
  name: string;
  accent: string;
  gender: string;
  tone: string;
  preview: string;
}

const VOICES: Voice[] = [
  { id: 'emma-neutral', name: 'Emma', accent: 'American', gender: 'Female', tone: 'Neutral', preview: 'Clear and professional, great for explainer videos.' },
  { id: 'james-deep', name: 'James', accent: 'British', gender: 'Male', tone: 'Deep', preview: 'Rich and authoritative, ideal for documentary style.' },
  { id: 'sofia-warm', name: 'Sofia', accent: 'American', gender: 'Female', tone: 'Warm', preview: 'Friendly and inviting, perfect for lifestyle content.' },
  { id: 'alex-energetic', name: 'Alex', accent: 'American', gender: 'Male', tone: 'Energetic', preview: 'Upbeat and dynamic, great for top-10 lists.' },
  { id: 'liam-casual', name: 'Liam', accent: 'Australian', gender: 'Male', tone: 'Casual', preview: 'Relaxed and approachable, good for vlogs.' },
  { id: 'maya-serious', name: 'Maya', accent: 'Indian', gender: 'Female', tone: 'Serious', preview: 'Focused and articulate, perfect for tech content.' },
  { id: 'noah-narrative', name: 'Noah', accent: 'American', gender: 'Male', tone: 'Narrative', preview: 'Storytelling voice with natural pacing.' },
  { id: 'chloe-bright', name: 'Chloe', accent: 'British', gender: 'Female', tone: 'Bright', preview: 'Cheerful and engaging, great for tutorials.' },
  { id: 'omar-calm', name: 'Omar', accent: 'Middle Eastern', gender: 'Male', tone: 'Calm', preview: 'Soothing and measured, ideal for meditation or learning.' },
  { id: 'mia-dramatic', name: 'Mia', accent: 'American', gender: 'Female', tone: 'Dramatic', preview: 'Bold and theatrical, perfect for story-driven content.' },
  { id: 'carlos-smooth', name: 'Carlos', accent: 'Spanish', gender: 'Male', tone: 'Smooth', preview: 'Polished and fluid, great for luxury brand content.' },
  { id: 'yuki-soft', name: 'Yuki', accent: 'Japanese', gender: 'Female', tone: 'Soft', preview: 'Gentle and precise, ideal for ASMR or calm content.' },
  { id: 'david-confident', name: 'David', accent: 'American', gender: 'Male', tone: 'Confident', preview: 'Strong and direct, great for motivational videos.' },
  { id: 'anna-friendly', name: 'Anna', accent: 'Scandinavian', gender: 'Female', tone: 'Friendly', preview: 'Warm Nordic clarity, perfect for product reviews.' },
  { id: 'kai-chill', name: 'Kai', accent: 'American', gender: 'Non-binary', tone: 'Chill', preview: 'Modern and relaxed, great for gen-z audiences.' },
  { id: 'elena-passionate', name: 'Elena', accent: 'Italian', gender: 'Female', tone: 'Passionate', preview: 'Expressive and lively, ideal for food and travel.' },
  { id: 'marcus-radio', name: 'Marcus', accent: 'American', gender: 'Male', tone: 'Radio', preview: 'Classic broadcast voice, polished and resonant.' },
  { id: 'priya-tech', name: 'Priya', accent: 'Indian', gender: 'Female', tone: 'Technical', preview: 'Clear and precise, excellent for programming tutorials.' },
  { id: 'lucas-gritty', name: 'Lucas', accent: 'American', gender: 'Male', tone: 'Gritty', preview: 'Raw and real, perfect for true crime narratives.' },
  { id: 'sarah-corporate', name: 'Sarah', accent: 'British', gender: 'Female', tone: 'Corporate', preview: 'Polished and measured, ideal for business content.' },
  { id: 'thomas-whisper', name: 'Thomas', accent: 'American', gender: 'Male', tone: 'Whisper', preview: 'Soft and intimate, great for ASMR and bedtime stories.' },
  { id: 'nina-news', name: 'Nina', accent: 'American', gender: 'Female', tone: 'News', preview: 'Crisp news anchor delivery, great for current events.' },
  { id: 'hans-deep', name: 'Hans', accent: 'German', gender: 'Male', tone: 'Deep', preview: 'Commanding and rich, ideal for history documentaries.' },
  { id: 'jenny-perky', name: 'Jenny', accent: 'American', gender: 'Female', tone: 'Perky', preview: 'Bright and bubbly, perfect for beauty and fashion.' },
  { id: 'ravi-warm', name: 'Ravi', accent: 'Indian', gender: 'Male', tone: 'Warm', preview: 'Approachable and clear, good for educational content.' },
  { id: 'lisa-sarcastic', name: 'Lisa', accent: 'American', gender: 'Female', tone: 'Sarcastic', preview: 'Witty and sharp, great for commentary videos.' },
  { id: 'ahmed-storyteller', name: 'Ahmed', accent: 'Arabic', gender: 'Male', tone: 'Storyteller', preview: 'Captivating narrative voice for long-form stories.' },
  { id: 'kim-clear', name: 'Kim', accent: 'Korean', gender: 'Female', tone: 'Clear', preview: 'Crystal clear diction, ideal for language learning.' },
  { id: 'ryan-hype', name: 'Ryan', accent: 'American', gender: 'Male', tone: 'Hype', preview: 'High energy and exciting, perfect for gaming content.' },
  { id: 'olivia-elegant', name: 'Olivia', accent: 'British', gender: 'Female', tone: 'Elegant', preview: 'Sophisticated and refined, great for luxury content.' },
  { id: 'jake-bro', name: 'Jake', accent: 'American', gender: 'Male', tone: 'Bro', preview: 'Casual gym-bro energy, great for fitness content.' },
  { id: 'mei-gentle', name: 'Mei', accent: 'Chinese', gender: 'Female', tone: 'Gentle', preview: 'Soft and calming, ideal for wellness and mindfulness.' },
  { id: 'andre-bass', name: 'Andre', accent: 'French', gender: 'Male', tone: 'Bass', preview: 'Deep and smooth French bass, great for noir content.' },
  { id: 'tanya-fierce', name: 'Tanya', accent: 'Russian', gender: 'Female', tone: 'Fierce', preview: 'Strong and commanding, ideal for empowerment content.' },
  { id: 'ben-nerd', name: 'Ben', accent: 'American', gender: 'Male', tone: 'Nerdy', preview: 'Enthusiastic and detailed, perfect for science content.' },
  { id: 'grace-asmr', name: 'Grace', accent: 'American', gender: 'Female', tone: 'ASMR', preview: 'Ultra-soft whisper for relaxation and ASMR videos.' },
  { id: 'diego-latin', name: 'Diego', accent: 'Latin American', gender: 'Male', tone: 'Energetic', preview: 'Vibrant and lively, great for dance and culture.' },
  { id: 'freya-nordic', name: 'Freya', accent: 'Norwegian', gender: 'Female', tone: 'Calm', preview: 'Peaceful Nordic tone, perfect for nature documentaries.' },
  { id: 'sam-gen-alpha', name: 'Sam', accent: 'American', gender: 'Non-binary', tone: 'Gen Alpha', preview: 'Trendy and fresh, speaks the language of younger audiences.' },
  { id: 'zara-bold', name: 'Zara', accent: 'Nigerian', gender: 'Female', tone: 'Bold', preview: 'Confident and vibrant, ideal for empowerment and culture.' },
  { id: 'ivan-cinematic', name: 'Ivan', accent: 'Eastern European', gender: 'Male', tone: 'Cinematic', preview: 'Epic movie-trailer voice for dramatic content.' },
];

type FilterGender = 'All' | 'Female' | 'Male' | 'Non-binary';

export default function VoiceSelector() {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<FilterGender>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = VOICES.filter((v) => {
    if (filterGender !== 'All' && v.gender !== filterGender) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.name.toLowerCase().includes(q) ||
        v.accent.toLowerCase().includes(q) ||
        v.tone.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/vidai" style={styles.backLink}>&larr; VID.AI</Link>
      </nav>

      <h1 style={styles.heading}>Voice Selector</h1>
      <p style={styles.sub}>{VOICES.length} human-like voices across accents, tones, and styles.</p>

      <div style={styles.filters}>
        <input
          style={styles.search}
          placeholder="Search by name, accent, or tone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={styles.filterButtons}>
          {(['All', 'Female', 'Male', 'Non-binary'] as FilterGender[]).map((g) => (
            <button
              key={g}
              style={filterGender === g ? styles.filterActive : styles.filterBtn}
              onClick={() => setFilterGender(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <p style={styles.count}>{filtered.length} voices</p>

      <div style={styles.grid}>
        {filtered.map((voice) => (
          <div
            key={voice.id}
            style={{
              ...styles.voiceCard,
              ...(selectedVoice === voice.id ? styles.voiceSelected : {}),
            }}
            onClick={() => setSelectedVoice(voice.id)}
          >
            <div style={styles.voiceHeader}>
              <span style={styles.voiceName}>{voice.name}</span>
              <span style={styles.voiceTone}>{voice.tone}</span>
            </div>
            <span style={styles.voiceAccent}>{voice.accent} &middot; {voice.gender}</span>
            <p style={styles.voicePreview}>{voice.preview}</p>
            <button style={styles.playBtn}>Preview Voice</button>
          </div>
        ))}
      </div>

      {selectedVoice && (
        <div style={styles.selectionBar}>
          Selected: <strong>{VOICES.find(v => v.id === selectedVoice)?.name}</strong>
          <Link href="/vidai/video">
            <button style={styles.useBtn}>Use in Video</button>
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
  filters: { display: 'flex', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' },
  search: {
    flex: 1,
    minWidth: '200px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    padding: '0.625rem 1rem',
    fontSize: '0.95rem',
  },
  filterButtons: { display: 'flex', gap: '0.5rem' },
  filterBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
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
  count: { color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  voiceCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  voiceSelected: {
    borderColor: '#3b82f6',
    background: 'rgba(59,130,246,0.1)',
  },
  voiceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' },
  voiceName: { fontWeight: 700, fontSize: '1rem' },
  voiceTone: { color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600 },
  voiceAccent: { color: '#64748b', fontSize: '0.8rem' },
  voicePreview: { color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0.5rem 0' },
  playBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: '#fff',
    padding: '0.375rem 0.75rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
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
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1.25rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
