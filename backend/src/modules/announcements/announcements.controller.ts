import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  QueryAnnouncementsDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

/**
 * Controlador para la gestión de anuncios institucionales
 * Proporciona endpoints CRUD y operaciones específicas para anuncios
 */
@ApiTags('announcements')
@Controller('announcements')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  /**
   * Crear un nuevo anuncio
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo anuncio',
    description: 'Crea un nuevo anuncio institucional. Puede ser publicado inmediatamente o guardarse como borrador.',
  })
  @ApiResponse({
    status: 201,
    description: 'Anuncio creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  create(
    @Body() createDto: CreateAnnouncementDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.announcementsService.create(tenantId, createDto, user.firstName);
  }

  /**
   * Obtener todos los anuncios con filtros
   * Accesible por todos los roles autenticados
   */
  @Get()
  @Roles('TENANT_ADMIN', 'TEACHER', 'STUDENT', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar todos los anuncios',
    description: 'Obtiene una lista paginada de anuncios con opciones de filtrado por prioridad, estado, búsqueda y ordenamiento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de anuncios obtenida exitosamente',
  })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryAnnouncementsDto,
  ) {
    return this.announcementsService.findAll(tenantId, query);
  }

  /**
   * Obtener estadísticas de anuncios
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadísticas de anuncios',
    description: 'Retorna estadísticas incluyendo total, por estado y por prioridad.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getStats(@CurrentTenant() tenantId: string) {
    return this.announcementsService.getStats(tenantId);
  }

  /**
   * Obtener anuncios por prioridad
   * Accesible por TENANT_ADMIN, TEACHER, SUPER_ADMIN
   */
  @Get('priority/:priority')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener anuncios por prioridad',
    description: 'Obtiene todos los anuncios filtrados por nivel de prioridad (ALTA, MEDIA, BAJA).',
  })
  @ApiParam({
    name: 'priority',
    description: 'Nivel de prioridad',
    enum: ['ALTA', 'MEDIA', 'BAJA'],
  })
  getByPriority(
    @Param('priority') priority: string,
    @CurrentTenant() tenantId: string,
  ) {
    if (!['ALTA', 'MEDIA', 'BAJA'].includes(priority)) {
      throw new BadRequestException('Prioridad inválida');
    }
    return this.announcementsService.findByPriority(tenantId, priority);
  }

  /**
   * Obtener un anuncio por ID
   * Accesible por TENANT_ADMIN, TEACHER, STUDENT, SUPER_ADMIN
   */
  @Get(':id')
  @Roles('TENANT_ADMIN', 'TEACHER', 'STUDENT', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener un anuncio por ID',
    description: 'Retorna la información completa de un anuncio específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del anuncio',
  })
  @ApiResponse({
    status: 200,
    description: 'Anuncio encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Anuncio no encontrado',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.announcementsService.findOne(id, tenantId);
  }

  /**
   * Actualizar un anuncio
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Patch(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar un anuncio',
    description: 'Actualiza los campos especificados de un anuncio existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del anuncio',
  })
  @ApiResponse({
    status: 200,
    description: 'Anuncio actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Anuncio no encontrado',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAnnouncementDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.announcementsService.update(id, tenantId, updateDto);
  }

  /**
   * Publicar un anuncio
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/publish')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publicar un anuncio',
    description: 'Cambia el estado de un anuncio de BORRADOR a PUBLICADO.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del anuncio',
  })
  @ApiResponse({
    status: 200,
    description: 'Anuncio publicado exitosamente',
  })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.announcementsService.publish(id, tenantId);
  }

  /**
   * Archivar un anuncio
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/archive')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archivar un anuncio',
    description: 'Cambia el estado de un anuncio a ARCHIVADO.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del anuncio',
  })
  @ApiResponse({
    status: 200,
    description: 'Anuncio archivado exitosamente',
  })
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.announcementsService.archive(id, tenantId);
  }

  /**
   * Eliminar un anuncio
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un anuncio',
    description: 'Elimina permanentemente un anuncio del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del anuncio',
  })
  @ApiResponse({
    status: 200,
    description: 'Anuncio eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Anuncio no encontrado',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.announcementsService.remove(id, tenantId);
  }
}
