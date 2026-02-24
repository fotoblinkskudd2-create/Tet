import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";

const prisma = new PrismaClient();
const router = Router();

/** Get meal plan for a given week */
router.get(
  "/plan",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const weekParam = req.query.week as string;

    const weekStart = weekParam ? new Date(weekParam) : getMonday(new Date());

    const plan = await prisma.mealPlan.findFirst({
      where: { userId, weekStart },
    });

    if (!plan) {
      res.status(404).json({ error: "Ingen måltidsplan for denne uken" });
      return;
    }

    res.json(plan);
  }
);

/** Generate a new meal plan based on user profile and preferences */
router.post(
  "/generate",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      res.status(400).json({
        error: "Opprett helseprofil først for å generere måltidsplan",
      });
      return;
    }

    const weekStart = getMonday(new Date());
    const dailyTarget = profile.dailyTarget;

    // Simplified meal plan generation (in production, use OpenAI API)
    const meals = generateSimpleMealPlan(dailyTarget);

    const plan = await prisma.mealPlan.upsert({
      where: { id: `${userId}-${weekStart.toISOString().slice(0, 10)}` },
      create: { userId, weekStart, meals },
      update: { meals },
    });

    res.status(201).json(plan);
  }
);

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function generateSimpleMealPlan(dailyTarget: number) {
  const days = [
    "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag",
  ];

  const mealTemplates = [
    {
      breakfast: { name: "Havregrøt med blåbær og honning", calories: Math.round(dailyTarget * 0.25), protein: 12, carbs: 45, fat: 8 },
      lunch: { name: "Kyllingwrap med avokado og salat", calories: Math.round(dailyTarget * 0.35), protein: 35, carbs: 30, fat: 15 },
      dinner: { name: "Laks med søtpotet og brokkoli", calories: Math.round(dailyTarget * 0.30), protein: 30, carbs: 35, fat: 12 },
      snack: { name: "Gresk yoghurt med nøtter", calories: Math.round(dailyTarget * 0.10), protein: 10, carbs: 12, fat: 6 },
    },
    {
      breakfast: { name: "Smoothie med banan, spinat og proteinpulver", calories: Math.round(dailyTarget * 0.25), protein: 25, carbs: 35, fat: 5 },
      lunch: { name: "Linsegryte med fullkornris", calories: Math.round(dailyTarget * 0.35), protein: 20, carbs: 50, fat: 8 },
      dinner: { name: "Kyllingbryst med quinoa og grønnsaksmix", calories: Math.round(dailyTarget * 0.30), protein: 35, carbs: 30, fat: 10 },
      snack: { name: "Eple med peanøttsmør", calories: Math.round(dailyTarget * 0.10), protein: 5, carbs: 20, fat: 8 },
    },
    {
      breakfast: { name: "Eggerøre med fullkornsbrød og tomat", calories: Math.round(dailyTarget * 0.25), protein: 18, carbs: 25, fat: 12 },
      lunch: { name: "Tunfisksalat med bønner og olivenolje", calories: Math.round(dailyTarget * 0.35), protein: 30, carbs: 20, fat: 18 },
      dinner: { name: "Ovnsbakt torsk med rotgrønnsaker", calories: Math.round(dailyTarget * 0.30), protein: 28, carbs: 35, fat: 8 },
      snack: { name: "Cottage cheese med agurk", calories: Math.round(dailyTarget * 0.10), protein: 12, carbs: 5, fat: 3 },
    },
  ];

  return days.map((day, i) => ({
    day,
    meals: mealTemplates[i % mealTemplates.length],
    totalCalories: dailyTarget,
  }));
}

export default router;
