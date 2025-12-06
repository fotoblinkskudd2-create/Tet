'use client';

import { useState } from 'react';
import { AuthClient, AuthStorage } from '@/lib/auth-client';

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handlePasskeyLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await AuthClient.loginWithPasskey(email || undefined);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Check if 2FA is required
      if (result.requireTotp || result.requireTotpVerification) {
        setUserId(result.userId);
        setShow2FA(true);
        return;
      }

      // Login successful
      if (result.accessToken) {
        AuthStorage.setTokens(result.accessToken, result.refreshToken);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please ensure your device supports passkeys.');
    } finally {
      setLoading(false);
    }
  };

  const handleTOTPVerify = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await AuthClient.verifyTOTP(
        userId,
        useBackupCode ? '' : totpCode,
        useBackupCode ? totpCode : undefined
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.accessToken) {
        AuthStorage.setTokens(result.accessToken, result.refreshToken);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (show2FA) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Two-Factor Authentication</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="totp" className="block text-sm font-medium text-gray-700">
              {useBackupCode ? 'Backup Code' : '6-digit code from your authenticator app'}
            </label>
            <input
              id="totp"
              type="text"
              value={totpCode}
              onChange={(e) =>
                setTotpCode(
                  useBackupCode
                    ? e.target.value
                    : e.target.value.replace(/\D/g, '').slice(0, 6)
                )
              }
              placeholder={useBackupCode ? 'XXXX-XXXX-XXXX' : '000000'}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
            />
          </div>

          <button
            onClick={() => setUseBackupCode(!useBackupCode)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {useBackupCode ? 'Use authenticator app code' : 'Use backup code instead'}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleTOTPVerify}
            disabled={loading || !totpCode}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            onClick={() => setShow2FA(false)}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Sign In</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Email is optional with passkeys but helps pre-filter your credentials
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          onClick={handlePasskeyLogin}
          disabled={loading}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Signing in...' : '🔐 Sign in with Passkey'}
        </button>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Passkey Login</h3>
          <p className="text-xs text-blue-800">
            Use your device's biometrics (fingerprint, face recognition) or PIN to securely sign
            in.
          </p>
        </div>
      </div>
    </div>
  );
}
