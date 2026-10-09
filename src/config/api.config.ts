/**
 * Origen del backend. Las rutas de src/api/endpoints/ ya llevan el prefijo
 * /api/v1, asi que esto es el ORIGEN, no una ruta base.
 *
 * Sin valor configurado se usa el mismo origen de la pagina (cadena vacia):
 * en produccion el nginx que sirve la SPA hace proxy de /api/ hacia el
 * backend, asi que el mismo origen siempre funciona. El antiguo fallback a
 * http://localhost:4000 era correcto en desarrollo pero dejaba una build de
 * produccion mal configurada apuntando al equipo del visitante.
 */
const origenConfigurado = import.meta.env.VITE_API_URL?.trim();

export const API_CONFIG = {
  baseURL: origenConfigurado || (import.meta.env.DEV ? 'http://localhost:4000' : ''),
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
