import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { query } from '../db';
import { User } from '../types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export function parseTokenFromRequest(req: Request): string | undefined {
  // First try cookie
  const fromCookie = req.cookies?.['session'];
  if (fromCookie) return fromCookie;

  // Then try Authorization header
  const header = req.headers.authorization;
  if (!header) return undefined;

  const [bearer, token] = header.split(' ');
  if (bearer !== 'Bearer') return undefined;

  return token;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = parseTokenFromRequest(req);

  if (!token) {
    res.status(401).json({ error: 'No authentication token provided' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { userId: string };

    // Fetch user from database
    const users = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [payload.userId]
    );

    if (users.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = users[0];
    req.userId = users[0].id;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = parseTokenFromRequest(req);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { userId: string };
    const users = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [payload.userId]
    );

    if (users.length > 0) {
      req.user = users[0];
      req.userId = users[0].id;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.warn('Optional auth failed:', error);
  }

  next();
}

// Middleware to check subscription tier
export function requireSubscription(
  minTier: 'free' | 'premium' | 'eternal'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const tierHierarchy = { free: 0, premium: 1, eternal: 2 };
    const userTierLevel = tierHierarchy[req.user.subscriptionTier] || 0;
    const requiredTierLevel = tierHierarchy[minTier];

    if (userTierLevel < requiredTierLevel) {
      res.status(403).json({
        error: `This feature requires ${minTier} subscription`,
        currentTier: req.user.subscriptionTier,
        requiredTier: minTier,
      });
      return;
    }

    // Check if subscription is expired
    if (
      req.user.subscriptionTier !== 'eternal' &&
      req.user.subscriptionExpiresAt &&
      new Date(req.user.subscriptionExpiresAt) < new Date()
    ) {
      res.status(403).json({
        error: 'Your subscription has expired',
        expiresAt: req.user.subscriptionExpiresAt,
      });
      return;
    }

    next();
  };
}
