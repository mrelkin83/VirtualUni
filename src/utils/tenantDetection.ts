/**
 * Extract subdomain from current URL
 * Examples:
 * - http://uniprueba.localhost:3000 -> 'uniprueba'
 * - http://universidad.virtualuni.com -> 'universidad'
 * - http://localhost:3000 -> 'uniprueba' (DEV MODE - default tenant)
 */
export function getSubdomainFromUrl(): string | null {
  const hostname = window.location.hostname;

  // Split hostname by dots
  const parts = hostname.split('.');

  // For localhost development
  if (hostname.includes('localhost')) {
    // Check if subdomain exists before localhost
    // e.g., uniprueba.localhost
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }

    // DEV MODE: If accessing from plain localhost or localhost:port, use default tenant
    // This allows testing without configuring hosts file
    const isLocalhost = hostname === 'localhost' || hostname.startsWith('localhost:');
    if (isLocalhost) {
      console.warn('🔧 DEV MODE: Using default tenant "uniprueba". For production, use subdomain.');
      return 'uniprueba'; // Default tenant for development
    }

    return null;
  }

  // For production domains (e.g., universidad.virtualuni.com)
  // Subdomain is the first part if there are 3+ parts
  if (parts.length >= 3) {
    return parts[0];
  }

  // No subdomain found
  return null;
}

/**
 * Validate subdomain format
 * Only allow alphanumeric characters and hyphens
 * Must start with a letter
 */
export function isValidSubdomain(subdomain: string): boolean {
  const subdomainRegex = /^[a-z][a-z0-9-]{1,62}$/i;
  return subdomainRegex.test(subdomain);
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

  // For localhost development
  if (window.location.hostname.includes('localhost')) {
    return `${protocol}//${subdomain}.localhost${port}${path}`;
  }

  // For production (assuming virtualuni.com as base domain)
  const baseDomain = window.location.hostname.split('.').slice(-2).join('.');
  return `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
}
