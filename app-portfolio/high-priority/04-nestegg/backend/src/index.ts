// NestEgg Backend — Pensjonskalkulator, gap-analyse, spareplaner og AI-coach
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  (req as any).userId = token;
  next();
}

const profileSchema = z.object({
  currentAge: z.number().min(18).max(80),
  retirementAge: z.number().min(50).max(80),
  currentSavings: z.number().min(0),
  monthlyIncome: z.number().positive(),
  monthlyExpenses: z.number().positive(),
  existingPensionAnnual: z.number().min(0),
  country: z.string().length(2),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).optional(),
});

// Compound growth calculation for retirement projections
function projectSavings(current: number, monthlyAdd: number, years: number, annualReturn: number): number {
  let total = current;
  for (let y = 0; y < years; y++) {
    total = total * (1 + annualReturn) + monthlyAdd * 12;
  }
  return total;
}

app.post("/v1/pension/gap-analysis", auth, (req: Request, res: Response) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const p = parsed.data;
  const yearsToRetirement = p.retirementAge - p.currentAge;
  const yearsInRetirement = 25;
  const inflationAdjusted = 0.02;
  const annualReturn = p.riskTolerance === "conservative" ? 0.04 : p.riskTolerance === "aggressive" ? 0.08 : 0.06;

  const annualNeed = p.monthlyExpenses * 12 * 0.75;
  const neededTotal = annualNeed * yearsInRetirement * (1 + inflationAdjusted * yearsToRetirement);
  const projectedFromCurrent = projectSavings(p.currentSavings, 0, yearsToRetirement, annualReturn);
  const pensionCoverage = p.existingPensionAnnual * yearsInRetirement;
  const gap = Math.max(0, neededTotal - projectedFromCurrent - pensionCoverage);
  const monthlySavingsNeeded = gap / (yearsToRetirement * 12) / (1 + annualReturn / 2);

  res.json({
    neededTotal: Math.round(neededTotal),
    projectedFromCurrentSavings: Math.round(projectedFromCurrent),
    pensionCoverage: Math.round(pensionCoverage),
    gap: Math.round(gap),
    monthlySavingsNeeded: Math.round(monthlySavingsNeeded),
    yearsToRetirement,
    assumptions: { annualReturn, inflation: inflationAdjusted, yearsInRetirement, replacementRate: 0.75 },
  });
});

// Scenario projections: "What if I retire at 62?" "What if market crashes?"
app.post("/v1/pension/projections", auth, (req: Request, res: Response) => {
  const { currentSavings = 100000, monthlySaving = 3000, years = 35 } = req.body;

  const scenarios = [
    { name: "Konservativ (4%)", return: 0.04 },
    { name: "Balansert (6%)", return: 0.06 },
    { name: "Aggressiv (8%)", return: 0.08 },
    { name: "Børskrakk (-20% år 1, 6% etter)", return: 0.06, crash: true },
  ];

  const projections = scenarios.map((s) => {
    let total = currentSavings;
    const yearlyData: { year: number; value: number }[] = [];

    for (let y = 1; y <= years; y++) {
      const ret = s.crash && y === 1 ? -0.2 : s.return;
      total = total * (1 + ret) + monthlySaving * 12;
      yearlyData.push({ year: y, value: Math.round(total) });
    }

    return { scenario: s.name, finalValue: Math.round(total), yearlyData };
  });

  res.json({ projections });
});

// Savings plan CRUD
const savingsPlans: Map<string, any> = new Map();

app.post("/v1/savings/plan", auth, (req: Request, res: Response) => {
  const { monthlyAmount, strategy = "balanced", autoInvest = true } = req.body;
  const plan = {
    id: `plan_${Date.now()}`,
    userId: (req as any).userId,
    monthlyAmount,
    strategy,
    autoInvest,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  savingsPlans.set(plan.id, plan);
  res.status(201).json(plan);
});

// AI pension coach
app.post("/v1/coach/ask", auth, async (req: Request, res: Response) => {
  const { question, language = "no" } = req.body;
  if (!question) return res.status(400).json({ error: "Question required" });

  const coachResponse = `Godt spørsmål! Her er mitt råd basert på din profil: Start med å spare det du kan — selv kr 500/mnd gir kr 350,000+ over 30 år med 6% avkastning. Det viktigste er å komme i gang.`;

  res.json({
    answer: coachResponse,
    suggestedActions: [
      { type: "calculator", label: "Oppdater pensjonskalkulator" },
      { type: "plan", label: "Start spareplan" },
    ],
  });
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "nestegg-api" }));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`NestEgg API on port ${PORT}`));

export default app;
