import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Sincroniza la sección activa de un dashboard con la URL.
 *
 * El problema: App.tsx declara /estudiante/*, /docente/* y /admin/*, pero
 * dentro de cada dashboard la sección es un useState. La URL nunca cambia, así
 * que no se puede compartir el enlace de una pantalla, el botón «atrás» saca
 * del dashboard entero y recargar devuelve siempre a «Inicio».
 *
 * La solución deliberadamente NO es convertir cada sección en una <Route>: eso
 * obligaría a desmontar los hooks de 1.748 y 2.488 líneas, que es una
 * refactorización de arquitectura y no de presentación. Aquí `seccion` sigue
 * siendo la fuente de verdad y las secciones se pintan igual que siempre; solo
 * se mantiene la URL en paralelo. Quitar la llamada devuelve el comportamiento
 * anterior.
 *
 * POR QUÉ UN SOLO EFECTO. El primer intento usaba dos, uno por sentido, y se
 * colgaba en bucle infinito: al entrar en /estudiante/tareas con la sección en
 * 'inicio', el efecto URL->estado pedía 'tareas' mientras el efecto
 * estado->URL, leyendo todavía el 'inicio' de ese mismo render, navegaba de
 * vuelta a /estudiante/inicio. Cada uno deshacía al otro sin parar. Con un
 * efecto único y memoria de lo último sincronizado no hay dos voluntades que
 * puedan contradecirse.
 */

export interface OpcionesSeccionEnUrl<T extends string> {
  /** Prefijo de la ruta, sin barra final: '/estudiante', '/docente', '/admin'. */
  base: string;
  /** La sección que el dashboard está mostrando ahora. */
  seccion: T;
  setSeccion: (seccion: T) => void;
  /** Decide si un segmento de la URL es una sección real de este rol. */
  esValida: (valor: string) => valor is T;
}

/** Devuelve el segmento que sigue a `base`, o null si no hay ninguno. */
export function leerSeccionDeRuta(pathname: string, base: string): string | null {
  if (!pathname.startsWith(base)) return null;
  const resto = pathname.slice(base.length).replace(/^\/+/, '');
  if (!resto) return null;
  return resto.split('/')[0];
}

export function useSeccionEnUrl<T extends string>({
  base,
  seccion,
  setSeccion,
  esValida,
}: OpcionesSeccionEnUrl<T>): void {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /** Último par (ruta, sección) que quedó en acuerdo. */
  const sincronizado = useRef<{ ruta: string; seccion: T } | null>(null);

  // `setSeccion` y `esValida` suelen venir sin memorizar desde el dashboard;
  // guardarlas evita que el efecto se reejecute por identidad y no por valor.
  const fns = useRef({ setSeccion, esValida });
  fns.current = { setSeccion, esValida };

  useEffect(() => {
    const enRuta = leerSeccionDeRuta(pathname, base);
    const previo = sincronizado.current;
    const rutaCambio = previo === null || previo.ruta !== pathname;

    // 1) Si quien se movió fue la URL —entrada directa, enlace compartido,
    //    botón «atrás»— manda la URL.
    if (rutaCambio && enRuta !== null && fns.current.esValida(enRuta)) {
      if (enRuta !== seccion) {
        sincronizado.current = { ruta: pathname, seccion: enRuta };
        fns.current.setSeccion(enRuta);
        return;
      }
    }

    // 2) Si no, manda el estado: el menú cambió de sección y la barra de
    //    direcciones tiene que acompañar.
    if (enRuta !== seccion) {
      const destino = `${base}/${seccion}`;
      sincronizado.current = { ruta: destino, seccion };
      // Entrar en /estudiante sin sección solo completa la ruta: se reemplaza
      // para que «atrás» salga del dashboard en vez de quedar atrapado.
      navigate(destino, { replace: enRuta === null });
      return;
    }

    // 3) Ya coinciden.
    sincronizado.current = { ruta: pathname, seccion };
  }, [pathname, seccion, base, navigate]);
}
