import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export const COOKIE_NAME = 'session';
export const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

export interface AuthedRequest extends Request {
  userId?: string;
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_WEEK_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

function parseTokenFromRequest(req: Request): string | undefined {
  const fromCookie = (req as any).cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (!header) return undefined;
  const [, token] = header.split(' ');
  return token;
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = parseTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
