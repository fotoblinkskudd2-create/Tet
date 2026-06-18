import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import {
  AuthedRequest,
  JWT_SECRET,
  authMiddleware,
  clearSessionCookie,
  setSessionCookie,
} from '../middleware/auth';

const router = Router();

interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
}

function toPublicUser(user: UserRow) {
  return { id: user.id, email: user.email, username: user.username };
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

    const existing = await pool.query<UserRow>(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.rowCount) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const inserted = await pool.query<UserRow>(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, password_hash`,
      [email, username, passwordHash]
    );
    const newUser = inserted.rows[0];

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    setSessionCookie(res, token);

    res.status(201).json(toPublicUser(newUser));
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
  const result = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [
    normalizedEmail,
  ]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  setSessionCookie(res, token);

  res.json(toPublicUser(user));
});

router.post('/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get('/me', authMiddleware, async (req: AuthedRequest, res: Response) => {
  const result = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [req.userId]);
  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(toPublicUser(user));
});

export default router;
