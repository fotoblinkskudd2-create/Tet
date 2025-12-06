import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, rateLimitMiddleware, extractClientInfo } from '@/lib/middleware';
import { verifyAndEnableTOTP } from '@/lib/totp';

/**
 * POST /api/auth/totp/verify-setup
 * Verify TOTP token and enable 2FA
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId, token, backupCodes } = body;

    if (!userId || !token || !backupCodes) {
      return apiError('Missing required fields', 400);
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret) {
      return apiError('User not found or 2FA not initialized', 404);
    }

    if (user.totpEnabled) {
      return apiError('2FA is already enabled', 400);
    }

    // Verify token and enable TOTP
    const result = await verifyAndEnableTOTP(user.totpSecret, token, backupCodes);

    if (!result.valid) {
      return apiError('Invalid verification code', 400);
    }

    // Enable TOTP and store hashed backup codes
    await db.user.update({
      where: { id: userId },
      data: {
        totpEnabled: true,
        totpBackupCodes: result.hashedBackupCodes || [],
      },
    });

    // Log event
    const clientInfo = extractClientInfo(request);
    await db.auditLog.create({
      data: {
        userId,
        eventType: 'totp_enabled',
        eventAction: 'success',
        eventDescription: '2FA enabled successfully',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      },
    });

    return apiResponse({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error: any) {
    console.error('TOTP verify setup error:', error);
    return apiError('Failed to enable 2FA', 500);
  }
}
