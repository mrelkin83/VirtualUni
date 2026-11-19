import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PublicCatalogService } from '../public-site/public-catalog.service';
import { VerificacionService } from '../public-site/verificacion.service';
import { AdmissionsService } from '../admissions/admissions.service';
import { PublicApiGuard, PublicApiContext, Scopes } from './public-api.guard';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { CrearLeadApiDto, CrearSolicitudApiDto } from './dto/public-api.dto';

type ReqApi = Request & { publicApi: PublicApiContext };

/**
 * API pública /public/v1 para equipos de desarrollo (§13.3). Separada de la
 * API interna api/v1 del campus; el tenant sale SOLO de la llave; errores en
 * formato uniforme {error:{code,message,details}}; paginación por cursor.
 */
@ApiTags('public-v1')
@ApiBearerAuth()
@Controller('public/v1')
@UseGuards(PublicApiGuard)
export class PublicApiController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogo: PublicCatalogService,
    private readonly verificacion: VerificacionService,
    private readonly admissions: AdmissionsService,
  ) {}

  // ------------------------------------------------------------- catálogo

  @Get('programs')
  @Scopes('catalog:read')
  @ApiOperation({ summary: 'Programas publicados (mismos filtros del sitio)' })
  async programas(
    @Req() req: ReqApi,
    @Query('nivel') nivel?: string,
    @Query('modalidad') modalidad?: string,
    @Query('area') area?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const todos = await this.catalogo.listar(req.publicApi.tenantId, {
      categoria: nivel, modalidad, area, q: q?.slice(0, 80),
    });
    const tam = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const inicio = cursor ? todos.findIndex((p) => p.slug === cursor) + 1 : 0;
    const pagina = todos.slice(inicio, inicio + tam);
    return {
      data: pagina,
      nextCursor: inicio + tam < todos.length ? pagina[pagina.length - 1]?.slug ?? null : null,
    };
  }

  @Get('programs/:slug')
  @Scopes('catalog:read')
  @ApiOperation({ summary: 'Ficha completa de un programa' })
  async programa(@Req() req: ReqApi, @Param('slug') slug: string) {
    const ficha = await this.catalogo.ficha(req.publicApi.tenantId, slug);
    if (!ficha) throw new NotFoundException({ error: { code: 'not_found', message: 'Programa no encontrado' } });
    const { programa, ...resto } = ficha;
    return {
      slug: programa.slug, name: programa.name,
      shortDescription: programa.shortDescription, publicDescription: programa.publicDescription,
      officialCode: programa.officialCode, area: programa.area, schedule: programa.schedule,
      tuitionDisplay: programa.tuitionDisplay, imageUrl: programa.imageUrl,
      ...resto,
    };
  }

  @Get('admission-calls')
  @Scopes('calls:read')
  @ApiOperation({ summary: 'Convocatorias (status=ABIERTA para solo abiertas)' })
  async convocatorias(@Req() req: ReqApi, @Query('status') status?: string) {
    const filas = await this.prisma.admissionCall.findMany({
      where: { tenantId: req.publicApi.tenantId, ...(status ? { status: status as never } : {}) },
      orderBy: { opensAt: 'desc' },
      include: { program: { select: { name: true, slug: true } } },
    });
    return {
      data: filas
        .filter((c) => (status === 'ABIERTA' ? this.catalogo.llamadaAbierta(c) : true))
        .map((c) => ({
          slug: c.slug, name: c.name, status: c.status,
          opensAt: c.opensAt, closesAt: c.closesAt, rolling: c.rolling, startsAt: c.startsAt,
          applicationFee: c.applicationFee, program: c.program,
        })),
    };
  }

  @Get('admission-calls/:slug')
  @Scopes('calls:read')
  @ApiOperation({ summary: 'Convocatoria con documentos, requisitos, cupos y valor' })
  async convocatoria(@Req() req: ReqApi, @Param('slug') slug: string) {
    const c = await this.admissions.convocatoriaPorSlug(req.publicApi.tenantId, slug);
    const ocupados = await this.prisma.application.count({
      where: {
        tenantId: req.publicApi.tenantId, callId: c.id, isTest: false,
        status: { notIn: ['BORRADOR', 'INTERESADO', 'DESISTIO', 'NO_ADMITIDA'] },
      },
    });
    return {
      slug: c.slug, name: c.name, status: c.status, abierta: this.catalogo.llamadaAbierta(c),
      opensAt: c.opensAt, closesAt: c.closesAt, rolling: c.rolling, startsAt: c.startsAt,
      applicationFee: c.applicationFee, capacity: c.capacity, cupoDisponible: c.capacity ? Math.max(0, c.capacity - ocupados) : null,
      minAge: c.minAge, maxAge: c.maxAge, minEducation: c.minEducation,
      targetLevels: c.targetLevels,
      requiredDocuments: c.requiredDocuments.map((d) => ({ id: d.id, name: d.name, required: d.required, acceptTypes: d.acceptTypes, maxSizeMb: d.maxSizeMb })),
      program: { name: c.program.name, slug: c.program.slug },
    };
  }

  // ------------------------------------------------------------ solicitudes

  @Post('applications')
  @Scopes('applications:write')
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Crear aspirante + solicitud (consent obligatorio; acepta externalId y utm)' })
  crearSolicitud(@Req() req: ReqApi, @Body() dto: CrearSolicitudApiDto) {
    return this.admissions.crearDesdeApi(req.publicApi.tenantId, dto, req.publicApi.testMode);
  }

  @Get('applications')
  @Scopes('applications:read')
  @ApiOperation({ summary: 'Sincronización: ?updatedSince=ISO&cursor=&limit=' })
  listarSolicitudes(
    @Req() req: ReqApi,
    @Query('updatedSince') updatedSince?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admissions.listarApi(req.publicApi.tenantId, req.publicApi.testMode, {
      updatedSince, cursor, limit: Number(limit) || undefined,
    });
  }

  @Get('applications/:id')
  @Scopes('applications:read')
  @ApiOperation({ summary: 'Una solicitud' })
  async solicitud(@Req() req: ReqApi, @Param('id') id: string) {
    const s = await this.admissions.vistaApi(req.publicApi.tenantId, id);
    if (s.isTest !== req.publicApi.testMode) {
      throw new NotFoundException({ error: { code: 'not_found', message: 'Solicitud no encontrada' } });
    }
    return s;
  }

  @Post('applications/:id/documents')
  @Scopes('documents:write')
  @UseInterceptors(FileInterceptor('file'), IdempotencyInterceptor)
  @ApiOperation({ summary: 'Subir un documento (multipart: file + requiredDocId)' })
  subirDocumento(
    @Req() req: ReqApi,
    @Param('id') id: string,
    @Body('requiredDocId') requiredDocId?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException({ error: { code: 'missing_file', message: 'Adjunta el archivo en el campo "file"' } });
    if (!requiredDocId) throw new BadRequestException({ error: { code: 'missing_required_doc', message: 'Indica requiredDocId' } });
    return this.admissions.subirDocumentoApi(req.publicApi.tenantId, req.publicApi.testMode, id, requiredDocId, file);
  }

  @Post('leads')
  @Scopes('applicants:write')
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Lead de solo contacto (Meta Lead Ads, formularios propios)' })
  crearLead(@Req() req: ReqApi, @Body() dto: CrearLeadApiDto) {
    return this.admissions.crearLeadApi(req.publicApi.tenantId, dto, req.publicApi.testMode);
  }

  // ------------------------------------------------------------ certificados

  @Get('certificates/verify/:code')
  @Scopes('certificates:verify')
  @ApiOperation({ summary: 'Validar un certificado o carnet por su código (respuesta mínima)' })
  verificar(@Req() req: ReqApi, @Param('code') code: string) {
    // Misma lógica que la página /validar y el widget: una sola fuente (§2).
    return this.verificacion.validar(req.publicApi.tenantId, code);
  }
}
