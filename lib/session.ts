import { db } from './db';
import { createTokenPair, getTokenExpirationDates } from './jwt';
import { sha256Hash, generateSecureRandom } from './crypto';
import UAParser from 'ua-parser-js';

/**
 * Session Management with Token Rotation
 * Implements breach replay attack protection
 */

export interface CreateSessionParams {
  userId: string;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
}

// Create new session with token pair
export async function createSession(params: CreateSessionParams): Promise<{
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}> {
  const user = await db.user.findUnique({ where: { id: params.userId } });
  if (!user) throw new Error('User not found');

  // Generate token family for rotation tracking
  const tokenFamily = generateSecureRandom(32);
  const sessionId = generateSecureRandom(32);

  const { accessTokenExpiresAt, refreshTokenExpiresAt } = getTokenExpirationDates();

  // Create token pair
  const { accessToken, refreshToken } = await createTokenPair({
    userId: params.userId,
    sessionId,
    sessionVersion: user.sessionVersion,
    tokenFamily,
    deviceId: params.deviceId,
  });

  // Hash refresh token for storage
  const refreshTokenHash = sha256Hash(refreshToken);

  // Create session in database
  await db.session.create({
    data: {
      id: sessionId,
      userId: params.userId,
      accessToken,
      refreshToken,
      refreshTokenHash,
      tokenFamily,
      sessionVersion: user.sessionVersion,
      deviceId: params.deviceId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    },
  });

  // Update user's last login
  await db.user.update({
    where: { id: params.userId },
    data: { lastLoginAt: new Date() },
  });

  return { accessToken, refreshToken, sessionId };
}

// Rotate tokens (on refresh)
export async function rotateTokens(
  oldRefreshToken: string,
  ipAddress: string
): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const oldRefreshTokenHash = sha256Hash(oldRefreshToken);

  // Find session by refresh token hash
  const session = await db.session.findUnique({
    where: { refreshToken: oldRefreshToken },
    include: { user: true },
  });

  if (!session) {
    // Token not found - possible replay attack
    await logSecurityEvent('token_rotation_failed', null, ipAddress, {
      reason: 'token_not_found',
    });
    return null;
  }

  // Check if session is revoked
  if (session.isRevoked) {
    await logSecurityEvent('token_rotation_blocked', session.userId, ipAddress, {
      reason: 'session_revoked',
    });
    return null;
  }

  // Check if refresh token has expired
  if (session.refreshTokenExpiresAt < new Date()) {
    await revokeSession(session.id, 'expired');
    return null;
  }

  // Check for session version mismatch (password changed)
  if (session.sessionVersion !== session.user.sessionVersion) {
    await revokeSession(session.id, 'password_changed');
    return null;
  }

  // BREACH REPLAY PROTECTION: Check for token reuse
  // If this refresh token was already used and new tokens were issued,
  // it's a replay attack - revoke entire token family
  if (session.rotationCount > 0) {
    const tokenHash = sha256Hash(oldRefreshToken);
    if (tokenHash !== session.refreshTokenHash) {
      // Token reuse detected - revoke all sessions in this family
      await revokeTokenFamily(session.tokenFamily, 'replay_attack_detected');
      await logSecurityEvent('replay_attack_detected', session.userId, ipAddress, {
        tokenFamily: session.tokenFamily,
      });
      return null;
    }
  }

  const { accessTokenExpiresAt, refreshTokenExpiresAt } = getTokenExpirationDates();

  // Create new token pair
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await createTokenPair({
    userId: session.userId,
    sessionId: session.id,
    sessionVersion: session.user.sessionVersion,
    tokenFamily: session.tokenFamily,
    deviceId: session.deviceId,
  });

  const newRefreshTokenHash = sha256Hash(newRefreshToken);

  // Update session with new tokens
  await db.session.update({
    where: { id: session.id },
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenHash: newRefreshTokenHash,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      rotationCount: session.rotationCount + 1,
      lastActivityAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

// Revoke single session
export async function revokeSession(sessionId: string, reason: string): Promise<void> {
  await db.session.update({
    where: { id: sessionId },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

// Revoke all sessions in a token family (breach protection)
export async function revokeTokenFamily(tokenFamily: string, reason: string): Promise<void> {
  await db.session.updateMany({
    where: { tokenFamily },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

// Revoke all sessions for a user
export async function revokeAllUserSessions(userId: string, reason: string): Promise<void> {
  await db.session.updateMany({
    where: { userId },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });

  // Increment session version to invalidate all existing tokens
  await db.user.update({
    where: { id: userId },
    data: {
      sessionVersion: { increment: 1 },
    },
  });
}

// Revoke all sessions except current
export async function revokeOtherSessions(userId: string, currentSessionId: string): Promise<void> {
  await db.session.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
      isRevoked: false,
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: 'user_logout_all_others',
    },
  });
}

// Get user's active sessions
export async function getUserSessions(userId: string) {
  const sessions = await db.session.findMany({
    where: {
      userId,
      isRevoked: false,
      refreshTokenExpiresAt: { gt: new Date() },
    },
    include: {
      device: true,
    },
    orderBy: { lastActivityAt: 'desc' },
  });

  return sessions.map((session) => {
    const parser = new UAParser(session.userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();

    return {
      id: session.id,
      ipAddress: session.ipAddress,
      browser: browser.name || 'Unknown',
      os: os.name || 'Unknown',
      deviceName: session.device?.deviceName || 'Unknown Device',
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      isCurrent: false, // Will be set by caller
    };
  });
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await db.session.deleteMany({
    where: {
      OR: [
        { refreshTokenExpiresAt: { lt: new Date() } },
        { isRevoked: true, revokedAt: { lt: thirtyDaysAgo } },
      ],
    },
  });
}

// Audit logging helper
async function logSecurityEvent(
  eventType: string,
  userId: string | null,
  ipAddress: string,
  metadata?: any
): Promise<void> {
  await db.auditLog.create({
    data: {
      userId,
      eventType,
      eventAction: 'warning',
      eventDescription: `Security event: ${eventType}`,
      ipAddress,
      metadata,
    },
  });
}
