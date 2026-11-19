/**
 * Une clases condicionales. Equivale a `clsx` para lo que necesitamos aquí,
 * sin añadir una dependencia: el rediseño es a coste cero en paquetes nuevos.
 *
 * No resuelve conflictos de Tailwind (eso sería `tailwind-merge`). Las
 * primitivas están escritas para que la clase del consumidor venga siempre al
 * final, que es donde gana en la cascada cuando la especificidad es igual.
 */
export type ValorClase =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean | null | undefined>;

export function cn(...valores: ValorClase[]): string {
  const salida: string[] = [];

  for (const v of valores) {
    if (!v) continue;

    if (typeof v === 'string' || typeof v === 'number') {
      salida.push(String(v));
      continue;
    }

    for (const [clase, activa] of Object.entries(v)) {
      if (activa) salida.push(clase);
    }
  }

  return salida.join(' ');
}
