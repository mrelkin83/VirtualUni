import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('notifications')
// TenantGuard es imprescindible aqui porque los metodos toman el tenant de
// @CurrentTenant(), que resuelve la cabecera X-Tenant-ID. Solo con
// JwtAuthGuard, un usuario podia listar y CREAR notificaciones en el tenant
// de otro cliente cambiando esa cabecera.
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  // El DTO lleva el userId del destinatario, asi que sin control de rol
  // cualquier alumno podia hacer llegar al administrador una notificacion con
  // el aspecto de un aviso oficial de la plataforma: phishing interno con la
  // credibilidad del propio sistema. Las notificaciones automaticas no pasan
  // por aqui, se crean desde los servicios.
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  create(
    @CurrentTenant() tenantId: string,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(tenantId, createNotificationDto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findAll(
      tenantId,
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('unread-count')
  getUnreadCount(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.notificationsService.findUnreadCount(tenantId, userId);
  }

  @Put(':id/mark-as-read')
  markAsRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(tenantId, userId, id);
  }

  @Put('mark-all-as-read')
  markAllAsRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.notificationsService.markAllAsRead(tenantId, userId);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.remove(tenantId, userId, id);
  }

  @Delete()
  removeAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.notificationsService.removeAll(tenantId, userId);
  }
}
