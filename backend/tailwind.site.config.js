/**
 * Tailwind SOLO del sitio público renderizado en servidor. No toca la SPA
 * (que tiene su propio build en la raíz del repo). Se compila con
 * `npm run css:sitio`, encadenado dentro de `npm run build` para que el
 * Dockerfile no cambie.
 */
module.exports = {
  content: ['./src/modules/public-site/templates/**/*.eta'],
  theme: {
    extend: {
      // Tipografía del sistema «cartel» (DESIGN.md del módulo): Anton para la
      // cartelería en mayúsculas, Hanken Grotesk para interfaz y cuerpo, y
      // Plex Mono —heredada del campus— para todo dato duro (fechas, códigos,
      // precios, cupos).
      fontFamily: {
        cartel: ['Anton', '"Arial Narrow"', 'system-ui', 'sans-serif'],
        display: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
