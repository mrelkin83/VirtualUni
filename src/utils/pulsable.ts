import type { KeyboardEvent, MouseEvent } from 'react';

/**
 * Hace que un elemento que no es un botón se pueda pulsar con el teclado.
 *
 * Por el código hay 76 `<div onClick>` —tarjetas de curso, filas de tabla,
 * pestañas, casillas de resumen— que solo responden al ratón. Para quien
 * navega con el tabulador, o con un lector de pantalla, sencillamente no
 * existen: no reciben el foco, no se anuncian como pulsables y no reaccionan
 * a Intro. Es el criterio 2.1.1 de WCAG, el más básico de todos.
 *
 * Lo ideal sería que fueran `<button>`, pero muchos envuelven bloques enteros
 * con títulos y listas dentro, y meter eso en un botón rompe tanto la
 * semántica como la maquetación. El patrón estándar para ese caso es el de
 * aquí: rol de botón, entrada en el orden de tabulación e Intro/Espacio.
 *
 * Se usa repartiendo las props:
 *
 *   <div {...pulsable(() => abrir(curso))} className="...">
 */
export function pulsable(
  alPulsar: ((e: MouseEvent | KeyboardEvent) => void) | undefined,
) {
  // Sin manejador no es pulsable: no se le da ni foco ni rol, porque anunciar
  // un botón que no hace nada es peor que no anunciarlo.
  if (!alPulsar) return {};

  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: alPulsar,
    onKeyDown: (e: KeyboardEvent) => {
      // El espacio desplaza la página por defecto; en un botón no debe.
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        alPulsar(e);
      }
    },
  };
}
