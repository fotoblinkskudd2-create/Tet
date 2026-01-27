import { useState } from 'react';
import Link from 'next/link';

interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  type: 'split' | 'overlay' | 'pip' | 'broll';
  regions: string[];
}

const TEMPLATES: LayoutTemplate[] = [
  {
    id: 'split-50-50',
    name: 'Split 50/50',
    description: 'Even split left-right. Main content on left, B-roll on right.',
    type: 'split',
    regions: ['Left Panel', 'Right Panel'],
  },
  {
    id: 'split-70-30',
    name: 'Split 70/30',
    description: 'Main content takes 70% left, sidebar content on right.',
    type: 'split',
    regions: ['Main Panel (70%)', 'Side Panel (30%)'],
  },
  {
    id: 'top-bottom',
    name: 'Top & Bottom',
    description: 'Horizontal split. Commentary on top, gameplay on bottom.',
    type: 'split',
    regions: ['Top Panel', 'Bottom Panel'],
  },
  {
    id: 'pip-corner',
    name: 'Picture-in-Picture',
    description: 'Full-screen main with small overlay in corner.',
    type: 'pip',
    regions: ['Background', 'PiP Window'],
  },
  {
    id: 'game-broll-full',
    name: 'Full Game B-Roll',
    description: 'Full-screen gameplay footage as background for narration.',
    type: 'broll',
    regions: ['Game Footage'],
  },
  {
    id: 'subway-surfers',
    name: 'Subway Surfers Style',
    description: 'Content on top, satisfying gameplay footage on bottom. TikTok viral format.',
    type: 'split',
    regions: ['Content (Top)', 'Gameplay (Bottom)'],
  },
  {
    id: 'minecraft-parkour',
    name: 'Minecraft Parkour',
    description: 'Narration overlay with Minecraft parkour B-roll. YouTube Shorts staple.',
    type: 'overlay',
    regions: ['Text Overlay', 'Minecraft Background'],
  },
  {
    id: 'triple-panel',
    name: 'Triple Panel',
    description: 'Three vertical panels side by side for comparison content.',
    type: 'split',
    regions: ['Left', 'Center', 'Right'],
  },
  {
    id: 'overlay-gradient',
    name: 'Gradient Overlay',
    description: 'B-roll with gradient overlay and large text. Great for motivational content.',
    type: 'overlay',
    regions: ['Background Video', 'Gradient + Text'],
  },
  {
    id: 'reaction-split',
    name: 'Reaction Layout',
    description: 'Original content on one side, reaction cam placeholder on other.',
    type: 'split',
    regions: ['Original Content', 'Reaction Space'],
  },
];

type LayoutType = 'all' | 'split' | 'overlay' | 'pip' | 'broll';

export default function LayoutEngine() {
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<LayoutType>('all');
  const [regionAssignments, setRegionAssignments] = useState<Record<string, string>>({});

  const filtered = TEMPLATES.filter((t) => filterType === 'all' || t.type === filterType);
  const activeTemplate = TEMPLATES.find((t) => t.id === selectedLayout);

  const assignRegion = (region: string, source: string) => {
    setRegionAssignments((prev) => ({ ...prev, [region]: source }));
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/vidai" style={styles.backLink}>&larr; VID.AI</Link>
      </nav>

      <h1 style={styles.heading}>Split Screen & B-Roll</h1>
      <p style={styles.sub}>Game B-roll, split screen layouts, and overlay compositions.</p>

      <div style={styles.filterRow}>
        {(['all', 'split', 'overlay', 'pip', 'broll'] as LayoutType[]).map((t) => (
          <button
            key={t}
            style={filterType === t ? styles.filterActive : styles.filterBtn}
            onClick={() => setFilterType(t)}
          >
            {t === 'all' ? 'All' : t === 'pip' ? 'PiP' : t === 'broll' ? 'B-Roll' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {filtered.map((template) => (
          <div
            key={template.id}
            style={{
              ...styles.templateCard,
              ...(selectedLayout === template.id ? styles.templateSelected : {}),
            }}
            onClick={() => {
              setSelectedLayout(template.id);
              setRegionAssignments({});
            }}
          >
            <div style={styles.templatePreview}>
              {template.regions.map((r, i) => (
                <div key={i} style={{
                  ...styles.previewRegion,
                  flex: template.type === 'split' && i === 0 && template.id === 'split-70-30' ? 2.33 : 1,
                }}>
                  {r}
                </div>
              ))}
            </div>
            <h3 style={styles.templateName}>{template.name}</h3>
            <p style={styles.templateDesc}>{template.description}</p>
            <span style={styles.templateType}>{template.type}</span>
          </div>
        ))}
      </div>

      {activeTemplate && (
        <div style={styles.configPanel}>
          <h2 style={styles.configTitle}>Configure: {activeTemplate.name}</h2>
          <p style={styles.configDesc}>{activeTemplate.description}</p>

          {activeTemplate.regions.map((region) => (
            <div key={region} style={styles.regionRow}>
              <span style={styles.regionLabel}>{region}</span>
              <select
                style={styles.regionSelect}
                value={regionAssignments[region] || ''}
                onChange={(e) => assignRegion(region, e.target.value)}
              >
                <option value="">Select source...</option>
                <option value="stock">Stock Footage</option>
                <option value="game-minecraft">Minecraft Parkour</option>
                <option value="game-subway">Subway Surfers</option>
                <option value="game-gta">GTA Gameplay</option>
                <option value="narration-text">Narration Text</option>
                <option value="caption-overlay">Caption Overlay</option>
                <option value="custom-upload">Custom Upload</option>
              </select>
            </div>
          ))}

          <Link href="/vidai/video">
            <button style={styles.applyBtn}>Apply Layout to Video</button>
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  templateCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  templateSelected: {
    borderColor: '#3b82f6',
    background: 'rgba(59,130,246,0.1)',
  },
  templatePreview: {
    display: 'flex',
    gap: '4px',
    height: '80px',
    marginBottom: '0.75rem',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  previewRegion: {
    background: 'rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    color: '#64748b',
    textAlign: 'center',
    padding: '0.25rem',
  },
  templateName: { fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' },
  templateDesc: { color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0.25rem 0 0.5rem' },
  templateType: {
    display: 'inline-block',
    background: 'rgba(59,130,246,0.15)',
    color: '#3b82f6',
    borderRadius: '4px',
    padding: '0.125rem 0.5rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  configPanel: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  configTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' },
  configDesc: { color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' },
  regionRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' },
  regionLabel: { fontWeight: 600, fontSize: '0.9rem', minWidth: '150px' },
  regionSelect: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: '#fff',
    padding: '0.5rem',
    fontSize: '0.9rem',
  },
  applyBtn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '1.5rem',
  },
};
