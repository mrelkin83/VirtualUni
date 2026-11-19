import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { IconButton } from '../ui/Button';
import { cn } from '../ui/cn';
import { SidebarNav } from './SidebarNav';
import type { GrupoNav } from './navegacion';

/**
 * Armazón de la aplicación: barra lateral + cabecera + contenido.
 *
 * Lo comparten los tres roles. Antes había tres armazones distintos y el del
 * administrador no tenía navegación móvil en absoluto.
 *
 * La cabecera recibe sus acciones por `accionesCabecera` para no imponer un
 * conjunto fijo: el estudiante lleva mensajes y notificaciones, el
 * administrador además la búsqueda global.
 */

export interface AppShellProps<T extends string> {
  grupos: GrupoNav<T>[];
  seccionActiva: T;
  onCambiarSeccion: (seccion: T) => void;
  /** Título de la pantalla actual. Se muestra como h1 en la cabecera. */
  titulo: string;
  marca: string;
  subtitulo?: string;
  logo?: string;
  contadores?: Partial<Record<'mensajes' | 'tareas' | 'tramites', number>>;
  /** Controles de la derecha de la cabecera. */
  accionesCabecera?: ReactNode;
  /** Ocupa el centro de la cabecera. Para la búsqueda global del admin. */
  centroCabecera?: ReactNode;
  onSalir?: () => void;
  children: ReactNode;
}

export function AppShell<T extends string>({
  grupos,
  seccionActiva,
  onCambiarSeccion,
  titulo,
  marca,
  subtitulo,
  logo,
  contadores,
  accionesCabecera,
  centroCabecera,
  onSalir,
  children,
}: AppShellProps<T>) {
  const [cajonAbierto, setCajonAbierto] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-pn-ground">
      <SidebarNav
        grupos={grupos}
        activa={seccionActiva}
        onCambiar={onCambiarSeccion}
        marca={marca}
        subtitulo={subtitulo}
        logo={logo}
        contadores={contadores}
        cajonAbierto={cajonAbierto}
        onCerrarCajon={() => setCajonAbierto(false)}
        onSalir={onSalir}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            'flex h-16 shrink-0 items-center gap-3 border-b border-pn-line',
            'bg-pn-surface px-3 sm:px-4',
          )}
        >
          <IconButton
            icono={Menu}
            etiqueta="Abrir menú"
            onClick={() => setCajonAbierto(true)}
            className="shrink-0 lg:hidden"
          />

          <h1 className="min-w-0 truncate font-display text-lg font-bold tracking-[-0.015em] text-pn-ink sm:text-xl">
            {titulo}
          </h1>

          {centroCabecera && (
            // Se oculta en pantallas estrechas: con el título y las acciones no
            // cabe, y una búsqueda de 80 px no sirve para nada.
            <div className="mx-2 hidden min-w-0 flex-1 md:block">
              {centroCabecera}
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {accionesCabecera}
          </div>
        </header>

        {/* `scrollbar-gutter: stable` reserva el carril siempre: sin eso, el
            contenido salta unos píxeles en cuanto una pantalla pasa a tener
            desplazamiento. */}
        <main
          className="pn-scroll min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
          style={{ scrollbarGutter: 'stable' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
