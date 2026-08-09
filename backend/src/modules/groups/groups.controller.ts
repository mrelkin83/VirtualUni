import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, AddMembersDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un grupo de curso' })
  @ApiResponse({ status: 201, description: 'Grupo creado' })
  create(@Body() dto: CreateGroupDto, @CurrentTenant() tenantId: string) {
    return this.groupsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar grupos' })
  findAll(@Query('courseId') courseId: string, @CurrentTenant() tenantId: string) {
    return this.groupsService.findAll(tenantId, courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.groupsService.findOne(tenantId, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Agregar estudiantes al grupo' })
  addMembers(
    @Param('id') id: string,
    @Body() dto: AddMembersDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.groupsService.addMembers(tenantId, id, dto);
  }

  @Delete(':id/members/:studentId')
  @ApiOperation({ summary: 'Quitar un estudiante del grupo' })
  removeMember(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.groupsService.removeMember(tenantId, id, studentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grupo' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.groupsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un grupo' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.groupsService.remove(tenantId, id);
  }
}
