import { NextRequest } from 'next/server';
import { apiResponse, apiError, requireAuth, extractClientInfo } from '@/lib/middleware';
import { revokeSession } from '@/lib/session';
import { db } from '@/lib/db';

/**
 * POST /api/auth/logout
 * Logout from current session
 */
export async function POST(request: NextRequest) {
  return requireAuth(request, async (userId, sessionId) => {
    try {
      // Revoke current session
      await revokeSession(sessionId, 'user_logout');

      // Log logout
      const clientInfo = extractClientInfo(request);
      await db.auditLog.create({
        data: {
          userId,
          eventType: 'logout',
          eventAction: 'success',
          eventDescription: 'User logged out',
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
        },
      });

      return apiResponse({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('Logout error:', error);
      return apiError('Failed to logout', 500);
    }
  });
}
