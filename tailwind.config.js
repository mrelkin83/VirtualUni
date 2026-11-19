/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Ya no queda ninguna variante `dark:*` en el código: el tema entero se
  // resuelve con tokens que se redefinen bajo [data-theme='dark'] (ver
  // src/index.css). Se apunta el selector a ese mismo atributo para que, si
  // algún día hace falta un `dark:` suelto, funcione; con 'class' habría
  // quedado inerte sin avisar, que es justo como murieron las 331 anteriores.
  darkMode: ['selector', "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        // Paleta heredada. No se toca: la usan los estilos actuales.
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Tokens de Pensum. Se exponen como utilidades `pn-*`
        // (bg-pn-surface, text-pn-ink, border-pn-line, ...).
        //
        // Nota: al ser hex dentro de var(), estos tokens NO admiten el
        // modificador de opacidad de Tailwind (bg-pn-surface/50). Es a
        // propósito: el formato hex es lo que permite derivar el acento con
        // color-mix(), que es lo que hace viable el multi-tenant. Donde haga
        // falta transparencia, usar color-mix en CSS.
        pn: {
          ground: 'var(--pn-ground)',
          surface: 'var(--pn-surface)',
          'surface-2': 'var(--pn-surface-2)',
          'surface-3': 'var(--pn-surface-3)',
          ink: 'var(--pn-ink)',
          'ink-2': 'var(--pn-ink-2)',
          muted: 'var(--pn-muted)',
          line: 'var(--pn-line)',
          'line-strong': 'var(--pn-line-strong)',
          accent: 'var(--pn-accent)',
          'accent-ink': 'var(--pn-accent-ink)',
          'accent-text': 'var(--pn-accent-text)',
          'accent-soft': 'var(--pn-accent-soft)',
          'accent-line': 'var(--pn-accent-line)',
          'accent-hover': 'var(--pn-accent-hover)',
          'accent-2': 'var(--pn-accent-2)',
          'accent-2-ink': 'var(--pn-accent-2-ink)',
          'accent-2-text': 'var(--pn-accent-2-text)',
          'accent-2-soft': 'var(--pn-accent-2-soft)',
          shell: 'var(--pn-shell)',
          'shell-2': 'var(--pn-shell-2)',
          'shell-ink': 'var(--pn-shell-ink)',
          'shell-muted': 'var(--pn-shell-muted)',
          'shell-line': 'var(--pn-shell-line)',
          'shell-activo': 'var(--pn-shell-activo)',
          'shell-activo-ink': 'var(--pn-shell-activo-ink)',
          ok: 'var(--pn-ok)',
          'ok-soft': 'var(--pn-ok-soft)',
          warn: 'var(--pn-warn)',
          'warn-soft': 'var(--pn-warn-soft)',
          danger: 'var(--pn-danger)',
          'danger-soft': 'var(--pn-danger-soft)',
          info: 'var(--pn-info)',
          'info-soft': 'var(--pn-info-soft)',
          stale: 'var(--pn-stale)',
        },
      },
      // Claves nuevas: `sans` se deja intacta para no cambiar la tipografía de
      // ninguna pantalla existente. Las primitivas usan font-display/body/mono.
      fontFamily: {
        display: 'var(--pn-font-display)',
        body: 'var(--pn-font-body)',
        mono: 'var(--pn-font-mono)',
      },
      borderRadius: {
        'pn-sm': 'var(--pn-r-sm)',
        'pn-md': 'var(--pn-r-md)',
        'pn-lg': 'var(--pn-r-lg)',
      },
      boxShadow: {
        'pn-pop': 'var(--pn-shadow-pop)',
      },
      transitionTimingFunction: {
        'pn-ease': 'var(--pn-ease)',
        'pn-spring': 'var(--pn-spring)',
      },
      transitionDuration: {
        'pn-fast': 'var(--pn-t-fast)',
        'pn-mid': 'var(--pn-t-mid)',
        'pn-slow': 'var(--pn-t-slow)',
      },
    },
  },
  plugins: [],
}
