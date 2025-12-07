import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = db.prepare(
      'SELECT id, email, username, password_hash, rating FROM users WHERE email = ?'
    ).get(email) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'Ugyldig e-post eller passord' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Ugyldig e-post eller passord' },
        { status: 401 }
      );
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      rating: user.rating,
    };

    const token = createToken(userResponse);
    await setAuthCookie(token);

    return NextResponse.json({ user: userResponse });
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
