/**
 * Backfill de contenido maestro (fase 4 de la estructura académica).
 *
 * Mueve el temario, las carpetas y los materiales existentes de un grupo a su
 * Subject SOLO cuando esa Subject tiene un único grupo (no hay ambigüedad
 * sobre de quién es el contenido). Si la asignatura se dicta en varios
 * grupos, el contenido se queda en cada grupo y se reporta para que el admin
 * decida qué promover.
 *
 * IDEMPOTENTE: lo movido deja de tener courseId, así que una segunda pasada
 * no encuentra nada que mover. No borra ni duplica nada.
 *
 * CÓMO CORRERLO (desde backend/):
 *   npx ts-node prisma/scripts/backfill-contenido-maestro.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resumen = {
  asignaturasProcesadas: 0,
  temasMovidos: 0,
  carpetasMovidas: 0,
  materialesMovidos: 0,
  asignaturasConVariosGrupos: [] as string[],
};

async function procesarTenant(tenantId: string, slug: string) {
  console.log(`\n→ tenant ${slug}`);

  const subjects = await prisma.subject.findMany({
    where: { tenantId },
    select: {
      id: true,
      code: true,
      courses: { select: { id: true } },
    },
  });

  for (const subject of subjects) {
    if (subject.courses.length === 0) continue;

    if (subject.courses.length > 1) {
      resumen.asignaturasConVariosGrupos.push(`${slug}/${subject.code}`);
      continue;
    }

    const courseId = subject.courses[0].id;

    const [temas, carpetas, materiales] = await prisma.$transaction([
      prisma.courseTopic.updateMany({
        where: { tenantId, courseId },
        data: { subjectId: subject.id, courseId: null },
      }),
      prisma.materialFolder.updateMany({
        where: { tenantId, courseId },
        data: { subjectId: subject.id, courseId: null },
      }),
      prisma.material.updateMany({
        where: { tenantId, courseId },
        data: { subjectId: subject.id, courseId: null },
      }),
    ]);

    resumen.asignaturasProcesadas++;
    resumen.temasMovidos += temas.count;
    resumen.carpetasMovidas += carpetas.count;
    resumen.materialesMovidos += materiales.count;
  }
}

async function main() {
  const tenants = await prisma.tenant.findMany({ select: { id: true, slug: true } });
  console.log(`Backfill de contenido maestro sobre ${tenants.length} tenant(s)...`);

  for (const tenant of tenants) {
    await procesarTenant(tenant.id, tenant.slug);
  }

  console.log('\n===== RESUMEN =====');
  console.log(JSON.stringify(resumen, null, 2));
  if (resumen.asignaturasConVariosGrupos.length > 0) {
    console.log(
      '\nEl contenido de las asignaturas listadas arriba quedó en sus grupos ' +
        '(varios grupos por asignatura): promuévalo desde la UI cuando el ' +
        'admin decida cuál es el canónico.',
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
