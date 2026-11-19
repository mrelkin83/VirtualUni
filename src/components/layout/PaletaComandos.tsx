import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';
import { cn } from '../ui/cn';
import type { GrupoNav } from './navegacion';

/**
 * Paleta de comandos (Ctrl+K / ⌘K).
 *
 * Con 20 entradas en el menú del administrador, llegar a una sección exigía
 * recorrer cinco grupos con la vista. Aquí se escribe y se pulsa Enter.
 *
 * Es navegación, no búsqueda de datos: lista las mismas secciones del menú, así
 * que no hay una segunda fuente de verdad que mantener. La búsqueda global del
 * administrador es otra cosa —busca personas y cursos— y por eso conviven.
 *
 * El foco no se mueve de la caja de texto: la selección se anuncia con
 * `aria-activedescendant`, que es lo que permite seguir escribiendo mientras se
 * recorre la lista con las flechas.
 */

/** Sin tildes y en minúsculas: «examenes» tiene que encontrar «Exámenes». */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Puntúa una entrada contra lo escrito; `null` si no coincide. Menor es mejor:
 * 0 empieza por ahí, 1 alguna de sus palabras empieza por ahí, 2 lo contiene.
 * Todas las palabras de la consulta tienen que aparecer.
 */
export function puntuar(etiqueta: string, consulta: string): number | null {
  const e = normalizar(etiqueta);
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return 2;
  if (!palabras.every((p) => e.includes(p))) return null;

  const primera = palabras[0];
  if (e.startsWith(primera)) return 0;
  if (e.split(/\s+/).some((p) => p.startsWith(primera))) return 1;
  return 2;
}

export interface PaletaComandosProps<T extends string> {
  grupos: GrupoNav<T>[];
  abierta: boolean;
  onCerrar: () => void;
  onIr: (seccion: T) => void;
}

export function PaletaComandos<T extends string>({
  grupos,
  abierta,
  onCerrar,
  onIr,
}: PaletaComandosProps<T>) {
  const [consulta, setConsulta] = useState('');
  const [indice, setIndice] = useState(0);
  const dialogRef = useModalA11y(abierta, onCerrar);
  const listaRef = useRef<HTMLUListElement>(null);

  const resultados = useMemo(() => {
    const planas = grupos.flatMap((g) =>
      g.entradas.map((e) => ({ ...e, grupo: g.titulo })),
    );
    return planas
      .map((entrada) => ({ entrada, punto: puntuar(entrada.etiqueta, consulta) }))
      .filter((r) => r.punto !== null)
      .sort((a, b) => (a.punto as number) - (b.punto as number))
      .map((r) => r.entrada);
  }, [grupos, consulta]);

  // Al abrir, y en cada cambio de consulta, la selección vuelve arriba:
  // dejarla donde estaba apuntaría a otra entrada tras filtrar.
  useEffect(() => {
    setIndice(0);
  }, [consulta, abierta]);

  useEffect(() => {
    if (!abierta) setConsulta('');
  }, [abierta]);

  // Mantiene visible la selección cuando se recorre con las flechas. jsdom no
  // implementa scrollIntoView, así que en las pruebas simplemente no hay nada
  // que desplazar.
  useEffect(() => {
    const seleccionada = listaRef.current?.children[indice] as
      | HTMLElement
      | undefined;
    if (typeof seleccionada?.scrollIntoView === 'function') {
      seleccionada.scrollIntoView({ block: 'nearest' });
    }
  }, [indice]);

  if (!abierta) return null;

  const idOpcion = (i: number) => `paleta-opcion-${i}`;

  const alTeclear = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndice((i) => (resultados.length ? (i + 1) % resultados.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndice((i) =>
        resultados.length ? (i - 1 + resultados.length) % resultados.length : 0,
      );
    } else if (e.key === 'Home') {
      e.preventDefault();
      setIndice(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setIndice(Math.max(0, resultados.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const elegida = resultados[indice];
      if (elegida) {
        onIr(elegida.id);
        onCerrar();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
      onClick={onCerrar}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ir a una sección"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-lg overflow-hidden rounded-pn-lg border border-pn-line',
          'bg-pn-surface shadow-pn-pop',
        )}
      >
        <div className="flex items-center gap-2 border-b border-pn-line px-3">
          <Search size={18} className="shrink-0 text-pn-muted" aria-hidden="true" />
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={alTeclear}
            placeholder="Ir a una sección…"
            aria-label="Ir a una sección"
            role="combobox"
            aria-expanded
            aria-controls="paleta-resultados"
            aria-activedescendant={resultados.length ? idOpcion(indice) : undefined}
            autoComplete="off"
            className={cn(
              'min-h-[44px] w-full bg-transparent py-2 font-body text-sm text-pn-ink',
              'placeholder:text-pn-muted focus:outline-none',
            )}
          />
        </div>

        {resultados.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-pn-muted">
            Ninguna sección coincide con «{consulta}».
          </p>
        ) : (
          <ul
            ref={listaRef}
            id="paleta-resultados"
            role="listbox"
            aria-label="Secciones"
            className="pn-scroll max-h-[min(60vh,22rem)] overflow-y-auto py-1"
          >
            {resultados.map((entrada, i) => {
              const Icono = entrada.icono;
              const activa = i === indice;
              return (
                <li key={entrada.id} role="presentation">
                  <button
                    type="button"
                    id={idOpcion(i)}
                    role="option"
                    aria-selected={activa}
                    onMouseMove={() => setIndice(i)}
                    onClick={() => {
                      onIr(entrada.id);
                      onCerrar();
                    }}
                    className={cn(
                      'flex min-h-[44px] w-full items-center gap-3 px-3 text-left',
                      'font-body text-sm transition-colors duration-pn-fast',
                      activa
                        ? 'bg-pn-accent-soft text-pn-accent-text'
                        : 'text-pn-ink hover:bg-pn-surface-3',
                    )}
                  >
                    <Icono size={16} className="shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {entrada.etiqueta}
                    </span>
                    <span className="shrink-0 text-xs text-pn-muted">
                      {entrada.grupo}
                    </span>
                    {activa && (
                      <CornerDownLeft
                        size={14}
                        className="shrink-0 text-pn-muted"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
