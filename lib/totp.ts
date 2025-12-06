import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';
import { config } from './config';
import { generateBackupCodes, hashBackupCodes, verifyBackupCode } from './crypto';

/**
 * TOTP 2FA Implementation
 * Mandatory on first login for enhanced security
 */

// Generate TOTP secret for user
export function generateTOTPSecret(email: string): {
  secret: string;
  uri: string;
} {
  const totp = new TOTP({
    issuer: config.webauthn.rpName,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

// Generate QR code for TOTP setup
export async function generateQRCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri);
}

// Verify TOTP token
export function verifyTOTPToken(secret: string, token: string): boolean {
  const totp = new TOTP({
    secret: Secret.fromBase32(secret),
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  // Validate with window of ±1 period (±30 seconds)
  const delta = totp.validate({
    token,
    window: config.security.totpWindow,
  });

  return delta !== null;
}

// Setup 2FA for user
export async function setupTOTP(email: string): Promise<{
  secret: string;
  qrCode: string;
  backupCodes: string[];
}> {
  const { secret, uri } = generateTOTPSecret(email);
  const qrCode = await generateQRCode(uri);
  const backupCodes = generateBackupCodes(config.security.totpBackupCodesCount);

  return {
    secret,
    qrCode,
    backupCodes,
  };
}

// Verify and enable TOTP for user
export async function verifyAndEnableTOTP(
  secret: string,
  token: string,
  backupCodes: string[]
): Promise<{ valid: boolean; hashedBackupCodes?: string[] }> {
  const isValid = verifyTOTPToken(secret, token);

  if (isValid) {
    const hashedBackupCodes = await hashBackupCodes(backupCodes);
    return { valid: true, hashedBackupCodes };
  }

  return { valid: false };
}

// Verify TOTP or backup code
export async function verifyTOTPOrBackup(
  secret: string,
  totpToken: string,
  backupCode: string | null,
  storedBackupCodes: string[]
): Promise<{ valid: boolean; usedBackupCodeIndex?: number }> {
  // Try TOTP first
  if (totpToken && verifyTOTPToken(secret, totpToken)) {
    return { valid: true };
  }

  // Try backup code
  if (backupCode) {
    const index = await verifyBackupCode(backupCode, storedBackupCodes);
    if (index !== -1) {
      return { valid: true, usedBackupCodeIndex: index };
    }
  }

  return { valid: false };
}
