import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuid } from 'uuid';
import { authMiddleware } from './auth';

const router = Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Chapter {
  number: number;
  title: string;
  content: string;
}

interface Novel {
  id: string;
  userId: string;
  title: string;
  genre: string;
  tone: string;
  chapters: Chapter[];
  status: 'generating' | 'completed' | 'failed';
  totalChapters: number;
  currentChapter: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (replace with database later)
const novels = new Map<string, Novel>();

// Auth middleware (simplified - extract from request)
function getUserId(req: Request): string | null {
  return (req as any).userId || null;
}

// Generate a chapter using Claude
async function generateChapter(
  title: string,
  genre: string,
  tone: string,
  chapterNumber: number,
  totalChapters: number,
  previousChapters: Chapter[]
): Promise<{ title: string; content: string }> {
  const previousContext = previousChapters.length > 0
    ? `\n\nPrevious chapters summary:\n${previousChapters.map(ch =>
        `Kapittel ${ch.number}: ${ch.title}\n${ch.content.substring(0, 500)}...`
      ).join('\n\n')}`
    : '';

  const prompt = `Du er en mesterlig norsk romanforfatter. Skriv kapittel ${chapterNumber} av ${totalChapters} i en novelle.

Tittel: "${title}"
Sjanger: ${genre}
Tone: ${tone}
${previousContext}

Skriv BARE kapittel ${chapterNumber}. Kapittelet skal være rundt 3-4 sider (ca. 1500-2000 ord).

${chapterNumber === 1 ? 'Dette er første kapittel - introduser karakterer, setting og konflikt på en fengslende måte.' : ''}
${chapterNumber === totalChapters ? 'Dette er siste kapittel - gi historien en tilfredsstillende avslutning.' : ''}

Returner i følgende format:
KAPITTEL_TITTEL: [Tittel på kapittelet]
---
[Kapittelinnhold her]`;

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  const content = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse the response
  const lines = content.split('\n');
  let chapterTitle = `Kapittel ${chapterNumber}`;
  let chapterContent = content;

  // Extract title if present
  const titleMatch = content.match(/KAPITTEL_TITTEL:\s*(.+)/);
  if (titleMatch) {
    chapterTitle = titleMatch[1].trim();
    chapterContent = content.replace(/KAPITTEL_TITTEL:.+\n---\n/, '').trim();
  }

  return {
    title: chapterTitle,
    content: chapterContent,
  };
}

// POST /api/novels/generate - Start generating a novel
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, genre, tone } = req.body;
    if (!title || !genre || !tone) {
      return res.status(400).json({ error: 'Title, genre, and tone are required' });
    }

    const novelId = uuid();
    const novel: Novel = {
      id: novelId,
      userId,
      title,
      genre,
      tone,
      chapters: [],
      status: 'generating',
      totalChapters: 7, // ~70 pages with 10 pages per chapter
      currentChapter: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    novels.set(novelId, novel);

    // Start generating chapters in the background
    generateNovelChapters(novelId).catch(err => {
      console.error('Error generating novel:', err);
      const novel = novels.get(novelId);
      if (novel) {
        novel.status = 'failed';
        novel.updatedAt = new Date();
      }
    });

    res.status(201).json({
      id: novelId,
      title,
      genre,
      tone,
      status: 'generating',
      totalChapters: novel.totalChapters,
      currentChapter: 0,
    });
  } catch (error) {
    console.error('Error creating novel:', error);
    res.status(500).json({ error: 'Failed to start novel generation' });
  }
});

// Background function to generate all chapters
async function generateNovelChapters(novelId: string) {
  const novel = novels.get(novelId);
  if (!novel) return;

  for (let i = 1; i <= novel.totalChapters; i++) {
    try {
      const chapter = await generateChapter(
        novel.title,
        novel.genre,
        novel.tone,
        i,
        novel.totalChapters,
        novel.chapters
      );

      novel.chapters.push({
        number: i,
        title: chapter.title,
        content: chapter.content,
      });
      novel.currentChapter = i;
      novel.updatedAt = new Date();

      console.log(`✓ Generated chapter ${i}/${novel.totalChapters} for novel "${novel.title}"`);
    } catch (error) {
      console.error(`Error generating chapter ${i}:`, error);
      novel.status = 'failed';
      novel.updatedAt = new Date();
      return;
    }
  }

  novel.status = 'completed';
  novel.updatedAt = new Date();
  console.log(`✓ Novel "${novel.title}" completed!`);
}

// GET /api/novels - Get all novels for current user
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userNovels = Array.from(novels.values())
    .filter(n => n.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(n => ({
      id: n.id,
      title: n.title,
      genre: n.genre,
      tone: n.tone,
      status: n.status,
      totalChapters: n.totalChapters,
      currentChapter: n.currentChapter,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

  res.json(userNovels);
});

// GET /api/novels/:id - Get a specific novel with all chapters
router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const novel = novels.get(req.params.id);
  if (!novel) {
    return res.status(404).json({ error: 'Novel not found' });
  }

  if (novel.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(novel);
});

// DELETE /api/novels/:id - Delete a novel
router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const novel = novels.get(req.params.id);
  if (!novel) {
    return res.status(404).json({ error: 'Novel not found' });
  }

  if (novel.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  novels.delete(req.params.id);
  res.json({ message: 'Novel deleted successfully' });
});

export default router;
