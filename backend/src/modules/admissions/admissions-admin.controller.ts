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
import { PedirCorreccionDto, RevisarDocumentoDto } from './dto/admissions.dto';

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

  @Get('documents/:docId/archivo')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Descargar un documento del aspirante (visor de la bandeja)' })
  async archivo(@CurrentTenant() tenantId: string, @Param('docId') docId: string, @Res() res: Response) {
    const { stream, mime, nombre } = await this.servicio.streamDocumento(tenantId, docId);
    res.type(mime).setHeader('Content-Disposition', `inline; filename="${nombre.replace(/[^\w.() -]/g, '_')}"`);
    stream.pipe(res);
  }
}
