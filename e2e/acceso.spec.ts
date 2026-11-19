import { expect, test } from '@playwright/test';
import { CUENTAS, entrar, type Rol } from './apoyo';

/**
 * Lo más básico que puede romperse sin que nadie se entere: que cada rol
 * entre y aterrice en su panel. Si esto falla, el resto de la suite miente.
 */

const ROLES = Object.keys(CUENTAS) as Rol[];

for (const rol of ROLES) {
  test(`${rol} entra y aterriza en su panel`, async ({ page }) => {
    await entrar(page, rol);
    await expect(page).toHaveURL(new RegExp(`${CUENTAS[rol].inicio}$`));
    await expect(page.getByRole('navigation', { name: 'Secciones' })).toBeVisible();
  });
}

test('una contraseña equivocada no deja pasar', async ({ page }) => {
  await page.goto('/login?tenant=uniprueba');
  await page.locator('input[type=email]').fill(CUENTAS.admin.correo);
  await page.locator('input[type=password]').fill('no-es-la-clave');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Sigue en el login: lo que importa es que NO entre.
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('main')).toHaveCount(0);
});
