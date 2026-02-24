import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Seeds the database with demo users, foods, and sample data */
async function main() {
  console.log("🌱 Seeding LeanLife database...");

  // Create demo user
  const passwordHash = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "marie@example.com" },
    update: {},
    create: {
      email: "marie@example.com",
      passwordHash,
      name: "Marie Johansen",
      subscription: "PRO",
    },
  });

  // Health profile
  await prisma.healthProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      heightCm: 168,
      goalWeightKg: 72,
      activityLevel: "LIGHT",
      birthDate: new Date("1992-05-15"),
      sex: "FEMALE",
      bmr: 1480,
      tdee: 2035,
      dailyTarget: 1535,
    },
  });

  // Foods
  const foods = await Promise.all([
    upsertFood("Havregryn", 379, 13.2, 67.7, 6.5, 10.1, 100),
    upsertFood("Kyllingbryst", 165, 31.0, 0, 3.6, 0, 100),
    upsertFood("Laksfilet", 208, 20.4, 0, 13.4, 0, 100),
    upsertFood("Ris (kokt)", 130, 2.7, 28.2, 0.3, 0.4, 100),
    upsertFood("Brokkoli", 34, 2.8, 7.2, 0.4, 2.6, 100),
    upsertFood("Egg (kokt)", 155, 12.6, 1.1, 10.6, 0, 100),
    upsertFood("Banan", 89, 1.1, 22.8, 0.3, 2.6, 100),
    upsertFood("Gresk yoghurt", 97, 9.0, 3.6, 5.0, 0, 100),
    upsertFood("Fullkornsbrød", 247, 13.0, 41.0, 3.4, 7.0, 100),
    upsertFood("Avokado", 160, 2.0, 8.5, 14.7, 6.7, 100),
    upsertFood("Søtpotet", 86, 1.6, 20.1, 0.1, 3.0, 100),
    upsertFood("Cottage cheese", 98, 11.1, 3.4, 4.3, 0, 100),
    upsertFood("Blåbær", 57, 0.7, 14.5, 0.3, 2.4, 100),
    upsertFood("Tunfisk (i vann)", 116, 25.5, 0, 0.8, 0, 100),
    upsertFood("Quinoa (kokt)", 120, 4.4, 21.3, 1.9, 2.8, 100),
    upsertFood("Spinat", 23, 2.9, 3.6, 0.4, 2.2, 100),
    upsertFood("Mandler", 579, 21.2, 21.7, 49.9, 12.5, 100),
    upsertFood("Melk (lettmelk)", 46, 3.5, 5.0, 1.5, 0, 100),
    upsertFood("Tomat", 18, 0.9, 3.9, 0.2, 1.2, 100),
    upsertFood("Agurk", 16, 0.7, 3.6, 0.1, 0.5, 100),
  ]);

  // Weight entries (simulated 30-day trend)
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const weight = 84 - i * 0.08 + (Math.random() - 0.5) * 0.6;

    await prisma.weightEntry.upsert({
      where: {
        userId_date: { userId: user.id, date: new Date(date.toISOString().slice(0, 10)) },
      },
      update: { weightKg: Math.round(weight * 10) / 10 },
      create: {
        userId: user.id,
        weightKg: Math.round(weight * 10) / 10,
        date: new Date(date.toISOString().slice(0, 10)),
      },
    });
  }

  // Sample food logs for today
  const todayStr = today.toISOString().slice(0, 10);
  await prisma.foodLog.createMany({
    data: [
      { userId: user.id, foodId: foods[0].id, amount: 80, mealType: "BREAKFAST", date: new Date(todayStr) },
      { userId: user.id, foodId: foods[12].id, amount: 100, mealType: "BREAKFAST", date: new Date(todayStr) },
      { userId: user.id, foodId: foods[17].id, amount: 200, mealType: "BREAKFAST", date: new Date(todayStr) },
      { userId: user.id, foodId: foods[1].id, amount: 150, mealType: "LUNCH", date: new Date(todayStr) },
      { userId: user.id, foodId: foods[3].id, amount: 200, mealType: "LUNCH", date: new Date(todayStr) },
      { userId: user.id, foodId: foods[4].id, amount: 150, mealType: "LUNCH", date: new Date(todayStr) },
    ],
    skipDuplicates: true,
  });

  // Achievements
  await prisma.achievement.createMany({
    data: [
      { userId: user.id, type: "streak", name: "7-dagers streak" },
      { userId: user.id, type: "weight", name: "Første kilo ned" },
      { userId: user.id, type: "food", name: "100 måltider logget" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete!");
  console.log("   Demo-bruker: marie@example.com / demo1234");
}

async function upsertFood(
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  servingG: number
) {
  return prisma.food.upsert({
    where: { barcode: name.toLowerCase().replace(/\s/g, "-") },
    update: {},
    create: {
      name,
      barcode: name.toLowerCase().replace(/\s/g, "-"),
      calories,
      protein,
      carbs,
      fat,
      fiber,
      servingG,
      source: "seed",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
