'use client';

import { useState, useEffect } from 'react';
import { AuthClient } from '@/lib/auth-client';

export default function TOTPSetup({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);

  useEffect(() => {
    setupTOTP();
  }, []);

  const setupTOTP = async () => {
    try {
      const result = await AuthClient.setupTOTP(userId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setQrCode(result.qrCode);
      setSecret(result.secret);
      setBackupCodes(result.backupCodes);
    } catch (err: any) {
      setError(err.message || 'Failed to setup 2FA');
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await AuthClient.verifyTOTPSetup(userId, verificationCode, backupCodes);

      if (result.error) {
        setError(result.error);
        return;
      }

      setShowBackupCodes(true);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBackupCodes = () => {
    setBackupCodesSaved(true);
    onSuccess();
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showBackupCodes) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Save Backup Codes</h2>
        <p className="text-gray-600 mb-4">
          Save these backup codes in a secure location. You can use them to access your account if
          you lose your 2FA device.
        </p>

        <div className="bg-gray-50 p-4 rounded-md mb-4 font-mono text-sm">
          {backupCodes.map((code, i) => (
            <div key={i} className="py-1">
              {code}
            </div>
          ))}
        </div>

        <button
          onClick={downloadBackupCodes}
          className="w-full mb-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download Backup Codes
        </button>

        <button
          onClick={handleConfirmBackupCodes}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          I've Saved My Backup Codes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Set Up Two-Factor Authentication</h2>
      <p className="text-gray-600 mb-6">
        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
      </p>

      {qrCode && (
        <div className="mb-6 flex justify-center">
          <img src={qrCode} alt="2FA QR Code" className="border rounded-lg" />
        </div>
      )}

      {secret && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
          <div className="bg-gray-50 p-3 rounded-md font-mono text-sm break-all">{secret}</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Enter 6-digit code from your app
          </label>
          <input
            id="code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || verificationCode.length !== 6}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
        </button>
      </div>
    </div>
  );
}
