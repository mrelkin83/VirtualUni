import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSubdomainFromUrl, resolveTenantSlug, buildTenantUrl } from './tenantDetection';

const ubicacionOriginal = window.location;

function simularUrl(url: string) {
  const parsed = new URL(url);
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      ...ubicacionOriginal,
      href: parsed.href,
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
    },
  });
}

describe('tenantDetection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: ubicacionOriginal,
    });
  });

  it('no toma el primer octeto de una IP como subdominio', () => {
    simularUrl('http://169.58.249.64/login');
    expect(getSubdomainFromUrl()).toBeNull();
  });

  it('acepta ?tenant= cuando se entra por IP y lo recuerda', () => {
    simularUrl('http://169.58.249.64/login?tenant=UET');
    expect(resolveTenantSlug()).toBe('uet');

    simularUrl('http://169.58.249.64/login');
    expect(resolveTenantSlug()).toBe('uet');
  });

  it('ignora un ?tenant= con formato invalido', () => {
    simularUrl('http://169.58.249.64/login?tenant=../otro');
    // En la build de desarrollo cae al tenant de pruebas; lo que importa es
    // que el valor recibido no se propaga tal cual.
    expect(resolveTenantSlug()).not.toBe('../otro');
    expect(localStorage.getItem('virtualuni_tenant_slug')).toBeNull();
  });

  it('el subdominio del host gana al tenant recordado', () => {
    localStorage.setItem('virtualuni_tenant_slug', 'uet');
    simularUrl('https://otra.virtualuni.com/login');
    expect(resolveTenantSlug()).toBe('otra');
  });

  it('www y api no son tenants', () => {
    simularUrl('https://www.virtualuni.com/login');
    expect(getSubdomainFromUrl()).toBeNull();
  });

  it('cambia de tenant por query param cuando el host es una IP', () => {
    simularUrl('http://169.58.249.64/login');
    expect(buildTenantUrl('uet', '/login')).toBe('http://169.58.249.64/login?tenant=uet');
  });
});
