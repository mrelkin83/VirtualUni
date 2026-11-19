import {
  CONTRASTE_AA,
  CONTRASTE_AA_GRANDE,
  aHex,
  acentoLegible,
  mezclar,
  parsearHex,
  razonDeContraste,
  tintaSobre,
  type Rgb,
} from './color';

/**
 * Inyecta el color de la institución como acento de la interfaz.
 *
 * Se escribe UNA variable, --pn-accent; el resto de la rampa la deriva el CSS
 * con color-mix() (ver src/index.css). Las dos que no se pueden derivar así
 * son las que dependen del contraste, y se calculan aquí:
 *
 *   --pn-accent-ink   texto sobre un relleno del acento (botón primario)
 *   --pn-accent-2-text  el secundario cuando hace de texto, no de relleno
 *   --pn-accent-text  el acento usado como texto sobre la superficie o
 *                     sobre su propio tinte suave, lo que sea mas exigente
 *
 * Si el color del tenant es inválido o no viene, no se toca nada y queda el
 * acento por defecto de Pensum.
 */

/** Superficie sobre la que se mide el contraste en cada tema. */
const SUPERFICIE: Record<'light' | 'dark', Rgb> = {
  light: [255, 255, 255], // --pn-surface
  dark: [20, 25, 33], //    --pn-surface en [data-theme='dark']
};

/**
 * Cuanto acento lleva --pn-accent-soft (ver src/index.css). El texto en color
 * de marca se apoya casi siempre en ese tinte -- insignias, pestanas activas,
 * avisos informativos --, no en la superficie limpia. Medir solo contra blanco
 * dejaba esas combinaciones en 3.3:1: el tinte resta contraste y nadie lo
 * estaba contando. Se mide contra el fondo real mas exigente de los dos.
 */
const TINTE_SUAVE = 0.12;

export interface ResultadoAcento {
  /** El color tal cual lo eligió la institución. Se usa para rellenos. */
  acento: string;
  /** Texto legible encima de un relleno de ese acento. */
  tinta: string;
  /** El acento ajustado para leerse tambien sobre --pn-accent-soft. */
  texto: string;
  /** true si hubo que ajustar `texto` porque el original no llegaba a 4.5:1. */
  ajustado: boolean;
  /** Contraste del color original como texto sobre la superficie. */
  contrasteOriginal: number;
}

/**
 * Calcula las variantes sin tocar el DOM. Separado de la escritura para poder
 * probarlo y para que la pantalla de configuración pueda avisar si el color
 * elegido es problemático.
 */
export function calcularAcento(
  colorTenant: string | null | undefined,
  tema: 'light' | 'dark' = 'light',
): ResultadoAcento | null {
  if (!colorTenant) return null;

  const rgb = parsearHex(colorTenant);
  if (!rgb) return null;

  const superficie = SUPERFICIE[tema];
  const contrasteOriginal = razonDeContraste(rgb, superficie);
  // mezclar(a, b, t) = a + (b - a) * t, asi que la base va primero.
  const tinteSuave = mezclar(superficie, rgb, TINTE_SUAVE);
  const texto = acentoLegible(rgb, tinteSuave, CONTRASTE_AA);

  return {
    acento: aHex(rgb),
    tinta: aHex(tintaSobre(rgb)),
    texto: aHex(texto),
    ajustado: contrasteOriginal < CONTRASTE_AA,
    contrasteOriginal,
  };
}

/**
 * Escribe las variables en <html>. Devuelve lo que calculó para el acento
 * primario, o null si no hizo nada. `raiz` es inyectable para las pruebas.
 *
 * `colorSecundario` alimenta --pn-accent-2, que es lo que marca el énfasis: la
 * entrada activa del menú y la métrica destacada. Sale de
 * `tenant.secondaryColor`, un campo que el backend expone desde siempre y que
 * el frontend no usaba en ningún sitio.
 */
export function aplicarAcento(
  colorTenant: string | null | undefined,
  tema: 'light' | 'dark' = 'light',
  raiz: HTMLElement | null = typeof document !== 'undefined'
    ? document.documentElement
    : null,
  colorSecundario?: string | null,
): ResultadoAcento | null {
  if (!raiz) return null;

  const secundario = calcularAcento(colorSecundario, tema);
  if (secundario) {
    raiz.style.setProperty('--pn-accent-2', secundario.acento);
    raiz.style.setProperty('--pn-accent-2-ink', secundario.tinta);
    // El secundario se eligió para rellenar, no para escribir: el naranja por
    // defecto da 2.77:1 sobre blanco. Esta es su versión legible como texto.
    raiz.style.setProperty('--pn-accent-2-text', secundario.texto);
  } else {
    raiz.style.removeProperty('--pn-accent-2');
    raiz.style.removeProperty('--pn-accent-2-ink');
    raiz.style.removeProperty('--pn-accent-2-text');
  }

  const r = calcularAcento(colorTenant, tema);
  if (!r) {
    raiz.style.removeProperty('--pn-accent');
    raiz.style.removeProperty('--pn-accent-ink');
    raiz.style.removeProperty('--pn-accent-text');
    return null;
  }

  raiz.style.setProperty('--pn-accent', r.acento);
  raiz.style.setProperty('--pn-accent-ink', r.tinta);
  raiz.style.setProperty('--pn-accent-text', r.texto);
  return r;
}

/** Devuelve los acentos a los valores por defecto de la hoja de estilos. */
export function limpiarAcento(
  raiz: HTMLElement | null = typeof document !== 'undefined'
    ? document.documentElement
    : null,
): void {
  if (!raiz) return;
  for (const v of [
    '--pn-accent',
    '--pn-accent-ink',
    '--pn-accent-text',
    '--pn-accent-2',
    '--pn-accent-2-ink',
    '--pn-accent-2-text',
  ]) {
    raiz.style.removeProperty(v);
  }
}

/**
 * Para la pantalla de configuración: describe en castellano si un color sirve
 * como acento. No bloquea nada — la institución manda sobre su marca — pero
 * permite avisar antes de guardar.
 */
export function revisarColorDeMarca(colorTenant: string): {
  valido: boolean;
  cumpleTexto: boolean;
  cumpleInterfaz: boolean;
  mensaje: string;
} {
  const rgb = parsearHex(colorTenant);
  if (!rgb) {
    return {
      valido: false,
      cumpleTexto: false,
      cumpleInterfaz: false,
      mensaje: 'No es un color hexadecimal válido.',
    };
  }

  const contraste = razonDeContraste(rgb, SUPERFICIE.light);
  const cumpleTexto = contraste >= CONTRASTE_AA;
  const cumpleInterfaz = contraste >= CONTRASTE_AA_GRANDE;

  if (cumpleTexto) {
    return {
      valido: true,
      cumpleTexto,
      cumpleInterfaz,
      mensaje: 'Contraste suficiente para textos y botones.',
    };
  }

  return {
    valido: true,
    cumpleTexto,
    cumpleInterfaz,
    mensaje: cumpleInterfaz
      ? 'Sirve para botones y bordes. En textos se usará una versión más oscura.'
      : 'Contraste bajo. Se usará una versión más oscura en textos y bordes.',
  };
}
