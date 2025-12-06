import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, rateLimitMiddleware } from '@/lib/middleware';
import { generatePasskeyAuthenticationOptions } from '@/lib/webauthn';
import { config } from '@/lib/config';

/**
 * POST /api/auth/passkey/login-options
 * Generate WebAuthn authentication options
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { email } = body;

    // Generate authentication options (email is optional for passkey discovery)
    const options = await generatePasskeyAuthenticationOptions(email);

    // Store challenge
    const expiresAt = new Date(Date.now() + config.security.challengeExpirationMinutes * 60 * 1000);
    await db.authChallenge.create({
      data: {
        challenge: options.challenge,
        email: email || null,
        type: 'authentication',
        expiresAt,
      },
    });

    return apiResponse({ options });
  } catch (error: any) {
    console.error('Passkey login options error:', error);
    return apiError('Failed to generate authentication options', 500);
  }
}
