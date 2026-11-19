import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CONTRASTE_AA,
  mezclar,
  parsearHex,
  razonDeContraste,
  type Rgb,
} from './color';

/**
 * Contraste de los tokens de color, medido sobre los fondos donde se usan.
 *
 * Esto nació de un fallo real: `--pn-muted` llevaba desde el primer módulo en
 * #6a7a93, que da 4.36:1 sobre una tarjeta blanca. Está por debajo del 4.5 de
 * AA y es el color de casi todo el texto secundario de la aplicación, así que
 * el fallo estaba en cientos de sitios a la vez. No lo veía nadie: `tsc`, el
 * lint y el build no miran colores, y un token se escribe una vez y se olvida.
 *
 * Se lee el CSS de verdad en vez de repetir aquí los valores, que es lo único
 * que garantiza que la prueba hable del mismo archivo que se publica.
 */

const CSS = readFileSync(resolve(__dirname, '../index.css'), 'utf8');

/**
 * Todos los bloques de declaraciones que abre `selector`, concatenados.
 *
 * Se ancla a principio de línea a propósito: el encabezado de index.css
 * menciona `[data-theme='dark']` dentro de un comentario, y un indexOf a secas
 * se quedaba con esa mención y acababa midiendo el bloque equivocado. Y hay
 * dos reglas con ese selector —una con los tokens y otra sólo con
 * color-scheme—, así que se juntan en vez de quedarse con la primera.
 */
function bloqueDe(selector: string): string {
  const escapado = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp(`^${escapado}\\s*\\{`, 'gm');
  const trozos: string[] = [];
  for (const m of CSS.matchAll(rx)) {
    const abre = CSS.indexOf('{', m.index);
    trozos.push(CSS.slice(abre, CSS.indexOf('\n}', abre)));
  }
  if (!trozos.length) {
    throw new Error(`No está el bloque ${selector} en index.css`);
  }
  return trozos.join('\n');
}

/** Los `--pn-*: #hex;` literales de ese bloque. Los derivados se ignoran. */
function tokensDe(selector: string): Record<string, Rgb> {
  const salida: Record<string, Rgb> = {};
  for (const m of bloqueDe(selector).matchAll(
    /(--pn-[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  )) {
    const rgb = parsearHex(m[2]);
    if (rgb) salida[m[1]] = rgb;
  }
  return salida;
}

/** El acento de fábrica, antes de que lo reemplace el color de un tenant. */
function acentoPorDefecto(selector: string): Rgb {
  const m = bloqueDe(selector).match(/--pn-accent:\s*(#[0-9a-fA-F]{6})\s*;/);
  if (!m) throw new Error(`No está --pn-accent en ${selector}`);
  return parsearHex(m[1])!;
}

/**
 * El porcentaje de un `color-mix()` declarado en el CSS, en tanto por uno. Se
 * lee en vez de copiarse para que la prueba no se quede obsoleta en silencio
 * si alguien ajusta el tinte.
 */
function porcentajeDeMezcla(token: string): number {
  // Nada de [^)]: el valor lleva un `var(--pn-accent)` por medio, y su
  // paréntesis de cierre cortaba la búsqueda antes de llegar al porcentaje.
  const m = CSS.match(new RegExp(`${token}:\\s*color-mix\\(in srgb,.*?(\\d+)%`));
  if (!m) throw new Error(`No se pudo leer el porcentaje de ${token}`);
  return Number(m[1]) / 100;
}

/**
 * Resuelve un token a color siguiendo las indirecciones del CSS: un `var()`
 * que apunta a otro token y un `color-mix()` de dos términos.
 *
 * Hace falta porque los textos de acento se declaran como `var(--pn-accent)`:
 * `tokensDe` solo recoge hexadecimales literales y por eso no los veía, que es
 * justo por lo que el texto de acento no estaba cubierto (módulo 7).
 *
 * Si el tema oscuro no redefine un token, se cae a `:root`, que es lo que hace
 * la cascada de verdad.
 */
function resolver(
  selector: string,
  nombre: string,
  vistos: Set<string> = new Set(),
): Rgb {
  if (vistos.has(`${selector}|${nombre}`)) {
    throw new Error(`Ciclo de tokens en ${nombre}`);
  }
  vistos.add(`${selector}|${nombre}`);

  // `selector` es siempre el contexto donde se evalúa. Si el tema no redefine
  // el token se toma la declaración de `:root`, pero los `var()` de dentro se
  // siguen resolviendo en `selector`: así sustituye el navegador las custom
  // properties, y por eso --pn-accent-soft en oscuro mezcla con la superficie
  // oscura aunque su declaración viva en :root.
  const declarado = (sel: string) =>
    bloqueDe(sel).match(new RegExp(`${nombre}:\\s*([^;]+);`))?.[1].trim();
  const valor = declarado(selector) ?? declarado(':root');
  if (!valor) throw new Error(`No está ${nombre} en index.css`);

  if (/^#[0-9a-fA-F]{6}$/.test(valor)) return parsearHex(valor)!;

  const indirecto = valor.match(/^var\((--pn-[\w-]+)\)$/);
  if (indirecto) return resolver(selector, indirecto[1], vistos);

  // color-mix(in srgb, <A> N%, <B>) — el porcentaje es la parte de A.
  const mezcla = valor.match(/^color-mix\(in srgb,\s*(.+?)\s+(\d+)%,\s*(.+?)\)$/);
  if (mezcla) {
    const termino = (t: string): Rgb => {
      const v = t.match(/^var\((--pn-[\w-]+)\)$/);
      return v ? resolver(selector, v[1], new Set(vistos)) : parsearHex(t)!;
    };
    return mezclar(termino(mezcla[3]), termino(mezcla[1]), Number(mezcla[2]) / 100);
  }

  throw new Error(`No sé resolver ${nombre}: ${valor}`);
}

const CLARO = tokensDe(':root');
const OSCURO = tokensDe("[data-theme='dark']");

/**
 * Los `*-soft` se derivan con color-mix(), así que aquí se rehace la mezcla
 * con el porcentaje que declara el propio archivo. Ojo: el tema oscuro NO
 * redefine --pn-accent-soft, hereda el de :root.
 */
const TINTE_ACENTO = porcentajeDeMezcla('--pn-accent-soft');
const TINTE_ACENTO_2 = porcentajeDeMezcla('--pn-accent-2-soft');

const SEMANTICOS: Array<[string, string, string]> = [
  ['ok', '--pn-ok', '--pn-ok-soft'],
  ['warn', '--pn-warn', '--pn-warn-soft'],
  ['danger', '--pn-danger', '--pn-danger-soft'],
  ['info', '--pn-info', '--pn-info-soft'],
];

/** Los fondos donde puede acabar posado un texto, en el tema que sea. */
function fondosDe(t: Record<string, Rgb>, acento: Rgb): Array<[string, Rgb]> {
  return [
    ['--pn-ground', t['--pn-ground']],
    ['--pn-surface', t['--pn-surface']],
    ['--pn-surface-2', t['--pn-surface-2']],
    ['--pn-surface-3', t['--pn-surface-3']],
    ['--pn-accent-soft', mezclar(t['--pn-surface'], acento, TINTE_ACENTO)],
    [
      '--pn-accent-2-soft',
      mezclar(t['--pn-surface'], t['--pn-accent-2'], TINTE_ACENTO_2),
    ],
  ];
}

describe.each([
  ['claro', CLARO, acentoPorDefecto(':root')],
  ['oscuro', OSCURO, acentoPorDefecto("[data-theme='dark']")],
])('contraste de los tokens de texto, tema %s', (_tema, t, acento) => {
  const fondos = fondosDe(t, acento);

  it.each(fondos)('--pn-ink se lee sobre %s', (_n, fondo) => {
    expect(razonDeContraste(t['--pn-ink'], fondo)).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
  });

  it.each(fondos)('--pn-ink-2 se lee sobre %s', (_n, fondo) => {
    expect(razonDeContraste(t['--pn-ink-2'], fondo)).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
  });

  // El que falló: es el color de casi todo el texto secundario.
  it.each(fondos)('--pn-muted se lee sobre %s', (_n, fondo) => {
    expect(razonDeContraste(t['--pn-muted'], fondo)).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
  });

  // Los semánticos se usan casi siempre dentro de su propia insignia, que es
  // el fondo más exigente que van a encontrar.
  it.each(SEMANTICOS)('%s se lee sobre su propio tinte', (_n, texto, fondo) => {
    expect(razonDeContraste(t[texto], t[fondo])).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
  });
});

/**
 * Los colores de acento, que hasta el módulo 7 no se medían: son el texto de
 * los enlaces y las insignias, y la tinta de todos los botones primarios.
 */
describe.each([
  ['claro', ':root'],
  ['oscuro', "[data-theme='dark']"],
])('contraste de los acentos, tema %s', (_tema, sel) => {
  const sobre = (fondo: string) => resolver(sel, fondo);

  it.each(['--pn-surface', '--pn-surface-2', '--pn-surface-3', '--pn-ground', '--pn-accent-soft'])(
    '--pn-accent-text se lee sobre %s',
    (fondo) => {
      expect(
        razonDeContraste(resolver(sel, '--pn-accent-text'), sobre(fondo)),
      ).toBeGreaterThanOrEqual(CONTRASTE_AA);
    },
  );

  it.each(['--pn-surface', '--pn-surface-3', '--pn-accent-2-soft'])(
    '--pn-accent-2-text se lee sobre %s',
    (fondo) => {
      expect(
        razonDeContraste(resolver(sel, '--pn-accent-2-text'), sobre(fondo)),
      ).toBeGreaterThanOrEqual(CONTRASTE_AA);
    },
  );

  // La pareja del botón primario, que es el control más repetido de la app.
  it('--pn-accent-ink se lee sobre el relleno de acento', () => {
    expect(
      razonDeContraste(resolver(sel, '--pn-accent-ink'), sobre('--pn-accent')),
    ).toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it('--pn-accent-2-ink se lee sobre el relleno de acento 2', () => {
    expect(
      razonDeContraste(resolver(sel, '--pn-accent-2-ink'), sobre('--pn-accent-2')),
    ).toBeGreaterThanOrEqual(CONTRASTE_AA);
  });
});

describe('el recuadro del logotipo de la barra lateral', () => {
  // Lleva `bg-pn-shell-ink text-pn-shell`, y no --pn-accent-text: ese se
  // aclara en tema oscuro justo cuando el recuadro sigue siendo claro, y la
  // letra se perdía (2.94:1). shell y shell-ink son pareja en los dos temas.
  it('la letra se lee sobre su recuadro en tema claro', () => {
    // --pn-shell: color-mix(in srgb, var(--pn-accent) 90%, #000000)
    const shell = mezclar(acentoPorDefecto(':root'), [0, 0, 0], 0.1);
    expect(razonDeContraste(shell, CLARO['--pn-shell-ink'])).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
  });

  it('la letra se lee sobre su recuadro en tema oscuro', () => {
    // --pn-shell: color-mix(in srgb, var(--pn-accent) 16%, #0a1120)
    const shell = mezclar(
      parsearHex('#0a1120')!,
      acentoPorDefecto("[data-theme='dark']"),
      0.16,
    );
    expect(razonDeContraste(shell, OSCURO['--pn-shell-ink'])).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
  });
});
