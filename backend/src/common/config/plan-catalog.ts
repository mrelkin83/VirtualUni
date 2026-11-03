import { Plan } from '@prisma/client';

/**
 * Fuente única de verdad de los planes: cupos, features y precio.
 *
 * Antes esto vivía duplicado en dos sitios que había que mantener a mano en
 * sintonía:
 *
 *  - `TenantsService.getPlanLimits()`, que es lo que de verdad se ESCRIBE en la
 *    fila del tenant al crearlo o al cambiarle el plan.
 *  - `BillingService.getPlans()` + `PLAN_PRICES_COP`, que es lo que se MUESTRA
 *    en el catálogo y lo que se cobra por Wompi.
 *
 * Dos copias de la misma tabla, con nombres de campo distintos (`maxStudents`
 * frente a `students`) y sin nada que las ligara: cambiar una y olvidar la otra
 * dejaba el catálogo prometiendo cupos que el tenant nunca recibía, y ningún
 * test fallaba. Ahora ambas derivan de `CATALOGO_DE_PLANES`.
 */

/** Cupos y features de un plan, con los nombres de campo del modelo Tenant. */
export interface LimitesDePlan {
  maxStudents: number;
  maxTeachers: number;
  maxCourses: number;
  storageGB: number;
  enableMessaging: boolean;
  enableVideoConf: boolean;
  enablePayments: boolean;
  enableCertificates: boolean;
}

export interface DefinicionDePlan {
  /** Nombre para mostrar en el catálogo. */
  displayName: string;
  /**
   * Monto mensual en COP, o `null` si el plan no se cobra.
   *
   * Es un placeholder de negocio (no tengo el precio real) — ajustar aquí
   * cuando se defina. `createCheckoutSession` rechaza cualquier plan cuyo
   * precio sea `null`.
   */
  precioCop: number | null;
  limites: LimitesDePlan;
}

export const CATALOGO_DE_PLANES: Record<Plan, DefinicionDePlan> = {
  [Plan.FREE]: {
    displayName: 'Free',
    precioCop: null,
    limites: {
      maxStudents: 20,
      maxTeachers: 2,
      maxCourses: 5,
      storageGB: 1,
      enableMessaging: true,
      enableVideoConf: false,
      enablePayments: false,
      enableCertificates: false,
    },
  },
  [Plan.BASIC]: {
    displayName: 'Basic',
    precioCop: 120_000,
    limites: {
      maxStudents: 100,
      maxTeachers: 10,
      maxCourses: 20,
      storageGB: 10,
      enableMessaging: true,
      enableVideoConf: true,
      enablePayments: false,
      enableCertificates: true,
    },
  },
  [Plan.PROFESSIONAL]: {
    displayName: 'Professional',
    precioCop: 400_000,
    limites: {
      maxStudents: 500,
      maxTeachers: 50,
      maxCourses: 100,
      storageGB: 50,
      enableMessaging: true,
      enableVideoConf: true,
      enablePayments: true,
      enableCertificates: true,
    },
  },
  [Plan.ENTERPRISE]: {
    displayName: 'Enterprise',
    precioCop: 1_200_000,
    limites: {
      maxStudents: 999999,
      maxTeachers: 999999,
      maxCourses: 999999,
      storageGB: 500,
      enableMessaging: true,
      enableVideoConf: true,
      enablePayments: true,
      enableCertificates: true,
    },
  },
};

/**
 * Cupos y features del plan, listos para pasar al `data` de un create/update de
 * Prisma.
 *
 * Devuelve una copia: el objeto va directo a Prisma, y entregar la referencia
 * del catálogo permitiría que una mutación accidental cambiara los límites de
 * todos los tenants que se tocaran después en el mismo proceso.
 */
export function obtenerLimitesDePlan(plan: Plan): LimitesDePlan {
  return { ...CATALOGO_DE_PLANES[plan].limites };
}

/** Precio mensual en COP, o `null` si el plan no se cobra. */
export function obtenerPrecioCop(plan: Plan): number | null {
  return CATALOGO_DE_PLANES[plan].precioCop;
}
