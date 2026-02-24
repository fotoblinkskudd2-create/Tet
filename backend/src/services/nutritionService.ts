import { PrismaClient } from "@prisma/client";
import { NutritionSummary } from "../types";

const prisma = new PrismaClient();

/** Returns daily nutrition summary for a user on a given date */
export async function getDailyNutrition(
  userId: string,
  date: string
): Promise<NutritionSummary> {
  const logs = await prisma.foodLog.findMany({
    where: { userId, date: new Date(date) },
    include: { food: true },
  });

  return logs.reduce(
    (acc, log) => {
      const ratio = log.amount / log.food.servingG;
      return {
        calories: acc.calories + Math.round(log.food.calories * ratio),
        protein: Math.round((acc.protein + log.food.protein * ratio) * 10) / 10,
        carbs: Math.round((acc.carbs + log.food.carbs * ratio) * 10) / 10,
        fat: Math.round((acc.fat + log.food.fat * ratio) * 10) / 10,
        fiber: Math.round((acc.fiber + log.food.fiber * ratio) * 10) / 10,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

/** Returns a 7-day calorie trend */
export async function getWeeklyCalorieTrend(
  userId: string
): Promise<{ date: string; calories: number }[]> {
  const today = new Date();
  const results: { date: string; calories: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const summary = await getDailyNutrition(userId, dateStr);
    results.push({ date: dateStr, calories: summary.calories });
  }

  return results;
}
