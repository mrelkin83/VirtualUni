import { Plan } from '@prisma/client';
import {
  CATALOGO_DE_PLANES,
  obtenerLimitesDePlan,
  obtenerPrecioCop,
} from './plan-catalog';

/** De menor a mayor. El orden del enum de Prisma no garantiza esto por si solo. */
const PLANES_ASCENDENTES: Plan[] = [
  Plan.FREE,
  Plan.BASIC,
  Plan.PROFESSIONAL,
  Plan.ENTERPRISE,
];

describe('CATALOGO_DE_PLANES', () => {
  it('cubre todos los planes del enum de Prisma', () => {
    // Si se agrega un plan al schema y no al catalogo, obtenerLimitesDePlan
    // devolveria undefined y el spread en el `data` de Prisma no escribiria
    // ningun cupo, en silencio. El tipo Record<Plan, ...> ya lo impide al
    // compilar; esto lo cubre tambien en ejecucion.
    expect(Object.keys(CATALOGO_DE_PLANES).sort()).toEqual(
      Object.values(Plan).sort(),
    );
    expect(PLANES_ASCENDENTES).toHaveLength(Object.values(Plan).length);
  });

  it('solo FREE es gratuito; el resto tiene precio', () => {
    // createCheckoutSession rechaza con BadRequestException cualquier plan de
    // precio nulo, asi que un plan de pago sin precio seria imposible de
    // contratar.
    expect(obtenerPrecioCop(Plan.FREE)).toBeNull();

    for (const plan of PLANES_ASCENDENTES.filter((p) => p !== Plan.FREE)) {
      expect(obtenerPrecioCop(plan)).toBeGreaterThan(0);
    }
  });

  it('no reduce cupos ni precio al subir de plan', () => {
    // Invariante de negocio: pagar mas nunca puede dar menos.
    for (let i = 1; i < PLANES_ASCENDENTES.length; i++) {
      const anterior = obtenerLimitesDePlan(PLANES_ASCENDENTES[i - 1]);
      const actual = obtenerLimitesDePlan(PLANES_ASCENDENTES[i]);

      expect(actual.maxStudents).toBeGreaterThanOrEqual(anterior.maxStudents);
      expect(actual.maxTeachers).toBeGreaterThanOrEqual(anterior.maxTeachers);
      expect(actual.maxCourses).toBeGreaterThanOrEqual(anterior.maxCourses);
      expect(actual.storageGB).toBeGreaterThanOrEqual(anterior.storageGB);

      expect(obtenerPrecioCop(PLANES_ASCENDENTES[i]) ?? 0).toBeGreaterThanOrEqual(
        obtenerPrecioCop(PLANES_ASCENDENTES[i - 1]) ?? 0,
      );
    }
  });

  it('devuelve una copia, no la referencia del catalogo', () => {
    // El objeto va directo al `data` de un update de Prisma. Si fuera la
    // referencia, una mutacion accidental cambiaria los cupos de todos los
    // tenants que se tocaran despues en el mismo proceso.
    const limites = obtenerLimitesDePlan(Plan.BASIC);
    limites.maxStudents = 1;

    expect(obtenerLimitesDePlan(Plan.BASIC).maxStudents).toBe(
      CATALOGO_DE_PLANES[Plan.BASIC].limites.maxStudents,
    );
    expect(CATALOGO_DE_PLANES[Plan.BASIC].limites.maxStudents).not.toBe(1);
  });
});
