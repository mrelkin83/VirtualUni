import { useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';
import { IconButton } from './Button';
import { cn } from './cn';

/**
 * Modal de Pensum.
 *
 * Hoy hay 50 archivos con una superposición propia y solo 20 declaran
 * `role="dialog"`. Los otros 30 son un `<div>` sin semántica, sin trampa de
 * foco y sin cierre con Escape. `useModalA11y` ya resolvía eso bien; lo que
 * faltaba era un componente que lo aplicara siempre.
 *
 * En móvil el diálogo se convierte en hoja inferior: cabecera fija, cuerpo con
 * desplazamiento y acciones ancladas abajo, que es lo que evita que el pie se
 * pierda bajo el teclado.
 */

export type TamanoModal = 'sm' | 'md' | 'lg' | 'full';

const ANCHOS: Record<TamanoModal, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-3xl',
  full: 'sm:max-w-[min(1100px,92vw)]',
};

export interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: ReactNode;
  /** Línea de apoyo bajo el título. Se enlaza con aria-describedby. */
  descripcion?: ReactNode;
  tamano?: TamanoModal;
  /** Fila de acciones anclada al pie. */
  pie?: ReactNode;
  /** Oculta la X. Úsalo solo si el pie ya ofrece una salida clara. */
  sinBotonCerrar?: boolean;
  className?: string;
  children: ReactNode;
}

export function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  tamano = 'md',
  pie,
  sinBotonCerrar = false,
  className,
  children,
}: ModalProps) {
  // Foco atrapado, cierre con Escape y devolución del foco al cerrar.
  const refDialogo = useModalA11y(abierto, onCerrar);
  const base = useId();
  const idTitulo = `${base}-titulo`;
  const idDescripcion = descripcion ? `${base}-descripcion` : undefined;

  if (!abierto) return null;

  return (
    <div
      className={
        'fixed inset-0 z-50 flex items-end justify-center ' +
        'bg-black/50 p-0 sm:items-center sm:p-4'
      }
      // Pulsar el velo cierra; pulsar dentro del diálogo no.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        ref={refDialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idDescripcion}
        tabIndex={-1}
        className={cn(
          'flex w-full flex-col bg-pn-surface shadow-pn-pop',
          'max-h-[92vh] rounded-t-pn-lg sm:max-h-[86vh] sm:rounded-pn-lg',
          'focus-visible:outline-none',
          ANCHOS[tamano],
          className,
        )}
      >
        <header className="flex items-start gap-3 border-b border-pn-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2
              id={idTitulo}
              className="font-display text-lg font-bold leading-tight text-pn-ink"
            >
              {titulo}
            </h2>
            {descripcion && (
              <p
                id={idDescripcion}
                className="mt-1 font-body text-[13px] leading-snug text-pn-muted"
              >
                {descripcion}
              </p>
            )}
          </div>
          {!sinBotonCerrar && (
            <IconButton
              icono={X}
              etiqueta="Cerrar"
              tamano="sm"
              onClick={onCerrar}
              className="-mr-1 shrink-0"
            />
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 font-body text-pn-ink-2">
          {children}
        </div>

        {pie && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-pn-line px-5 py-3.5">
            {pie}
          </footer>
        )}
      </div>
    </div>
  );
}

export interface DrawerProps extends Omit<ModalProps, 'tamano'> {
  /** Lado por el que entra en escritorio. En móvil siempre sube desde abajo. */
  lado?: 'derecha' | 'izquierda';
  ancho?: string;
}

/**
 * Panel lateral para ver detalle sin perder de vista la lista: la
 * previsualización de un material, la ficha de un estudiante junto a la tabla
 * de notas.
 */
export function Drawer({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  pie,
  lado = 'derecha',
  ancho = 'sm:max-w-md',
  sinBotonCerrar = false,
  className,
  children,
}: DrawerProps) {
  const refDialogo = useModalA11y(abierto, onCerrar);
  const base = useId();
  const idTitulo = `${base}-titulo`;
  const idDescripcion = descripcion ? `${base}-descripcion` : undefined;

  if (!abierto) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex bg-black/50',
        'items-end sm:items-stretch',
        lado === 'derecha' ? 'sm:justify-end' : 'sm:justify-start',
      )}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        ref={refDialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idDescripcion}
        tabIndex={-1}
        className={cn(
          'flex w-full flex-col bg-pn-surface shadow-pn-pop',
          'max-h-[92vh] rounded-t-pn-lg sm:h-full sm:max-h-none sm:rounded-none',
          'focus-visible:outline-none',
          ancho,
          className,
        )}
      >
        <header className="flex items-start gap-3 border-b border-pn-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2
              id={idTitulo}
              className="font-display text-base font-bold leading-tight text-pn-ink"
            >
              {titulo}
            </h2>
            {descripcion && (
              <p
                id={idDescripcion}
                className="mt-1 font-body text-[13px] leading-snug text-pn-muted"
              >
                {descripcion}
              </p>
            )}
          </div>
          {!sinBotonCerrar && (
            <IconButton
              icono={X}
              etiqueta="Cerrar"
              tamano="sm"
              onClick={onCerrar}
              className="-mr-1 shrink-0"
            />
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 font-body text-pn-ink-2">
          {children}
        </div>

        {pie && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-pn-line px-5 py-3.5">
            {pie}
          </footer>
        )}
      </div>
    </div>
  );
}
