/**
 * Utilidades de color para el acento inyectable por tenant.
 *
 * El problema que resuelven: `tenant.primaryColor` lo elige cada institución
 * desde la pantalla de configuración, con un selector de color libre. Nada
 * impide que alguien ponga un amarillo (#FFD400) y deje ilegible todo el texto
 * de acento. Antes de usar ese color hay que comprobar el contraste y, si no
 * llega, derivar una variante que sí.
 *
 * La matemática es la de WCAG 2.x: luminancia relativa y razón de contraste.
 */

export type Rgb = [number, number, number];

/** Umbral AA para texto normal. */
export const CONTRASTE_AA = 4.5;
/** Umbral AA para texto grande y elementos de interfaz. */
export const CONTRASTE_AA_GRANDE = 3;

/**
 * Acepta `#abc`, `#aabbcc` y las mismas formas sin almohadilla.
 * Devuelve null si no es un color hexadecimal válido: quien llama decide el
 * respaldo, porque aquí no sabemos cuál corresponde.
 */
export function parsearHex(hex: string): Rgb | null {
  if (typeof hex !== 'string') return null;

  const limpio = hex.trim().replace(/^#/, '');

  if (/^[0-9a-f]{3}$/i.test(limpio)) {
    return [
      parseInt(limpio[0] + limpio[0], 16),
      parseInt(limpio[1] + limpio[1], 16),
      parseInt(limpio[2] + limpio[2], 16),
    ];
  }

  if (/^[0-9a-f]{6}$/i.test(limpio)) {
    return [
      parseInt(limpio.slice(0, 2), 16),
      parseInt(limpio.slice(2, 4), 16),
      parseInt(limpio.slice(4, 6), 16),
    ];
  }

  return null;
}

const aDosDigitos = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0');

export function aHex([r, g, b]: Rgb): string {
  return `#${aDosDigitos(r)}${aDosDigitos(g)}${aDosDigitos(b)}`;
}

/** Luminancia relativa según WCAG 2.x (0 = negro, 1 = blanco). */
export function luminanciaRelativa([r, g, b]: Rgb): number {
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Razón de contraste entre dos colores: de 1 (idénticos) a 21 (negro/blanco). */
export function razonDeContraste(a: Rgb, b: Rgb): number {
  const la = luminanciaRelativa(a);
  const lb = luminanciaRelativa(b);
  const claro = Math.max(la, lb);
  const oscuro = Math.min(la, lb);
  return (claro + 0.05) / (oscuro + 0.05);
}

/** Mezcla lineal entre dos colores. `cantidad` 0 devuelve `a`, 1 devuelve `b`. */
export function mezclar(a: Rgb, b: Rgb, cantidad: number): Rgb {
  const t = Math.max(0, Math.min(1, cantidad));
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

const NEGRO: Rgb = [0, 0, 0];
const BLANCO: Rgb = [255, 255, 255];

/**
 * Elige el color de texto que mejor contrasta sobre un relleno del color dado.
 * Se usa para --pn-accent-ink: el texto de un botón primario.
 */
export function tintaSobre(
  relleno: Rgb,
  claro: Rgb = BLANCO,
  oscuro: Rgb = [11, 14, 18],
): Rgb {
  return razonDeContraste(relleno, claro) >= razonDeContraste(relleno, oscuro)
    ? claro
    : oscuro;
}

/**
 * Devuelve una variante del acento legible como TEXTO sobre `fondo`.
 *
 * Si el acento ya cumple el umbral se devuelve intacto. Si no, se desplaza
 * hacia el negro (fondo claro) o hacia el blanco (fondo oscuro) por pasos del
 * 5 % hasta alcanzarlo. El recorrido está acotado a 20 pasos; el último paso es
 * el extremo puro, que siempre cumple.
 *
 * El relleno conserva el color original de la institución: solo cambia la
 * variante de texto. Así la marca se respeta y la lectura no se rompe.
 */
export function acentoLegible(
  acento: Rgb,
  fondo: Rgb,
  objetivo: number = CONTRASTE_AA,
): Rgb {
  if (razonDeContraste(acento, fondo) >= objetivo) return acento;

  // Sobre un fondo claro hay que ir hacia el negro; sobre uno oscuro, al blanco.
  const destino: Rgb = luminanciaRelativa(fondo) > 0.5 ? NEGRO : BLANCO;

  for (let paso = 1; paso <= 20; paso++) {
    const candidato = mezclar(acento, destino, paso * 0.05);
    if (razonDeContraste(candidato, fondo) >= objetivo) return candidato;
  }

  return destino;
}
