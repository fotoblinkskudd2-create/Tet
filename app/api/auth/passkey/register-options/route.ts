import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, rateLimitMiddleware } from '@/lib/middleware';
import { generatePasskeyRegistrationOptions } from '@/lib/webauthn';
import { generateSecureRandom } from '@/lib/crypto';
import { config } from '@/lib/config';

/**
 * POST /api/auth/passkey/register-options
 * Generate WebAuthn registration options
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return apiError('User ID and email are required', 400);
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError('User not found', 404);
    }

    // Generate registration options
    const options = await generatePasskeyRegistrationOptions(
      user.id,
      user.email,
      user.username || user.email
    );

    // Store challenge temporarily (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + config.security.challengeExpirationMinutes * 60 * 1000);
    await db.authChallenge.create({
      data: {
        challenge: options.challenge,
        userId: user.id,
        email: user.email,
        type: 'registration',
        expiresAt,
      },
    });

    return apiResponse({ options });
  } catch (error: any) {
    console.error('Passkey registration options error:', error);
    return apiError('Failed to generate registration options', 500);
  }
}
