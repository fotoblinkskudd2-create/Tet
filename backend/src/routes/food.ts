import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { foodLogSchema, foodSearchSchema } from "../utils/validators";
import { AuthRequest, NutritionSummary } from "../types";

const prisma = new PrismaClient();
const router = Router();

/** Search for foods by name */
router.get(
  "/search",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.status(400).json({ error: "Søkeparameter 'q' er påkrevd" });
      return;
    }

    const foods = await prisma.food.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      take: 20,
      orderBy: { name: "asc" },
    });

    res.json(foods);
  }
);

/** Log a food entry */
router.post(
  "/log",
  authenticate,
  validate(foodLogSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { foodId, amount, unit, mealType, date } = req.body;
    const userId = req.user!.userId;

    const food = await prisma.food.findUnique({ where: { id: foodId } });
    if (!food) {
      res.status(404).json({ error: "Matvare ikke funnet" });
      return;
    }

    const entry = await prisma.foodLog.create({
      data: {
        userId,
        foodId,
        amount,
        unit,
        mealType,
        date: new Date(date),
      },
      include: { food: true },
    });

    const ratio = amount / food.servingG;
    res.status(201).json({
      ...entry,
      totalCalories: Math.round(food.calories * ratio),
      totalProtein: Math.round(food.protein * ratio * 10) / 10,
      totalCarbs: Math.round(food.carbs * ratio * 10) / 10,
      totalFat: Math.round(food.fat * ratio * 10) / 10,
    });
  }
);

/** Get food log for a specific date with nutrition summary */
router.get(
  "/log",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const userId = req.user!.userId;

    const logs = await prisma.foodLog.findMany({
      where: {
        userId,
        date: new Date(dateStr),
      },
      include: { food: true },
      orderBy: { createdAt: "asc" },
    });

    const summary: NutritionSummary = logs.reduce(
      (acc, log) => {
        const ratio = log.amount / log.food.servingG;
        return {
          calories: acc.calories + Math.round(log.food.calories * ratio),
          protein: acc.protein + log.food.protein * ratio,
          carbs: acc.carbs + log.food.carbs * ratio,
          fat: acc.fat + log.food.fat * ratio,
          fiber: acc.fiber + log.food.fiber * ratio,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    summary.protein = Math.round(summary.protein * 10) / 10;
    summary.carbs = Math.round(summary.carbs * 10) / 10;
    summary.fat = Math.round(summary.fat * 10) / 10;
    summary.fiber = Math.round(summary.fiber * 10) / 10;

    res.json({ date: dateStr, logs, summary });
  }
);

/** Delete a food log entry */
router.delete(
  "/log/:id",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const entry = await prisma.foodLog.findFirst({
      where: { id, userId },
    });

    if (!entry) {
      res.status(404).json({ error: "Loggoppføring ikke funnet" });
      return;
    }

    await prisma.foodLog.delete({ where: { id } });
    res.json({ success: true });
  }
);

export default router;
