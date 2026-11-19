import { expect, test } from '@playwright/test';
import { BASE, RUTAS, desbordes, rutaDeSesion, type Rol } from './apoyo';

/**
 * El módulo 7 arregló 53 rutas que se salían de una pantalla de 390 px. Esto
 * vigila que no vuelvan a salirse: es la clase de defecto que nadie nota
 * revisando en un portátil y que en el móvil deja botones fuera de alcance.
 *
 * Solo corre en el proyecto de 390 px; en escritorio no prueba nada.
 */

for (const rol of Object.keys(RUTAS) as Rol[]) {
  test.describe(rol, () => {
    test.use({ storageState: rutaDeSesion(rol) });

    test(`ninguna sección de ${rol} se sale de 390 px`, async ({ page }, info) => {
      test.skip(info.project.name !== 'movil-390', 'solo tiene sentido en móvil');
      test.setTimeout(180_000);

      const culpables: Array<{ ruta: string; total: number; peor: unknown }> = [];
      for (const ruta of RUTAS[rol]) {
        await page.goto(BASE[rol] + ruta);
        await page.locator('main').waitFor();
        // Deja asentar la primera pintada: las tarjetas entran con transición.
        await page.waitForTimeout(350);

        const fuera = await desbordes(page);
        if (fuera.length) culpables.push({ ruta, total: fuera.length, peor: fuera[0] });
      }

      expect(
        culpables,
        `secciones que desbordan:\n${JSON.stringify(culpables, null, 2)}`,
      ).toEqual([]);
    });
  });
}
