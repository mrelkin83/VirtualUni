import { useMemo, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  type LucideIcon,
} from 'lucide-react';
import { EmptyState, Skeleton } from './Feedback';
import { cn } from './cn';
import { pulsable } from '../../utils/pulsable';

/**
 * Tabla de datos de Pensum.
 *
 * Sustituye a las 27 tablas escritas a mano. Cuatro decisiones que las
 * diferencian de lo que hay hoy:
 *
 *   1. Filas de 44 px en vez de ~56. De ahí sale la ganancia de densidad:
 *      caben tres filas más por pantalla sin apretar nada.
 *   2. Las columnas numéricas van a la derecha, en monoespaciada tabular. Las
 *      notas y los pesos dejan de bailar y se comparan de un vistazo.
 *   3. Por debajo de `sm` cada fila se convierte en tarjeta apilada. Hoy las
 *      tablas se desplazan en horizontal, que en un teléfono es inservible
 *      —y una de ellas ni siquiera eso: desborda la página.
 *   4. Carga, vacío y ordenación son estados de la propia tabla, no del
 *      consumidor.
 */

export interface ColumnaTabla<T> {
  /** Identificador estable. Se usa para la ordenación. */
  clave: string;
  cabecera: ReactNode;
  /** Qué pintar en la celda. */
  celda: (fila: T) => ReactNode;
  /** Cifras: alineadas a la derecha y en monoespaciada. */
  numerica?: boolean;
  /** Valor por el que ordenar. Si falta, la columna no es ordenable. */
  ordenarPor?: (fila: T) => string | number;
  /** Oculta la columna en la vista de tarjetas de móvil. */
  ocultarEnMovil?: boolean;
  anchoClase?: string;
}

export interface DataTableProps<T> {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  /** Clave estable por fila. Nunca el índice. */
  idFila: (fila: T) => string;
  /** Describe la tabla. Se usa como `<caption>` accesible. */
  titulo: string;
  cargando?: boolean;
  /** Mensajes del estado vacío. */
  vacio?: {
    icono?: LucideIcon;
    titulo: string;
    descripcion?: string;
    accion?: ReactNode;
  };
  onFilaClick?: (fila: T) => void;
  /** 'comoda' = 44 px, 'compacta' = 36 px. */
  densidad?: 'comoda' | 'compacta';
  className?: string;
}

type Orden = { clave: string; dir: 'asc' | 'desc' } | null;

export function DataTable<T>({
  columnas,
  filas,
  idFila,
  titulo,
  cargando = false,
  vacio,
  onFilaClick,
  densidad = 'comoda',
  className,
}: DataTableProps<T>) {
  const [orden, setOrden] = useState<Orden>(null);

  const filasOrdenadas = useMemo(() => {
    if (!orden) return filas;
    const col = columnas.find((c) => c.clave === orden.clave);
    if (!col?.ordenarPor) return filas;

    const extraer = col.ordenarPor;
    // Copia: ordenar in situ mutaría las props del consumidor.
    return [...filas].sort((a, b) => {
      const va = extraer(a);
      const vb = extraer(b);
      if (va === vb) return 0;
      const menor =
        typeof va === 'number' && typeof vb === 'number'
          ? va < vb
          : String(va).localeCompare(String(vb), 'es') < 0;
      return (menor ? -1 : 1) * (orden.dir === 'asc' ? 1 : -1);
    });
  }, [filas, orden, columnas]);

  const alternarOrden = (clave: string) => {
    setOrden((actual) => {
      if (actual?.clave !== clave) return { clave, dir: 'asc' };
      if (actual.dir === 'asc') return { clave, dir: 'desc' };
      return null; // tercera pulsación: vuelve al orden original
    });
  };

  const altoFila = densidad === 'compacta' ? 'h-9' : 'h-11';

  if (cargando) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-pn-md border border-pn-line bg-pn-surface',
          className,
        )}
        aria-busy="true"
        aria-label={`Cargando ${titulo}`}
      >
        <div className="border-b border-pn-line-strong bg-pn-surface-2 px-4 py-3">
          <Skeleton className="h-2.5 w-32" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-pn-line px-4 py-3 last:border-b-0"
          >
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (filasOrdenadas.length === 0) {
    return (
      <div
        className={cn('rounded-pn-md border border-pn-line bg-pn-surface', className)}
      >
        <EmptyState
          icono={vacio?.icono}
          titulo={vacio?.titulo ?? 'Nada que mostrar todavía'}
          descripcion={vacio?.descripcion}
          accion={vacio?.accion}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* --- Tabla: desde sm --- */}
      <div className="hidden overflow-x-auto rounded-pn-md border border-pn-line bg-pn-surface sm:block">
        <table className="w-full border-collapse text-[13.5px]">
          <caption className="sr-only">{titulo}</caption>
          <thead>
            <tr>
              {columnas.map((c) => {
                const ordenable = Boolean(c.ordenarPor);
                const activa = orden?.clave === c.clave;
                const Icono = !activa
                  ? ChevronsUpDown
                  : orden?.dir === 'asc'
                    ? ChevronUp
                    : ChevronDown;

                return (
                  <th
                    key={c.clave}
                    scope="col"
                    aria-sort={
                      activa
                        ? orden?.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : ordenable
                          ? 'none'
                          : undefined
                    }
                    className={cn(
                      'whitespace-nowrap border-b border-pn-line-strong bg-pn-surface-2',
                      'px-4 py-2.5 font-mono text-[10.5px] font-semibold uppercase',
                      'tracking-[0.07em] text-pn-muted',
                      c.numerica ? 'text-right' : 'text-left',
                      c.anchoClase,
                    )}
                  >
                    {ordenable ? (
                      <button
                        type="button"
                        onClick={() => alternarOrden(c.clave)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-[3px] uppercase',
                          'transition-colors duration-pn-fast hover:text-pn-ink',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-pn-accent focus-visible:ring-offset-1',
                          'focus-visible:ring-offset-pn-surface-2',
                          activa && 'text-pn-ink',
                          c.numerica && 'flex-row-reverse',
                        )}
                      >
                        {c.cabecera}
                        <Icono size={12} aria-hidden="true" />
                      </button>
                    ) : (
                      c.cabecera
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filasOrdenadas.map((fila) => (
              <tr
                key={idFila(fila)}
                {...pulsable(onFilaClick ? () => onFilaClick(fila) : undefined)}
                className={cn(
                  altoFila,
                  'border-b border-pn-line last:border-b-0',
                  onFilaClick && 'cursor-pointer hover:bg-pn-surface-2',
                )}
              >
                {columnas.map((c) => (
                  <td
                    key={c.clave}
                    className={cn(
                      'px-4 py-2 align-middle text-pn-ink-2',
                      c.numerica
                        ? 'whitespace-nowrap text-right font-mono tabular-nums text-pn-ink'
                        : 'text-left',
                    )}
                  >
                    {c.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Tarjetas apiladas: por debajo de sm --- */}
      <ul className="flex list-none flex-col gap-2 p-0 sm:hidden">
        {filasOrdenadas.map((fila) => (
          <li key={idFila(fila)}>
            <div
              role={onFilaClick ? 'button' : undefined}
              tabIndex={onFilaClick ? 0 : undefined}
              onClick={onFilaClick ? () => onFilaClick(fila) : undefined}
              onKeyDown={
                onFilaClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onFilaClick(fila);
                      }
                    }
                  : undefined
              }
              className={cn(
                'rounded-pn-md border border-pn-line bg-pn-surface p-3.5',
                onFilaClick &&
                  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pn-accent',
              )}
            >
              {columnas
                .filter((c) => !c.ocultarEnMovil)
                .map((c, i) => (
                  <div
                    key={c.clave}
                    className={cn(
                      'flex items-baseline justify-between gap-3',
                      i > 0 && 'mt-2 border-t border-pn-line pt-2',
                    )}
                  >
                    <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.07em] text-pn-muted">
                      {c.cabecera}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 text-right text-[13.5px] text-pn-ink-2',
                        c.numerica && 'font-mono tabular-nums text-pn-ink',
                      )}
                    >
                      {c.celda(fila)}
                    </span>
                  </div>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
