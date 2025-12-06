import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';
import { config } from './config';
import { db } from './db';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

/**
 * WebAuthn (Passkeys) Implementation
 * Primary authentication method with device attestation
 */

// Generate registration options for new passkey
export async function generatePasskeyRegistrationOptions(
  userId: string,
  email: string,
  username: string
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  // Get existing passkeys for the user
  const existingPasskeys = await db.passkey.findMany({
    where: { userId },
    select: { credentialID: true },
  });

  const options = await generateRegistrationOptions({
    rpName: config.webauthn.rpName,
    rpID: config.webauthn.rpID,
    userID: isoUint8Array.fromUTF8String(userId),
    userName: email,
    userDisplayName: username || email,
    timeout: config.webauthn.timeout,
    attestationType: config.webauthn.attestation,
    excludeCredentials: existingPasskeys.map((passkey) => ({
      id: passkey.credentialID,
      type: 'public-key',
      transports: ['usb', 'ble', 'nfc', 'internal'],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform', // Prefer platform authenticators
    },
    supportedAlgorithmIDs: [-7, -257], // ES256, RS256
  });

  return options;
}

// Verify passkey registration
export async function verifyPasskeyRegistration(
  response: RegistrationResponseJSON,
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: config.webauthn.origin,
    expectedRPID: config.webauthn.rpID,
    requireUserVerification: true,
  });

  if (!verification.verified) {
    throw new Error('Passkey registration verification failed');
  }

  return verification;
}

// Store passkey in database
export async function storePasskey(
  userId: string,
  verification: VerifiedRegistrationResponse,
  deviceName: string
): Promise<void> {
  const { registrationInfo } = verification;
  if (!registrationInfo) {
    throw new Error('Registration info not available');
  }

  const {
    credentialID,
    credentialPublicKey,
    counter,
    aaguid,
    attestationFormat,
    credentialBackedUp,
    credentialDeviceType,
  } = registrationInfo;

  await db.passkey.create({
    data: {
      userId,
      credentialID: Buffer.from(credentialID),
      credentialPublicKey: Buffer.from(credentialPublicKey),
      counter: BigInt(counter),
      deviceName,
      deviceType: credentialDeviceType,
      aaguid,
      attestationFormat,
      credentialBackedUp,
      credentialDeviceType,
      transports: [], // Will be updated from client
    },
  });
}

// Generate authentication options
export async function generatePasskeyAuthenticationOptions(
  email?: string
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  let allowCredentials: { id: Buffer; transports?: AuthenticatorTransport[] }[] = [];

  // If email provided, get user's passkeys
  if (email) {
    const user = await db.user.findUnique({
      where: { email },
      include: { passkeys: true },
    });

    if (user) {
      allowCredentials = user.passkeys
        .filter((passkey) => passkey.isActive)
        .map((passkey) => ({
          id: passkey.credentialID,
          transports: passkey.transports as AuthenticatorTransport[],
        }));
    }
  }

  const options = await generateAuthenticationOptions({
    rpID: config.webauthn.rpID,
    timeout: config.webauthn.timeout,
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    userVerification: 'preferred',
  });

  return options;
}

// Verify passkey authentication
export async function verifyPasskeyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string
): Promise<{ verified: boolean; userId: string; passkeyId: string }> {
  // Find the passkey
  const passkey = await db.passkey.findUnique({
    where: { credentialID: Buffer.from(response.id, 'base64url') },
    include: { user: true },
  });

  if (!passkey || !passkey.isActive) {
    throw new Error('Passkey not found or inactive');
  }

  // Verify the authentication response
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: config.webauthn.origin,
    expectedRPID: config.webauthn.rpID,
    authenticator: {
      credentialID: passkey.credentialID,
      credentialPublicKey: passkey.credentialPublicKey,
      counter: Number(passkey.counter),
      transports: passkey.transports as AuthenticatorTransport[],
    },
    requireUserVerification: true,
  });

  if (!verification.verified) {
    throw new Error('Passkey authentication verification failed');
  }

  // Update counter and last used timestamp
  await db.passkey.update({
    where: { id: passkey.id },
    data: {
      counter: BigInt(verification.authenticationInfo.newCounter),
      lastUsedAt: new Date(),
    },
  });

  return {
    verified: true,
    userId: passkey.userId,
    passkeyId: passkey.id,
  };
}

// Revoke/deactivate passkey
export async function revokePasskey(passkeyId: string, userId: string): Promise<void> {
  await db.passkey.updateMany({
    where: {
      id: passkeyId,
      userId,
    },
    data: {
      isActive: false,
    },
  });
}
