import { useEffect, useRef } from 'react';

const SELECTOR_FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad mínima para los modales de la app: ninguno tenía
 * role="dialog", trampa de foco, cierre con Escape ni devolvía el foco al
 * cerrar (auditoría de agosto 2026 — grep de role="dialog"/aria-modal en
 * src/ no arrojó ningún resultado).
 *
 * Uso:
 *   const dialogRef = useModalA11y(isOpen, onClose);
 *   <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}> ... </div>
 */
export function useModalA11y(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previoFoco = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previoFoco.current = document.activeElement as HTMLElement | null;

    const contenedor = dialogRef.current;
    const primerFocable = contenedor?.querySelector<HTMLElement>(SELECTOR_FOCUSABLE);
    (primerFocable ?? contenedor)?.focus();

    const manejarTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !contenedor) return;

      // Sin filtrar por offsetParent: en jsdom (tests) siempre es null al no
      // calcular layout, y en un modal real todo lo que coincide con el
      // selector ya está visible, así que el filtro no aportaba nada fiable.
      const focables = Array.from(
        contenedor.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE),
      );
      if (focables.length === 0) return;

      const primero = focables[0];
      const ultimo = focables[focables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', manejarTeclado);

    return () => {
      document.removeEventListener('keydown', manejarTeclado);
      previoFoco.current?.focus();
    };
  }, [isOpen, onClose]);

  return dialogRef;
}
