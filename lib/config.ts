// Centralized security configuration with validation

export const config = {
  // JWT Configuration
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRES_MINUTES || '5'),
    refreshExpiresDays: parseInt(process.env.SESSION_MAX_AGE_DAYS || '30'),
    issuer: 'secure-auth-system',
    audience: 'secure-auth-api',
  },

  // WebAuthn Configuration
  webauthn: {
    rpName: process.env.WEBAUTHN_RP_NAME || 'Secure Auth System',
    rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
    origin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
    timeout: 60000, // 60 seconds
    attestation: 'direct' as const, // Request attestation for device binding
  },

  // Rate Limiting
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    loginMaxAttempts: 5,
    loginWindowMs: 900000, // 15 minutes
    blockDurationMs: 3600000, // 1 hour
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    totpWindow: 1, // Allow 1 step before/after current time
    totpBackupCodesCount: 10,
    challengeExpirationMinutes: 5,
    maxFailedLogins: 5,
    accountLockDurationMinutes: 60,
  },

  // Application
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },
} as const;

// Validate critical configuration on startup
export function validateConfig() {
  const errors: string[] = [];

  if (!config.jwt.accessSecret || config.jwt.accessSecret.length < 32) {
    errors.push('JWT_ACCESS_SECRET must be at least 32 characters');
  }

  if (!config.jwt.refreshSecret || config.jwt.refreshSecret.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters');
  }

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}
