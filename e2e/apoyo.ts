import type { Page } from '@playwright/test';

/**
 * Lo que comparten las pruebas de extremo a extremo.
 *
 * Los dos medidores de abajo salen de dos mediciones equivocadas durante el
 * módulo 7, y las dos fallaron diciendo «todo bien»: por eso viven aquí y no
 * copiados en cada archivo.
 */

export const TENANT = 'uniprueba';

/** Credenciales del seed local (`backend/prisma/seed.ts`). */
export const CUENTAS = {
  admin: { correo: 'admin@uniprueba.com', clave: 'Admin123!', inicio: '/admin/inicio' },
  docente: { correo: 'profesor1@uniprueba.com', clave: 'Profesor123!', inicio: '/docente/inicio' },
  estudiante: { correo: 'estudiante@uniprueba.com', clave: 'Estudiante123!', inicio: '/estudiante/inicio' },
} as const;

export type Rol = keyof typeof CUENTAS;

/** Las secciones alcanzables de cada rol, que son las del menú. */
export const RUTAS: Record<Rol, string[]> = {
  admin: ['inicio', 'academico', 'sitioweb', 'admisiones', 'inscripcion', 'plantillas', 'biblioteca', 'usuarios', 'recursoshumanos', 'carnetizacion', 'nomina', 'finanzas', 'activos', 'inventario', 'mensajes', 'mensajesmasivos', 'anuncios', 'tramites', 'documentos', 'integraciones', 'reportes', 'analiticas', 'configuracion'],
  docente: ['inicio', 'cursos', 'materiales', 'clases', 'tareas', 'examenes', 'calificaciones', 'asistencia', 'estudiantes', 'grupos', 'mensajes', 'calendario', 'analiticas', 'configuracion'],
  estudiante: ['inicio', 'miprograma', 'cursos', 'materiales', 'clases', 'tareas', 'examenes', 'calificaciones', 'horarios', 'biblioteca', 'comunidad', 'mensajes', 'certificados', 'tramites', 'financiero', 'perfil'],
};

export const BASE: Record<Rol, string> = {
  admin: '/admin/',
  docente: '/docente/',
  estudiante: '/estudiante/',
};

/** Dónde guarda `sesion.setup.ts` la sesión ya abierta de cada rol. */
export function rutaDeSesion(rol: Rol): string {
  return `e2e/.auth/${rol}.json`;
}

export async function entrar(page: Page, rol: Rol): Promise<void> {
  const cuenta = CUENTAS[rol];
  await page.goto(`/login?tenant=${TENANT}`);
  await page.locator('input[type=email]').fill(cuenta.correo);
  await page.locator('input[type=password]').fill(cuenta.clave);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.waitForURL(`**${cuenta.inicio}`);
  await page.locator('main').waitFor();
}

export interface Desborde {
  texto: string;
  exceso: number;
  clases: string;
}

/**
 * Elementos que se salen del ancho útil.
 *
 * Se mide contra la caja de contenido de `main`, NO contra el viewport: la
 * raíz del armazón es `overflow-hidden`, así que lo que se sale queda
 * recortado en lugar de ensanchar el documento. Medirlo contra el viewport
 * daba cero problemas en 23 rutas que sí desbordaban.
 *
 * Se perdona lo que viva dentro de algo con desplazamiento horizontal real:
 * las tablas anchas y las pestañas se desplazan a propósito.
 */
export async function desbordes(page: Page): Promise<Desborde[]> {
  return page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    const limite =
      main.getBoundingClientRect().right -
      parseFloat(getComputedStyle(main).paddingRight);

    const fuera: Array<{ texto: string; exceso: number; clases: string }> = [];
    for (const el of Array.from(main.querySelectorAll('*'))) {
      const caja = el.getBoundingClientRect();
      if (caja.width <= 0 || caja.right <= limite + 1) continue;

      let enScroll = false;
      for (let p = el.parentElement; p && p !== main; p = p.parentElement) {
        const ov = getComputedStyle(p).overflowX;
        if (ov === 'auto' || ov === 'scroll') {
          enScroll = true;
          break;
        }
      }
      if (enScroll) continue;

      fuera.push({
        texto: (el.textContent ?? '').trim().slice(0, 30),
        exceso: Math.round(caja.right - limite),
        clases: String((el as HTMLElement).className ?? '').slice(0, 60),
      });
    }
    return fuera.sort((a, b) => b.exceso - a.exceso);
  });
}

export interface FalloContraste {
  texto: string;
  razon: number;
  minimo: number;
  color: string;
}

/**
 * Textos que no llegan al contraste AA sobre su fondo real.
 *
 * Ojo con el color: `getComputedStyle` devuelve a veces
 * `color(srgb 0.89 0.92 0.98)` —flotantes de 0 a 1— en lugar de `rgb()` de 0
 * a 255. Tratarlos como 0..255 convierte un fondo claro en casi negro, lo que
 * inventa fallos en tema claro y, peor, los esconde en el oscuro.
 */
export async function fallosDeContraste(page: Page): Promise<FalloContraste[]> {
  return page.evaluate(() => {
    const aRgb = (valor: string): [number, number, number, number] | null => {
      const nums = (valor.match(/[\d.]+/g) ?? []).map(Number);
      if (nums.length < 3) return null;
      const escala = valor.startsWith('color(') ? 255 : 1;
      return [nums[0] * escala, nums[1] * escala, nums[2] * escala, nums[3] ?? 1];
    };
    const luminancia = ([r, g, b]: number[]) => {
      const f = (c: number) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const razon = (a: number[], b: number[]) => {
      const l1 = luminancia(a);
      const l2 = luminancia(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const fondoDe = (el: Element): number[] => {
      for (let p: Element | null = el; p; p = p.parentElement) {
        const c = aRgb(getComputedStyle(p).backgroundColor);
        if (c && c[3] > 0.95) return c;
      }
      return [255, 255, 255, 1];
    };

    const fallos: Array<{ texto: string; razon: number; minimo: number; color: string }> = [];
    for (const el of Array.from(document.querySelectorAll('main *, nav *, header *'))) {
      // Solo elementos con texto propio: si no, se mediría el del padre.
      const tieneTextoPropio = Array.from(el.childNodes).some(
        (n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 1,
      );
      if (!tieneTextoPropio) continue;

      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
      const color = aRgb(cs.color);
      if (!color || color[3] < 0.95) continue;

      const tam = parseFloat(cs.fontSize);
      const grande = tam >= 24 || (tam >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      const minimo = grande ? 3 : 4.5;
      const r = razon(color, fondoDe(el));
      if (r < minimo) {
        fallos.push({
          texto: (el.textContent ?? '').trim().slice(0, 30),
          razon: Number(r.toFixed(2)),
          minimo,
          color: cs.color,
        });
      }
    }
    // Un token mal elegido aparece en decenas de nodos; interesa el caso.
    return [...new Map(fallos.map((f) => [f.color + f.razon, f])).values()];
  });
}
