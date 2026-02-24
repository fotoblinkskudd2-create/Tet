import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { weightLogSchema } from "../utils/validators";
import { AuthRequest } from "../types";
import { calculateBMI } from "../utils/calories";

const prisma = new PrismaClient();
const router = Router();

/** Log a weight entry (upserts on same date) */
router.post(
  "/",
  authenticate,
  validate(weightLogSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { weightKg, date, note } = req.body;
    const userId = req.user!.userId;

    const entry = await prisma.weightEntry.upsert({
      where: { userId_date: { userId, date: new Date(date) } },
      create: { userId, weightKg, date: new Date(date), note },
      update: { weightKg, note },
    });

    res.status(201).json(entry);
  }
);

/** Get weight entries for a date range */
router.get(
  "/",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const from = req.query.from as string;
    const to = req.query.to as string;

    const where: any = { userId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const entries = await prisma.weightEntry.findMany({
      where,
      orderBy: { date: "asc" },
    });

    res.json(entries);
  }
);

/** Get weight statistics */
router.get(
  "/stats",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const [latest, earliest, profile] = await Promise.all([
      prisma.weightEntry.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
      }),
      prisma.weightEntry.findFirst({
        where: { userId },
        orderBy: { date: "asc" },
      }),
      prisma.healthProfile.findUnique({ where: { userId } }),
    ]);

    if (!latest || !profile) {
      res.status(404).json({ error: "Ikke nok data for statistikk" });
      return;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekOld = await prisma.weightEntry.findFirst({
      where: { userId, date: { lte: sevenDaysAgo } },
      orderBy: { date: "desc" },
    });

    const weeklyChange = weekOld
      ? Math.round((latest.weightKg - weekOld.weightKg) * 10) / 10
      : null;

    res.json({
      current: latest.weightKg,
      start: earliest?.weightKg,
      goal: profile.goalWeightKg,
      bmi: calculateBMI(latest.weightKg, profile.heightCm),
      totalChange: earliest
        ? Math.round((latest.weightKg - earliest.weightKg) * 10) / 10
        : 0,
      weeklyChange,
      remaining: Math.round((latest.weightKg - profile.goalWeightKg) * 10) / 10,
    });
  }
);

export default router;
