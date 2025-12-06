import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, rateLimitMiddleware, extractClientInfo } from '@/lib/middleware';
import { verifyPasskeyAuthentication } from '@/lib/webauthn';
import { createSession } from '@/lib/session';
import { registerDevice } from '@/lib/device';
import { isAccountLocked, recordFailedLogin, resetFailedLogins } from '@/lib/rate-limit';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

/**
 * POST /api/auth/passkey/login-verify
 * Verify passkey authentication and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { response } = body as { response: AuthenticationResponseJSON };

    if (!response) {
      return apiError('Missing authentication response', 400);
    }

    // Get challenge
    const challenge = await db.authChallenge.findFirst({
      where: {
        type: 'authentication',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      return apiError('Invalid or expired challenge', 400);
    }

    let userId: string;

    try {
      // Verify authentication
      const verification = await verifyPasskeyAuthentication(response, challenge.challenge);

      if (!verification.verified) {
        return apiError('Passkey verification failed', 400);
      }

      userId = verification.userId;

      // Check if account is locked
      const locked = await isAccountLocked(userId);
      if (locked) {
        return apiError('Account is locked due to too many failed attempts', 423);
      }

      // Get user
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        return apiError('User not found', 404);
      }

      // Check if TOTP is enabled (mandatory after first login)
      if (!user.totpEnabled) {
        // Mark challenge as used
        await db.authChallenge.update({
          where: { id: challenge.id },
          data: { used: true, usedAt: new Date() },
        });

        return apiResponse({
          requireTotp: true,
          userId: user.id,
          message: 'Please set up 2FA before continuing',
        });
      }

      // TOTP is enabled, require verification
      return apiResponse({
        requireTotpVerification: true,
        userId: user.id,
        tempToken: challenge.challenge, // Use challenge as temp token
        message: 'Please enter your 2FA code',
      });
    } catch (error: any) {
      // Failed authentication
      if (userId!) {
        await recordFailedLogin(userId);
      }

      // Mark challenge as used
      await db.authChallenge.update({
        where: { id: challenge.id },
        data: { used: true, usedAt: new Date() },
      });

      return apiError('Authentication failed', 401);
    }
  } catch (error: any) {
    console.error('Passkey login verify error:', error);
    return apiError(error.message || 'Failed to verify passkey authentication', 500);
  }
}
