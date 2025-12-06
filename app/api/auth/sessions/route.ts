import { NextRequest } from 'next/server';
import { apiResponse, apiError, requireAuth } from '@/lib/middleware';
import { getUserSessions } from '@/lib/session';

/**
 * GET /api/auth/sessions
 * Get all active sessions for current user
 */
export async function GET(request: NextRequest) {
  return requireAuth(request, async (userId, sessionId) => {
    try {
      const sessions = await getUserSessions(userId);

      // Mark current session
      const sessionsWithCurrent = sessions.map((session) => ({
        ...session,
        isCurrent: session.id === sessionId,
      }));

      return apiResponse({ sessions: sessionsWithCurrent });
    } catch (error: any) {
      console.error('Get sessions error:', error);
      return apiError('Failed to retrieve sessions', 500);
    }
  });
}
