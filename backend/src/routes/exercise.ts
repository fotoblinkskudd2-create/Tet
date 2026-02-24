import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { z } from "zod";
import { validate } from "../middleware/validate";

const prisma = new PrismaClient();
const router = Router();

const exerciseLogSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
  durationMin: z.number().positive().int(),
  calories: z.number().min(0),
  date: z.string().date(),
});

const EXERCISE_SUGGESTIONS = [
  { type: "cardio", name: "Rask gåtur", durationMin: 30, caloriesPer30Min: 150, level: "beginner" },
  { type: "cardio", name: "Jogging", durationMin: 30, caloriesPer30Min: 250, level: "intermediate" },
  { type: "cardio", name: "Sykling", durationMin: 30, caloriesPer30Min: 200, level: "beginner" },
  { type: "cardio", name: "Svømming", durationMin: 30, caloriesPer30Min: 300, level: "intermediate" },
  { type: "strength", name: "Kroppsvektøvelser hjemme", durationMin: 20, caloriesPer30Min: 180, level: "beginner" },
  { type: "strength", name: "Styrketrening gym", durationMin: 45, caloriesPer30Min: 220, level: "intermediate" },
  { type: "hiit", name: "HIIT 20 min", durationMin: 20, caloriesPer30Min: 350, level: "advanced" },
  { type: "flexibility", name: "Yoga", durationMin: 30, caloriesPer30Min: 120, level: "beginner" },
  { type: "cardio", name: "Dans", durationMin: 30, caloriesPer30Min: 200, level: "beginner" },
  { type: "cardio", name: "Trappegang", durationMin: 15, caloriesPer30Min: 280, level: "intermediate" },
];

/** Get personalized exercise suggestions */
router.get(
  "/suggest",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    let level = "beginner";
    if (profile) {
      const activityMap: Record<string, string> = {
        SEDENTARY: "beginner",
        LIGHT: "beginner",
        MODERATE: "intermediate",
        ACTIVE: "intermediate",
        VERY_ACTIVE: "advanced",
      };
      level = activityMap[profile.activityLevel] || "beginner";
    }

    const suggestions = EXERCISE_SUGGESTIONS.filter(
      (e) =>
        e.level === level ||
        e.level === "beginner" ||
        (level === "advanced" && e.level === "intermediate")
    );

    res.json(suggestions);
  }
);

/** Log an exercise entry */
router.post(
  "/log",
  authenticate,
  validate(exerciseLogSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { type, name, durationMin, calories, date } = req.body;

    const entry = await prisma.exerciseLog.create({
      data: {
        userId: req.user!.userId,
        type,
        name,
        durationMin,
        calories,
        date: new Date(date),
      },
    });

    res.status(201).json(entry);
  }
);

/** Get exercise log for a specific date */
router.get(
  "/log",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const dateStr =
      (req.query.date as string) || new Date().toISOString().slice(0, 10);

    const entries = await prisma.exerciseLog.findMany({
      where: {
        userId: req.user!.userId,
        date: new Date(dateStr),
      },
      orderBy: { createdAt: "asc" },
    });

    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const totalMinutes = entries.reduce((sum, e) => sum + e.durationMin, 0);

    res.json({ date: dateStr, entries, totalCalories, totalMinutes });
  }
);

export default router;
