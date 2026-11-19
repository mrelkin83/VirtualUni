/**
 * Tema compartido de las gráficas.
 *
 * Las tres traían sus propios hexadecimales a mano (#3B82F6, #10B981,
 * #E5E7EB…), así que en tema oscuro quedaban con rejilla clara y ejes grises
 * sobre fondo negro, y el color del tenant no las alcanzaba.
 *
 * Aquí todo apunta a tokens. Funciona porque los atributos SVG `stroke`,
 * `fill` y `stopColor` admiten `var()` igual que cualquier propiedad CSS, así
 * que la gráfica cambia con el tema sin volver a renderizarse.
 */

/** Paleta de series. El acento primero: la serie principal es la de la marca. */
export const SERIES = [
  'var(--pn-accent)',
  'var(--pn-ok)',
  'var(--pn-accent-2)',
  'var(--pn-info)',
  'var(--pn-warn)',
  'var(--pn-danger)',
] as const;

export const colorSerie = (i: number) => SERIES[i % SERIES.length];

/** Ejes: texto atenuado y monoespaciado, que es donde viven las cifras. */
export const EJE = {
  stroke: 'var(--pn-muted)',
  tick: {
    fill: 'var(--pn-muted)',
    fontSize: 11,
    fontFamily: 'var(--pn-font-mono)',
  },
  tickLine: false,
  axisLine: { stroke: 'var(--pn-line)' },
} as const;

/** Rejilla: solo horizontal y de un píxel. Las verticales no aportan nada. */
export const REJILLA = {
  stroke: 'var(--pn-line)',
  strokeDasharray: '3 3',
  vertical: false,
} as const;

export const TOOLTIP = {
  contentStyle: {
    backgroundColor: 'var(--pn-surface)',
    border: '1px solid var(--pn-line)',
    borderRadius: 'var(--pn-r-sm)',
    boxShadow: 'var(--pn-shadow-pop)',
    fontFamily: 'var(--pn-font-body)',
    fontSize: '12.5px',
    color: 'var(--pn-ink)',
  },
  labelStyle: {
    color: 'var(--pn-ink)',
    fontWeight: 600,
    marginBottom: 2,
  },
  itemStyle: { color: 'var(--pn-ink-2)' },
} as const;

export const LEYENDA = {
  wrapperStyle: {
    paddingTop: 14,
    fontFamily: 'var(--pn-font-body)',
    fontSize: '12.5px',
    color: 'var(--pn-ink-2)',
  },
  iconType: 'circle' as const,
  iconSize: 9,
};
