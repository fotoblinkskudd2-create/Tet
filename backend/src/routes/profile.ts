import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { healthProfileSchema } from "../utils/validators";
import { AuthRequest } from "../types";
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyTarget,
  calculateAge,
} from "../utils/calories";

const prisma = new PrismaClient();
const router = Router();

router.get(
  "/",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      res.status(404).json({ error: "Helseprofil ikke opprettet ennå" });
      return;
    }

    res.json(profile);
  }
);

/** Creates or updates the health profile and recalculates calorie targets */
router.put(
  "/",
  authenticate,
  validate(healthProfileSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { heightCm, goalWeightKg, activityLevel, birthDate, sex } = req.body;
    const userId = req.user!.userId;

    const latestWeight = await prisma.weightEntry.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const currentWeight = latestWeight?.weightKg || goalWeightKg + 10;
    const age = calculateAge(new Date(birthDate));
    const bmr = calculateBMR(currentWeight, heightCm, age, sex);
    const tdee = calculateTDEE(bmr, activityLevel);
    const dailyTarget = calculateDailyTarget(
      tdee,
      currentWeight > goalWeightKg ? "lose" : "maintain"
    );

    const profile = await prisma.healthProfile.upsert({
      where: { userId },
      create: {
        userId,
        heightCm,
        goalWeightKg,
        activityLevel,
        birthDate: new Date(birthDate),
        sex,
        bmr,
        tdee,
        dailyTarget,
      },
      update: {
        heightCm,
        goalWeightKg,
        activityLevel,
        birthDate: new Date(birthDate),
        sex,
        bmr,
        tdee,
        dailyTarget,
      },
    });

    res.json(profile);
  }
);

export default router;
