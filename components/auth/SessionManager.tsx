'use client';

import { useState, useEffect } from 'react';
import { AuthClient } from '@/lib/auth-client';

interface Session {
  id: string;
  ipAddress: string;
  browser: string;
  os: string;
  deviceName: string;
  lastActivityAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const result = await AuthClient.getSessions();

      if (result.error) {
        setError(result.error);
        return;
      }

      setSessions(result.sessions);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout from all devices? You will be signed out.')) {
      return;
    }

    try {
      await AuthClient.logoutAll();
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Failed to logout from all devices');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Active Sessions</h2>
        <button
          onClick={handleLogoutAll}
          className="py-2 px-4 border border-red-300 rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout All Devices
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-4 rounded-lg border ${
              session.isCurrent
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{session.deviceName}</h3>
                  {session.isCurrent && (
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                      Current Session
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {session.browser} on {session.os}
                </p>
                <p className="text-sm text-gray-500 mt-1">IP: {session.ipAddress}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Last active: {formatDate(session.lastActivityAt)}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {formatDate(session.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No active sessions found</p>
        </div>
      )}
    </div>
  );
}
