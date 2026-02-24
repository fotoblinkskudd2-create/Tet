/**
 * Generates extended demo data for LeanLife presentations and demos.
 * Run with: npx tsx scripts/generate-demo-data.ts
 *
 * Requires DATABASE_URL environment variable.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_USERS = [
  { name: "Marie Johansen", email: "marie@example.com", sex: "FEMALE", height: 168, goalWeight: 72, startWeight: 84, activityLevel: "LIGHT" },
  { name: "Erik Hansen", email: "erik@example.com", sex: "MALE", height: 180, goalWeight: 88, startWeight: 102, activityLevel: "SEDENTARY" },
  { name: "Sara Olsen", email: "sara@example.com", sex: "FEMALE", height: 162, goalWeight: 60, startWeight: 68, activityLevel: "MODERATE" },
  { name: "Anders Berg", email: "anders@example.com", sex: "MALE", height: 178, goalWeight: 82, startWeight: 95, activityLevel: "LIGHT" },
  { name: "Ingrid Vik", email: "ingrid@example.com", sex: "FEMALE", height: 170, goalWeight: 68, startWeight: 78, activityLevel: "ACTIVE" },
];

async function main() {
  console.log("Generating extended demo data...\n");

  const passwordHash = await bcrypt.hash("demo1234", 12);

  for (const demo of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        passwordHash,
        name: demo.name,
        subscription: "PRO",
      },
    });

    await prisma.healthProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        heightCm: demo.height,
        goalWeightKg: demo.goalWeight,
        activityLevel: demo.activityLevel as any,
        birthDate: randomBirthDate(),
        sex: demo.sex as any,
        bmr: 1500,
        tdee: 2000,
        dailyTarget: 1600,
      },
    });

    // Generate 60 days of weight entries with realistic progression
    const today = new Date();
    for (let i = 60; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const progressRatio = (60 - i) / 60;
      const targetLoss = demo.startWeight - demo.goalWeight;
      const weight =
        demo.startWeight -
        targetLoss * progressRatio * 0.4 +
        (Math.random() - 0.5) * 0.8;

      await prisma.weightEntry.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: new Date(date.toISOString().slice(0, 10)),
          },
        },
        update: { weightKg: Math.round(weight * 10) / 10 },
        create: {
          userId: user.id,
          weightKg: Math.round(weight * 10) / 10,
          date: new Date(date.toISOString().slice(0, 10)),
        },
      });
    }

    console.log(`  Created user: ${demo.name} (${demo.email})`);
  }

  console.log(`\nDemo data generated for ${DEMO_USERS.length} users.`);
  console.log("Login with any email above and password: demo1234");
}

function randomBirthDate(): Date {
  const year = 1975 + Math.floor(Math.random() * 25);
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
