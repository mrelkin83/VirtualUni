import { test as setup } from '@playwright/test';
import { CUENTAS, entrar, rutaDeSesion, type Rol } from './apoyo';

/**
 * Abre sesión una vez por rol y guarda el estado para el resto de la suite.
 *
 * No es solo por velocidad: el login está limitado a 10 intentos por minuto
 * (`@Throttle` en `auth.controller.ts`). Con una sesión por prueba la suite se
 * pasaba de la cuenta, y las pruebas se quedaban colgadas 60 segundos
 * esperando una navegación que el servidor ya estaba rechazando. El límite
 * hace lo que debe; era la suite la que lo provocaba.
 */

for (const rol of Object.keys(CUENTAS) as Rol[]) {
  setup(`abrir sesión como ${rol}`, async ({ page }) => {
    await entrar(page, rol);
    await page.context().storageState({ path: rutaDeSesion(rol) });
  });
}
