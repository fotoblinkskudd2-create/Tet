// Seed script — populates database with demo users, lessons, and transactions
// Run: npx ts-node scripts/seed.ts

interface SeedUser {
  id: string;
  name: string;
  email: string;
  language: string;
  level: number;
  totalXp: number;
  subscriptionTier: string;
}

interface SeedLesson {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xpReward: number;
  durationMinutes: number;
  language: string;
}

const demoUsers: SeedUser[] = [
  { id: "user_maria", name: "Maria Santos", email: "maria@demo.com", language: "pt", level: 5, totalXp: 1250, subscriptionTier: "pro" },
  { id: "user_ahmed", name: "Ahmed Obi", email: "ahmed@demo.com", language: "en", level: 3, totalXp: 620, subscriptionTier: "free" },
  { id: "user_emma", name: "Emma Nordberg", email: "emma@demo.com", language: "no", level: 2, totalXp: 310, subscriptionTier: "free" },
];

const demoLessons: SeedLesson[] = [
  { id: "lesson_renter_101", title: "Hva er renter?", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 4, language: "no" },
  { id: "lesson_inflasjon_101", title: "Hva er inflasjon?", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 5, language: "no" },
  { id: "lesson_budsjett_101", title: "Budsjettering 101", category: "budgeting", difficulty: "beginner", xpReward: 50, durationMinutes: 4, language: "no" },
  { id: "lesson_compound", title: "Renters rente", category: "investing", difficulty: "intermediate", xpReward: 75, durationMinutes: 7, language: "no" },
  { id: "lesson_gjeld_101", title: "Forstå gjeld", category: "debt", difficulty: "beginner", xpReward: 50, durationMinutes: 5, language: "no" },
  { id: "lesson_sparing_101", title: "Spar smart", category: "saving", difficulty: "beginner", xpReward: 50, durationMinutes: 4, language: "no" },
  { id: "lesson_aksjer_101", title: "Hva er aksjer?", category: "investing", difficulty: "intermediate", xpReward: 75, durationMinutes: 8, language: "no" },
  { id: "lesson_skatt_101", title: "Skatt for nybegynnere", category: "tax", difficulty: "beginner", xpReward: 50, durationMinutes: 6, language: "no" },
  { id: "lesson_forsikring_101", title: "Forsikring du trenger", category: "insurance", difficulty: "beginner", xpReward: 50, durationMinutes: 5, language: "no" },
  { id: "lesson_pensjon_101", title: "Start pensjonssparing", category: "retirement", difficulty: "intermediate", xpReward: 75, durationMinutes: 7, language: "no" },
  { id: "lesson_interest_en", title: "What are interest rates?", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 4, language: "en" },
  { id: "lesson_inflation_en", title: "Understanding inflation", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 5, language: "en" },
  { id: "lesson_budget_en", title: "Budgeting 101", category: "budgeting", difficulty: "beginner", xpReward: 50, durationMinutes: 4, language: "en" },
  { id: "lesson_juros_pt", title: "O que são juros?", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 4, language: "pt" },
  { id: "lesson_inflacao_pt", title: "Entendendo a inflação", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 5, language: "pt" },
  { id: "lesson_credit_101", title: "Kredittscore forklart", category: "credit", difficulty: "intermediate", xpReward: 75, durationMinutes: 6, language: "no" },
  { id: "lesson_etf_101", title: "ETF og fond", category: "investing", difficulty: "intermediate", xpReward: 75, durationMinutes: 8, language: "no" },
  { id: "lesson_nødfond", title: "Bygg nødfond", category: "saving", difficulty: "beginner", xpReward: 50, durationMinutes: 5, language: "no" },
  { id: "lesson_bolig_101", title: "Kjøpe bolig?", category: "housing", difficulty: "advanced", xpReward: 100, durationMinutes: 10, language: "no" },
  { id: "lesson_crypto_101", title: "Krypto: risiko og muligheter", category: "investing", difficulty: "advanced", xpReward: 100, durationMinutes: 8, language: "no" },
];

const demoTransactions = Array.from({ length: 50 }, (_, i) => ({
  id: `txn_${i + 1}`,
  userId: demoUsers[i % 3].id,
  amount: Math.round((Math.random() * 500 + 10) * 100) / 100,
  category: ["food", "transport", "entertainment", "utilities", "shopping", "health"][i % 6],
  description: ["Matbutikk", "Buss", "Netflix", "Strøm", "Klær", "Apotek"][i % 6],
  date: new Date(2026, 1, Math.floor(i / 2) + 1).toISOString().split("T")[0],
  source: "manual",
}));

async function seed() {
  console.log("Seeding CashPilot database...");
  console.log(`  ${demoUsers.length} users`);
  console.log(`  ${demoLessons.length} lessons`);
  console.log(`  ${demoTransactions.length} transactions`);

  // In production, replace with Prisma calls:
  // await prisma.user.createMany({ data: demoUsers });
  // await prisma.lesson.createMany({ data: demoLessons });
  // await prisma.transaction.createMany({ data: demoTransactions });

  console.log("Seed data ready. Connect to Prisma to persist.");
  console.log(JSON.stringify({ users: demoUsers, lessons: demoLessons, transactions: demoTransactions }, null, 2));
}

seed().catch(console.error);
