// MindWell Backend — Express + TypeScript med mood, chat og auth endepunkter
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

// --- Config ---

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const app = express();
app.use(cors());
app.use(express.json());

// --- In-memory store (erstattes med PostgreSQL i prod) ---

interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: "free" | "pro" | "pro_plus";
}

interface MoodEntry {
  id: string;
  userId: string;
  score: number;
  emotions: string[];
  note?: string;
  context?: string;
  createdAt: string;
  aiSuggestion?: string;
}

interface ChatSession {
  id: string;
  userId: string;
  messages: { role: "user" | "assistant"; content: string; createdAt: string }[];
}

const users: User[] = [
  { id: "user_1", email: "demo@mindwell.app", name: "Demo User", passwordHash: "demo123", plan: "pro" },
];
const moods: MoodEntry[] = [];
const sessions: Map<string, ChatSession> = new Map();

// --- Auth Middleware ---

interface AuthRequest extends Request {
  userId?: string;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// --- Auth Routes ---

app.post("/v1/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.passwordHash === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
});

app.post("/v1/auth/signup", (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const user: User = { id: `user_${randomUUID().slice(0, 8)}`, email, name, passwordHash: password, plan: "free" };
  users.push(user);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: user.id, email, name, plan: "free" } });
});

// --- Mood Routes ---

app.post("/v1/mood", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { score, emotions, note, context } = req.body;
  if (!score || score < 1 || score > 10) {
    return res.status(400).json({ error: "Score must be between 1 and 10" });
  }

  const aiSuggestion = generateMoodSuggestion(score, emotions || []);

  const entry: MoodEntry = {
    id: `mood_${randomUUID().slice(0, 8)}`,
    userId: req.userId!,
    score,
    emotions: emotions || [],
    note,
    context,
    createdAt: new Date().toISOString(),
    aiSuggestion,
  };
  moods.push(entry);
  res.status(201).json(entry);
});

app.get("/v1/mood", authMiddleware, (req: AuthRequest, res: Response) => {
  const { from, to } = req.query;
  let userMoods = moods.filter((m) => m.userId === req.userId);
  if (from) userMoods = userMoods.filter((m) => m.createdAt >= (from as string));
  if (to) userMoods = userMoods.filter((m) => m.createdAt <= (to as string) + "T23:59:59Z");
  res.json(userMoods);
});

app.get("/v1/mood/insights", authMiddleware, (req: AuthRequest, res: Response) => {
  const userMoods = moods.filter((m) => m.userId === req.userId);
  if (userMoods.length < 3) {
    return res.json({ message: "Logg humør i minst 3 dager for innsikter." });
  }
  const avg = userMoods.reduce((s, m) => s + m.score, 0) / userMoods.length;
  const trend = userMoods.length >= 7
    ? userMoods.slice(-7).reduce((s, m) => s + m.score, 0) / 7 > avg ? "improving" : "stable"
    : "insufficient_data";

  const allEmotions = userMoods.flatMap((m) => m.emotions);
  const emotionCounts = allEmotions.reduce<Record<string, number>>((acc, e) => {
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});

  res.json({
    averageScore: Math.round(avg * 10) / 10,
    trend,
    topEmotions: Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3),
    totalEntries: userMoods.length,
  });
});

// --- Chat Routes ---

app.post("/v1/chat", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { message, session_id } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const sessionId = session_id || `sess_${randomUUID().slice(0, 8)}`;
  let session = sessions.get(sessionId);
  if (!session) {
    session = { id: sessionId, userId: req.userId!, messages: [] };
    sessions.set(sessionId, session);
  }

  session.messages.push({ role: "user", content: message, createdAt: new Date().toISOString() });

  const crisisDetected = detectCrisis(message);
  let aiResponse: string;

  if (OPENAI_API_KEY) {
    aiResponse = await callOpenAI(session.messages);
  } else {
    aiResponse = generateFallbackResponse(message, crisisDetected);
  }

  session.messages.push({ role: "assistant", content: aiResponse, createdAt: new Date().toISOString() });

  res.json({
    session_id: sessionId,
    response: aiResponse,
    crisis_detected: crisisDetected,
    ...(crisisDetected ? { crisis_resources: { hotline: "116 123", url: "https://mentalhelse.no" } } : {}),
  });
});

app.get("/v1/chat/history", authMiddleware, (req: AuthRequest, res: Response) => {
  const userSessions = Array.from(sessions.values()).filter((s) => s.userId === req.userId);
  res.json(userSessions);
});

// --- AI Helpers ---

function generateMoodSuggestion(score: number, emotions: string[]): string {
  if (score <= 3) return "Vanskelig dag. Prøv en 5-minutters pusteøvelse — det kan hjelpe å roe kroppen.";
  if (score <= 6) return "Middels dag. Kanskje en kort gåtur eller journaling kan gi et løft?";
  return "Flott! Skriv gjerne ned hva som gikk bra i dag — det styrker positive mønstre.";
}

function detectCrisis(message: string): boolean {
  const crisisKeywords = ["selvmord", "ta livet mitt", "vil dø", "suicide", "kill myself", "end it all", "ikke leve"];
  return crisisKeywords.some((kw) => message.toLowerCase().includes(kw));
}

function generateFallbackResponse(message: string, crisis: boolean): string {
  if (crisis) {
    return "Jeg hører deg, og det du føler er viktig. Vennligst kontakt kriselinje 116 123 umiddelbart, eller gå til mentalhelse.no. Du er ikke alene.";
  }
  return "Takk for at du deler. Det høres ut som du har mye på hjertet. Kan du fortelle mer om hva som trigger disse følelsene? Sammen kan vi utforske noen strategier.";
}

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const systemPrompt = `Du er MindWell, en empatisk AI-terapeut basert på kognitiv atferdsterapi (CBT).
Retningslinjer:
- Vær varm, validerende og ikke-dømmende
- Bruk CBT-teknikker: tankeregistrering, kognitiv restrukturering, atferdseksperimenter
- Hold svar korte (2-4 setninger) med ett åpent spørsmål
- Ved krise: oppfordre til å ringe 116 123 umiddelbart
- Aldri diagnostiser eller forskriv medisiner`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Beklager, jeg kunne ikke svare akkurat nå. Prøv igjen.";
}

// --- Health Check ---

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Start ---

app.listen(PORT, () => {
  console.log(`MindWell API running on port ${PORT}`);
});

export default app;
