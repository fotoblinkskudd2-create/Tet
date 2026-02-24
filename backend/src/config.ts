import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-change-me",
    accessExpiry: "15m",
    refreshExpiry: "30d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
} as const;
