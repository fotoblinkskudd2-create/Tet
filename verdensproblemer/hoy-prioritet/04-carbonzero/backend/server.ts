// CarbonZero Backend — Footprint tracking, challenges, and offset endpoints
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const app = express();
app.use(cors());
app.use(express.json());

// --- Types ---

interface Activity {
  id: string;
  userId: string;
  category: string;
  co2Kg: number;
  description: string;
  date: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  co2SavingKg: number;
  durationDays: number;
  category: string;
}

// --- Seed data ---

const users = [
  { id: "user_1", email: "demo@carbonzero.app", passwordHash: "demo123", name: "Demo User" },
];

const activities: Activity[] = [
  { id: "a1", userId: "user_1", category: "transport", co2Kg: 45, description: "Bilpendling januar", date: "2026-01-31" },
  { id: "a2", userId: "user_1", category: "food", co2Kg: 80, description: "Matforbruk januar", date: "2026-01-31" },
  { id: "a3", userId: "user_1", category: "energy", co2Kg: 60, description: "Strøm januar", date: "2026-01-31" },
  { id: "a4", userId: "user_1", category: "shopping", co2Kg: 25, description: "Klær og ting januar", date: "2026-01-31" },
  { id: "a5", userId: "user_1", category: "transport", co2Kg: 38, description: "Bilpendling februar", date: "2026-02-24" },
  { id: "a6", userId: "user_1", category: "food", co2Kg: 65, description: "Matforbruk februar", date: "2026-02-24" },
  { id: "a7", userId: "user_1", category: "energy", co2Kg: 55, description: "Strøm februar", date: "2026-02-24" },
];

const challenges: Challenge[] = [
  { id: "ch1", title: "Kjøttfri uke", description: "Spis vegetarisk i 7 dager", co2SavingKg: 15, durationDays: 7, category: "food" },
  { id: "ch2", title: "Sykkel til jobb", description: "Sykl eller gå til jobb 5 dager", co2SavingKg: 20, durationDays: 7, category: "transport" },
  { id: "ch3", title: "Energisparer", description: "Senk termostaten 2°C i en uke", co2SavingKg: 8, durationDays: 7, category: "energy" },
  { id: "ch4", title: "Kjøpefri mnd", description: "Ingen unødvendige kjøp denne måneden", co2SavingKg: 25, durationDays: 30, category: "shopping" },
  { id: "ch5", title: "Kortdusj", description: "Maks 5 min dusj i en uke", co2SavingKg: 5, durationDays: 7, category: "energy" },
];

// --- Auth ---

interface AuthRequest extends Request { userId?: string; }

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch { res.status(401).json({ error: "Invalid token" }); }
}

app.post("/v1/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.passwordHash === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// --- Footprint ---

app.get("/v1/footprint/summary", authMiddleware, (req: AuthRequest, res: Response) => {
  const userActivities = activities.filter((a) => a.userId === req.userId);
  const totalKg = userActivities.reduce((s, a) => s + a.co2Kg, 0);
  const months = new Set(userActivities.map((a) => a.date.slice(0, 7))).size || 1;

  const byCategory = userActivities.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.co2Kg;
    return acc;
  }, {});

  const breakdown = Object.entries(byCategory).map(([category, kg]) => ({
    category,
    kg,
    percentage: Math.round((kg / totalKg) * 100),
  })).sort((a, b) => b.kg - a.kg);

  res.json({
    total_kg: totalKg,
    monthly_avg_kg: Math.round(totalKg / months),
    breakdown,
    trend: "improving",
  });
});

app.get("/v1/footprint/breakdown", authMiddleware, (req: AuthRequest, res: Response) => {
  const userActivities = activities.filter((a) => a.userId === req.userId);
  res.json(userActivities);
});

// --- Activities ---

app.post("/v1/activities", authMiddleware, (req: AuthRequest, res: Response) => {
  const { category, co2_kg, description } = req.body;
  const activity: Activity = {
    id: `act_${randomUUID().slice(0, 8)}`,
    userId: req.userId!,
    category,
    co2Kg: co2_kg,
    description,
    date: new Date().toISOString().split("T")[0],
  };
  activities.push(activity);
  res.status(201).json(activity);
});

app.get("/v1/activities", authMiddleware, (req: AuthRequest, res: Response) => {
  res.json(activities.filter((a) => a.userId === req.userId));
});

// --- Challenges ---

app.get("/v1/challenges", (_req: Request, res: Response) => {
  res.json(challenges.map((c) => ({
    id: c.id, title: c.title, description: c.description,
    co2_saving_kg: c.co2SavingKg, duration_days: c.durationDays, category: c.category,
  })));
});

app.post("/v1/challenges/:id/join", authMiddleware, (req: AuthRequest, res: Response) => {
  const challenge = challenges.find((c) => c.id === req.params.id);
  if (!challenge) return res.status(404).json({ error: "Challenge not found" });
  res.json({ challenge_id: challenge.id, user_id: req.userId, status: "active", joined_at: new Date().toISOString() });
});

// --- Offsets ---

app.post("/v1/offsets/purchase", authMiddleware, (req: AuthRequest, res: Response) => {
  const { amount_kg } = req.body;
  const costUsd = amount_kg * 0.015;
  res.status(201).json({
    id: `off_${randomUUID().slice(0, 8)}`,
    user_id: req.userId,
    amount_kg,
    cost_usd: Math.round(costUsd * 100) / 100,
    provider: "Gold Standard",
    project: "Kaya Cookstoves — Kenya",
    certificate_url: "https://registry.goldstandard.org/...",
    created_at: new Date().toISOString(),
  });
});

// --- Insights (AI) ---

app.get("/v1/insights", authMiddleware, (req: AuthRequest, res: Response) => {
  const userActivities = activities.filter((a) => a.userId === req.userId);
  const topCategory = userActivities.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.co2Kg;
    return acc;
  }, {});

  const sorted = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);
  const tips = sorted.slice(0, 2).map(([cat]) => {
    const tipMap: Record<string, string> = {
      transport: "Vurder å sykle eller ta kollektiv 2 dager i uken — kan spare 30+ kg CO₂/mnd.",
      food: "Bytt ut biff med kylling eller bønner 3 dager/uke — sparer ~20 kg CO₂/mnd.",
      energy: "Senk termostaten 1°C — sparer ca. 300 kg CO₂/år.",
      shopping: "Kjøp brukt eller reparer — ett plagg mindre per mnd sparer 5 kg CO₂.",
    };
    return tipMap[cat] || "Fortsett å tracke for mer personlige tips!";
  });

  res.json({ tips });
});

// --- Health ---

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => console.log(`CarbonZero API on port ${PORT}`));
export default app;
