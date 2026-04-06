import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

type Platform = 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'linkedin';
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface ScheduledPost {
  id: string;
  userId: string;
  content: string;
  platforms: Platform[];
  scheduledAt: string;
  status: PostStatus;
  mediaUrl?: string;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

interface PlatformConnection {
  platform: Platform;
  userId: string;
  connected: boolean;
  accountName: string;
  connectedAt: string;
}

const posts = new Map<string, ScheduledPost>();
const connections = new Map<string, PlatformConnection[]>();

const router = Router();

// Get all posts for a user
router.get('/posts', (req: Request, res: Response) => {
  const userId = (req as any).userId || 'demo-user';
  const userPosts = [...posts.values()]
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  res.json(userPosts);
});

// Get a single post
router.get('/posts/:id', (req: Request, res: Response) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

// Create a new post
router.post('/posts', (req: Request, res: Response) => {
  const userId = (req as any).userId || 'demo-user';
  const { content, platforms, scheduledAt, mediaUrl, hashtags, status } = req.body;

  if (!content || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'Content and at least one platform are required' });
  }

  const now = new Date().toISOString();
  const newPost: ScheduledPost = {
    id: uuid(),
    userId,
    content: String(content),
    platforms,
    scheduledAt: scheduledAt || now,
    status: status || 'scheduled',
    mediaUrl: mediaUrl || undefined,
    hashtags: hashtags || [],
    createdAt: now,
    updatedAt: now,
  };

  posts.set(newPost.id, newPost);
  res.status(201).json(newPost);
});

// Update a post
router.put('/posts/:id', (req: Request, res: Response) => {
  const existing = posts.get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const { content, platforms, scheduledAt, mediaUrl, hashtags, status } = req.body;
  const updated: ScheduledPost = {
    ...existing,
    content: content !== undefined ? String(content) : existing.content,
    platforms: platforms || existing.platforms,
    scheduledAt: scheduledAt || existing.scheduledAt,
    mediaUrl: mediaUrl !== undefined ? mediaUrl : existing.mediaUrl,
    hashtags: hashtags || existing.hashtags,
    status: status || existing.status,
    updatedAt: new Date().toISOString(),
  };

  posts.set(updated.id, updated);
  res.json(updated);
});

// Delete a post
router.delete('/posts/:id', (req: Request, res: Response) => {
  if (!posts.has(req.params.id)) {
    return res.status(404).json({ error: 'Post not found' });
  }
  posts.delete(req.params.id);
  res.json({ success: true });
});

// Publish a post immediately
router.post('/posts/:id/publish', (req: Request, res: Response) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const updated: ScheduledPost = {
    ...post,
    status: 'published',
    updatedAt: new Date().toISOString(),
  };
  posts.set(updated.id, updated);

  res.json({
    ...updated,
    publishedTo: post.platforms,
    message: `Successfully published to ${post.platforms.join(', ')}`,
  });
});

// Get platform connections
router.get('/platforms', (req: Request, res: Response) => {
  const userId = (req as any).userId || 'demo-user';
  const userConnections = connections.get(userId) || [];
  res.json(userConnections);
});

// Connect a platform
router.post('/platforms/connect', (req: Request, res: Response) => {
  const userId = (req as any).userId || 'demo-user';
  const { platform, accountName } = req.body;

  if (!platform || !accountName) {
    return res.status(400).json({ error: 'Platform and account name are required' });
  }

  const userConnections = connections.get(userId) || [];
  const existingIndex = userConnections.findIndex((c) => c.platform === platform);

  const connection: PlatformConnection = {
    platform,
    userId,
    connected: true,
    accountName: String(accountName),
    connectedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    userConnections[existingIndex] = connection;
  } else {
    userConnections.push(connection);
  }

  connections.set(userId, userConnections);
  res.json(connection);
});

// Disconnect a platform
router.post('/platforms/disconnect', (req: Request, res: Response) => {
  const userId = (req as any).userId || 'demo-user';
  const { platform } = req.body;

  const userConnections = connections.get(userId) || [];
  const index = userConnections.findIndex((c) => c.platform === platform);

  if (index >= 0) {
    userConnections[index].connected = false;
    connections.set(userId, userConnections);
  }

  res.json({ success: true });
});

// Get daily schedule overview
router.get('/schedule', (req: Request, res: Response) => {
  const userId = (req as any).userId || 'demo-user';
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const userPosts = [...posts.values()]
    .filter((p) => p.userId === userId && p.scheduledAt.startsWith(date))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const defaultTimes = ['09:00', '12:00', '17:00', '20:00'];
  const slots = defaultTimes.map((time, index) => {
    const matchingPost = userPosts.find((p) => {
      const postTime = new Date(p.scheduledAt).toTimeString().slice(0, 5);
      return postTime === time;
    });

    return {
      id: `slot-${index}`,
      time,
      post: matchingPost || null,
    };
  });

  res.json({ date, slots, totalPosts: userPosts.length });
});

// Generate content suggestion
router.post('/generate', (req: Request, res: Response) => {
  const { platform, topic, tone } = req.body;

  const toneMap: Record<string, string> = {
    professional: 'In a professional tone',
    casual: 'In a casual, friendly tone',
    humorous: 'With humor and wit',
    inspirational: 'In an inspirational tone',
  };

  const platformTips: Record<string, string> = {
    instagram: 'Use visual descriptions and relevant hashtags. Keep it engaging and personal.',
    facebook: 'Write a longer, more detailed post. Include a call to action.',
    twitter: 'Keep it under 280 characters. Be concise and punchy.',
    tiktok: 'Write a script-style caption. Use trending hashtags.',
    linkedin: 'Be professional. Share insights and industry knowledge.',
  };

  const tonePrefix = toneMap[tone] || toneMap.casual;
  const platformTip = platformTips[platform] || '';

  const templates = [
    `${tonePrefix}, here's a great post about ${topic || 'your brand'}! ${platformTip}`,
    `Check out what we've been working on! ${topic ? `It's all about ${topic}.` : ''} ${platformTip}`,
    `We're excited to share this with you! ${topic || 'Something amazing is coming.'} ${platformTip}`,
    `${topic ? `Let's talk about ${topic}!` : 'Big news!'} ${tonePrefix.toLowerCase()}. ${platformTip}`,
  ];

  const suggestion = templates[Math.floor(Math.random() * templates.length)];
  const hashtags = topic
    ? topic.split(' ').map((w: string) => `#${w.toLowerCase().replace(/[^a-z0-9]/g, '')}`)
    : ['#socialmedia', '#content', '#marketing'];

  res.json({
    suggestion,
    hashtags: hashtags.filter((h: string) => h.length > 1),
    tip: platformTip,
  });
});

export default router;
