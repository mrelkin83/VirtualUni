import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn';

/**
 * Campos de formulario de Pensum.
 *
 * El problema que resuelven: hoy hay 471 `<label>` y solo 30 `htmlFor`. Es
 * decir, la gran mayoría de las etiquetas no están asociadas a su campo, así
 * que pulsar la etiqueta no enfoca el campo y un lector de pantalla anuncia
 * «cuadro de edición» sin decir de qué. Y `aria-describedby` no aparece ni una
 * vez, de modo que los mensajes de error son invisibles para quien no los ve.
 *
 * `Field` reparte un id por contexto y conecta sola etiqueta, control, ayuda y
 * error. Ningún consumidor tiene que acordarse.
 */

interface ContextoCampo {
  idControl: string;
  idAyuda?: string;
  idError?: string;
  hayError: boolean;
  requerido: boolean;
}

const CampoCtx = createContext<ContextoCampo | null>(null);

/** Los controles la usan para engancharse; fuera de un Field devuelve null. */
function useCampo(): ContextoCampo | null {
  return useContext(CampoCtx);
}

const CLASES_CONTROL =
  'w-full font-body text-sm text-pn-ink bg-pn-surface ' +
  'border border-pn-line-strong rounded-pn-sm px-3 py-2.5 min-h-[44px] ' +
  'placeholder:text-pn-muted ' +
  'transition-colors duration-pn-fast ease-pn-ease ' +
  'focus-visible:outline-none focus-visible:border-pn-accent ' +
  'focus-visible:ring-2 focus-visible:ring-pn-accent focus-visible:ring-offset-0 ' +
  'disabled:opacity-55 disabled:cursor-not-allowed read-only:bg-pn-surface-2';

const CLASES_CONTROL_ERROR =
  'border-pn-danger focus-visible:border-pn-danger focus-visible:ring-pn-danger';

export interface FieldProps {
  etiqueta: ReactNode;
  /** Texto de apoyo permanente. Se enlaza con aria-describedby. */
  ayuda?: ReactNode;
  /** Mensaje de error. Si viene, sustituye a la ayuda y marca el control. */
  error?: ReactNode;
  requerido?: boolean;
  /** Oculta la etiqueta visualmente pero la mantiene para lectores. */
  etiquetaOculta?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({
  etiqueta,
  ayuda,
  error,
  requerido = false,
  etiquetaOculta = false,
  className,
  children,
}: FieldProps) {
  const base = useId();
  const hayError = Boolean(error);

  const ctx: ContextoCampo = {
    idControl: `${base}-control`,
    idAyuda: ayuda && !hayError ? `${base}-ayuda` : undefined,
    idError: hayError ? `${base}-error` : undefined,
    hayError,
    requerido,
  };

  return (
    <CampoCtx.Provider value={ctx}>
      <div className={cn('mb-4', className)}>
        <label
          htmlFor={ctx.idControl}
          className={cn(
            'block font-body text-[12.5px] font-semibold text-pn-ink mb-1.5',
            etiquetaOculta && 'sr-only',
          )}
        >
          {etiqueta}
          {requerido && (
            <span className="text-pn-danger ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {children}

        {hayError ? (
          <p
            id={ctx.idError}
            // El error aparece después de escribir, así que hay que anunciarlo.
            role="alert"
            className="mt-1.5 font-body text-xs text-pn-danger"
          >
            {error}
          </p>
        ) : ayuda ? (
          <p id={ctx.idAyuda} className="mt-1.5 font-body text-xs text-pn-muted">
            {ayuda}
          </p>
        ) : null}
      </div>
    </CampoCtx.Provider>
  );
}

/** Reúne los ids de descripción que correspondan. */
function describedBy(ctx: ContextoCampo | null, propio?: string) {
  return (
    [ctx?.idError, ctx?.idAyuda, propio].filter(Boolean).join(' ') || undefined
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Cifras, dinero, documentos: monoespaciada y tabular para que alineen. */
  tabular?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, tabular = false, id, 'aria-describedby': descrito, ...resto },
  ref,
) {
  const ctx = useCampo();
  return (
    <input
      ref={ref}
      id={id ?? ctx?.idControl}
      required={resto.required ?? ctx?.requerido}
      aria-invalid={ctx?.hayError || undefined}
      aria-describedby={describedBy(ctx, descrito)}
      className={cn(
        CLASES_CONTROL,
        ctx?.hayError && CLASES_CONTROL_ERROR,
        tabular && 'font-mono tabular-nums',
        className,
      )}
      {...resto}
    />
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, id, children, 'aria-describedby': descrito, ...resto },
  ref,
) {
  const ctx = useCampo();
  return (
    <select
      ref={ref}
      id={id ?? ctx?.idControl}
      required={resto.required ?? ctx?.requerido}
      aria-invalid={ctx?.hayError || undefined}
      aria-describedby={describedBy(ctx, descrito)}
      className={cn(
        CLASES_CONTROL,
        ctx?.hayError && CLASES_CONTROL_ERROR,
        className,
      )}
      {...resto}
    >
      {children}
    </select>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, id, rows = 4, 'aria-describedby': descrito, ...resto },
    ref,
  ) {
    const ctx = useCampo();
    return (
      <textarea
        ref={ref}
        id={id ?? ctx?.idControl}
        rows={rows}
        required={resto.required ?? ctx?.requerido}
        aria-invalid={ctx?.hayError || undefined}
        aria-describedby={describedBy(ctx, descrito)}
        className={cn(
          CLASES_CONTROL,
          'resize-y',
          ctx?.hayError && CLASES_CONTROL_ERROR,
          className,
        )}
        {...resto}
      />
    );
  },
);

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  etiqueta: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ etiqueta, className, id, ...resto }, ref) {
    const propio = useId();
    const idFinal = id ?? propio;
    return (
      <div className={cn('flex items-start gap-2.5', className)}>
        <input
          ref={ref}
          id={idFinal}
          type="checkbox"
          className={
            'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[3px] ' +
            'border border-pn-line-strong accent-pn-accent ' +
            'focus-visible:outline-none focus-visible:ring-2 ' +
            'focus-visible:ring-pn-accent focus-visible:ring-offset-2 ' +
            'focus-visible:ring-offset-pn-surface ' +
            'disabled:opacity-55 disabled:cursor-not-allowed'
          }
          {...resto}
        />
        <label
          htmlFor={idFinal}
          className="font-body text-sm text-pn-ink-2 cursor-pointer select-none"
        >
          {etiqueta}
        </label>
      </div>
    );
  },
);

export interface ToggleProps {
  activo: boolean;
  onCambio: (activo: boolean) => void;
  /** Obligatoria: es lo único que anuncia el lector de pantalla. */
  etiqueta: string;
  /** Muestra la etiqueta al lado del interruptor. */
  mostrarEtiqueta?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  activo,
  onCambio,
  etiqueta,
  mostrarEtiqueta = false,
  disabled = false,
  className,
}: ToggleProps) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={mostrarEtiqueta ? undefined : etiqueta}
      disabled={disabled}
      onClick={() => onCambio(!activo)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border',
        'transition-colors duration-pn-fast ease-pn-ease',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pn-accent',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-pn-surface',
        'disabled:opacity-55 disabled:pointer-events-none',
        activo
          ? 'bg-pn-accent border-transparent'
          : 'bg-pn-surface-3 border-pn-line-strong',
        !mostrarEtiqueta && className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-pn-surface shadow-sm',
          'transition-transform duration-pn-fast ease-pn-spring',
          activo ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );

  if (!mostrarEtiqueta) return control;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {control}
      <span className="font-body text-sm text-pn-ink-2">{etiqueta}</span>
    </div>
  );
}
