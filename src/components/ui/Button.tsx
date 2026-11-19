import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from './cn';

/**
 * Botón de Pensum.
 *
 * Sustituye a los 674 `<button>` con clases sueltas que hay hoy por el código.
 * Tres cosas que no se pueden olvidar en cada uso y aquí van de serie:
 *
 *   - `type="button"` por defecto. El defecto del navegador es "submit", y esa
 *     es la causa clásica de formularios que se envían al pulsar cualquier cosa.
 *   - foco visible. Hoy hay 0 usos de focus-visible en todo el proyecto.
 *   - durante la carga el botón se deshabilita y anuncia el estado, en vez de
 *     dejar que el usuario pulse dos veces.
 */

export type VarianteBoton = 'primary' | 'secondary' | 'ghost' | 'danger';
export type TamanoBoton = 'sm' | 'md';

const BASE =
  'inline-flex items-center justify-center gap-2 font-body font-semibold ' +
  'rounded-pn-sm border transition-colors duration-pn-fast ease-pn-ease ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pn-accent ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-pn-surface ' +
  'disabled:opacity-55 disabled:pointer-events-none';

const VARIANTES: Record<VarianteBoton, string> = {
  primary:
    'bg-pn-accent text-pn-accent-ink border-transparent hover:bg-pn-accent-hover',
  secondary:
    'bg-pn-surface text-pn-ink border-pn-line-strong hover:bg-pn-surface-3',
  ghost:
    'bg-transparent text-pn-ink-2 border-transparent hover:bg-pn-surface-3 hover:text-pn-ink',
  danger: 'bg-transparent text-pn-danger border-pn-danger hover:bg-pn-danger-soft',
};

/** 44 px de alto en `md` para cumplir el objetivo táctil mínimo en móvil. */
const TAMANOS: Record<TamanoBoton, string> = {
  sm: 'text-[13px] px-3 py-1.5 min-h-[32px]',
  md: 'text-sm px-4 py-2.5 min-h-[44px]',
};

export interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  /** Deshabilita y muestra un indicador. El texto se mantiene para no saltar. */
  cargando?: boolean;
  icono?: LucideIcon;
  /** Coloca el icono a la derecha. Útil en «Siguiente →». */
  iconoAlFinal?: boolean;
  /** Ocupa todo el ancho disponible. */
  ancho?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, BotonProps>(function Button(
  {
    variante = 'primary',
    tamano = 'md',
    cargando = false,
    icono: Icono,
    iconoAlFinal = false,
    ancho = false,
    disabled,
    className,
    children,
    type,
    ...resto
  },
  ref,
) {
  const tamanoIcono = tamano === 'sm' ? 14 : 16;

  const marca = cargando ? (
    <Loader2 size={tamanoIcono} className="animate-spin" aria-hidden="true" />
  ) : Icono ? (
    <Icono size={tamanoIcono} aria-hidden="true" />
  ) : null;

  return (
    <button
      ref={ref}
      // Explícito a propósito: el defecto del navegador es "submit".
      type={type ?? 'button'}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={cn(
        BASE,
        VARIANTES[variante],
        TAMANOS[tamano],
        ancho && 'w-full',
        className,
      )}
      {...resto}
    >
      {!iconoAlFinal && marca}
      {children}
      {iconoAlFinal && marca}
    </button>
  );
});

export interface IconButtonProps
  extends Omit<BotonProps, 'icono' | 'iconoAlFinal' | 'children' | 'ancho'> {
  icono: LucideIcon;
  /** Obligatorio: sin texto visible, es lo único que anuncia el lector. */
  etiqueta: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icono: Icono,
      etiqueta,
      variante = 'ghost',
      tamano = 'md',
      className,
      ...resto
    },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        variante={variante}
        tamano={tamano}
        aria-label={etiqueta}
        title={etiqueta}
        className={cn(
          'px-0 aspect-square',
          tamano === 'sm' ? 'w-8 min-h-[32px]' : 'w-11 min-h-[44px]',
          className,
        )}
        {...resto}
      >
        <Icono size={tamano === 'sm' ? 16 : 18} aria-hidden="true" />
      </Button>
    );
  },
);
