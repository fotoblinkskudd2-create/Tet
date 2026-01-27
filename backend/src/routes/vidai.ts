import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

const router = Router();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface Scene {
  order: number;
  narration: string;
  visualType: 'stock' | 'broll' | 'split' | 'text';
  visualQuery: string;
  duration: number;
}

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
  createdAt: string;
}

interface TextMessage {
  id: string;
  sender: 'left' | 'right';
  text: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------

const projects = new Map<string, VideoProject>();

// ---------------------------------------------------------------------------
// Script templates for generation
// ---------------------------------------------------------------------------

const HOOK_TEMPLATES = [
  'What if I told you {topic} could change everything?',
  'Most people get {topic} completely wrong. Here\'s the truth.',
  'Stop scrolling. This is the {topic} breakdown you need.',
  'In the next few minutes, {topic} will make total sense.',
  'Nobody is talking about this {topic} secret.',
];

const CTA_TEMPLATES = [
  'If this helped, smash that subscribe button and drop a comment below.',
  'Follow for more {topic} content. Share this with someone who needs it.',
  'Like and subscribe if you want more videos like this.',
  'Comment your biggest {topic} takeaway below.',
  'Hit the bell icon so you never miss a {topic} video.',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateScriptFromPrompt(prompt: string, tone: string, format: string): GeneratedScript {
  const topic = prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt;
  const isShort = format.includes('Short') || format === 'TikTok' || format === 'Instagram Reel';

  const hook = pickRandom(HOOK_TEMPLATES).replace('{topic}', topic);
  const cta = pickRandom(CTA_TEMPLATES).replace('{topic}', topic);

  const sections: ScriptSection[] = isShort
    ? [
        { label: 'Key Point', text: `Here's the thing about ${prompt}. Most people overcomplicate it. The real answer is simpler than you think.` },
        { label: 'Proof', text: `The data backs this up. When you look at the numbers, the results speak for themselves.` },
      ]
    : [
        { label: 'Introduction', text: `Let's break down ${prompt}. I've spent hours researching this so you don't have to. By the end, you'll have a clear action plan.` },
        { label: 'Point 1', text: `First, the foundation. Understanding the basics of ${prompt} is crucial because everything else builds on top of this.` },
        { label: 'Point 2', text: `Now here's where it gets interesting. The advanced strategy that separates beginners from experts is all about consistency and systems.` },
        { label: 'Point 3', text: `The secret sauce? Automation. Set up once, and let the compounding work in your favor. Build systems, not stress.` },
        { label: 'Summary', text: `To recap: start with the fundamentals, level up your strategy, and automate everything. ${prompt} is a long game, and you're now ahead of 90% of people.` },
      ];

  const estimatedDuration = isShort ? '30-60 seconds' : '5-10 minutes';

  return {
    title: `${prompt.charAt(0).toUpperCase() + prompt.slice(1)} — ${tone} Breakdown`,
    hook,
    sections,
    cta,
    estimatedDuration,
  };
}

// ---------------------------------------------------------------------------
// Scene splitting
// ---------------------------------------------------------------------------

function splitIntoScenes(script: string, format: string): Scene[] {
  const paragraphs = script
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [{ order: 1, narration: script, visualType: 'stock', visualQuery: 'general', duration: 15 }];
  }

  return paragraphs.map((para, i) => {
    const wordCount = para.split(/\s+/).length;
    const duration = Math.max(5, Math.round(wordCount / 2.5));
    const visualType: Scene['visualType'] =
      i === 0 ? 'text' : i % 3 === 0 ? 'broll' : 'stock';

    const queryWords = para.split(/\s+/).slice(0, 4).join(' ');

    return {
      order: i + 1,
      narration: para,
      visualType,
      visualQuery: queryWords,
      duration,
    };
  });
}

// ---------------------------------------------------------------------------
// Text message generation
// ---------------------------------------------------------------------------

const TEXT_STORIES: Record<string, { messages: Array<{ sender: 'left' | 'right'; text: string }> }> = {
  default: {
    messages: [
      { sender: 'left', text: 'Hey, we need to talk...' },
      { sender: 'right', text: 'About what?' },
      { sender: 'left', text: 'I saw something on your phone' },
      { sender: 'right', text: 'What are you talking about??' },
      { sender: 'left', text: 'The messages. I saw all of them.' },
      { sender: 'right', text: 'I can explain' },
      { sender: 'left', text: 'Go ahead. I\'m listening.' },
      { sender: 'right', text: 'It was a surprise birthday party planning group chat' },
      { sender: 'right', text: 'For YOU' },
      { sender: 'left', text: '...' },
      { sender: 'left', text: 'Oh.' },
      { sender: 'right', text: 'Yeah. Surprise ruined I guess lol' },
      { sender: 'left', text: 'I am SO sorry' },
      { sender: 'right', text: 'You\'re still getting the party. But now you have to act surprised.' },
      { sender: 'left', text: 'Deal. I love you.' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST /api/vidai/script — Generate a video script from a prompt
router.post('/script', (req: Request, res: Response) => {
  const { prompt, tone, format } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const script = generateScriptFromPrompt(
    prompt,
    tone || 'Casual',
    format || 'YouTube Long',
  );

  res.json(script);
});

// POST /api/vidai/video/split-scenes — Split a script into scenes
router.post('/video/split-scenes', (req: Request, res: Response) => {
  const { script, format } = req.body || {};

  if (!script || typeof script !== 'string') {
    return res.status(400).json({ error: 'Script text is required' });
  }

  const scenes = splitIntoScenes(script, format || 'YouTube Long');
  res.json({ scenes });
});

// POST /api/vidai/video/build — Create a video project
router.post('/video/build', (req: Request, res: Response) => {
  const { title, format, scenes, voiceId, captionsEnabled, musicTrack } = req.body || {};

  if (!title || !scenes || !Array.isArray(scenes) || scenes.length === 0) {
    return res.status(400).json({ error: 'Title and at least one scene are required' });
  }

  const totalDuration = scenes.reduce(
    (sum: number, s: Scene) => sum + (s.duration || 10),
    0,
  );

  const project: VideoProject = {
    id: uuid(),
    title: String(title),
    status: 'processing',
    format: format || 'YouTube Long',
    duration: `${Math.floor(totalDuration / 60)}:${String(totalDuration % 60).padStart(2, '0')}`,
    voiceId: voiceId || 'emma-neutral',
    captionsEnabled: captionsEnabled !== false,
    musicTrack: musicTrack || 'ambient-lo-fi',
    scenes,
    createdAt: new Date().toISOString(),
  };

  projects.set(project.id, project);
  res.status(201).json(project);
});

// GET /api/vidai/video/:id — Get a video project by ID
router.get('/video/:id', (req: Request, res: Response) => {
  const project = projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// GET /api/vidai/voices — List all available voices
router.get('/voices', (_req: Request, res: Response) => {
  const voices = [
    { id: 'emma-neutral', name: 'Emma', accent: 'American', gender: 'Female', tone: 'Neutral' },
    { id: 'james-deep', name: 'James', accent: 'British', gender: 'Male', tone: 'Deep' },
    { id: 'sofia-warm', name: 'Sofia', accent: 'American', gender: 'Female', tone: 'Warm' },
    { id: 'alex-energetic', name: 'Alex', accent: 'American', gender: 'Male', tone: 'Energetic' },
    { id: 'liam-casual', name: 'Liam', accent: 'Australian', gender: 'Male', tone: 'Casual' },
    { id: 'maya-serious', name: 'Maya', accent: 'Indian', gender: 'Female', tone: 'Serious' },
    { id: 'noah-narrative', name: 'Noah', accent: 'American', gender: 'Male', tone: 'Narrative' },
    { id: 'chloe-bright', name: 'Chloe', accent: 'British', gender: 'Female', tone: 'Bright' },
    { id: 'omar-calm', name: 'Omar', accent: 'Middle Eastern', gender: 'Male', tone: 'Calm' },
    { id: 'mia-dramatic', name: 'Mia', accent: 'American', gender: 'Female', tone: 'Dramatic' },
    { id: 'carlos-smooth', name: 'Carlos', accent: 'Spanish', gender: 'Male', tone: 'Smooth' },
    { id: 'yuki-soft', name: 'Yuki', accent: 'Japanese', gender: 'Female', tone: 'Soft' },
    { id: 'david-confident', name: 'David', accent: 'American', gender: 'Male', tone: 'Confident' },
    { id: 'anna-friendly', name: 'Anna', accent: 'Scandinavian', gender: 'Female', tone: 'Friendly' },
    { id: 'kai-chill', name: 'Kai', accent: 'American', gender: 'Non-binary', tone: 'Chill' },
    { id: 'elena-passionate', name: 'Elena', accent: 'Italian', gender: 'Female', tone: 'Passionate' },
    { id: 'marcus-radio', name: 'Marcus', accent: 'American', gender: 'Male', tone: 'Radio' },
    { id: 'priya-tech', name: 'Priya', accent: 'Indian', gender: 'Female', tone: 'Technical' },
    { id: 'lucas-gritty', name: 'Lucas', accent: 'American', gender: 'Male', tone: 'Gritty' },
    { id: 'sarah-corporate', name: 'Sarah', accent: 'British', gender: 'Female', tone: 'Corporate' },
    { id: 'thomas-whisper', name: 'Thomas', accent: 'American', gender: 'Male', tone: 'Whisper' },
    { id: 'nina-news', name: 'Nina', accent: 'American', gender: 'Female', tone: 'News' },
    { id: 'hans-deep', name: 'Hans', accent: 'German', gender: 'Male', tone: 'Deep' },
    { id: 'jenny-perky', name: 'Jenny', accent: 'American', gender: 'Female', tone: 'Perky' },
    { id: 'ravi-warm', name: 'Ravi', accent: 'Indian', gender: 'Male', tone: 'Warm' },
    { id: 'lisa-sarcastic', name: 'Lisa', accent: 'American', gender: 'Female', tone: 'Sarcastic' },
    { id: 'ahmed-storyteller', name: 'Ahmed', accent: 'Arabic', gender: 'Male', tone: 'Storyteller' },
    { id: 'kim-clear', name: 'Kim', accent: 'Korean', gender: 'Female', tone: 'Clear' },
    { id: 'ryan-hype', name: 'Ryan', accent: 'American', gender: 'Male', tone: 'Hype' },
    { id: 'olivia-elegant', name: 'Olivia', accent: 'British', gender: 'Female', tone: 'Elegant' },
    { id: 'jake-bro', name: 'Jake', accent: 'American', gender: 'Male', tone: 'Bro' },
    { id: 'mei-gentle', name: 'Mei', accent: 'Chinese', gender: 'Female', tone: 'Gentle' },
    { id: 'andre-bass', name: 'Andre', accent: 'French', gender: 'Male', tone: 'Bass' },
    { id: 'tanya-fierce', name: 'Tanya', accent: 'Russian', gender: 'Female', tone: 'Fierce' },
    { id: 'ben-nerd', name: 'Ben', accent: 'American', gender: 'Male', tone: 'Nerdy' },
    { id: 'grace-asmr', name: 'Grace', accent: 'American', gender: 'Female', tone: 'ASMR' },
    { id: 'diego-latin', name: 'Diego', accent: 'Latin American', gender: 'Male', tone: 'Energetic' },
    { id: 'freya-nordic', name: 'Freya', accent: 'Norwegian', gender: 'Female', tone: 'Calm' },
    { id: 'sam-gen-alpha', name: 'Sam', accent: 'American', gender: 'Non-binary', tone: 'Gen Alpha' },
    { id: 'zara-bold', name: 'Zara', accent: 'Nigerian', gender: 'Female', tone: 'Bold' },
    { id: 'ivan-cinematic', name: 'Ivan', accent: 'Eastern European', gender: 'Male', tone: 'Cinematic' },
  ];

  res.json({ voices, total: voices.length });
});

// GET /api/vidai/music — List music tracks
router.get('/music', (_req: Request, res: Response) => {
  const tracks = [
    { id: 'ambient-lo-fi', name: 'Lo-Fi Study', genre: 'Lo-Fi', mood: 'Chill', bpm: 85 },
    { id: 'cinematic-epic', name: 'Epic Rise', genre: 'Cinematic', mood: 'Dramatic', bpm: 120 },
    { id: 'upbeat-pop', name: 'Sunny Day', genre: 'Pop', mood: 'Happy', bpm: 128 },
    { id: 'dark-trap', name: 'Night Drive', genre: 'Trap', mood: 'Dark', bpm: 140 },
    { id: 'corporate-light', name: 'Clean Slate', genre: 'Corporate', mood: 'Professional', bpm: 100 },
    { id: 'acoustic-warm', name: 'Morning Coffee', genre: 'Acoustic', mood: 'Warm', bpm: 90 },
    { id: 'edm-hype', name: 'Drop Zone', genre: 'EDM', mood: 'Energetic', bpm: 150 },
    { id: 'piano-emotional', name: 'Quiet Reflection', genre: 'Piano', mood: 'Emotional', bpm: 72 },
    { id: 'hip-hop-smooth', name: 'Street Glow', genre: 'Hip-Hop', mood: 'Smooth', bpm: 95 },
    { id: 'ambient-nature', name: 'Forest Rain', genre: 'Ambient', mood: 'Peaceful', bpm: 60 },
  ];

  res.json({ tracks, total: tracks.length });
});

// GET /api/vidai/stock — Search stock clips
router.get('/stock', (req: Request, res: Response) => {
  const query = String(req.query.q || '').toLowerCase();
  const category = String(req.query.category || 'All');

  const clips = [
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

  const filtered = clips.filter((clip) => {
    if (category !== 'All' && clip.category !== category) return false;
    if (query) {
      return clip.title.toLowerCase().includes(query) ||
        clip.tags.some((t) => t.includes(query)) ||
        clip.category.toLowerCase().includes(query);
    }
    return true;
  });

  res.json({ clips: filtered, total: filtered.length });
});

// GET /api/vidai/layouts — List layout templates
router.get('/layouts', (_req: Request, res: Response) => {
  const layouts = [
    { id: 'split-50-50', name: 'Split 50/50', type: 'split', regions: ['Left Panel', 'Right Panel'] },
    { id: 'split-70-30', name: 'Split 70/30', type: 'split', regions: ['Main Panel (70%)', 'Side Panel (30%)'] },
    { id: 'top-bottom', name: 'Top & Bottom', type: 'split', regions: ['Top Panel', 'Bottom Panel'] },
    { id: 'pip-corner', name: 'Picture-in-Picture', type: 'pip', regions: ['Background', 'PiP Window'] },
    { id: 'game-broll-full', name: 'Full Game B-Roll', type: 'broll', regions: ['Game Footage'] },
    { id: 'subway-surfers', name: 'Subway Surfers Style', type: 'split', regions: ['Content (Top)', 'Gameplay (Bottom)'] },
    { id: 'minecraft-parkour', name: 'Minecraft Parkour', type: 'overlay', regions: ['Text Overlay', 'Minecraft Background'] },
    { id: 'triple-panel', name: 'Triple Panel', type: 'split', regions: ['Left', 'Center', 'Right'] },
    { id: 'overlay-gradient', name: 'Gradient Overlay', type: 'overlay', regions: ['Background Video', 'Gradient + Text'] },
    { id: 'reaction-split', name: 'Reaction Layout', type: 'split', regions: ['Original Content', 'Reaction Space'] },
  ];

  res.json({ layouts, total: layouts.length });
});

// POST /api/vidai/textmsg/generate — Generate a fake text conversation
router.post('/textmsg/generate', (req: Request, res: Response) => {
  const { prompt, leftName, rightName } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const story = TEXT_STORIES.default;
  let msgId = 1;

  const messages: TextMessage[] = story.messages.map((m) => ({
    id: String(msgId++),
    sender: m.sender,
    text: m.text,
    timestamp: `${9 + Math.floor(msgId / 4)}:${String((msgId * 7) % 60).padStart(2, '0')} PM`,
  }));

  res.json({
    leftName: leftName || 'Alex',
    rightName: rightName || 'Jordan',
    messages,
  });
});

// GET /api/vidai/formats — List export formats
router.get('/formats', (_req: Request, res: Response) => {
  const formats = [
    { id: 'yt-long', name: 'YouTube Long Form', platform: 'YouTube', aspectRatio: '16:9', maxDuration: '12+ hours', resolution: '1920x1080' },
    { id: 'yt-short', name: 'YouTube Shorts', platform: 'YouTube', aspectRatio: '9:16', maxDuration: '3 min', resolution: '1080x1920' },
    { id: 'tiktok', name: 'TikTok', platform: 'TikTok', aspectRatio: '9:16', maxDuration: '10 min', resolution: '1080x1920' },
    { id: 'ig-reel', name: 'Instagram Reels', platform: 'Instagram', aspectRatio: '9:16', maxDuration: '15 min', resolution: '1080x1920' },
    { id: 'ig-post', name: 'Instagram Post', platform: 'Instagram', aspectRatio: '1:1', maxDuration: '60 sec', resolution: '1080x1080' },
    { id: 'ig-story', name: 'Instagram Story', platform: 'Instagram', aspectRatio: '9:16', maxDuration: '60 sec', resolution: '1080x1920' },
    { id: 'fb-feed', name: 'Facebook Feed', platform: 'Facebook', aspectRatio: '16:9', maxDuration: '240 min', resolution: '1920x1080' },
    { id: 'fb-reel', name: 'Facebook Reels', platform: 'Facebook', aspectRatio: '9:16', maxDuration: '90 sec', resolution: '1080x1920' },
    { id: 'x-video', name: 'X (Twitter) Video', platform: 'X', aspectRatio: '16:9', maxDuration: '140 sec', resolution: '1920x1080' },
    { id: 'linkedin', name: 'LinkedIn Video', platform: 'LinkedIn', aspectRatio: '16:9', maxDuration: '10 min', resolution: '1920x1080' },
  ];

  res.json({ formats, total: formats.length });
});

export default router;
