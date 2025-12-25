import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import pool from '../db';

interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
}

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

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const userId = uuid();

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (id, email, username, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, rating, games_played, wins, losses, draws`,
      [userId, email, username, passwordHash]
    );

    const newUser = result.rows[0];

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    setSessionCookie(res, token);

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      rating: newUser.rating,
      stats: {
        gamesPlayed: newUser.games_played,
        wins: newUser.wins,
        losses: newUser.losses,
        draws: newUser.draws,
      },
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

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

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
    stats: {
      gamesPlayed: user.games_played,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
    },
  });
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;

  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = result.rows[0];

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    rating: user.rating,
    stats: {
      gamesPlayed: user.games_played,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
    },
  });
});

export { authMiddleware };
export default router;
