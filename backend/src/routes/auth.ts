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
  createdAt: Date;
}

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

const users = new Map<string, User>();
const emailIndex = new Map<string, string>();

const router = Router();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'dev-secret') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-secret';
  }
  return secret;
}

const COOKIE_NAME = 'session';
const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;
const BCRYPT_ROUNDS = 12;

function setSessionCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_WEEK_MS,
    path: '/',
  });
}

function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
}

function parseTokenFromRequest(req: Request): string | undefined {
  const fromCookie = (req as Record<string, any>).cookies?.[COOKIE_NAME];
  if (typeof fromCookie === 'string' && fromCookie.length > 0) return fromCookie;

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return undefined;
  const token = header.slice(7);
  return token.length > 0 ? token : undefined;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = parseTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function stripUserForResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    rating: user.rating,
    stats: user.stats,
  };
}

function validateEmail(raw: unknown): string {
  const email = String(raw ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error('Invalid email address');
  return email;
}

function validateUsername(raw: unknown): string {
  const username = String(raw ?? '').trim();
  if (!USERNAME_RE.test(username)) {
    throw new Error('Username must be 3-30 characters: letters, digits, _ or -');
  }
  return username;
}

function validatePassword(raw: unknown): string {
  const password = String(raw ?? '');
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  return password;
}

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const email = validateEmail(req.body?.email);
    const username = validateUsername(req.body?.username);
    const password = validatePassword(req.body?.password);

    if (emailIndex.has(email) || [...users.values()].some((u) => u.username === username)) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const newUser: User = {
      id: uuid(),
      email,
      username,
      passwordHash,
      rating: 1200,
      stats: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      createdAt: new Date(),
    };

    users.set(newUser.id, newUser);
    emailIndex.set(email, newUser.id);

    const token = jwt.sign({ userId: newUser.id }, getJwtSecret(), { expiresIn: '7d' });
    setSessionCookie(res, token);
    res.status(201).json(stripUserForResponse(newUser));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const email = validateEmail(req.body?.email);
    const password = String(req.body?.password ?? '');
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const userId = emailIndex.get(email);
    const user = userId ? users.get(userId) : undefined;

    // Constant-time-ish: always run compare even if user is missing
    const dummyHash = '$2a$12$000000000000000000000uGIu0SXH.XOE.SCKB3h1Cv0w8KNfuaO';
    const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);

    if (!user || !passwordMatches) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });
    setSessionCookie(res, token);
    res.json(stripUserForResponse(user));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = users.get(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(stripUserForResponse(user));
});

export { users, emailIndex };
export default router;
