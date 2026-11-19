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
      // Tipografía del sistema «Horizonte Académico» (DESIGN.md del módulo):
      // Plus Jakarta Sans para titulares, Inter para cuerpo. Plex Mono se
      // conserva del campus para todo dato duro (fechas, códigos, precios).
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
