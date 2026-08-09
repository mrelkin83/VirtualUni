import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '../types/api.types';
import { authApi } from '../api/endpoints/auth';
import { AUTH_CONFIG } from '../config/api.config';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setTenantId: (tenantId: string) => void;
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      tenantId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setTokens: (tokens) =>
        set({
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      setTenantId: (tenantId) => set({ tenantId }),

      login: async (email, password, tenantId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password, tenantId);

          set({
            user: response.user,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            tenantId: response.user.tenantId,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Error al iniciar sesión';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            tenantId: null,
            isAuthenticated: false,
            error: null,
          });

          // Clear localStorage
          localStorage.removeItem(AUTH_CONFIG.tokenKey);
          localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
          localStorage.removeItem(AUTH_CONFIG.tenantKey);
          localStorage.removeItem(AUTH_CONFIG.userKey);
        }
      },

      clearError: () => set({ error: null }),

      initializeAuth: () => {
        const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
        const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenKey);
        const tenantId = localStorage.getItem(AUTH_CONFIG.tenantKey);
        const userString = localStorage.getItem(AUTH_CONFIG.userKey);

        if (token && userString) {
          const user = JSON.parse(userString);
          set({
            user,
            token,
            refreshToken,
            tenantId,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
