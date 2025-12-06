import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, rateLimitMiddleware, extractClientInfo } from '@/lib/middleware';
import { verifyPasskeyRegistration, storePasskey } from '@/lib/webauthn';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

/**
 * POST /api/auth/passkey/register-verify
 * Verify and store passkey registration
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId, response, deviceName } = body as {
      userId: string;
      response: RegistrationResponseJSON;
      deviceName: string;
    };

    if (!userId || !response || !deviceName) {
      return apiError('Missing required fields', 400);
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError('User not found', 404);
    }

    // Get challenge
    const challenge = await db.authChallenge.findFirst({
      where: {
        userId,
        type: 'registration',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      return apiError('Invalid or expired challenge', 400);
    }

    // Verify registration
    const verification = await verifyPasskeyRegistration(response, challenge.challenge);

    if (!verification.verified) {
      return apiError('Passkey verification failed', 400);
    }

    // Store passkey
    await storePasskey(userId, verification, deviceName);

    // Mark challenge as used
    await db.authChallenge.update({
      where: { id: challenge.id },
      data: { used: true, usedAt: new Date() },
    });

    // Log event
    const clientInfo = extractClientInfo(request);
    await db.auditLog.create({
      data: {
        userId,
        eventType: 'passkey_registered',
        eventAction: 'success',
        eventDescription: `Passkey registered: ${deviceName}`,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      },
    });

    return apiResponse({
      success: true,
      message: 'Passkey registered successfully',
    });
  } catch (error: any) {
    console.error('Passkey registration verify error:', error);
    return apiError(error.message || 'Failed to verify passkey registration', 500);
  }
}
