/**
 * Tailwind SOLO del sitio público renderizado en servidor. No toca la SPA
 * (que tiene su propio build en la raíz del repo). Se compila con
 * `npm run css:sitio`, encadenado dentro de `npm run build` para que el
 * Dockerfile no cambie.
 */
module.exports = {
  content: ['./src/modules/public-site/templates/**/*.eta'],
  theme: {
    extend: {},
  },
  plugins: [],
};
