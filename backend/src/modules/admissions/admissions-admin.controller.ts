import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser, CurrentUserData } from '@/common/decorators/current-user.decorator';
import { AdmissionsService } from './admissions.service';
import {
  ActualizarConvocatoriaDto,
  ConfirmarPagoDto,
  CrearConvocatoriaDto,
  DecisionDto,
  NoAdmitirDto,
  PedirCorreccionDto,
  RevisarDocumentoDto,
} from './dto/admissions.dto';

/**
 * Bandeja de aspirantes para la administración del tenant (§5): listado con
 * filtros, detalle con documentos y línea de tiempo, revisión de documentos
 * y petición de corrección. Admitir/No admitir llegan en la Fase 4.
 */
@ApiTags('admissions')
@Controller('admissions')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class AdmissionsAdminController {
  constructor(private readonly servicio: AdmissionsService) {}

  @Get('calls')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Convocatorias del tenant (para filtros de la bandeja)' })
  convocatorias(@CurrentTenant() tenantId: string) {
    return this.servicio.convocatoriasDelTenant(tenantId);
  }

  @Get('applications')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Bandeja de solicitudes con filtros' })
  listar(
    @CurrentTenant() tenantId: string,
    @Query('callId') callId?: string,
    @Query('status') status?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('utmSource') utmSource?: string,
    @Query('q') q?: string,
  ) {
    return this.servicio.listar(tenantId, { callId, status, desde, hasta, utmSource, q });
  }

  @Get('applications/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Detalle de una solicitud: datos, documentos y línea de tiempo' })
  detalle(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.servicio.detalle(tenantId, id);
  }

  @Patch('documents/:docId')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Aprobar o rechazar un documento (con nota)' })
  revisarDocumento(
    @CurrentTenant() tenantId: string,
    @Param('docId') docId: string,
    @Body() dto: RevisarDocumentoDto,
    @CurrentUser() user: CurrentUserData,
    @Req() req: Request,
  ) {
    const base = `${((req.headers['x-forwarded-proto'] as string) || req.protocol).split(',')[0]}://${req.headers.host}`;
    return this.servicio.revisarDocumento(tenantId, docId, dto, user.userId, base);
  }

  @Post('applications/:id/pedir-correccion')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Pedir una corrección al aspirante (correo con enlace)' })
  pedirCorreccion(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: PedirCorreccionDto,
    @CurrentUser() user: CurrentUserData,
    @Req() req: Request,
  ) {
    const base = `${((req.headers['x-forwarded-proto'] as string) || req.protocol).split(',')[0]}://${req.headers.host}`;
    return this.servicio.pedirCorreccion(tenantId, id, dto, user.userId, base);
  }

  // ------------------------------------------------- pago manual (Fase 4)

  @Post('applications/:id/confirmar-pago')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Confirmar el pago manual de la inscripción' })
  confirmarPago(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmarPagoDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.servicio.confirmarPago(tenantId, id, dto.ref, user.userId);
  }

  @Post('applications/:id/rechazar-pago')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Rechazar el comprobante (correo con nota al aspirante)' })
  rechazarPago(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: NoAdmitirDto,
    @CurrentUser() user: CurrentUserData,
    @Req() req: Request,
  ) {
    const base = `${((req.headers['x-forwarded-proto'] as string) || req.protocol).split(',')[0]}://${req.headers.host}`;
    return this.servicio.rechazarPago(tenantId, id, dto.nota, user.userId, base);
  }

  // ---------------------------------------------------- decisión (Fase 4)

  @Post('applications/:id/admitir')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admitir: crea usuario + estudiante + inscripción al programa' })
  admitir(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: DecisionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.servicio.admitir(tenantId, id, dto.nota, user.userId);
  }

  @Post('applications/:id/no-admitir')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'No admitir (correo con la nota)' })
  noAdmitir(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: NoAdmitirDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.servicio.noAdmitir(tenantId, id, dto.nota, user.userId);
  }

  @Post('applications/:id/desistir')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Marcar que el aspirante desistió' })
  desistir(@CurrentTenant() tenantId: string, @Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.servicio.marcarDesistio(tenantId, id, user.userId);
  }

  @Post('applications/:id/matricular')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Pasar de ADMITIDA a MATRICULADA (momentos distintos)' })
  matricular(@CurrentTenant() tenantId: string, @Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.servicio.matricular(tenantId, id, user.userId);
  }

  // ------------------------------------------------------ embudo (Fase 4)

  @Get('funnel')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Embudo: interesados → enviadas → pagadas → admitidas → matriculadas, por fuente' })
  embudo(@CurrentTenant() tenantId: string, @Query('callId') callId?: string) {
    return this.servicio.embudo(tenantId, callId);
  }

  // ------------------------------------- CRUD de convocatorias (Fase 4)

  @Get('calls/detallado')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Convocatorias con documentos, cupo usado y ventana' })
  convocatoriasDetallado(@CurrentTenant() tenantId: string) {
    return this.servicio.convocatoriasDetallado(tenantId);
  }

  @Post('calls')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear una convocatoria' })
  crearConvocatoria(@CurrentTenant() tenantId: string, @Body() dto: CrearConvocatoriaDto) {
    return this.servicio.crearConvocatoria(tenantId, dto);
  }

  @Patch('calls/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar/abrir/cerrar una convocatoria' })
  actualizarConvocatoria(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ActualizarConvocatoriaDto,
  ) {
    return this.servicio.actualizarConvocatoria(tenantId, id, dto);
  }

  @Get('documents/:docId/archivo')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Descargar un documento del aspirante (visor de la bandeja)' })
  async archivo(@CurrentTenant() tenantId: string, @Param('docId') docId: string, @Res() res: Response) {
    const { stream, mime, nombre } = await this.servicio.streamDocumento(tenantId, docId);
    res.type(mime).setHeader('Content-Disposition', `inline; filename="${nombre.replace(/[^\w.() -]/g, '_')}"`);
    stream.pipe(res);
  }
}
