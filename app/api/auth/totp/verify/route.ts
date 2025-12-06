import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, rateLimitMiddleware, extractClientInfo } from '@/lib/middleware';
import { verifyTOTPOrBackup } from '@/lib/totp';
import { createSession } from '@/lib/session';
import { registerDevice } from '@/lib/device';
import { resetFailedLogins } from '@/lib/rate-limit';

/**
 * POST /api/auth/totp/verify
 * Verify TOTP code and complete login
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId, token, backupCode } = body;

    if (!userId) {
      return apiError('User ID is required', 400);
    }

    if (!token && !backupCode) {
      return apiError('TOTP token or backup code is required', 400);
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpEnabled || !user.totpSecret) {
      return apiError('2FA not enabled for this user', 400);
    }

    // Verify TOTP or backup code
    const verification = await verifyTOTPOrBackup(
      user.totpSecret,
      token || '',
      backupCode || null,
      user.totpBackupCodes
    );

    if (!verification.valid) {
      return apiError('Invalid verification code', 401);
    }

    // If backup code was used, remove it
    if (verification.usedBackupCodeIndex !== undefined) {
      const updatedBackupCodes = [...user.totpBackupCodes];
      updatedBackupCodes.splice(verification.usedBackupCodeIndex, 1);

      await db.user.update({
        where: { id: userId },
        data: { totpBackupCodes: updatedBackupCodes },
      });
    }

    // Reset failed login attempts
    await resetFailedLogins(userId);

    // Register or get device
    const clientInfo = extractClientInfo(request);
    const deviceId = await registerDevice(userId, clientInfo);

    // Create session
    const { accessToken, refreshToken, sessionId } = await createSession({
      userId,
      deviceId,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    // Log successful login
    await db.auditLog.create({
      data: {
        userId,
        eventType: 'login_success',
        eventAction: 'success',
        eventDescription: 'User logged in with passkey and 2FA',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceId,
      },
    });

    return apiResponse({
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error: any) {
    console.error('TOTP verify error:', error);
    return apiError('Failed to verify 2FA code', 500);
  }
}
