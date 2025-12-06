import { NextRequest } from 'next/server';
import { apiResponse, apiError, rateLimitMiddleware, extractClientInfo } from '@/lib/middleware';
import { rotateTokens } from '@/lib/session';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Implements token rotation for breach protection
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return apiError('Refresh token is required', 400);
    }

    const clientInfo = extractClientInfo(request);

    // Rotate tokens
    const tokens = await rotateTokens(refreshToken, clientInfo.ipAddress);

    if (!tokens) {
      return apiError('Invalid or revoked refresh token', 401);
    }

    return apiResponse({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return apiError('Failed to refresh token', 500);
  }
}
