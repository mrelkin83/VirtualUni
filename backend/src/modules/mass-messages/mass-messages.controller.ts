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
import { MassMessagesService } from './mass-messages.service';
import {
  CreateMassMessageDto,
  UpdateMassMessageDto,
  QueryMassMessagesDto,
  SendMassMessageDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

/**
 * Controlador para la gestión de mensajes masivos
 * Proporciona endpoints para crear, enviar y administrar mensajes masivos
 */
@ApiTags('mass-messages')
@Controller('mass-messages')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class MassMessagesController {
  constructor(private readonly massMessagesService: MassMessagesService) {}

  /**
   * Crear un nuevo mensaje masivo
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo mensaje masivo',
    description:
      'Crea un nuevo mensaje masivo. Puede ser enviado inmediatamente, guardado como borrador o programado para una fecha futura.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mensaje masivo creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  create(
    @Body() createDto: CreateMassMessageDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.massMessagesService.create(tenantId, createDto, user.firstName);
  }

  /**
   * Obtener todos los mensajes masivos con filtros
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar todos los mensajes masivos',
    description:
      'Obtiene una lista paginada de mensajes masivos con opciones de filtrado por estado, búsqueda y ordenamiento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensajes masivos obtenida exitosamente',
  })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryMassMessagesDto,
  ) {
    return this.massMessagesService.findAll(tenantId, query);
  }

  /**
   * Obtener estadísticas de mensajes masivos
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadísticas de mensajes masivos',
    description:
      'Retorna estadísticas incluyendo total, por estado y promedio de destinatarios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getStats(@CurrentTenant() tenantId: string) {
    return this.massMessagesService.getStats(tenantId);
  }

  /**
   * Obtener un mensaje masivo por ID
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener un mensaje masivo por ID',
    description: 'Retorna la información completa de un mensaje masivo específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del mensaje masivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje masivo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Mensaje masivo no encontrado',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.massMessagesService.findOne(id, tenantId);
  }

  /**
   * Actualizar un mensaje masivo
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Patch(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar un mensaje masivo',
    description:
      'Actualiza los campos especificados de un mensaje masivo existente. No se puede editar un mensaje ya enviado.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del mensaje masivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje masivo actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Mensaje masivo no encontrado',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMassMessageDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.massMessagesService.update(id, tenantId, updateDto);
  }

  /**
   * Enviar un mensaje masivo
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/send')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar un mensaje masivo',
    description:
      'Envía un mensaje masivo inmediatamente a todos los destinatarios especificados.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del mensaje masivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje masivo enviado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Mensaje masivo no encontrado',
  })
  send(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.massMessagesService.send(id, tenantId);
  }

  /**
   * Obtener mensajes por estado
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('status/:status')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener mensajes masivos por estado',
    description: 'Obtiene todos los mensajes masivos filtrados por estado.',
  })
  @ApiParam({
    name: 'status',
    description: 'Estado del mensaje',
    enum: ['BORRADOR', 'PROGRAMADO', 'ENVIADO', 'FALLIDO'],
  })
  getByStatus(
    @Param('status') status: string,
    @CurrentTenant() tenantId: string,
  ) {
    const validStates = ['BORRADOR', 'PROGRAMADO', 'ENVIADO', 'FALLIDO'];
    if (!validStates.includes(status)) {
      // Un `Error` pelado no lo reconoce el filtro de excepciones de Nest y
      // acaba en 500 "Internal server error": un dato mal escrito por el
      // cliente se reportaba como caida del servidor, sin decirle que valores
      // son validos y ensuciando las metricas de error.
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${validStates.join(', ')}`,
      );
    }
    return this.massMessagesService.findByStatus(tenantId, status as any);
  }

  /**
   * Eliminar un mensaje masivo
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un mensaje masivo',
    description:
      'Elimina permanentemente un mensaje masivo. No se puede eliminar un mensaje ya enviado.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del mensaje masivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje masivo eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Mensaje masivo no encontrado',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.massMessagesService.remove(id, tenantId);
  }
}
