import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PublicTenantService } from './public-tenant.service';
import { ActualizarSitioDto, GuardarPaginaDto } from './dto/site-admin.dto';
import { ETIQUETA_CATEGORIA, TEXTOS_POR_TIPO } from './textos-institucion';

const SITIO_POR_DEFECTO: Omit<Prisma.TenantSiteUncheckedCreateInput, 'tenantId'> = {
  heroSlides: [],
  sections: { order: ['featured', 'calls', 'benefits', 'stats', 'cta'], hidden: [] },
  featuredProgramIds: [],
};

@Injectable()
export class SiteAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: PublicTenantService,
  ) {}

  /** Configuración del sitio + lo que el formulario necesita para pintarse. */
  async obtener(tenantId: string) {
    const site = await this.prisma.tenantSite.upsert({
      where: { tenantId },
      update: {},
      create: { tenantId, ...SITIO_POR_DEFECTO },
    });

    const programas = await this.prisma.program.findMany({
      where: { tenantId, status: 'ACTIVO' },
      select: { id: true, name: true, slug: true, isPublished: true, educationLevel: true },
      orderBy: { name: 'asc' },
    });

    return {
      site,
      programas,
      // El diccionario viaja por API para que la SPA y las plantillas
      // compartan una única fuente de textos (§0.1).
      diccionario: TEXTOS_POR_TIPO,
      categorias: ETIQUETA_CATEGORIA,
      previewToken: this.tenants.firmarPreview(tenantId),
    };
  }

  async actualizar(tenantId: string, dto: ActualizarSitioDto) {
    // Ids de programas destacados: del propio tenant, nada más.
    if (dto.featuredProgramIds?.length) {
      const propios = await this.prisma.program.count({
        where: { tenantId, id: { in: dto.featuredProgramIds } },
      });
      if (propios !== dto.featuredProgramIds.length) {
        throw new BadRequestException('Algún programa destacado no pertenece a la institución');
      }
    }

    // levelLabels: solo categorías conocidas y solo {label, hidden}.
    let levelLabels: Prisma.InputJsonValue | undefined;
    if (dto.levelLabels !== undefined) {
      const limpio: Record<string, { label?: string; hidden?: boolean }> = {};
      for (const slug of Object.keys(ETIQUETA_CATEGORIA)) {
        const v = dto.levelLabels[slug];
        if (!v) continue;
        limpio[slug] = {
          ...(typeof v.label === 'string' && v.label.trim() ? { label: v.label.trim().slice(0, 40) } : {}),
          ...(v.hidden === true ? { hidden: true } : {}),
        };
      }
      levelLabels = limpio;
    }

    const { levelLabels: _ignorado, ...resto } = dto;
    // Los DTOs anidados ya validaron la forma; para Prisma son Json planos.
    const datos = resto as unknown as Prisma.TenantSiteUncheckedUpdateInput;

    const site = await this.prisma.tenantSite.upsert({
      where: { tenantId },
      update: { ...datos, ...(levelLabels !== undefined ? { levelLabels } : {}) },
      create: {
        tenantId,
        ...SITIO_POR_DEFECTO,
        ...(resto as unknown as object),
        ...(levelLabels !== undefined ? { levelLabels } : {}),
      },
    });

    // El sitio público cachea el contexto por host 30 s: al guardar se purga
    // para que el admin vea su cambio de inmediato.
    this.tenants.invalidar();
    return site;
  }

  // -------------------------------------------- páginas institucionales

  listarPaginas(tenantId: string) {
    return this.prisma.sitePage.findMany({
      where: { tenantId },
      orderBy: [{ menuGroup: 'asc' }, { order: 'asc' }, { title: 'asc' }],
    });
  }

  async crearPagina(tenantId: string, dto: GuardarPaginaDto) {
    const existente = await this.prisma.sitePage.findFirst({ where: { tenantId, slug: dto.slug } });
    if (existente) throw new BadRequestException('Ya existe una página con esa URL');
    const pagina = await this.prisma.sitePage.create({ data: { tenantId, ...dto } });
    this.tenants.invalidar();
    return pagina;
  }

  async actualizarPagina(tenantId: string, id: string, dto: GuardarPaginaDto) {
    const propia = await this.prisma.sitePage.findFirst({ where: { id, tenantId } });
    if (!propia) throw new BadRequestException('Página no encontrada');
    const choque = await this.prisma.sitePage.findFirst({
      where: { tenantId, slug: dto.slug, id: { not: id } },
    });
    if (choque) throw new BadRequestException('Ya existe otra página con esa URL');
    const pagina = await this.prisma.sitePage.update({ where: { id: propia.id }, data: dto });
    this.tenants.invalidar();
    return pagina;
  }

  async eliminarPagina(tenantId: string, id: string) {
    const propia = await this.prisma.sitePage.findFirst({ where: { id, tenantId } });
    if (!propia) throw new BadRequestException('Página no encontrada');
    await this.prisma.sitePage.delete({ where: { id: propia.id } });
    this.tenants.invalidar();
    return this.listarPaginas(tenantId);
  }
}
