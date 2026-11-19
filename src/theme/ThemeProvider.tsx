import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ContextoTema,
  guardarTema,
  leerTemaGuardado,
  resolverTema,
  type Tema,
  type TemaResuelto,
  type ValorTema,
} from './contexto';
import { aplicarAcento } from './aplicarAcento';
import { useTenantStore } from '../store/tenantStore';

/**
 * Tema de Pensum.
 *
 * Qué hace:
 *   - guarda la preferencia en localStorage y la respeta entre sesiones;
 *   - resuelve 'system' contra prefers-color-scheme y reacciona si el sistema
 *     operativo cambia mientras la pestaña está abierta;
 *   - escribe [data-theme] en <html>, que es lo que leen los tokens;
 *   - reinyecta el acento del tenant cuando cambia el tema, porque el contraste
 *     se mide contra una superficie distinta en claro y en oscuro.
 *
 * No añade la clase `dark` de Tailwind y no le hace falta: el tema entero vive
 * en los tokens, que se redefinen bajo [data-theme='dark']. Ya no queda ni una
 * variante `dark:*` en el código; en tailwind.config.js el selector apunta a
 * ese mismo atributo, por si alguna vez hiciera falta escribir una suelta.
 *
 * El destello al cargar lo evita el script en línea de index.html, que fija
 * [data-theme] antes del primer pintado. Si cambia la lógica aquí, cambia allí.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(leerTemaGuardado);
  const [resuelto, setResuelto] = useState<TemaResuelto>(() =>
    resolverTema(leerTemaGuardado()),
  );

  const colorTenant = useTenantStore((s) => s.tenant?.primaryColor ?? null);
  const colorSecundario = useTenantStore((s) => s.tenant?.secondaryColor ?? null);

  // Mantiene `resuelto` al día y escribe el atributo que leen los tokens.
  useEffect(() => {
    const aplicar = () => {
      const r = resolverTema(tema);
      setResuelto(r);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', r);
      }
    };

    aplicar();

    if (tema !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // Solo con 'system' interesa escuchar al sistema operativo.
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, [tema]);

  // El acento se recalcula con el tema: el contraste se mide contra la
  // superficie clara u oscura, y no dan el mismo resultado.
  useEffect(() => {
    aplicarAcento(colorTenant, resuelto, document.documentElement, colorSecundario);
  }, [colorTenant, colorSecundario, resuelto]);

  const establecerTema = useCallback((siguiente: Tema) => {
    setTema(siguiente);
    guardarTema(siguiente);
  }, []);

  const alternarTema = useCallback(() => {
    setTema((actual) => {
      const siguiente: Tema = resolverTema(actual) === 'dark' ? 'light' : 'dark';
      guardarTema(siguiente);
      return siguiente;
    });
  }, []);

  const valor = useMemo<ValorTema>(
    () => ({ tema, resuelto, establecerTema, alternarTema }),
    [tema, resuelto, establecerTema, alternarTema],
  );

  return <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>;
}
