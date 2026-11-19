import { expect, test } from '@playwright/test';
import { BASE, fallosDeContraste, rutaDeSesion, type Rol } from './apoyo';

/**
 * Contraste AA de lo que de verdad se pinta, en los dos temas.
 *
 * Las pruebas de `src/theme/contrasteTokens.test.ts` miden los tokens; esto
 * mide el resultado, que es distinto: el color de marca del tenant se calcula
 * en caliente con `aplicarAcento()` y puede acabar sobre un fondo que nadie
 * previó. El tema se cambia con el conmutador de la cabecera, no escribiendo
 * `data-theme` a mano: a mano no se recalcula el acento y sale un resultado
 * que no le ocurre a ningún usuario.
 */

// Una muestra ancha de cada rol; recorrer las 53 en dos temas no aporta más.
const MUESTRA: Record<Rol, string[]> = {
  admin: ['inicio', 'usuarios', 'finanzas', 'academico'],
  docente: ['inicio', 'cursos', 'calificaciones', 'calendario'],
  estudiante: ['inicio', 'calificaciones', 'certificados', 'financiero'],
};

for (const rol of Object.keys(MUESTRA) as Rol[]) {
  test.describe(rol, () => {
    test.use({ storageState: rutaDeSesion(rol) });

    for (const tema of ['claro', 'oscuro'] as const) {
      test(`${rol}: el texto se lee en tema ${tema}`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.goto(BASE[rol] + MUESTRA[rol][0]);
        await page.locator('main').waitFor();

        if (tema === 'oscuro') {
          await page.getByRole('button', { name: /tema oscuro/i }).click();
          await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        }

        const fallos: Array<{ ruta: string; casos: unknown }> = [];
        for (const ruta of MUESTRA[rol]) {
          await page.goto(BASE[rol] + ruta);
          await page.locator('main').waitFor();
          await page.waitForTimeout(350);

          const casos = await fallosDeContraste(page);
          if (casos.length) fallos.push({ ruta, casos });
        }

        expect(
          fallos,
          `textos por debajo de AA:\n${JSON.stringify(fallos, null, 2)}`,
        ).toEqual([]);
      });
    }
  });
}
