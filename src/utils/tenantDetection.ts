/**
 * Resolucion del tenant a partir de la URL.
 *
 * Casos soportados:
 * - http://uniprueba.localhost:3000     -> 'uniprueba'
 * - http://universidad.virtualuni.com   -> 'universidad'
 * - http://localhost:3000               -> tenant por defecto (desarrollo)
 * - http://169.58.249.64/login?tenant=uet -> 'uet' (se recuerda en el navegador)
 */

/** Clave donde se recuerda el tenant elegido con ?tenant= */
const CLAVE_TENANT_MANUAL = 'virtualuni_tenant_slug';

/** Tenant por defecto cuando el host no puede llevar subdominio. */
const TENANT_POR_DEFECTO = import.meta.env.VITE_DEFAULT_TENANT?.trim() || '';

/**
 * Hosts que no pueden llevar subdominio: una IP desnuda (IPv4 o IPv6) o un
 * nombre de una sola etiqueta. Sin esta comprobacion, entrar por IP
 * (169.58.249.64) tomaba '169' como subdominio y la pantalla de login moria
 * con "El subdominio no es valido".
 */
function esHostSinSubdominio(hostname: string): boolean {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true; // IPv4
  if (hostname.includes(':') || hostname.startsWith('[')) return true; // IPv6
  return !hostname.includes('.');
}

function leerTenantRecordado(): string | null {
  try {
    return localStorage.getItem(CLAVE_TENANT_MANUAL);
  } catch {
    return null; // modo privado / storage bloqueado
  }
}

function recordarTenant(slug: string): void {
  try {
    localStorage.setItem(CLAVE_TENANT_MANUAL, slug);
  } catch {
    // sin storage disponible el ?tenant= sigue valiendo para esta carga
  }
}

/**
 * Extract subdomain from current URL. Devuelve null cuando el host no lleva
 * subdominio (IP, dominio raiz) en lugar de inventarse uno.
 */
export function getSubdomainFromUrl(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // For localhost development
  if (hostname.includes('localhost')) {
    // Check if subdomain exists before localhost (e.g., uniprueba.localhost)
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }

  if (esHostSinSubdominio(hostname)) {
    return null;
  }

  // For production domains (e.g., universidad.virtualuni.com)
  if (parts.length >= 3) {
    // www y api no son tenants: el backend ya los excluye
    // (tenant.middleware.ts) pero aqui se aceptaban, asi que
    // www.<dominio> intentaba cargar un tenant llamado "www" y moria con
    // "No se pudo cargar la informacion del tenant".
    if (parts[0] === 'www' || parts[0] === 'api') {
      return null;
    }
    return parts[0];
  }

  // No subdomain found
  return null;
}

/**
 * Tenant efectivo para esta carga de la pagina, por orden de prioridad:
 *  1. ?tenant=<slug> en la URL (se recuerda para las siguientes visitas)
 *  2. el subdominio del host
 *  3. el ultimo ?tenant= usado en este navegador
 *  4. VITE_DEFAULT_TENANT de la build
 *  5. 'uniprueba' solo en desarrollo, para no exigir tocar el fichero hosts
 */
export function resolveTenantSlug(): string | null {
  const parametro = new URLSearchParams(window.location.search).get('tenant');
  if (parametro && isValidSubdomain(parametro)) {
    const slug = getTenantSlug(parametro);
    recordarTenant(slug);
    return slug;
  }

  const subdominio = getSubdomainFromUrl();
  if (subdominio) {
    return getTenantSlug(subdominio);
  }

  const recordado = leerTenantRecordado();
  if (recordado && isValidSubdomain(recordado)) {
    return getTenantSlug(recordado);
  }

  if (TENANT_POR_DEFECTO && isValidSubdomain(TENANT_POR_DEFECTO)) {
    return getTenantSlug(TENANT_POR_DEFECTO);
  }

  if (import.meta.env.DEV) {
    console.warn('🔧 DEV MODE: usando el tenant "uniprueba". En produccion usa subdominio o ?tenant=.');
    return 'uniprueba';
  }

  return null;
}

/**
 * Validate subdomain format
 * Only allow alphanumeric characters and hyphens
 * Must start with a letter
 */
export function isValidSubdomain(subdomain: string): boolean {
  const subdomainRegex = /^[a-z][a-z0-9-]{1,62}$/i;
  return subdomainRegex.test(subdomain.trim());
}

/**
 * Get tenant slug from subdomain
 * Normalizes the subdomain to lowercase
 */
export function getTenantSlug(subdomain: string): string {
  return subdomain.toLowerCase().trim();
}

/**
 * Build URL for a specific tenant subdomain
 */
export function buildTenantUrl(subdomain: string, path = '/'): string {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  const hostname = window.location.hostname;

  // For localhost development
  if (hostname.includes('localhost')) {
    return `${protocol}//${subdomain}.localhost${port}${path}`;
  }

  // Un host sin subdominio (IP o dominio de una etiqueta) no admite prefijo:
  // se cambia de tenant por query param.
  if (esHostSinSubdominio(hostname)) {
    const separador = path.includes('?') ? '&' : '?';
    return `${protocol}//${hostname}${port}${path}${separador}tenant=${encodeURIComponent(subdomain)}`;
  }

  // For production (assuming virtualuni.com as base domain)
  const baseDomain = hostname.split('.').slice(-2).join('.');
  return `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
}
