import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { User } from '../models';
import {
  AuthRequest,
  authRequired,
  generateToken,
  setSessionCookie,
  clearSessionCookie,
} from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validate([
    { field: 'email', required: true, type: 'email' },
    { field: 'name', required: true, type: 'string', min: 2, max: 100 },
    { field: 'password', required: true, type: 'string', min: 8, max: 128 },
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();
      const { email, name, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
      if (existing) {
        res.status(409).json({ error: 'E-postadressen er allerede registrert' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const id = uuid();

      db.prepare(
        'INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
      ).run(id, normalizedEmail, name.trim(), passwordHash, 'user');

      const token = generateToken(id);
      setSessionCookie(res, token);

      res.status(201).json({
        id,
        email: normalizedEmail,
        name: name.trim(),
        role: 'user',
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Kunne ikke opprette bruker' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  validate([
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true, type: 'string' },
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = db.prepare(
        'SELECT id, email, name, password_hash, role FROM users WHERE email = ?'
      ).get(normalizedEmail) as User | undefined;

      if (!user || !user.password_hash) {
        res.status(401).json({ error: 'Feil e-post eller passord' });
        return;
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Feil e-post eller passord' });
        return;
      }

      const token = generateToken(user.id);
      setSessionCookie(res, token);

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Kunne ikke logge inn' });
    }
  }
);

// POST /api/auth/google (placeholder for Google OAuth)
router.post('/google', async (req: AuthRequest, res: Response) => {
  try {
    const { googleToken, email, name, googleId } = req.body;
    if (!email || !googleId) {
      res.status(400).json({ error: 'Mangler Google-innloggingsdata' });
      return;
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase().trim();

    let user = db.prepare(
      'SELECT id, email, name, role FROM users WHERE google_id = ? OR email = ?'
    ).get(googleId, normalizedEmail) as User | undefined;

    if (!user) {
      const id = uuid();
      db.prepare(
        'INSERT INTO users (id, email, name, google_id, role) VALUES (?, ?, ?, ?, ?)'
      ).run(id, normalizedEmail, name || normalizedEmail, googleId, 'user');
      user = { id, email: normalizedEmail, name, role: 'user' } as User;
    } else if (!user.google_id) {
      db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(googleId, user.id);
    }

    const token = generateToken(user.id);
    setSessionCookie(res, token);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Kunne ikke logge inn med Google' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: AuthRequest, res: Response) => {
  clearSessionCookie(res);
  res.json({ message: 'Logget ut' });
});

// GET /api/auth/me
router.get('/me', authRequired, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = db.prepare(
    'SELECT id, email, name, role, created_at FROM users WHERE id = ?'
  ).get(req.userId) as User | undefined;

  if (!user) {
    res.status(404).json({ error: 'Bruker ikke funnet' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
  });
});

export default router;
