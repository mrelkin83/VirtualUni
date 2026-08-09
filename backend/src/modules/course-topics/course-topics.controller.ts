import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CourseTopicsService } from './course-topics.service';
import {
  CrearTemaDto, ActualizarTemaDto, CrearBloqueDto, ActualizarBloqueDto,
} from './dto/topic.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('course-topics')
@Controller('course-topics')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class CourseTopicsController {
  constructor(private readonly service: CourseTopicsService) {}

  @Get()
  // El alumnado consulta el temario; editarlo es cosa del profesorado.
  @ApiOperation({ summary: 'Temario de un curso' })
  findByCourse(@Query('courseId') courseId: string, @CurrentTenant() tenantId: string) {
    return this.service.findByCourse(tenantId, courseId);
  }

  @Post()
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear un tema' })
  crear(@Body() dto: CrearTemaDto, @CurrentTenant() tenantId: string) {
    return this.service.crear(tenantId, dto);
  }

  @Patch(':id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar un tema' })
  actualizar(@Param('id') id: string, @Body() dto: ActualizarTemaDto, @CurrentTenant() tenantId: string) {
    return this.service.actualizar(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar un tema y sus bloques' })
  eliminar(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.eliminar(tenantId, id);
  }

  @Post(':id/blocks')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Añadir un bloque de contenido al tema' })
  crearBloque(@Param('id') id: string, @Body() dto: CrearBloqueDto, @CurrentTenant() tenantId: string) {
    return this.service.crearBloque(tenantId, id, dto);
  }

  @Patch('blocks/:blockId')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar un bloque' })
  actualizarBloque(@Param('blockId') blockId: string, @Body() dto: ActualizarBloqueDto, @CurrentTenant() tenantId: string) {
    return this.service.actualizarBloque(tenantId, blockId, dto);
  }

  @Delete('blocks/:blockId')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar un bloque' })
  eliminarBloque(@Param('blockId') blockId: string, @CurrentTenant() tenantId: string) {
    return this.service.eliminarBloque(tenantId, blockId);
  }
}
