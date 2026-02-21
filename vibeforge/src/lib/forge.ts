export interface ForgedFile {
  path: string;
  content: string;
  language: string;
}

export interface ForgePlan {
  appName: string;
  description: string;
  features: string[];
  dataModel: string[];
  routes: string[];
  files: string[];
}

export interface ForgeResult {
  plan: ForgePlan;
  files: ForgedFile[];
}

function inferAppDetails(input: string): { name: string; features: string[]; vibe: string } {
  const words = input.toLowerCase().split(/\s+/);
  const vibeKeywords = [
    "cyberpunk", "zen", "brutalist", "retro", "luxury", "hacker",
    "kawaii", "dark", "synthwave", "glass", "neon", "pastel", "minimal",
    "glitch", "matrix", "vapor", "frost",
  ];
  const detectedVibe = vibeKeywords.find((v) => words.includes(v)) ?? "modern";

  const appTypes: Record<string, string[]> = {
    tracker: ["dashboard", "stats tracking", "progress visualization", "data entry forms", "charts"],
    todo: ["task management", "categories", "due dates", "priority levels", "drag & drop"],
    chat: ["real-time messaging", "user profiles", "message history", "typing indicators"],
    blog: ["article editor", "categories", "comments", "search", "RSS feed"],
    store: ["product catalog", "shopping cart", "checkout flow", "order history"],
    portfolio: ["project gallery", "about section", "contact form", "blog", "resume"],
    dashboard: ["analytics widgets", "data visualization", "filters", "export", "alerts"],
    game: ["game loop", "score tracking", "leaderboard", "achievements", "sound effects"],
  };

  let features = ["responsive layout", "dark mode", "user authentication", "data persistence"];
  for (const [type, typeFeatures] of Object.entries(appTypes)) {
    if (words.includes(type) || words.some((w) => w.includes(type))) {
      features = typeFeatures;
      break;
    }
  }

  const nameWords = input.split(/\s+/).slice(0, 3).map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );

  return {
    name: nameWords.join("") + "App",
    features,
    vibe: detectedVibe,
  };
}

export function generateForgeResult(userInput: string, vibeName: string): ForgeResult {
  const details = inferAppDetails(userInput);
  const appName = details.name;
  const safeName = appName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  const plan: ForgePlan = {
    appName,
    description: userInput,
    features: [
      ...details.features,
      `${vibeName} visual theme`,
      "micro-animations & transitions",
      "mobile responsive design",
      "SEO optimized",
    ],
    dataModel: [
      "User { id, name, email, avatar, createdAt }",
      "Item { id, title, description, status, userId, createdAt, updatedAt }",
      "Category { id, name, color, icon }",
      "Settings { userId, theme, notifications, language }",
    ],
    routes: [
      "/ - Landing / Dashboard",
      "/app - Main application view",
      "/app/settings - User settings",
      "/api/items - CRUD endpoints",
      "/api/auth - Authentication",
    ],
    files: [
      `package.json`,
      `next.config.ts`,
      `tailwind.config.ts`,
      `src/app/layout.tsx`,
      `src/app/page.tsx`,
      `src/app/app/page.tsx`,
      `src/components/header.tsx`,
      `src/components/sidebar.tsx`,
      `src/components/dashboard.tsx`,
      `src/lib/types.ts`,
      `src/lib/store.ts`,
      `prisma/schema.prisma`,
    ],
  };

  const files: ForgedFile[] = [
    {
      path: "package.json",
      language: "json",
      content: JSON.stringify(
        {
          name: safeName,
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "eslint",
          },
          dependencies: {
            next: "^15.0.0",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
            "framer-motion": "^12.0.0",
            "lucide-react": "^0.400.0",
            "next-themes": "^0.4.0",
          },
          devDependencies: {
            "@types/node": "^20",
            "@types/react": "^19",
            typescript: "^5",
            tailwindcss: "^4",
          },
        },
        null,
        2
      ),
    },
    {
      path: "next.config.ts",
      language: "typescript",
      content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;`,
    },
    {
      path: "src/lib/types.ts",
      language: "typescript",
      content: `export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "archived";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}`,
    },
    {
      path: "src/app/layout.tsx",
      language: "tsx",
      content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${appName}",
  description: "${userInput}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}`,
    },
    {
      path: "src/app/page.tsx",
      language: "tsx",
      content: `"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  const [items, setItems] = useState<{ id: string; title: string; status: string }[]>([]);

  const addItem = (title: string) => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, status: "active" },
    ]);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Dashboard items={items} onAddItem={addItem} />
      </main>
    </div>
  );
}`,
    },
    {
      path: "src/components/header.tsx",
      language: "tsx",
      content: `"use client";

import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ${appName}
        </h1>
        <nav className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
            New Item
          </button>
        </nav>
      </div>
    </motion.header>
  );
}`,
    },
    {
      path: "src/components/dashboard.tsx",
      language: "tsx",
      content: `"use client";

import { motion } from "framer-motion";

interface DashboardProps {
  items: { id: string; title: string; status: string }[];
  onAddItem: (title: string) => void;
}

export function Dashboard({ items, onAddItem }: DashboardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-full flex flex-col items-center gap-4 py-20 text-muted-foreground"
        >
          <p className="text-lg">No items yet. Create your first one!</p>
          <button
            onClick={() => onAddItem("My First Item")}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            Get Started
          </button>
        </motion.div>
      )}
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg"
        >
          <h3 className="font-semibold text-card-foreground">{item.title}</h3>
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            {item.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}`,
    },
    {
      path: "prisma/schema.prisma",
      language: "prisma",
      content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  avatar    String?
  items     Item[]
  createdAt DateTime @default(now())
}

model Item {
  id          String   @id @default(cuid())
  title       String
  description String   @default("")
  status      String   @default("active")
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id    String @id @default(cuid())
  name  String
  color String
  icon  String
}`,
    },
  ];

  files.push({
    path: "src/app/globals.css",
    language: "css",
    content: `@import "tailwindcss";

:root {
  --background: ${vibeName === "Cyberpunk" ? "#0a0a0f" : "#0c0c12"};
  --foreground: #e0e0ff;
  --primary: #00f0ff;
  --card: #0f0f1e;
  --border: #2a2a4a;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

::selection {
  background: var(--primary);
  color: var(--background);
}`,
  });

  files.push({
    path: ".env.example",
    language: "bash",
    content: `DATABASE_URL="postgresql://user:password@localhost:5432/${safeName}"
NEXT_PUBLIC_APP_URL="http://localhost:3000"`,
  });

  files.push({
    path: "src/lib/store.ts",
    language: "typescript",
    content: `type Listener = () => void;

class Store<T> {
  private state: T;
  private listeners: Set<Listener> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(partial: Partial<T>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const appStore = new Store({
  items: [] as { id: string; title: string; status: string }[],
  loading: false,
});`,
  });

  return { plan, files };
}
