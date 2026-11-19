import { useEffect } from 'react';

/**
 * Cierra un panel flotante con Escape.
 *
 * Los dropdowns de notificaciones y mensajes solo se cerraban pulsando el
 * overlay: con el teclado no había salida (módulo 7). No usan `useModalA11y`
 * porque no son diálogos —no deben atrapar el foco ni anunciarse como
 * modales—, solo les falta la tecla de escape.
 */
export function useCerrarConEscape(abierto: boolean, onCerrar: () => void): void {
  useEffect(() => {
    if (!abierto) return;

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onCerrar();
    };

    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto, onCerrar]);
}
