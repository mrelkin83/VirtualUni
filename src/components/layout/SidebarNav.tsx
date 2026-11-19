import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { cn } from '../ui/cn';
import { IconButton } from '../ui/Button';
import { guardarPlegada, leerPlegada } from './plegado';
import type { GrupoNav } from './navegacion';

/**
 * Barra lateral compartida por los tres roles.
 *
 * Qué cambia respecto a lo que hay hoy:
 *
 *   - Una sola implementación. Había tres: la del estudiante, la del docente y
 *     la del administrador escrita en línea dentro de un archivo de 2.648
 *     líneas.
 *   - Cajón deslizante en móvil TAMBIÉN en el administrador. Su barra alternaba
 *     entre w-64 y w-20 en todas las resoluciones, así que en un teléfono de
 *     390 px se comía 256 px de ancho de forma permanente.
 *   - El estado plegado persiste. Antes se perdía en cada recarga.
 *   - El marco lleva color y el contenido se queda en calma. Es el patrón de
 *     los dashboards de CodeXR que sí tienen presencia —el fondo de página
 *     coloreado y las tarjetas blancas flotando encima— pero aplicado donde
 *     aquí no estorba: detrás del menú, no detrás de una tabla de pensum. El
 *     color del marco se deriva del acento, así que la barra ES la marca de la
 *     institución; ver --pn-shell en src/index.css.
 */

/* CLAVE_PLEGADA, leerPlegada y guardarPlegada viven en ./plegado para no
   exportar funciones junto al componente: la regla react-refresh avisa porque
   eso rompe la recarga en caliente. */

export interface SidebarNavProps<T extends string> {
  grupos: GrupoNav<T>[];
  activa: T;
  onCambiar: (seccion: T) => void;
  /** Nombre de la institución o de la plataforma. */
  marca: string;
  /** «Portal del estudiante», «Panel docente»… */
  subtitulo?: string;
  logo?: string;
  contadores?: Partial<Record<'mensajes' | 'tareas' | 'tramites', number>>;
  /** Estado del cajón en móvil. Lo controla AppShell. */
  cajonAbierto: boolean;
  onCerrarCajon: () => void;
  onSalir?: () => void;
}

export function SidebarNav<T extends string>({
  grupos,
  activa,
  onCambiar,
  marca,
  subtitulo,
  logo,
  contadores,
  cajonAbierto,
  onCerrarCajon,
  onSalir,
}: SidebarNavProps<T>) {
  const [plegada, setPlegada] = useState(leerPlegada);

  const alternarPlegada = useCallback(() => {
    setPlegada((p) => {
      const siguiente = !p;
      guardarPlegada(siguiente);
      return siguiente;
    });
  }, []);

  // Escape cierra el cajón móvil. Sin esto, en un teléfono con teclado
  // externo no hay forma de salir sin tocar la pantalla.
  useEffect(() => {
    if (!cajonAbierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrarCajon();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [cajonAbierto, onCerrarCajon]);

  const elegir = (id: T) => {
    onCambiar(id);
    onCerrarCajon(); // en móvil, al elegir se cierra; en escritorio no estorba
  };

  return (
    <>
      {/* Velo del cajón: solo por debajo de lg */}
      {cajonAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCerrarCajon}
          aria-hidden="true"
        />
      )}

      <nav
        aria-label="Secciones"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          'pn-shell-bg text-pn-shell-ink',
          'transition-[transform,width] duration-pn-slow ease-pn-ease',
          'lg:static lg:translate-x-0',
          cajonAbierto ? 'translate-x-0' : '-translate-x-full',
          plegada ? 'w-16' : 'w-64',
        )}
      >
        {/* --- Marca --- */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center gap-2.5 border-b border-pn-shell-line px-3',
            plegada && 'justify-center px-0',
          )}
        >
          {logo ? (
            <img
              src={logo}
              alt={marca}
              className="h-8 w-8 shrink-0 rounded object-contain"
            />
          ) : (
            /* Fondo claro con la letra en el color de marca, y NO al revés.
               Con `bg-pn-accent` el cuadro desaparecía: el degradado del marco
               arranca justo en el acento (--pn-shell-from), así que en la
               cabecera el recuadro y su fondo eran el mismo color exacto.
               La letra va en --pn-shell y no en --pn-accent-text: ese último se
               aclara en tema oscuro y entonces chocaba contra el recuadro claro
               (2.94:1). shell y shell-ink son pareja en los dos temas —
               6.91:1 en claro, 14.38:1 en oscuro. */
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-pn-sm bg-pn-shell-ink font-display text-sm font-bold text-pn-shell"
              aria-hidden="true"
            >
              {marca.charAt(0).toUpperCase()}
            </span>
          )}

          {!plegada && (
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-sm font-bold leading-tight text-pn-shell-ink">
                {marca}
              </span>
              {subtitulo && (
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.08em] text-pn-shell-muted">
                  {subtitulo}
                </span>
              )}
            </span>
          )}

          {!plegada && (
            <IconButton
              icono={X}
              etiqueta="Cerrar menú"
              tamano="sm"
              onClick={onCerrarCajon}
              // El fantasma por defecto usa tinta oscura: sobre el marco no se
              // vería. Aquí manda la paleta del marco.
              className="shrink-0 text-pn-shell-muted hover:bg-pn-shell-2 hover:text-pn-shell-ink lg:hidden"
            />
          )}
        </div>

        {/* --- Grupos --- */}
        <div className="pn-scroll-shell min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2">
          {grupos.map((grupo) => (
            <div key={grupo.titulo} className="mb-1">
              {plegada ? (
                <div
                  className="mx-3 my-2 border-t border-pn-shell-line"
                  aria-hidden="true"
                />
              ) : (
                <p className="px-4 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-pn-shell-muted">
                  {grupo.titulo}
                </p>
              )}

              <ul className="list-none p-0">
                {grupo.entradas.map((entrada) => {
                  const Icono = entrada.icono;
                  const esActiva = entrada.id === activa;
                  const cuenta = entrada.contador
                    ? (contadores?.[entrada.contador] ?? 0)
                    : 0;

                  return (
                    <li key={entrada.id}>
                      <button
                        type="button"
                        onClick={() => elegir(entrada.id)}
                        aria-current={esActiva ? 'page' : undefined}
                        title={plegada ? entrada.etiqueta : undefined}
                        className={cn(
                          'relative flex w-full items-center gap-3 px-4 py-2.5',
                          'font-body text-[13.5px] transition-colors duration-pn-fast',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-inset focus-visible:ring-pn-accent',
                          plegada && 'justify-center px-0',
                          esActiva
                            ? 'bg-pn-shell-activo font-semibold text-pn-shell-activo-ink'
                            : 'text-pn-shell-muted hover:bg-pn-shell-2 hover:text-pn-shell-ink',
                        )}
                      >
                        <Icono size={17} className="shrink-0" aria-hidden="true" />

                        {!plegada && (
                          <span className="min-w-0 flex-1 truncate text-left">
                            {entrada.etiqueta}
                          </span>
                        )}

                        {cuenta > 0 && (
                          <span
                            className={cn(
                              'shrink-0 rounded-full bg-pn-danger px-1.5 font-mono',
                              'text-[10.5px] font-semibold leading-[17px] text-pn-surface',
                              plegada &&
                                'absolute right-1.5 top-1.5 min-w-[16px] px-1 text-center leading-[16px]',
                            )}
                          >
                            {cuenta > 99 ? '99+' : cuenta}
                            <span className="sr-only"> sin leer</span>
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* --- Pie --- */}
        <div className="shrink-0 border-t border-pn-shell-line p-2">
          {onSalir && (
            <button
              type="button"
              onClick={onSalir}
              title={plegada ? 'Cerrar sesión' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-pn-sm px-2.5 py-2.5',
                'font-body text-[13.5px] text-pn-shell-muted',
                'transition-colors duration-pn-fast',
                'hover:bg-pn-danger hover:text-pn-surface',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pn-accent',
                plegada && 'justify-center px-0',
              )}
            >
              <LogOut size={17} className="shrink-0" aria-hidden="true" />
              {!plegada && <span>Cerrar sesión</span>}
            </button>
          )}

          {/* Plegar es cosa de escritorio: en móvil el cajón ya se oculta. */}
          <button
            type="button"
            onClick={alternarPlegada}
            aria-expanded={!plegada}
            className={cn(
              'mt-1 hidden w-full items-center gap-3 rounded-pn-sm px-2.5 py-2',
              'font-body text-[12.5px] text-pn-shell-muted',
              'transition-colors duration-pn-fast hover:bg-pn-shell-2 hover:text-pn-shell-ink',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pn-accent',
              'lg:flex',
              plegada && 'justify-center px-0',
            )}
          >
            {plegada ? (
              <ChevronRight size={17} className="shrink-0" aria-hidden="true" />
            ) : (
              <ChevronLeft size={17} className="shrink-0" aria-hidden="true" />
            )}
            {!plegada && <span>Plegar menú</span>}
          </button>
        </div>
      </nav>
    </>
  );
}
