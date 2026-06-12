import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        priority: {
          p0: "#dc2626",
          p1: "#ea580c",
          p2: "#2563eb",
          p3: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;
