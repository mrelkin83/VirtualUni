import apiClient from '../client';
import { LoginResponse, RegisterRequest, AuthTokens } from '../../types/api.types';
import { AUTH_CONFIG } from '../../config/api.config';

const AUTH_BASE = '/api/v1/auth';

export const authApi = {
  /**
   * Login user
   */
  async login(email: string, password: string, tenantId: string): Promise<LoginResponse> {
    // Send tenant ID as header (backend expects it there)
    const response = await apiClient.post<LoginResponse>(
      `${AUTH_BASE}/login`,
      {
        email,
        password,
      },
      {
        headers: {
          'X-Tenant-ID': tenantId,
        },
      }
    );

    // Store tokens
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem(AUTH_CONFIG.tokenKey, accessToken);
    localStorage.setItem(AUTH_CONFIG.refreshTokenKey, refreshToken);
    localStorage.setItem(AUTH_CONFIG.tenantKey, tenantId);
    localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(response.data.user));

    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(`${AUTH_BASE}/register`, data);

    // Store tokens
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem(AUTH_CONFIG.tokenKey, accessToken);
    localStorage.setItem(AUTH_CONFIG.refreshTokenKey, refreshToken);
    localStorage.setItem(AUTH_CONFIG.tenantKey, data.tenantId);
    localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(response.data.user));

    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenKey);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthTokens>(`${AUTH_BASE}/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem(AUTH_CONFIG.tokenKey, accessToken);
    localStorage.setItem(AUTH_CONFIG.refreshTokenKey, newRefreshToken);

    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${AUTH_BASE}/logout`);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
      localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
      localStorage.removeItem(AUTH_CONFIG.tenantKey);
      localStorage.removeItem(AUTH_CONFIG.userKey);
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userString = localStorage.getItem(AUTH_CONFIG.userKey);
    return userString ? JSON.parse(userString) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    return !!token;
  },
};
