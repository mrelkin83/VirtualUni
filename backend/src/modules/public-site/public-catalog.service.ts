import { Injectable } from '@nestjs/common';
import { AdmissionCallStatus, EducationLevel, Prisma, StudyPlanStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CATEGORIA_POR_NIVEL,
  CategoriaPublica,
  ETIQUETA_CATEGORIA,
  ETIQUETA_MODALIDAD,
  ETIQUETA_NIVEL,
  nombreNivelPensum,
  rotuloIdentificador,
  rotuloOtorga,
  textoDuracion,
  textoOtorga,
} from './textos-institucion';

export interface FiltrosOferta {
  categoria?: string;
  modalidad?: string;
  area?: string;
  q?: string;
}

export interface TarjetaPrograma {
  slug: string;
  nombre: string;
  nivelEtiqueta: string;
  categoria: CategoriaPublica;
  descripcionCorta: string;
  duracion: string;
  modalidad: string;
  area: string | null;
  imageUrl: string | null;
  esNuevo: boolean;
  inscripcionesAbiertas: boolean;
  tuitionDisplay: string | null;
}

/**
 * Catálogo público. Regla API-first (§2): aquí vive la lógica; los
 * controladores HTML, el widget y la API pública solo la llaman. Este
 * servicio no sabe quién lo invoca y únicamente expone programas con
 * isPublished y estado ACTIVO del tenant que le pasan.
 */
@Injectable()
export class PublicCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  private whereBase(tenantId: string): Prisma.ProgramWhereInput {
    return { tenantId, isPublished: true, status: 'ACTIVO' };
  }

  llamadaAbierta(c: { status: AdmissionCallStatus; opensAt: Date; closesAt: Date | null; rolling: boolean }): boolean {
    const ahora = new Date();
    return (
      c.status === AdmissionCallStatus.ABIERTA &&
      c.opensAt <= ahora &&
      (c.rolling || !c.closesAt || c.closesAt >= ahora)
    );
  }

  /** Categorías con programas publicados, renombradas/ocultadas por el tenant. */
  async categorias(tenantId: string, levelLabels?: unknown) {
    const programas = await this.prisma.program.findMany({
      where: this.whereBase(tenantId),
      select: { educationLevel: true },
    });
    const conteo = new Map<CategoriaPublica, number>();
    for (const p of programas) {
      const c = CATEGORIA_POR_NIVEL[p.educationLevel];
      conteo.set(c, (conteo.get(c) || 0) + 1);
    }
    const overrides = (levelLabels || {}) as Record<string, { label?: string; hidden?: boolean }>;
    return [...conteo.entries()]
      .filter(([slug]) => !overrides[slug]?.hidden)
      .map(([slug, count]) => ({
        slug,
        label: overrides[slug]?.label || ETIQUETA_CATEGORIA[slug],
        count,
      }));
  }

  async modalidades(tenantId: string) {
    const filas = await this.prisma.program.findMany({
      where: this.whereBase(tenantId),
      select: { modality: true },
      distinct: ['modality'],
    });
    return filas.map((f) => ({ slug: f.modality.toLowerCase(), label: ETIQUETA_MODALIDAD[f.modality] }));
  }

  async areas(tenantId: string) {
    const filas = await this.prisma.program.findMany({
      where: { ...this.whereBase(tenantId), area: { not: null } },
      select: { area: true },
      distinct: ['area'],
      orderBy: { area: 'asc' },
    });
    return filas.map((f) => f.area as string);
  }

  async listar(tenantId: string, filtros: FiltrosOferta): Promise<TarjetaPrograma[]> {
    const where = this.whereBase(tenantId);
    if (filtros.modalidad) where.modality = filtros.modalidad.toUpperCase() as never;
    if (filtros.area) where.area = filtros.area;
    if (filtros.q) {
      where.OR = [
        { name: { contains: filtros.q, mode: 'insensitive' } },
        { shortDescription: { contains: filtros.q, mode: 'insensitive' } },
        { area: { contains: filtros.q, mode: 'insensitive' } },
      ];
    }
    if (filtros.categoria) {
      const niveles = (Object.keys(CATEGORIA_POR_NIVEL) as EducationLevel[]).filter(
        (n) => CATEGORIA_POR_NIVEL[n] === filtros.categoria,
      );
      where.educationLevel = { in: niveles };
    }

    const programas = await this.prisma.program.findMany({
      where,
      orderBy: [{ area: 'asc' }, { name: 'asc' }],
      include: {
        admissionCalls: {
          where: { status: AdmissionCallStatus.ABIERTA },
          select: { status: true, opensAt: true, closesAt: true, rolling: true },
        },
      },
    });

    const ahora = new Date();
    return programas.map((p) => ({
      slug: p.slug as string,
      nombre: p.name,
      nivelEtiqueta: ETIQUETA_NIVEL[p.educationLevel],
      categoria: CATEGORIA_POR_NIVEL[p.educationLevel],
      descripcionCorta: p.shortDescription || '',
      duracion: textoDuracion(p),
      modalidad: ETIQUETA_MODALIDAD[p.modality],
      area: p.area,
      imageUrl: p.imageUrl,
      esNuevo: !!p.isNewUntil && p.isNewUntil > ahora,
      inscripcionesAbiertas: p.admissionCalls.some((c) => this.llamadaAbierta(c)),
      tuitionDisplay: p.tuitionDisplay,
    }));
  }

  /** Directorio completo agrupado por área (la referencia lo lista debajo de las tarjetas). */
  async directorio(tenantId: string) {
    const tarjetas = await this.listar(tenantId, {});
    const grupos = new Map<string, TarjetaPrograma[]>();
    for (const t of tarjetas) {
      const area = t.area || 'Otros programas';
      if (!grupos.has(area)) grupos.set(area, []);
      (grupos.get(area) as TarjetaPrograma[]).push(t);
    }
    return [...grupos.entries()].map(([area, programas]) => ({ area, programas }));
  }

  /** Ficha completa del programa, o null (el controlador responde 404 genérico). */
  async ficha(tenantId: string, slug: string) {
    const p = await this.prisma.program.findFirst({
      where: { ...this.whereBase(tenantId), slug },
      include: {
        admissionCalls: {
          where: { status: AdmissionCallStatus.ABIERTA },
          orderBy: { opensAt: 'asc' },
          include: { requiredDocuments: true },
        },
        studyPlans: {
          where: { status: StudyPlanStatus.VIGENTE },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            blocks: { orderBy: { orderIndex: 'asc' } },
            subjects: {
              orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }],
              include: { subject: { select: { name: true, credits: true, hours: true } } },
            },
          },
        },
      },
    });
    if (!p) return null;

    const ahora = new Date();
    const plan = p.studyPlans[0] || null;

    // Pensum público: SOLO nombres por nivel y su medida. Nada de docentes,
    // grupos ni notas (§4).
    const niveles = new Map<number, { nombre: string; asignaturas: { nombre: string; medida: string | null }[] }>();
    if (plan) {
      for (const fila of plan.subjects) {
        if (!niveles.has(fila.level)) {
          niveles.set(fila.level, {
            nombre: nombreNivelPensum(p.periodStructure, p.educationLevel, fila.level),
            asignaturas: [],
          });
        }
        const creditos = fila.credits ?? fila.subject.credits;
        const horas = fila.hours ?? fila.subject.hours;
        (niveles.get(fila.level) as { asignaturas: { nombre: string; medida: string | null }[] }).asignaturas.push({
          nombre: fila.subject.name,
          medida:
            p.academicUnit === 'HORAS'
              ? horas ? `${horas} h` : null
              : creditos ? `${creditos} cr.` : null,
        });
      }
    }

    const convocatorias = p.admissionCalls
      .filter((c) => this.llamadaAbierta(c))
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        rolling: c.rolling,
        startsAt: c.startsAt,
        closesAt: c.closesAt,
        schedule: c.schedule,
        applicationFee: c.applicationFee,
        minAge: c.minAge,
        minEducation: c.minEducation,
        targetLevels: c.targetLevels as { level: number; label: string; capacity?: number }[] | null,
        requiredDocuments: c.requiredDocuments.map((d) => ({ name: d.name, required: d.required })),
      }));

    return {
      programa: p,
      nivelEtiqueta: ETIQUETA_NIVEL[p.educationLevel],
      categoria: CATEGORIA_POR_NIVEL[p.educationLevel],
      modalidadEtiqueta: ETIQUETA_MODALIDAD[p.modality],
      duracion: textoDuracion(p),
      otorgaRotulo: rotuloOtorga(p.educationLevel),
      otorgaTexto: textoOtorga(p.educationLevel, p.degreeTitle),
      identificadorRotulo: rotuloIdentificador(p.educationLevel),
      esNuevo: !!p.isNewUntil && p.isNewUntil > ahora,
      pensum: [...niveles.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v),
      bloques: plan ? plan.blocks.filter((b) => b.certifiable).map((b) => ({ nombre: b.name, descripcion: b.description })) : [],
      convocatorias,
      articulacion: await this.articulacion(tenantId, p.id, plan?.id ?? null),
      faq: (p.faq as { q: string; a: string }[] | null) || [],
    };
  }

  /**
   * "Con este programa avanzas X% en…": por cada otro programa publicado, el
   * porcentaje de su pensum vigente cubierto por las asignaturas de este
   * (misma Subject o equivalencia aprobada). Se muestran los 3 mejores ≥ 10%.
   */
  private async articulacion(tenantId: string, programId: string, planId: string | null) {
    if (!planId) return [];
    const propias = await this.prisma.studyPlanSubject.findMany({
      where: { studyPlanId: planId },
      select: { subjectId: true },
    });
    if (propias.length === 0) return [];
    const propiasIds = new Set(propias.map((s) => s.subjectId));

    const equivalencias = await this.prisma.subjectEquivalence.findMany({
      where: { tenantId, sourceSubjectId: { in: [...propiasIds] } },
      select: { targetSubjectId: true },
    });
    const cubiertas = new Set([...propiasIds, ...equivalencias.map((e) => e.targetSubjectId)]);

    const otros = await this.prisma.program.findMany({
      where: { ...this.whereBase(tenantId), id: { not: programId } },
      select: {
        name: true,
        slug: true,
        studyPlans: {
          where: { status: StudyPlanStatus.VIGENTE },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { subjects: { select: { subjectId: true } } },
        },
      },
    });

    const resultado: { nombre: string; slug: string; pct: number }[] = [];
    for (const o of otros) {
      const plan = o.studyPlans[0];
      if (!plan || plan.subjects.length === 0) continue;
      const total = plan.subjects.length;
      const avanza = plan.subjects.filter((s) => cubiertas.has(s.subjectId)).length;
      const pct = Math.round((avanza / total) * 100);
      if (pct >= 10) resultado.push({ nombre: o.name, slug: o.slug as string, pct });
    }
    return resultado.sort((a, b) => b.pct - a.pct).slice(0, 3);
  }

  /** Convocatorias abiertas del tenant, para la portada. */
  async convocatoriasAbiertas(tenantId: string) {
    const calls = await this.prisma.admissionCall.findMany({
      where: { tenantId, status: AdmissionCallStatus.ABIERTA },
      orderBy: [{ rolling: 'desc' }, { closesAt: 'asc' }],
      include: { program: { select: { name: true, slug: true, isPublished: true, educationLevel: true } } },
    });
    return calls
      .filter((c) => this.llamadaAbierta(c) && c.program.isPublished)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        programa: c.program.name,
        programaSlug: c.program.slug as string,
        rolling: c.rolling,
        closesAt: c.closesAt,
        startsAt: c.startsAt,
      }));
  }

  /**
   * Oferta agrupada por categoría pública para la portada: una institución
   * mixta (técnicos + bachillerato, o pregrado + ETDH) muestra cada nivel como
   * bloque propio en vez de una sola parrilla indistinta.
   */
  async ofertaPorCategoria(tenantId: string, levelLabels?: unknown) {
    const [cats, tarjetas] = await Promise.all([
      this.categorias(tenantId, levelLabels),
      this.listar(tenantId, {}),
    ]);
    return cats.map((c) => ({
      ...c,
      programas: tarjetas.filter((t) => t.categoria === c.slug).slice(0, 6),
    }));
  }

  /** Páginas institucionales publicadas, agrupadas para el menú. */
  async paginasMenu(tenantId: string) {
    const paginas = await this.prisma.sitePage.findMany({
      where: { tenantId, isPublished: true },
      orderBy: [{ menuGroup: 'asc' }, { order: 'asc' }, { title: 'asc' }],
      select: { slug: true, title: true, menuGroup: true },
    });
    const grupos = new Map<string, { slug: string; title: string }[]>();
    for (const p of paginas) {
      if (!grupos.has(p.menuGroup)) grupos.set(p.menuGroup, []);
      (grupos.get(p.menuGroup) as { slug: string; title: string }[]).push({ slug: p.slug, title: p.title });
    }
    return [...grupos.entries()].map(([grupo, items]) => ({ grupo, items }));
  }

  /** Página institucional publicada, o null (404 genérico en el controlador). */
  async pagina(tenantId: string, slug: string) {
    return this.prisma.sitePage.findFirst({ where: { tenantId, slug, isPublished: true } });
  }

  /** Destacados de la portada: los elegidos por el admin o los primeros publicados. */
  async destacados(tenantId: string, ids: string[]) {
    const tarjetas = await this.listar(tenantId, {});
    if (ids.length === 0) return tarjetas.slice(0, 6);
    const porId = await this.prisma.program.findMany({
      where: { ...this.whereBase(tenantId), id: { in: ids } },
      select: { slug: true },
    });
    const slugs = new Set(porId.map((p) => p.slug));
    const elegidos = tarjetas.filter((t) => slugs.has(t.slug));
    return elegidos.length > 0 ? elegidos : tarjetas.slice(0, 6);
  }
}
