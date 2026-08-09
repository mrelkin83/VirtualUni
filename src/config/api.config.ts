export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const AUTH_CONFIG = {
  tokenKey: 'virtualuni_access_token',
  refreshTokenKey: 'virtualuni_refresh_token',
  tenantKey: 'virtualuni_tenant_id',
  userKey: 'virtualuni_user',
};
