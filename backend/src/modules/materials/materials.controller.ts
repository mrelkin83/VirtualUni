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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  QueryMaterialsDto,
  CreateFolderDto,
  UpdateFolderDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser, CurrentUserData } from '@/common/decorators/current-user.decorator';

@ApiTags('materials')
@Controller('materials')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // ------------------------------------------------------------------ Carpetas
  @Post('folders')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear una carpeta de materiales' })
  @ApiResponse({ status: 201, description: 'Carpeta creada' })
  createFolder(@Body() dto: CreateFolderDto, @CurrentTenant() tenantId: string) {
    return this.materialsService.createFolder(tenantId, dto);
  }

  @Get('folders')
  @Roles('TEACHER', 'TENANT_ADMIN', 'STUDENT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar carpetas de materiales' })
  findAllFolders(
    @Query('courseId') courseId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    if (user.role === 'STUDENT') {
      return this.materialsService.findAllFoldersForStudent(tenantId, user.userId, courseId);
    }
    return this.materialsService.findAllFolders(tenantId, courseId);
  }

  @Patch('folders/:id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar una carpeta' })
  updateFolder(
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.materialsService.updateFolder(tenantId, id, dto);
  }

  @Delete('folders/:id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar una carpeta' })
  removeFolder(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.materialsService.removeFolder(tenantId, id);
  }

  // ---------------------------------------------------------------- Estadisticas
  @Get('stats')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Estadisticas de materiales' })
  getStats(@Query('courseId') courseId: string, @CurrentTenant() tenantId: string) {
    return this.materialsService.getStats(tenantId, courseId);
  }

  // ------------------------------------------------------------------ Estudiante
  @Get('my')
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'Materiales de mis cursos',
    description: 'Devuelve solo los materiales visibles de los cursos matriculados.',
  })
  findMy(
    @Query() query: QueryMaterialsDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.materialsService.findForStudent(tenantId, userId, query);
  }

  // ----------------------------------------------------------------- Materiales
  @Post()
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear un material' })
  @ApiResponse({ status: 201, description: 'Material creado' })
  create(
    @Body() dto: CreateMaterialDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.materialsService.create(tenantId, dto, userId);
  }

  @Get()
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar materiales' })
  findAll(@Query() query: QueryMaterialsDto, @CurrentTenant() tenantId: string) {
    return this.materialsService.findAll(tenantId, query);
  }

  /**
   * findOne/registerDownload no filtran por visibilidad ni matrícula (los
   * usan también update/remove para TEACHER/TENANT_ADMIN, que sí deben ver
   * materiales no visibles). Para un STUDENT hay que exigirlo aquí: sin esto,
   * cualquier estudiante que obtuviera/adivinara un id de material podía leer
   * y descargar contenido de cursos ajenos o marcado no visible.
   */
  private async asegurarAccesoEstudiante(user: CurrentUserData, tenantId: string, id: string) {
    if (user.role !== 'STUDENT') return;
    const accesible = await this.materialsService.esAccesibleParaEstudiante(
      tenantId,
      user.userId,
      id,
    );
    if (!accesible) {
      throw new NotFoundException('Material no encontrado');
    }
  }

  @Get(':id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'STUDENT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener un material' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.asegurarAccesoEstudiante(user, tenantId, id);
    return this.materialsService.findOne(tenantId, id);
  }

  @Post(':id/download')
  @Roles('TEACHER', 'TENANT_ADMIN', 'STUDENT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Registrar una descarga del material' })
  async download(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.asegurarAccesoEstudiante(user, tenantId, id);
    return this.materialsService.registerDownload(tenantId, id);
  }

  @Patch(':id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar un material' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.materialsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar un material' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.materialsService.remove(tenantId, id);
  }
}
