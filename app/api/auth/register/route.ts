import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .get(email, username);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email eller brukernavn er allerede i bruk' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const result = db.prepare(
      'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)'
    ).run(email, username, passwordHash);

    const user = {
      id: Number(result.lastInsertRowid),
      email,
      username,
      rating: 1000,
    };

    const token = createToken(user);
    await setAuthCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Noe gikk galt' },
      { status: 500 }
    );
  }
}
