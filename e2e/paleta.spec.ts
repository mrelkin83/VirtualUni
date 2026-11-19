import { expect, test } from '@playwright/test';
import { BASE, rutaDeSesion } from './apoyo';

/**
 * La paleta de comandos y las salidas de teclado del módulo 7.
 *
 * En Vitest ya se prueba el componente aislado; aquí se comprueba que esté
 * enchufada de verdad en la aplicación: que el atajo llegue desde cualquier
 * sección y que al elegir se navegue.
 */

test.describe('admin', () => {
  test.use({ storageState: rutaDeSesion('admin') });

  test('se abre con Ctrl+K y navega a la sección elegida', async ({ page }) => {
    await page.goto(BASE.admin + 'inicio');
    await page.locator('main').waitFor();

    await page.keyboard.press('Control+k');
    const paleta = page.getByRole('dialog', { name: 'Ir a una sección' });
    await expect(paleta).toBeVisible();

    // Sin tilde: «nomina» tiene que encontrar «Nómina».
    await page.getByRole('combobox', { name: 'Ir a una sección' }).fill('nomina');
    await expect(paleta.getByRole('option')).toHaveCount(1);

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/admin\/nomina$/);
    await expect(paleta).toBeHidden();
  });
});

test.describe('docente', () => {
  test.use({ storageState: rutaDeSesion('docente') });

  test('se cierra con Escape sin navegar', async ({ page }) => {
    await page.goto(BASE.docente + 'inicio');
    await page.locator('main').waitFor();
    const antes = page.url();

    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog', { name: 'Ir a una sección' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Ir a una sección' })).toBeHidden();
    expect(page.url()).toBe(antes);
  });
});

test.describe('estudiante', () => {
  test.use({ storageState: rutaDeSesion('estudiante') });

  test('las flechas mueven la selección sin sacar el foco de la caja', async ({ page }) => {
    await page.goto(BASE.estudiante + 'inicio');
    await page.locator('main').waitFor();
    await page.keyboard.press('Control+k');

    const caja = page.getByRole('combobox', { name: 'Ir a una sección' });
    await expect(caja).toBeFocused();
    await expect(caja).toHaveAttribute('aria-activedescendant', 'paleta-opcion-0');

    await page.keyboard.press('ArrowDown');
    await expect(caja).toHaveAttribute('aria-activedescendant', 'paleta-opcion-1');
    await expect(caja).toBeFocused();
  });

  test('el panel de notificaciones se cierra con Escape', async ({ page }) => {
    await page.goto(BASE.estudiante + 'inicio');
    await page.locator('main').waitFor();

    // Hasta el módulo 7 solo se cerraba con el ratón: sin salida por teclado.
    await page.getByRole('button', { name: /notificaciones/i }).first().click();
    // El encabezado está siempre; «marcar todas como leídas» solo si hay sin leer.
    const panel = page.getByRole('heading', { name: 'Notificaciones', level: 3 });
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });
});
