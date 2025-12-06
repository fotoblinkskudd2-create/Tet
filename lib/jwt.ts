import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { config } from './config';
import { generateSecureRandom } from './crypto';

/**
 * JWT Token Management with Short-Lived Access Tokens
 * - Access tokens: 5 minutes
 * - Refresh tokens: 30 days
 * - Token rotation on refresh for breach protection
 */

export interface TokenPayload extends JWTPayload {
  userId: string;
  sessionId: string;
  sessionVersion: number;
  tokenFamily: string;
  type: 'access' | 'refresh';
  deviceId?: string;
}

// Create access token (5 minutes)
export async function createAccessToken(payload: {
  userId: string;
  sessionId: string;
  sessionVersion: number;
  tokenFamily: string;
  deviceId?: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(config.jwt.accessSecret);

  const token = await new SignJWT({
    userId: payload.userId,
    sessionId: payload.sessionId,
    sessionVersion: payload.sessionVersion,
    tokenFamily: payload.tokenFamily,
    type: 'access',
    deviceId: payload.deviceId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(config.jwt.issuer)
    .setAudience(config.jwt.audience)
    .setExpirationTime(`${config.jwt.accessExpiresMinutes}m`)
    .sign(secret);

  return token;
}

// Create refresh token (30 days)
export async function createRefreshToken(payload: {
  userId: string;
  sessionId: string;
  sessionVersion: number;
  tokenFamily: string;
  deviceId?: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(config.jwt.refreshSecret);

  const token = await new SignJWT({
    userId: payload.userId,
    sessionId: payload.sessionId,
    sessionVersion: payload.sessionVersion,
    tokenFamily: payload.tokenFamily,
    type: 'refresh',
    deviceId: payload.deviceId,
    jti: generateSecureRandom(16), // Unique token ID
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(config.jwt.issuer)
    .setAudience(config.jwt.audience)
    .setExpirationTime(`${config.jwt.refreshExpiresDays}d`)
    .sign(secret);

  return token;
}

// Verify access token
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const secret = new TextEncoder().encode(config.jwt.accessSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

// Verify refresh token
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    const secret = new TextEncoder().encode(config.jwt.refreshSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

// Create token pair
export async function createTokenPair(payload: {
  userId: string;
  sessionId: string;
  sessionVersion: number;
  tokenFamily: string;
  deviceId?: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(payload),
    createRefreshToken(payload),
  ]);

  return { accessToken, refreshToken };
}

// Calculate expiration dates
export function getTokenExpirationDates() {
  const now = new Date();

  return {
    accessTokenExpiresAt: new Date(now.getTime() + config.jwt.accessExpiresMinutes * 60 * 1000),
    refreshTokenExpiresAt: new Date(now.getTime() + config.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000),
  };
}
