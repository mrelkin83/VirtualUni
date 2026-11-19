import { defineConfig, devices } from '@playwright/test';

/**
 * Fase 6 — pruebas de extremo a extremo.
 *
 * Vitest cubre el contrato de los componentes; esto cubre lo que solo se ve
 * con la aplicación entera en marcha, que además es donde más se rompió: el
 * ancho a 390 px y el contraste real de lo pintado. Esas dos auditorías se
 * hicieron a mano durante el módulo 7 y encontraron defectos que ni `tsc`, ni
 * el lint, ni jsdom podían ver.
 *
 * Necesita el backend y el seed de `uniprueba` levantados; si el frontend no
 * está en marcha, se arranca solo.
 */
export default defineConfig({
  testDir: './e2e',
  // Un fallo de layout no se arregla reintentando: si parpadea, es un dato.
  retries: 0,
  // El seed es compartido: dos pruebas escribiendo a la vez se estorban.
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'es-CO',
  },

  projects: [
    // Abre sesión una vez por rol. El login admite 10 intentos por minuto, así
    // que una sesión por prueba agotaba el cupo y colgaba la suite.
    { name: 'sesion', testMatch: /sesion\.setup\.ts/ },
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      dependencies: ['sesion'],
    },
    {
      // 390 px: el móvil estrecho más común y la medida contra la que se hizo
      // todo el módulo 7.
      name: 'movil-390',
      use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } },
      dependencies: ['sesion'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
