import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { generalLimiter } from "./middleware/rateLimit";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import foodRoutes from "./routes/food";
import weightRoutes from "./routes/weight";
import mealRoutes from "./routes/meals";
import exerciseRoutes from "./routes/exercise";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("short"));
app.use(generalLimiter);

app.use("/v1/auth", authRoutes);
app.use("/v1/profile", profileRoutes);
app.use("/v1/food", foodRoutes);
app.use("/v1/weight", weightRoutes);
app.use("/v1/meals", mealRoutes);
app.use("/v1/exercise", exerciseRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "1.0.0", service: "leanlife-api" });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Intern serverfeil" });
  }
);

app.listen(config.port, () => {
  console.log(`LeanLife API running on port ${config.port}`);
});

export default app;
