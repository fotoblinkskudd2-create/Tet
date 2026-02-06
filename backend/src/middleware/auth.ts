import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'bergenbudget-dev-secret-change-in-production';
const COOKIE_NAME = 'bb_session';
const TOKEN_EXPIRY = '7d';
const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_WEEK_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

function extractToken(req: Request): string | undefined {
  const fromCookie = (req as any).cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return undefined;
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Autentisering kreves' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = getDb();
    const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(payload.userId) as Pick<User, 'id' | 'role'> | undefined;

    if (!user) {
      res.status(401).json({ error: 'Bruker ikke funnet' });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch {
    res.status(401).json({ error: 'Ugyldig eller utløpt token' });
  }
}

export function adminRequired(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Kun administratorer har tilgang' });
    return;
  }
  next();
}

export function ownerOrAdmin(resourceUserId: string, req: AuthRequest): boolean {
  return req.userId === resourceUserId || req.userRole === 'admin';
}
