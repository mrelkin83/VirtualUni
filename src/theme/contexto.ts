import { createContext, useContext } from 'react';

/**
 * Contexto, constantes y lectores del tema.
 *
 * Están aquí y no en ThemeProvider.tsx por la misma razón por la que
 * `marcaDeTema` acabó en utils/materiales: la regla react-refresh avisa cuando
 * un archivo exporta componentes y además constantes o funciones, porque rompe
 * la recarga en caliente. El proveedor exporta solo el componente.
 */

export type Tema = 'light' | 'dark' | 'system';
export type TemaResuelto = 'light' | 'dark';

export const CLAVE_TEMA = 'virtualuni_tema';

/**
 * Por defecto, lo que diga el sistema operativo.
 *
 * Estuvo fijado en 'light' mientras convivían dos sistemas de tema: con el
 * `darkMode` por props todavía vivo, una preferencia de sistema en oscuro
 * dejaba la aplicación a dos tintas. Retirado ese segundo sistema (módulo 4),
 * los tokens cubren ambos temas y ya se puede respetar al usuario.
 */
export const TEMA_POR_DEFECTO: Tema = 'system';

export interface ValorTema {
  /** Lo que el usuario eligió, incluido 'system'. */
  tema: Tema;
  /** Lo que finalmente se está mostrando. */
  resuelto: TemaResuelto;
  establecerTema: (tema: Tema) => void;
  alternarTema: () => void;
}

export const ContextoTema = createContext<ValorTema | null>(null);

const esTemaValido = (v: unknown): v is Tema =>
  v === 'light' || v === 'dark' || v === 'system';

/** Lee la preferencia guardada. En SSR o con storage bloqueado, el defecto. */
export function leerTemaGuardado(): Tema {
  if (typeof window === 'undefined') return TEMA_POR_DEFECTO;
  try {
    const guardado = window.localStorage.getItem(CLAVE_TEMA);
    return esTemaValido(guardado) ? guardado : TEMA_POR_DEFECTO;
  } catch {
    // Modo privado o cookies bloqueadas: no es un error, solo no hay memoria.
    return TEMA_POR_DEFECTO;
  }
}

/** Guarda la preferencia. Si el navegador no deja, la sesión sigue igual. */
export function guardarTema(tema: Tema): void {
  try {
    window.localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    /* sin persistencia; no es motivo para romper nada */
  }
}

function prefiereOscuro(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolverTema(tema: Tema): TemaResuelto {
  if (tema === 'system') return prefiereOscuro() ? 'dark' : 'light';
  return tema;
}

export function useTheme(): ValorTema {
  const ctx = useContext(ContextoTema);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return ctx;
}
