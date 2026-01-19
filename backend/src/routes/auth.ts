import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { query } from '../db';
import { config } from '../config';
import { authMiddleware } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { User, UserResponse } from '../types';

const router = Router();
const COOKIE_NAME = 'session';
const ONE_MONTH_MS = 1000 * 60 * 60 * 24 * 30;

function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    maxAge: ONE_MONTH_MS,
    path: '/',
  });
}

function userToResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    subscriptionTier: user.subscriptionTier,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
  };
}

router.post('/signup', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedUsername = String(username).trim();

    // Check if user exists
    const existingUsers = await query<User>(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [normalizedEmail, normalizedUsername]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await query<User>(
      `INSERT INTO users (id, email, username, password_hash, subscription_tier)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [uuid(), normalizedEmail, normalizedUsername, passwordHash, 'free']
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    setSessionCookie(res, token);

    res.status(201).json(userToResponse(newUser));
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Find user
    const users = await query<User>(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    setSessionCookie(res, token);

    res.json(userToResponse(user));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json(userToResponse(req.user));
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Logged out successfully' });
});

export default router;
