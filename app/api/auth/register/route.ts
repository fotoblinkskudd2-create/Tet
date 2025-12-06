import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, rateLimitMiddleware, validateEmail, extractClientInfo } from '@/lib/middleware';
import { hashPassword } from '@/lib/crypto';
import { generateSecureRandom } from '@/lib/crypto';

/**
 * POST /api/auth/register
 * Initial user registration
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { email, password, username } = body;

    // Validation
    if (!email || !validateEmail(email)) {
      return apiError('Invalid email address', 400);
    }

    if (!password || password.length < 12) {
      return apiError('Password must be at least 12 characters', 400);
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return apiError(
        'Password must contain uppercase, lowercase, numbers, and special characters',
        400
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError('User already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
    });

    // Log registration
    const clientInfo = extractClientInfo(request);
    await db.auditLog.create({
      data: {
        userId: user.id,
        eventType: 'user_registered',
        eventAction: 'success',
        eventDescription: 'User account created',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      },
    });

    return apiResponse(
      {
        success: true,
        userId: user.id,
        message: 'Account created successfully. Please set up passkey and 2FA.',
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return apiError('Registration failed', 500);
  }
}
