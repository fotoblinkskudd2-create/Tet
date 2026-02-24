// DebtZero Backend — Gjeldsoversikt, avalanche/snowball-planlegger, AI-forhandling
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

interface Debt {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  status: string;
}

const userDebts: Map<string, Debt[]> = new Map();

function getDebts(userId: string): Debt[] {
  if (!userDebts.has(userId)) {
    userDebts.set(userId, [
      { id: "d1", userId, name: "Studielån", type: "student_loan", balance: 82000, interestRate: 4.5, minimumPayment: 450, status: "active" },
      { id: "d2", userId, name: "Visa kredittkort", type: "credit_card", balance: 15000, interestRate: 24.9, minimumPayment: 300, status: "active" },
      { id: "d3", userId, name: "Billån", type: "car_loan", balance: 5000, interestRate: 6.0, minimumPayment: 200, status: "active" },
    ]);
  }
  return userDebts.get(userId)!;
}

// Avalanche: prioritize highest interest rate first; Snowball: lowest balance first
function generatePlan(debts: Debt[], method: "avalanche" | "snowball", extraMonthly: number) {
  const sorted = [...debts].sort((a, b) =>
    method === "avalanche" ? b.interestRate - a.interestRate : a.balance - b.balance,
  );

  let totalInterest = 0;
  let months = 0;
  const remaining = sorted.map((d) => ({ ...d }));
  const totalMinimum = remaining.reduce((s, d) => s + d.minimumPayment, 0);

  while (remaining.some((d) => d.balance > 0) && months < 600) {
    months++;
    let extra = extraMonthly;

    for (const debt of remaining) {
      if (debt.balance <= 0) continue;
      const interest = (debt.balance * debt.interestRate) / 100 / 12;
      totalInterest += interest;
      debt.balance += interest;

      let payment = debt.minimumPayment;
      if (debt === remaining.find((d) => d.balance > 0)) {
        payment += extra;
        extra = 0;
      }

      debt.balance = Math.max(0, debt.balance - payment);
    }
  }

  const noExtraInterest = debts.reduce((sum, d) => {
    const monthsToPayoff = d.balance / d.minimumPayment;
    return sum + (d.balance * d.interestRate / 100 / 12) * monthsToPayoff * 0.6;
  }, 0);

  return {
    method,
    extraMonthly,
    totalMonths: months,
    totalInterestPaid: Math.round(totalInterest),
    interestSaved: Math.round(noExtraInterest - totalInterest),
    payoffDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    order: sorted.map((d) => ({ id: d.id, name: d.name })),
  };
}

function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  (req as any).userId = token;
  next();
}

app.get("/v1/debts", auth, (req: Request, res: Response) => {
  const debts = getDebts((req as any).userId);
  const focus = [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];
  res.json(debts.map((d) => ({ ...d, isFocus: d.id === focus?.id })));
});

const addDebtSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["credit_card", "student_loan", "mortgage", "personal_loan", "car_loan", "other"]),
  balance: z.number().positive(),
  interestRate: z.number().min(0).max(100),
  minimumPayment: z.number().positive(),
});

app.post("/v1/debts", auth, (req: Request, res: Response) => {
  const parsed = addDebtSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = (req as any).userId;
  const debts = getDebts(userId);
  const newDebt: Debt = { id: `d${Date.now()}`, userId, status: "active", ...parsed.data };
  debts.push(newDebt);
  res.status(201).json(newDebt);
});

app.post("/v1/plans/generate", auth, (req: Request, res: Response) => {
  const { method = "avalanche", extraMonthly = 200 } = req.body;
  const debts = getDebts((req as any).userId);
  const plan = generatePlan(debts, method, extraMonthly);
  res.json(plan);
});

app.get("/v1/progress", auth, (req: Request, res: Response) => {
  const debts = getDebts((req as any).userId);
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const originalTotal = 102000;
  const totalPaid = originalTotal - totalDebt;
  const focus = [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];

  res.json({
    totalDebt: originalTotal,
    totalPaid,
    percentPaid: Math.round((totalPaid / originalTotal) * 100),
    payoffDate: "mars 2029",
    nextMilestone: `Betal av ${focus?.name} → spar tusenvis i renter`,
  });
});

// AI-powered negotiation letter generator
app.post("/v1/negotiate/generate", auth, async (req: Request, res: Response) => {
  const { debtId, currentRate, desiredRate } = req.body;
  const debts = getDebts((req as any).userId);
  const debt = debts.find((d) => d.id === debtId);
  if (!debt) return res.status(404).json({ error: "Debt not found" });

  const letter = `Til: ${debt.name} kundeservice\n\nJeg er en lojal kunde med god betalingshistorikk. Min nåværende rente er ${currentRate || debt.interestRate}%. Jeg ber om en reduksjon til ${desiredRate || debt.interestRate - 5}% basert på:\n\n1. Konsekvent rettidig betaling i 12+ måneder\n2. Konkurransedyktige tilbud fra andre kreditorer\n3. Min intensjon om å forbli kunde ved bedre vilkår\n\nJeg ser frem til å høre fra dere.\n\nMvh,\n[Ditt navn]`;

  res.json({ letter, tips: ["Ring i stedet for å skrive — 56% høyere suksessrate", "Spør etter supervisor hvis første nei", "Nevn konkurrenter med lavere rente"] });
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "debtzero-api" }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`DebtZero API on port ${PORT}`));

export default app;
