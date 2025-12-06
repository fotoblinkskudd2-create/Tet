import { NextRequest } from 'next/server';
import { apiResponse, apiError, requireAuth, extractClientInfo } from '@/lib/middleware';
import { revokeAllUserSessions } from '@/lib/session';
import { db } from '@/lib/db';

/**
 * POST /api/auth/logout-all
 * Logout from ALL devices (revoke all sessions)
 */
export async function POST(request: NextRequest) {
  return requireAuth(request, async (userId, sessionId) => {
    try {
      // Revoke all sessions
      await revokeAllUserSessions(userId, 'user_logout_all_devices');

      // Log logout from all devices
      const clientInfo = extractClientInfo(request);
      await db.auditLog.create({
        data: {
          userId,
          eventType: 'logout_all_devices',
          eventAction: 'success',
          eventDescription: 'User logged out from all devices',
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
        },
      });

      return apiResponse({
        success: true,
        message: 'Logged out from all devices successfully',
      });
    } catch (error: any) {
      console.error('Logout all error:', error);
      return apiError('Failed to logout from all devices', 500);
    }
  });
}
