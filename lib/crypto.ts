import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import bcrypt from 'bcrypt';
import { config } from './config';

/**
 * Secure cryptographic utilities for authentication system
 * Implements best practices for hashing, encryption, and random generation
 */

// Hash password using bcrypt with configurable rounds
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.security.bcryptRounds);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate cryptographically secure random string
export function generateSecureRandom(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

// Generate random hex string
export function generateRandomHex(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// Hash data using SHA-256
export function sha256Hash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

// Hash data using SHA-512
export function sha512Hash(data: string): string {
  return createHash('sha512').update(data).digest('hex');
}

// Generate TOTP backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = randomBytes(6).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`);
  }
  return codes;
}

// Hash backup codes for storage
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(code => bcrypt.hash(code, 10)));
}

// Verify backup code against hashed codes
export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<number> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);
    if (isValid) return i;
  }
  return -1;
}

// Simple encryption for sensitive data (use environment-specific key in production)
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || sha256Hash('default-encryption-key-change-in-production')
).slice(0, 32);

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted data format');

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Generate device fingerprint from request data
export function generateDeviceFingerprint(data: {
  userAgent: string;
  ip: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
}): string {
  const fingerprintData = [
    data.userAgent,
    data.ip,
    data.acceptLanguage || '',
    data.acceptEncoding || '',
  ].join('||');

  return sha256Hash(fingerprintData);
}

// Generate nonce for replay protection
export function generateNonce(): string {
  return `${Date.now()}_${generateSecureRandom(16)}`;
}

// Validate nonce (basic time-based validation)
export function validateNonce(nonce: string, maxAgeMs: number = 300000): boolean {
  try {
    const timestamp = parseInt(nonce.split('_')[0]);
    const age = Date.now() - timestamp;
    return age >= 0 && age <= maxAgeMs;
  } catch {
    return false;
  }
}

// Constant-time string comparison to prevent timing attacks
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
