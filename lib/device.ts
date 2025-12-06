import { db } from './db';
import { generateDeviceFingerprint } from './crypto';
import UAParser from 'ua-parser-js';

/**
 * Device Binding and Management
 * Cryptographic attestation for enhanced security
 */

export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
}

// Register or retrieve device
export async function registerDevice(
  userId: string,
  deviceInfo: DeviceInfo,
  publicKey?: string,
  attestationData?: Buffer
): Promise<string> {
  const fingerprint = generateDeviceFingerprint({
    userAgent: deviceInfo.userAgent,
    ip: deviceInfo.ipAddress,
    acceptLanguage: deviceInfo.acceptLanguage,
    acceptEncoding: deviceInfo.acceptEncoding,
  });

  // Check if device already exists
  const existingDevice = await db.device.findUnique({
    where: { deviceFingerprint: fingerprint },
  });

  if (existingDevice) {
    // Update last seen info
    await db.device.update({
      where: { id: existingDevice.id },
      data: {
        lastSeenIp: deviceInfo.ipAddress,
        lastSeenAt: new Date(),
      },
    });
    return existingDevice.id;
  }

  // Parse user agent
  const parser = new UAParser(deviceInfo.userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  // Determine device type
  const deviceType = device.type || (device.vendor ? 'mobile' : 'desktop');

  // Generate device name
  const deviceName = `${browser.name || 'Unknown'} on ${os.name || 'Unknown'}`;

  // Create new device
  const newDevice = await db.device.create({
    data: {
      userId,
      deviceFingerprint: fingerprint,
      deviceName,
      deviceType,
      os: os.name,
      browser: browser.name,
      devicePublicKey: publicKey,
      attestationData,
      firstSeenIp: deviceInfo.ipAddress,
      lastSeenIp: deviceInfo.ipAddress,
      trustLevel: attestationData ? 'verified' : 'unverified',
    },
  });

  // Log device registration
  await db.auditLog.create({
    data: {
      userId,
      eventType: 'device_registered',
      eventAction: 'success',
      eventDescription: `New device registered: ${deviceName}`,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      deviceId: newDevice.id,
    },
  });

  return newDevice.id;
}

// Verify device belongs to user
export async function verifyDevice(deviceId: string, userId: string): Promise<boolean> {
  const device = await db.device.findFirst({
    where: {
      id: deviceId,
      userId,
      isActive: true,
    },
  });

  return !!device;
}

// Get user's devices
export async function getUserDevices(userId: string) {
  const devices = await db.device.findMany({
    where: { userId, isActive: true },
    orderBy: { lastSeenAt: 'desc' },
  });

  return devices.map((device) => ({
    id: device.id,
    name: device.deviceName,
    type: device.deviceType,
    os: device.os,
    browser: device.browser,
    trustLevel: device.trustLevel,
    isTrusted: device.isTrusted,
    lastSeenAt: device.lastSeenAt,
    lastSeenIp: device.lastSeenIp,
    createdAt: device.createdAt,
  }));
}

// Revoke device (remove trust)
export async function revokeDevice(deviceId: string, userId: string): Promise<void> {
  // Verify device belongs to user
  const device = await db.device.findFirst({
    where: { id: deviceId, userId },
  });

  if (!device) {
    throw new Error('Device not found');
  }

  // Deactivate device
  await db.device.update({
    where: { id: deviceId },
    data: {
      isActive: false,
      isTrusted: false,
    },
  });

  // Revoke all sessions from this device
  await db.session.updateMany({
    where: { deviceId },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: 'device_revoked',
    },
  });

  // Log device revocation
  await db.auditLog.create({
    data: {
      userId,
      eventType: 'device_revoked',
      eventAction: 'success',
      eventDescription: `Device revoked: ${device.deviceName}`,
      ipAddress: device.lastSeenIp,
      deviceId,
    },
  });
}

// Mark device as trusted
export async function trustDevice(deviceId: string, userId: string): Promise<void> {
  await db.device.updateMany({
    where: {
      id: deviceId,
      userId,
    },
    data: {
      isTrusted: true,
      trustLevel: 'trusted',
    },
  });
}

// Detect suspicious device activity
export async function detectSuspiciousDevice(
  userId: string,
  deviceInfo: DeviceInfo
): Promise<{ suspicious: boolean; reason?: string }> {
  const fingerprint = generateDeviceFingerprint({
    userAgent: deviceInfo.userAgent,
    ip: deviceInfo.ipAddress,
    acceptLanguage: deviceInfo.acceptLanguage,
    acceptEncoding: deviceInfo.acceptEncoding,
  });

  // Check if this is a known device
  const device = await db.device.findUnique({
    where: { deviceFingerprint: fingerprint },
  });

  if (!device) {
    // New device - not inherently suspicious but should trigger 2FA
    return { suspicious: false };
  }

  // Check for IP address changes
  const recentSessions = await db.session.findMany({
    where: {
      userId,
      deviceId: device.id,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    take: 10,
  });

  const uniqueIPs = new Set(recentSessions.map((s) => s.ipAddress));

  // If more than 3 different IPs in 24 hours, flag as suspicious
  if (uniqueIPs.size > 3) {
    return {
      suspicious: true,
      reason: 'multiple_ip_addresses',
    };
  }

  // Check for geographically distant IPs (simplified - in production use GeoIP)
  // This would require a GeoIP service

  return { suspicious: false };
}
