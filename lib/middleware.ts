import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt';
import { db } from './db';
import { checkRateLimit } from './rate-limit';
import validator from 'validator';

/**
 * Authentication and Security Middleware
 * Implements OWASP Top 10 protections
 */

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  sessionId?: string;
}

// Extract token from request
function extractToken(request: NextRequest): string | null {
  // Check Authorization header (preferred)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fallback to cookie
  const cookieToken = request.cookies.get('accessToken')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

// Authenticate request
export async function authenticate(
  request: NextRequest
): Promise<{ userId: string; sessionId: string } | null> {
  const token = extractToken(request);

  if (!token) {
    return null;
  }

  try {
    // Verify JWT
    const payload = await verifyAccessToken(token);

    // Check if session exists and is valid
    const session = await db.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    // Check if session is revoked
    if (session.isRevoked) {
      return null;
    }

    // Check if session has expired
    if (session.accessTokenExpiresAt < new Date()) {
      return null;
    }

    // Check session version (invalidated on password change)
    if (session.sessionVersion !== session.user.sessionVersion) {
      // Revoke this session
      await db.session.update({
        where: { id: session.id },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'session_version_mismatch',
        },
      });
      return null;
    }

    // Update last activity
    await db.session.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

    return {
      userId: payload.userId,
      sessionId: payload.sessionId,
    };
  } catch (error) {
    return null;
  }
}

// Rate limiting middleware
export async function rateLimitMiddleware(
  request: NextRequest,
  type: 'api' | 'auth' = 'api'
): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  const result = await checkRateLimit(ip, type);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': result.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': type === 'auth' ? '5' : '100',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null;
}

// CSRF protection
export function validateCSRFToken(request: NextRequest): boolean {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const csrfToken = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies.get('csrf-token')?.value;

  if (!csrfToken || !csrfCookie) {
    return false;
  }

  return csrfToken === csrfCookie;
}

// Input validation and sanitization (OWASP A03:2021)
export function sanitizeInput(input: string): string {
  // Remove any potential XSS vectors
  return validator.escape(input.trim());
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

export function validateUsername(username: string): boolean {
  // Alphanumeric, dash, underscore, 3-30 characters
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}

// SQL Injection prevention (handled by Prisma ORM)
// XSS prevention (handled by React and sanitization)
// CSRF prevention (handled by token validation)

// Content Security Policy headers (set in next.config.js)

// Secure headers helper
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Extract client info from request
export function extractClientInfo(request: NextRequest): {
  ipAddress: string;
  userAgent: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
} {
  return {
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    acceptLanguage: request.headers.get('accept-language') || undefined,
    acceptEncoding: request.headers.get('accept-encoding') || undefined,
  };
}

// API Response helper with security headers
export function apiResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response);
}

// API Error response
export function apiError(message: string, status: number = 400): NextResponse {
  const response = NextResponse.json({ error: message }, { status });
  return addSecurityHeaders(response);
}

// Require authentication wrapper
export async function requireAuth(
  request: NextRequest,
  handler: (userId: string, sessionId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await authenticate(request);

  if (!auth) {
    return apiError('Unauthorized', 401);
  }

  return handler(auth.userId, auth.sessionId);
}
