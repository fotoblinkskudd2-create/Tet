'use client';

import { useState } from 'react';
import { AuthClient } from '@/lib/auth-client';

export default function PasskeySetup({
  userId,
  email,
  onSuccess,
}: {
  userId: string;
  email: string;
  onSuccess: () => void;
}) {
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await AuthClient.registerPasskey(userId, email, deviceName);

      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Passkey registration failed. Please ensure your device supports passkeys.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Set Up Passkey</h2>
      <p className="text-gray-600 mb-6">
        Passkeys provide secure, passwordless authentication using your device's biometrics or PIN.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700">
            Device Name
          </label>
          <input
            id="deviceName"
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g., MacBook Pro, iPhone 15"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting up passkey...' : 'Register Passkey'}
        </button>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">What to expect:</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Your device will prompt you to verify your identity</li>
          <li>• Use your fingerprint, face ID, or device PIN</li>
          <li>• This passkey will be your primary login method</li>
        </ul>
      </div>
    </div>
  );
}
