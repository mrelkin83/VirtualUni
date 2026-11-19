import { expect, test } from '@playwright/test';
import { BASE, rutaDeSesion, type Rol } from './apoyo';

/**
 * Capturas de línea base.
 *
 * Las otras pruebas miden cosas concretas —ancho, contraste, teclado—; estas
 * son la red para lo que no se sabe medir: un degradado que desaparece, una
 * tarjeta que se descoloca, un icono que se pierde. Cualquier diferencia
 * visible obliga a mirar la imagen y decidir si es mejora o avería.
 *
 * Para aceptar un cambio deliberado: `npm run test:e2e:capturas`.
 *
 * Ojo con el CI: Playwright guarda una imagen por plataforma (`-win32`,
 * `-linux`…) porque el texto no se dibuja igual en cada sistema. Las que hay
 * aquí se tomaron en Windows; un runner de Linux necesita las suyas, y
 * generarlas en la máquina equivocada deja una referencia que no sirve.
 */

const PANTALLAS: Record<Rol, string[]> = {
  admin: ['inicio', 'usuarios', 'finanzas'],
  docente: ['inicio', 'calendario'],
  estudiante: ['inicio', 'calificaciones', 'certificados'],
};

for (const rol of Object.keys(PANTALLAS) as Rol[]) {
  test.describe(rol, () => {
    test.use({ storageState: rutaDeSesion(rol) });

    for (const ruta of PANTALLAS[rol]) {
      test(`captura: ${rol} / ${ruta}`, async ({ page }) => {
        await page.goto(BASE[rol] + ruta);
        await page.locator('main').waitFor();
        // Esperar solo un rato fijo dejaba la captura a medio pintar en las
        // secciones que cargan datos. Pero la red tampoco se calla siempre
        // —finanzas mantiene peticiones vivas—, así que es una espera con
        // tope: si no se calma, se sigue igual.
        await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(600);

        // Playwright ya añade el proyecto y la plataforma al nombre.
        await expect(page).toHaveScreenshot(`${rol}-${ruta}.png`, {
          fullPage: true,
          // Las horas relativas («Hace 5 min») cambian solas: algo de holgura
          // evita un fallo diario que nadie va a mirar.
          maxDiffPixelRatio: 0.02,
          animations: 'disabled',
        });
      });
    }
  });
}
