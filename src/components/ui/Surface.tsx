import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from './cn';

/**
 * Superficies y piezas de dato de Pensum.
 *
 * Criterio común: en el plano de la página se separa con un borde de 1 px, no
 * con sombra. La sombra queda reservada para lo que flota (modales,
 * desplegables). Eso quita de golpe el aspecto de «tarjetas flotando» que tiene
 * hoy la aplicación, con cuatro escalas de sombra repartidas sin jerarquía.
 */

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Posición en una rejilla, para escalonar la entrada. */
  indice?: number;
  /**
   * Clase de fondo. Es una PROP y no algo que se pase por `className` a
   * propósito: si la tarjeta impusiera `bg-pn-surface` y el consumidor añadiera
   * otro `bg-*`, ganaría el que Tailwind emite más tarde en la hoja, no el que
   * va después en el atributo. `cn()` no resuelve conflictos de Tailwind, así
   * que la única forma segura es que nunca haya dos clases de fondo.
   */
  fondo?: string;
}

export function Card({
  children,
  className,
  indice,
  fondo = 'bg-pn-surface',
}: CardProps) {
  const estilo =
    indice !== undefined ? ({ '--pn-i': indice } as CSSProperties) : undefined;

  return (
    <div
      style={estilo}
      className={cn(
        'rounded-pn-md border border-pn-line p-4',
        fondo,
        indice !== undefined && 'pn-rv',
        className,
      )}
    >
      {children}
    </div>
  );
}

export type TonoBadge = 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'accent';

const TONOS_BADGE: Record<TonoBadge, string> = {
  neutral: 'bg-pn-surface-3 text-pn-ink-2 border-pn-line-strong',
  ok: 'bg-pn-ok-soft text-pn-ok border-pn-ok',
  warn: 'bg-pn-warn-soft text-pn-warn border-pn-warn',
  danger: 'bg-pn-danger-soft text-pn-danger border-pn-danger',
  info: 'bg-pn-info-soft text-pn-info border-pn-info',
  accent: 'bg-pn-accent-soft text-pn-accent-text border-pn-accent-line',
};

export interface BadgeProps {
  children: ReactNode;
  tono?: TonoBadge;
  className?: string;
}

export function Badge({ children, tono = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border',
        'px-2 py-0.5 font-mono text-[11px] font-medium tracking-[0.03em]',
        TONOS_BADGE[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface StatusPillProps {
  tono?: TonoBadge;
  children: ReactNode;
  className?: string;
}

/**
 * Como Badge, pero con un punto delante. El punto es lo que permite distinguir
 * estados sin depender solo del color: quien no distingue rojo de verde ve la
 * forma y lee el texto.
 */
export function StatusPill({
  tono = 'neutral',
  children,
  className,
}: StatusPillProps) {
  return (
    <Badge tono={tono} className={className}>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
      />
      {children}
    </Badge>
  );
}

export interface CountUpProps {
  valor: number;
  /** Formateador. Por defecto, entero con separadores en castellano. */
  formato?: (n: number) => string;
  duracion?: number;
  className?: string;
}

/**
 * Anima una cifra hasta su valor. Con prefers-reduced-motion activo pinta el
 * valor final de una vez, sin animar.
 */
export function CountUp({
  valor,
  formato = (n) => Math.round(n).toLocaleString('es-CO'),
  duracion = 900,
  className,
}: CountUpProps) {
  const [mostrado, setMostrado] = useState(valor);
  const anterior = useRef(valor);

  useEffect(() => {
    const reducido =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducido || duracion <= 0) {
      anterior.current = valor;
      setMostrado(valor);
      return;
    }

    const desde = anterior.current;
    const inicio = performance.now();
    let frame = 0;

    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      // Salida exponencial: rápido al principio, se asienta al final.
      const e = 1 - Math.pow(1 - t, 3);
      setMostrado(desde + (valor - desde) * e);
      if (t < 1) frame = requestAnimationFrame(paso);
      else anterior.current = valor;
    };

    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [valor, duracion]);

  return <span className={cn('tabular-nums', className)}>{formato(mostrado)}</span>;
}

export interface StatCardProps {
  etiqueta: string;
  valor: ReactNode;
  icono?: LucideIcon;
  /** Variación respecto al periodo anterior, en porcentaje. */
  delta?: number;
  /** Texto junto al delta: «frente al periodo anterior». */
  nota?: string;
  /** Serie para la minigráfica. Dos puntos como mínimo. */
  serie?: number[];
  cargando?: boolean;
  indice?: number;
  /**
   * Rellena la tarjeta con el acento secundario. UNA por franja de métricas:
   * si se destacan todas, no se destaca ninguna.
   */
  destacada?: boolean;
  className?: string;
}

/**
 * Tarjeta de métrica. Sustituye a teacher/ui/StatsCard y a sus copias en línea.
 *
 * Cambio de criterio frente a la actual: el icono deja de ser un círculo
 * saturado que ocupa un cuarto de la tarjeta y pasa a ser una marca de 12 px
 * junto a la etiqueta. El espacio liberado lo ocupa la minigráfica, que sí
 * responde a «¿y va subiendo?».
 */
export function StatCard({
  etiqueta,
  valor,
  icono: Icono,
  delta,
  nota,
  serie,
  cargando = false,
  indice,
  destacada = false,
  className,
}: StatCardProps) {
  if (cargando) {
    return (
      <Card indice={indice} className={className}>
        <div className="h-3 w-24 animate-pulse rounded bg-pn-surface-3" />
        <div className="mt-3 h-7 w-20 animate-pulse rounded bg-pn-surface-3" />
        <div className="mt-3 h-3 w-32 animate-pulse rounded bg-pn-surface-3" />
      </Card>
    );
  }

  const sube = delta !== undefined && delta >= 0;

  return (
    <Card
      indice={indice}
      fondo={destacada ? 'bg-pn-accent-2' : undefined}
      className={cn(destacada && 'border-transparent text-pn-accent-2-ink', className)}
    >
      <p
        className={cn(
          'm-0 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.07em]',
          destacada ? 'opacity-80' : 'text-pn-muted',
        )}
      >
        {Icono && <Icono size={12} aria-hidden="true" />}
        {etiqueta}
      </p>

      <p
        className={cn(
          'm-0 mt-2 font-display text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums',
          !destacada && 'text-pn-ink',
        )}
      >
        {valor}
      </p>

      {serie && serie.length > 1 && <Sparkline serie={serie} />}

      {(delta !== undefined || nota) && (
        <p
          className={cn(
            'm-0 mt-2.5 flex items-center gap-2 font-body text-[12.5px]',
            destacada ? 'opacity-85' : 'text-pn-muted',
          )}
        >
          {delta !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-mono text-xs font-semibold',
                destacada
                  ? 'text-current'
                  : sube
                    ? 'text-pn-ok'
                    : 'text-pn-danger',
              )}
            >
              {sube ? (
                <TrendingUp size={12} aria-hidden="true" />
              ) : (
                <TrendingDown size={12} aria-hidden="true" />
              )}
              {sube ? '+' : ''}
              {delta.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %
            </span>
          )}
          {nota}
        </p>
      )}
    </Card>
  );
}

function Sparkline({ serie }: { serie: number[] }) {
  const min = Math.min(...serie);
  const max = Math.max(...serie);
  const rango = max - min || 1;
  const ancho = 120;
  const alto = 30;

  const puntos = serie.map((v, i) => {
    const x = (i / (serie.length - 1)) * ancho;
    const y = alto - ((v - min) / rango) * (alto - 4) - 2;
    return [x, y] as const;
  });

  const linea = puntos
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' L');
  const [ultX, ultY] = puntos[puntos.length - 1];

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      preserveAspectRatio="none"
      className="mt-3 block h-[30px] w-full"
      aria-hidden="true"
    >
      <path
        d={`M${linea} L${ancho},${alto} L0,${alto} Z`}
        fill="var(--pn-accent-soft)"
      />
      <path
        d={`M${linea}`}
        fill="none"
        stroke="var(--pn-accent)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={ultX} cy={ultY} r={2.5} fill="var(--pn-accent)" />
    </svg>
  );
}

export interface RingProps {
  /** De 0 a 1. */
  valor: number;
  tamano?: number;
  grosor?: number;
  /** Obligatoria: el anillo es una imagen y necesita texto alternativo. */
  etiqueta: string;
  children?: ReactNode;
  className?: string;
}

/** Arco de progreso. Para el avance de pensum y los créditos aprobados. */
export function Ring({
  valor,
  tamano = 96,
  grosor = 9,
  etiqueta,
  children,
  className,
}: RingProps) {
  const acotado = Math.max(0, Math.min(1, valor));
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;

  return (
    <div
      className={cn('relative grid place-items-center', className)}
      style={{ width: tamano, height: tamano }}
      role="img"
      aria-label={etiqueta}
    >
      <svg width={tamano} height={tamano} className="-rotate-90" aria-hidden="true">
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke="var(--pn-surface-3)"
          strokeWidth={grosor}
        />
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke="var(--pn-accent)"
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - acotado)}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}

export interface OpcionSegmentada {
  valor: string;
  etiqueta: ReactNode;
}

export interface SegmentedProps {
  opciones: OpcionSegmentada[];
  valor: string;
  onCambio: (valor: string) => void;
  /** Describe el grupo para lectores de pantalla. */
  etiqueta: string;
  className?: string;
}

/**
 * Control segmentado con pulgar deslizante. Para filtros de pocas opciones
 * —periodo, estado, densidad— donde un desplegable sería un clic de más.
 *
 * El pulgar se mide con ResizeObserver en vez de calcularse con porcentajes,
 * porque las etiquetas en castellano tienen anchos muy distintos.
 */
export function Segmented({
  opciones,
  valor,
  onCambio,
  etiqueta,
  className,
}: SegmentedProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const pulgar = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const caja = contenedor.current;
    if (!caja) return;

    const colocar = () => {
      const marca = pulgar.current;
      if (!marca) return;

      const activo = caja.querySelector<HTMLElement>(`[data-valor="${valor}"]`);
      if (!activo) {
        marca.style.opacity = '0';
        return;
      }

      marca.style.opacity = '1';
      marca.style.width = `${activo.offsetWidth}px`;
      marca.style.transform = `translateX(${activo.offsetLeft}px)`;
    };

    colocar();

    const ro = new ResizeObserver(colocar);
    ro.observe(caja);
    return () => ro.disconnect();
  }, [valor, opciones]);

  return (
    <div
      ref={contenedor}
      role="tablist"
      aria-label={etiqueta}
      className={cn(
        'relative inline-flex rounded-pn-sm border border-pn-line bg-pn-surface-2 p-1',
        className,
      )}
    >
      <span
        ref={pulgar}
        aria-hidden="true"
        className={
          'pointer-events-none absolute bottom-1 left-0 top-1 rounded-[4px] ' +
          'bg-pn-surface opacity-0 shadow-sm transition-[transform,width] ' +
          'duration-pn-mid ease-pn-ease'
        }
      />
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="tab"
            aria-selected={activo}
            data-valor={o.valor}
            onClick={() => onCambio(o.valor)}
            className={cn(
              'relative z-10 whitespace-nowrap rounded-[4px] px-3 py-1.5',
              'font-body text-[13px] transition-colors duration-pn-fast',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-pn-accent focus-visible:ring-offset-1',
              'focus-visible:ring-offset-pn-surface-2',
              activo
                ? 'font-semibold text-pn-ink'
                : 'text-pn-muted hover:text-pn-ink',
            )}
          >
            {o.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
