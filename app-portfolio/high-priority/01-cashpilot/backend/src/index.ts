// CashPilot Backend — Express server med leksjons-API og AI-chatbot endepunkter
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  totalXp: number;
  streakDays: number;
  subscriptionTier: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xpReward: number;
  durationMinutes: number;
  contentJson: object;
}

// --- In-memory store (replace with Prisma + PostgreSQL in production) ---
const users: Map<string, User> = new Map();
const lessons: Lesson[] = [
  { id: "lesson_renter_101", title: "Hva er renter?", description: "Forstå hvordan renter fungerer", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 4, contentJson: { slides: [{ type: "text", content: "Renter er prisen du betaler for å låne penger..." }], quiz: [{ q: "Hva er rente?", options: ["Pris for å låne", "Skatt", "Avgift", "Rabatt"], answer: 0 }] } },
  { id: "lesson_inflasjon_101", title: "Hva er inflasjon?", description: "Lær hvorfor prisene stiger over tid", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 5, contentJson: { slides: [{ type: "text", content: "Inflasjon betyr at det generelle prisnivået stiger..." }], quiz: [{ q: "Hva betyr 3% inflasjon?", options: ["Prisene stiger 3%/år", "Lønnen synker 3%", "Skatt er 3%", "Renta er 3%"], answer: 0 }] } },
  { id: "lesson_budsjett_101", title: "Budsjettering 101", description: "Lag ditt første budsjett med 50/30/20-regelen", category: "budgeting", difficulty: "beginner", xpReward: 50, durationMinutes: 4, contentJson: { slides: [{ type: "text", content: "50/30/20-regelen: 50% nødvendigheter, 30% ønsker, 20% sparing..." }], quiz: [{ q: "Hvor mye bør du spare ifølge 50/30/20?", options: ["20%", "50%", "30%", "10%"], answer: 0 }] } },
  { id: "lesson_compound", title: "Renters rente", description: "Kraften i compound interest", category: "investing", difficulty: "intermediate", xpReward: 75, durationMinutes: 7, contentJson: { slides: [{ type: "text", content: "Renters rente betyr at du tjener rente på renten..." }], quiz: [] } },
  { id: "lesson_gjeld_101", title: "Forstå gjeld", description: "Gjeldstyper og nedbetaling", category: "debt", difficulty: "beginner", xpReward: 50, durationMinutes: 5, contentJson: {} },
];

const completedLessons: Map<string, Set<string>> = new Map();

// --- Auth middleware (simplified — use Clerk in production) ---
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  let user = users.get(token);
  if (!user) {
    user = { id: token, name: "Demo User", email: "demo@cashpilot.app", level: 5, totalXp: 1250, streakDays: 7, subscriptionTier: "free" };
    users.set(token, user);
    completedLessons.set(token, new Set());
  }
  (req as any).user = user;
  (req as any).userId = token;
  next();
}

// --- Routes ---

app.get("/v1/users/me", authMiddleware, (req: Request, res: Response) => {
  res.json((req as any).user);
});

app.get("/v1/lessons", authMiddleware, (_req: Request, res: Response) => {
  res.json(lessons.map(({ contentJson, ...l }) => l));
});

app.get("/v1/lessons/recommended", authMiddleware, (req: Request, res: Response) => {
  const completed = completedLessons.get((req as any).userId) || new Set();
  const recommended = lessons
    .filter((l) => !completed.has(l.id))
    .slice(0, 3)
    .map(({ contentJson, ...l }) => l);
  res.json(recommended);
});

app.get("/v1/lessons/:id", authMiddleware, (req: Request, res: Response) => {
  const lesson = lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  res.json(lesson);
});

// Validates and records lesson completion, calculates XP and level
const completeLessonSchema = z.object({
  lessonId: z.string(),
  score: z.number().min(0).max(100),
  timeSpentSeconds: z.number().min(1),
});

app.post("/v1/lessons/:id/complete", authMiddleware, (req: Request, res: Response) => {
  const parsed = completeLessonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const lesson = lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });

  const userId = (req as any).userId;
  const user = users.get(userId)!;
  const completed = completedLessons.get(userId)!;

  const xpEarned = Math.round(lesson.xpReward * (parsed.data.score / 100));
  user.totalXp += xpEarned;
  user.level = Math.floor(user.totalXp / 250) + 1;
  completed.add(lesson.id);

  const nextLesson = lessons.find((l) => !completed.has(l.id));

  res.json({
    xpEarned,
    totalXp: user.totalXp,
    level: user.level,
    streak: user.streakDays,
    nextRecommended: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
    achievements: user.totalXp >= 1000 ? [{ id: "ach_1000xp", title: "1000 XP Club!", icon: "🏆" }] : [],
  });
});

app.get("/v1/progress", authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const completed = completedLessons.get((req as any).userId) || new Set();
  res.json({
    totalXp: user.totalXp,
    level: user.level,
    streakDays: user.streakDays,
    lessonsCompleted: completed.size,
    lessonsTotal: lessons.length,
  });
});

// AI chat endpoint — proxies to OpenAI with financial literacy context
app.post("/v1/ai/chat", authMiddleware, async (req: Request, res: Response) => {
  const { message, language = "en" } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const systemPrompt = `You are CashPilot AI, a friendly financial literacy assistant. 
Answer in ${language}. Keep answers concise (max 200 words). 
Never give specific investment advice. Always encourage learning.
Suggest relevant CashPilot lessons when appropriate.`;

  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.json({
        reply: "AI-rådgiveren er ikke konfigurert ennå. Sett OPENAI_API_KEY.",
        suggestedActions: [{ type: "lesson", id: "lesson_budsjett_101", title: "Budsjettering 101" }],
        sources: [],
      });
    }

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content || "Beklager, prøv igjen.";

    res.json({
      reply,
      suggestedActions: [{ type: "lesson", id: "lesson_budsjett_101", title: "Budsjettering 101" }],
      sources: ["lesson_budsjett_101"],
    });
  } catch {
    res.status(500).json({ error: "AI service error" });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "cashpilot-api" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`CashPilot API running on port ${PORT}`));

export default app;
