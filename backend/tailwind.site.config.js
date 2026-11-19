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
      // La misma familia tipográfica del campus (index.html de la SPA):
      // Archivo para titulares, IBM Plex Sans para interfaz y Plex Mono para
      // todo dato (fechas, códigos, precios, cupos). Una sola marca.
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
