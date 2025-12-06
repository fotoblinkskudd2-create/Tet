'use client';

import { useState } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import PasskeySetup from '@/components/auth/PasskeySetup';
import TOTPSetup from '@/components/auth/TOTPSetup';
import LoginForm from '@/components/auth/LoginForm';
import SessionManager from '@/components/auth/SessionManager';
import { AuthStorage } from '@/lib/auth-client';

export default function Home() {
  const [step, setStep] = useState<'register' | 'passkey' | 'totp' | 'login' | 'dashboard'>('login');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(AuthStorage.isAuthenticated());

  const handleRegistrationSuccess = (newUserId: string) => {
    setUserId(newUserId);
    setStep('passkey');
  };

  const handlePasskeySuccess = () => {
    setStep('totp');
  };

  const handleTOTPSuccess = () => {
    alert('Account setup complete! You can now login.');
    setStep('login');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setStep('dashboard');
  };

  const handleLogout = async () => {
    const { AuthClient } = await import('@/lib/auth-client');
    await AuthClient.logout();
    setIsAuthenticated(false);
    setStep('login');
  };

  if (isAuthenticated && step === 'dashboard') {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Logout
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600">
              You are now securely authenticated with passkeys and 2FA.
            </p>
          </div>

          <SessionManager />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Secure Authentication System
          </h1>
          <p className="text-gray-600">
            Production-ready auth with Passkeys, 2FA, and advanced security
          </p>
        </div>

        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => setStep('login')}
            className={`px-4 py-2 rounded-md ${
              step === 'login'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setStep('register')}
            className={`px-4 py-2 rounded-md ${
              step === 'register'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Register
          </button>
        </div>

        {step === 'register' && <RegisterForm onSuccess={handleRegistrationSuccess} />}
        {step === 'passkey' && <PasskeySetup userId={userId} email={email} onSuccess={handlePasskeySuccess} />}
        {step === 'totp' && <TOTPSetup userId={userId} onSuccess={handleTOTPSuccess} />}
        {step === 'login' && <LoginForm onSuccess={handleLoginSuccess} />}
      </div>
    </main>
  );
}
