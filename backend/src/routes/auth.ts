import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../config";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimit";
import { registerSchema, loginSchema } from "../utils/validators";
import { AuthRequest } from "../types";

const prisma = new PrismaClient();
const router = Router();

function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign({ userId, email }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });
  const refreshToken = jwt.sign({ userId, email }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
  return { accessToken, refreshToken };
}

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "E-post allerede registrert" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const tokens = generateTokens(user.id, user.email);
    res.status(201).json({ user, ...tokens });
  }
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Ugyldig e-post eller passord" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Ugyldig e-post eller passord" });
      return;
    }

    const tokens = generateTokens(user.id, user.email);
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    });
  }
);

router.post(
  "/refresh",
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token påkrevd" });
      return;
    }

    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
        email: string;
      };
      const tokens = generateTokens(payload.userId, payload.email);
      res.json(tokens);
    } catch {
      res.status(401).json({ error: "Ugyldig refresh token" });
    }
  }
);

router.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        createdAt: true,
        healthProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "Bruker ikke funnet" });
      return;
    }

    res.json(user);
  }
);

export default router;
