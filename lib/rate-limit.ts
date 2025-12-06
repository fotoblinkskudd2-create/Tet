import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from './config';
import { db } from './db';

/**
 * Rate Limiting Implementation
 * Protects against brute force and DoS attacks (OWASP A07:2021)
 */

// In-memory rate limiter for API endpoints
const apiLimiter = new RateLimiterMemory({
  points: config.rateLimit.maxRequests,
  duration: config.rateLimit.windowMs / 1000,
  blockDuration: 0, // Don't auto-block, handle manually
});

// Strict rate limiter for authentication endpoints
const authLimiter = new RateLimiterMemory({
  points: config.rateLimit.loginMaxAttempts,
  duration: config.rateLimit.loginWindowMs / 1000,
  blockDuration: config.rateLimit.blockDurationMs / 1000,
});

export async function checkRateLimit(
  key: string,
  type: 'api' | 'auth' = 'api'
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const limiter = type === 'auth' ? authLimiter : apiLimiter;
    await limiter.consume(key);
    return { allowed: true };
  } catch (error: any) {
    if (error.msBeforeNext) {
      return {
        allowed: false,
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      };
    }
    throw error;
  }
}

// Track failed login attempts per user
export async function recordFailedLogin(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const failedAttempts = user.failedLoginAttempts + 1;
  const shouldLock = failedAttempts >= config.security.maxFailedLogins;

  await db.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: failedAttempts,
      lastFailedLogin: new Date(),
      accountLocked: shouldLock,
      lockedUntil: shouldLock
        ? new Date(Date.now() + config.security.accountLockDurationMinutes * 60 * 1000)
        : undefined,
    },
  });
}

// Reset failed login attempts on successful login
export async function resetFailedLogins(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      accountLocked: false,
      lockedUntil: null,
    },
  });
}

// Check if account is locked
export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  if (user.accountLocked) {
    // Check if lock has expired
    if (user.lockedUntil && user.lockedUntil < new Date()) {
      await db.user.update({
        where: { id: userId },
        data: {
          accountLocked: false,
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
      return false;
    }
    return true;
  }

  return false;
}
