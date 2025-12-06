/**
 * Client-side authentication utilities
 */

import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || '';

// Token storage
export const AuthStorage = {
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

// API client with automatic token refresh
export class AuthClient {
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const accessToken = AuthStorage.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    // If token expired, try to refresh
    if (response.status === 401 && AuthStorage.getRefreshToken()) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${AuthStorage.getAccessToken()}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  static async refreshToken(): Promise<boolean> {
    const refreshToken = AuthStorage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        AuthStorage.clearTokens();
        return false;
      }

      const data = await response.json();
      AuthStorage.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch (error) {
      AuthStorage.clearTokens();
      return false;
    }
  }

  static async register(email: string, password: string, username?: string) {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });

    return response.json();
  }

  static async registerPasskey(userId: string, email: string, deviceName: string) {
    // Get registration options
    const optionsResponse = await fetch(`${API_BASE}/api/auth/passkey/register-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    });

    const { options } = await optionsResponse.json();

    // Start WebAuthn registration
    const registrationResponse = await startRegistration(
      options as PublicKeyCredentialCreationOptionsJSON
    );

    // Verify registration
    const verifyResponse = await fetch(`${API_BASE}/api/auth/passkey/register-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        response: registrationResponse,
        deviceName,
      }),
    });

    return verifyResponse.json();
  }

  static async loginWithPasskey(email?: string) {
    // Get authentication options
    const optionsResponse = await fetch(`${API_BASE}/api/auth/passkey/login-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const { options } = await optionsResponse.json();

    // Start WebAuthn authentication
    const authResponse = await startAuthentication(
      options as PublicKeyCredentialRequestOptionsJSON
    );

    // Verify authentication
    const verifyResponse = await fetch(`${API_BASE}/api/auth/passkey/login-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: authResponse }),
    });

    return verifyResponse.json();
  }

  static async setupTOTP(userId: string) {
    const response = await fetch(`${API_BASE}/api/auth/totp/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    return response.json();
  }

  static async verifyTOTPSetup(userId: string, token: string, backupCodes: string[]) {
    const response = await fetch(`${API_BASE}/api/auth/totp/verify-setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token, backupCodes }),
    });

    return response.json();
  }

  static async verifyTOTP(userId: string, token: string, backupCode?: string) {
    const response = await fetch(`${API_BASE}/api/auth/totp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token, backupCode }),
    });

    return response.json();
  }

  static async logout() {
    const response = await this.fetchWithAuth(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
    });

    AuthStorage.clearTokens();
    return response.json();
  }

  static async logoutAll() {
    const response = await this.fetchWithAuth(`${API_BASE}/api/auth/logout-all`, {
      method: 'POST',
    });

    AuthStorage.clearTokens();
    return response.json();
  }

  static async getSessions() {
    const response = await this.fetchWithAuth(`${API_BASE}/api/auth/sessions`);
    return response.json();
  }
}
