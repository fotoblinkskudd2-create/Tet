import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, rateLimitMiddleware } from '@/lib/middleware';
import { setupTOTP } from '@/lib/totp';

/**
 * POST /api/auth/totp/setup
 * Generate TOTP secret and QR code for 2FA setup
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return apiError('User ID is required', 400);
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError('User not found', 404);
    }

    if (user.totpEnabled) {
      return apiError('2FA is already enabled', 400);
    }

    // Generate TOTP secret and backup codes
    const { secret, qrCode, backupCodes } = await setupTOTP(user.email);

    // Store secret temporarily (not enabled until verified)
    await db.user.update({
      where: { id: userId },
      data: {
        totpSecret: secret,
      },
    });

    return apiResponse({
      secret,
      qrCode,
      backupCodes, // Return plaintext backup codes (user must save them)
    });
  } catch (error: any) {
    console.error('TOTP setup error:', error);
    return apiError('Failed to setup 2FA', 500);
  }
}
