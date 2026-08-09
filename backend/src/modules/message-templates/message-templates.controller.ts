import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessageTemplatesService } from './message-templates.service';
import {
  CrearPlantillaMensajeDto,
  ActualizarPlantillaMensajeDto,
} from './dto/plantilla-mensaje.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser, CurrentUserData } from '@/common/decorators/current-user.decorator';

@ApiTags('message-templates')
@Controller('message-templates')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class MessageTemplatesController {
  constructor(private readonly service: MessageTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar plantillas de mensaje' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Guardar una plantilla' })
  create(
    @Body() dto: CrearPlantillaMensajeDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.create(tenantId, user?.userId ?? null, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar una plantilla' })
  update(@Param('id') id: string, @Body() dto: ActualizarPlantillaMensajeDto, @CurrentTenant() tenantId: string) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una plantilla' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.remove(tenantId, id);
  }
}
