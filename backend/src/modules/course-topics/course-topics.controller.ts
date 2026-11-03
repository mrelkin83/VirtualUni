import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CourseTopicsService } from './course-topics.service';
import {
  CrearTemaDto, ActualizarTemaDto, CrearBloqueDto, ActualizarBloqueDto,
  CopiarTemarioDto,
} from './dto/topic.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser, CurrentUserData } from '@/common/decorators/current-user.decorator';

const EDITORES = ['TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN'] as const;

@ApiTags('course-topics')
@Controller('course-topics')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class CourseTopicsController {
  constructor(private readonly service: CourseTopicsService) {}

  @Get()
  // El alumnado consulta el temario; editarlo es cosa del profesorado.
  @ApiOperation({ summary: 'Temario de un grupo (maestro de su asignatura + propio)' })
  findByCourse(
    @Query('courseId') courseId: string,
    @Query('subjectId') subjectId: string,
    @CurrentTenant() tenantId: string,
  ) {
    // subjectId: administrar el temario maestro sin pasar por un grupo
    if (subjectId) return this.service.findBySubject(tenantId, subjectId);
    return this.service.findByCourse(tenantId, courseId);
  }

  @Post()
  @Roles(...EDITORES)
  @ApiOperation({ summary: 'Crear un tema (propio del grupo o maestro de la asignatura)' })
  crear(
    @Body() dto: CrearTemaDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.crear(tenantId, dto, user);
  }

  // Ruta estática antes de :id
  @Post('copiar-del-grupo')
  @Roles(...EDITORES)
  @ApiOperation({ summary: 'Copiar el temario propio de otro grupo de la misma asignatura' })
  copiarDelGrupo(@Body() dto: CopiarTemarioDto, @CurrentTenant() tenantId: string) {
    return this.service.copiarDelGrupo(tenantId, dto);
  }

  @Post(':id/promover')
  @Roles(...EDITORES)
  @ApiOperation({ summary: 'Promover un tema del grupo a contenido maestro de la asignatura' })
  promover(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.promover(tenantId, id, user);
  }

  @Patch(':id')
  @Roles(...EDITORES)
  @ApiOperation({ summary: 'Actualizar un tema' })
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarTemaDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.actualizar(tenantId, id, dto, user);
  }

  @Delete(':id')
  @Roles(...EDITORES)
  @ApiOperation({ summary: 'Eliminar un tema y sus bloques' })
  eliminar(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.eliminar(tenantId, id, user);
  }

  @Post(':id/blocks')
  @Roles(...EDITORES)
  @ApiOperation({ summary: 'Añadir un bloque de contenido al tema' })
  crearBloque(
    @Param('id') id: string,
    @Body() dto: CrearBloqueDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.crearBloque(tenantId, id, dto, user);
  }

  @Patch('blocks/:blockId')
  @Roles(...EDITORES)
  @ApiOperation({ summary: 'Actualizar un bloque' })
  actualizarBloque(
    @Param('blockId') blockId: string,
    @Body() dto: ActualizarBloqueDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.actualizarBloque(tenantId, blockId, dto, user);
  }

  @Delete('blocks/:blockId')
  @Roles(...EDITORES)
  @ApiOperation({ summary: 'Eliminar un bloque' })
  eliminarBloque(
    @Param('blockId') blockId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.eliminarBloque(tenantId, blockId, user);
  }
}
