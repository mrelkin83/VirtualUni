import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomologationStatus } from '@prisma/client';
import { HomologationsService } from './homologations.service';
import {
  ActualizarEquivalenciaDto,
  CambiarEstadoSolicitudDto,
  CrearEquivalenciaDto,
  CrearSolicitudDto,
  ResolverSolicitudDto,
} from './dto/homologation.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;

@ApiTags('homologations')
@Controller('subject-equivalences')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class SubjectEquivalencesController {
  constructor(private readonly service: HomologationsService) {}

  @Get()
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Equivalencias entre asignaturas del tenant' })
  listar(@CurrentTenant() tenantId: string) {
    return this.service.listarEquivalencias(tenantId);
  }

  @Post()
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Declarar que una asignatura equivale a otra' })
  crear(@Body() dto: CrearEquivalenciaDto, @CurrentTenant() tenantId: string) {
    return this.service.crearEquivalencia(tenantId, dto);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar una equivalencia' })
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarEquivalenciaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.actualizarEquivalencia(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Eliminar una equivalencia' })
  eliminar(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.eliminarEquivalencia(tenantId, id);
  }
}

@ApiTags('homologations')
@Controller('homologations')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class HomologationsController {
  constructor(private readonly service: HomologationsService) {}

  @Get()
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({
    summary: 'Solicitudes de homologación (un estudiante solo ve las suyas)',
  })
  listar(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
    @Query('status') status?: HomologationStatus,
    @Query('studentId') studentId?: string,
  ) {
    return this.service.listarSolicitudes(tenantId, user, { status, studentId });
  }

  @Post()
  @Roles('STUDENT', ...STAFF)
  @ApiOperation({ summary: 'Crear una solicitud de homologación con sus ítems' })
  crear(
    @Body() dto: CrearSolicitudDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.crearSolicitud(tenantId, dto, user);
  }

  @Get(':id')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Detalle de una solicitud' })
  obtener(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.obtenerSolicitud(tenantId, id, user);
  }

  @Patch(':id/status')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Pasar la solicitud a EN_REVISION o rechazarla' })
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoSolicitudDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.cambiarEstado(tenantId, id, dto, user);
  }

  @Post(':id/resolve')
  @Roles(...STAFF)
  @ApiOperation({
    summary: 'Resolver la solicitud ítem por ítem y escribir el historial',
  })
  resolver(
    @Param('id') id: string,
    @Body() dto: ResolverSolicitudDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.resolverSolicitud(tenantId, id, dto, user);
  }
}
