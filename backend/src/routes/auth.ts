import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  rating: number;
  stats: UserStats;
}

const users = new Map<string, User>();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = 'session';
const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_WEEK_MS,
    path: '/',
  });
}

function parseTokenFromRequest(req: Request): string | undefined {
  const fromCookie = (req as any).cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (!header) return undefined;
  const [, token] = header.split(' ');
  return token;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = parseTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function validateSignupBody(body: any) {
  if (!body?.email || !body?.username || !body?.password) {
    throw new Error('Missing required fields');
  }
}

router.post('/signup', async (req: Request, res: Response) => {
  try {
    validateSignupBody(req.body);
    const email = String(req.body.email).toLowerCase();
    const username = String(req.body.username);

    if ([...users.values()].some((u) => u.email === email || u.username === username)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const newUser: User = {
      id: uuid(),
      email,
      username,
      passwordHash,
      rating: 1200,
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
    };

    users.set(newUser.id, newUser);

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    setSessionCookie(res, token);

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      rating: newUser.rating,
      stats: newUser.stats,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).toLowerCase();
  const user = [...users.values()].find((u) => u.email === normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  setSessionCookie(res, token);

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    rating: user.rating,
    stats: user.stats,
  });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    rating: user.rating,
    stats: user.stats,
  });
});

export default router;
