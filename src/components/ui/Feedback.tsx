import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  AvisosCtx,
  registrarConfirmador,
  registrarEmisor,
  type ApiAvisos,
  type OpcionesConfirmar,
  type TonoAviso,
} from './avisos';
import { Button, IconButton } from './Button';
import { Modal } from './Modal';
import { cn } from './cn';

/* ===========================================================================
   Esqueletos
   ---------------------------------------------------------------------------
   Hoy no hay ni uno en todo el proyecto: 27 archivos manejan estado de carga y
   solo 11 muestran algo, siempre un disco girando. El resultado es el salto de
   diseño clásico, de pantalla vacía a contenido completo de golpe.
   ======================================================================== */

export interface SkeletonProps {
  className?: string;
  redondeado?: 'sm' | 'md' | 'full';
}

export function Skeleton({ className, redondeado = 'sm' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block animate-pulse bg-pn-surface-3',
        redondeado === 'full' && 'rounded-full',
        redondeado === 'md' && 'rounded-pn-md',
        redondeado === 'sm' && 'rounded-pn-sm',
        className,
      )}
    />
  );
}

export interface SkeletonTextoProps {
  lineas?: number;
  className?: string;
}

export function SkeletonTexto({ lineas = 3, className }: SkeletonTextoProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lineas }, (_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lineas - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

/* ===========================================================================
   Estado vacío
   ======================================================================== */

export interface EmptyStateProps {
  icono?: LucideIcon;
  titulo: string;
  /** Una frase. Si hace falta más, es que falta diseñar la pantalla. */
  descripcion?: string;
  /** UNA sola acción: el estado vacío enseña el siguiente paso, no diez. */
  accion?: ReactNode;
  className?: string;
}

export function EmptyState({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      {Icono && (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-pn-surface-3 text-pn-muted">
          <Icono size={22} aria-hidden="true" />
        </span>
      )}
      <h3 className="font-display text-base font-bold text-pn-ink">{titulo}</h3>
      {descripcion && (
        <p className="m-0 max-w-sm font-body text-sm leading-relaxed text-pn-muted">
          {descripcion}
        </p>
      )}
      {accion && <div className="mt-1">{accion}</div>}
    </div>
  );
}

/* ===========================================================================
   Avisos (toasts)
   ---------------------------------------------------------------------------
   Sustituyen a los 145 alert() y 31 confirm() que hay hoy. Además de no
   bloquear el hilo, la región es aria-live: un lector de pantalla se entera de
   que algo se guardó o falló, cosa que con alert() tampoco ocurría bien.
   ======================================================================== */

interface Aviso {
  id: number;
  tono: TonoAviso;
  mensaje: ReactNode;
}

const ICONOS_AVISO: Record<TonoAviso, LucideIcon> = {
  ok: CheckCircle2,
  error: XCircle,
  info: Info,
  warn: AlertTriangle,
};

const TONOS_AVISO: Record<TonoAviso, string> = {
  ok: 'border-l-pn-ok text-pn-ok',
  error: 'border-l-pn-danger text-pn-danger',
  info: 'border-l-pn-info text-pn-info',
  warn: 'border-l-pn-warn text-pn-warn',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguienteId = useRef(1);

  const quitar = useCallback((id: number) => {
    setAvisos((lista) => lista.filter((a) => a.id !== id));
  }, []);

  const avisar = useCallback(
    (mensaje: ReactNode, tono: TonoAviso = 'info', ms = 5000) => {
      const id = siguienteId.current++;
      setAvisos((lista) => [...lista, { id, tono, mensaje }]);
      // Los errores no se van solos: quien los provoca suele necesitar leerlos.
      if (tono !== 'error' && ms > 0) {
        window.setTimeout(() => quitar(id), ms);
      }
    },
    [quitar],
  );

  /* --- Confirmación --- */
  const [confirmacion, setConfirmacion] = useState<{
    opciones: OpcionesConfirmar;
    resolver: (v: boolean) => void;
  } | null>(null);

  const pedirConfirmacion = useCallback(
    (opciones: OpcionesConfirmar) =>
      new Promise<boolean>((resolver) => setConfirmacion({ opciones, resolver })),
    [],
  );

  const responder = (valor: boolean) => {
    confirmacion?.resolver(valor);
    setConfirmacion(null);
  };

  // El emisor de módulo apunta a este proveedor mientras esté montado. Así
  // `avisar.*` y `confirmar()` funcionan desde cualquier sitio, incluido un
  // catch, donde un hook no se puede invocar.
  useEffect(() => registrarEmisor(avisar), [avisar]);
  useEffect(() => registrarConfirmador(pedirConfirmacion), [pedirConfirmacion]);

  const api = useMemo<ApiAvisos>(
    () => ({
      avisar,
      ok: (m) => avisar(m, 'ok'),
      error: (m) => avisar(m, 'error'),
      info: (m) => avisar(m, 'info'),
    }),
    [avisar],
  );

  return (
    <AvisosCtx.Provider value={api}>
      {children}

      <ConfirmDialog
        abierto={confirmacion !== null}
        titulo={confirmacion?.opciones.titulo ?? ''}
        mensaje={confirmacion?.opciones.mensaje ?? ''}
        textoConfirmar={confirmacion?.opciones.textoConfirmar}
        textoCancelar={confirmacion?.opciones.textoCancelar}
        destructiva={confirmacion?.opciones.destructiva}
        onConfirmar={() => responder(true)}
        onCancelar={() => responder(false)}
      />
      <div
        // 'polite' y no 'assertive': no interrumpe lo que el usuario esté
        // leyendo; espera a que haga una pausa.
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {avisos.map((a) => {
          const Icono = ICONOS_AVISO[a.tono];
          return (
            <div
              key={a.id}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-2.5',
                'rounded-pn-md border border-l-[3px] border-pn-line bg-pn-surface',
                'px-3.5 py-3 shadow-pn-pop',
                TONOS_AVISO[a.tono],
              )}
            >
              <Icono size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="m-0 min-w-0 flex-1 font-body text-[13.5px] leading-snug text-pn-ink">
                {a.mensaje}
              </p>
              <IconButton
                icono={X}
                etiqueta="Descartar"
                tamano="sm"
                onClick={() => quitar(a.id)}
                className="-mr-1 -mt-1 shrink-0 text-pn-muted"
              />
            </div>
          );
        })}
      </div>
    </AvisosCtx.Provider>
  );
}

/* ===========================================================================
   Confirmación
   ======================================================================== */

export interface ConfirmDialogProps {
  abierto: boolean;
  titulo: string;
  mensaje: ReactNode;
  /** Qué dice el botón que ejecuta. «Eliminar», no «Aceptar». */
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Marca la acción como destructiva. */
  destructiva?: boolean;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Sustituto de `window.confirm`. Además de ser diseñable y accesible, permite
 * nombrar la acción en el botón —«Eliminar material»— en lugar del «Aceptar»
 * genérico del navegador, que es la causa habitual de borrados por error.
 */
export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  destructiva = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCancelar}
      titulo={titulo}
      tamano="sm"
      pie={
        <>
          <Button variante="ghost" onClick={onCancelar} disabled={cargando}>
            {textoCancelar}
          </Button>
          <Button
            variante={destructiva ? 'danger' : 'primary'}
            onClick={onConfirmar}
            cargando={cargando}
          >
            {textoConfirmar}
          </Button>
        </>
      }
    >
      <p className="m-0 font-body text-sm leading-relaxed text-pn-ink-2">
        {mensaje}
      </p>
    </Modal>
  );
}
