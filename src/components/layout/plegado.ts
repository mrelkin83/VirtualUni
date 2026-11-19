/**
 * Estado plegado de la barra lateral, persistido entre sesiones.
 *
 * Vive aparte de SidebarNav.tsx por la regla react-refresh: un archivo que
 * exporta componentes no debe exportar además constantes o funciones. Mismo
 * motivo por el que el tema tiene su `contexto.ts` y los avisos su `avisos.ts`.
 */

export const CLAVE_PLEGADA = 'virtualuni_nav_plegada';

export function leerPlegada(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLAVE_PLEGADA) === '1';
  } catch {
    // Modo privado o cookies bloqueadas: se arranca desplegada.
    return false;
  }
}

export function guardarPlegada(plegada: boolean): void {
  try {
    window.localStorage.setItem(CLAVE_PLEGADA, plegada ? '1' : '0');
  } catch {
    /* sin persistencia la sesión sigue igual */
  }
}
