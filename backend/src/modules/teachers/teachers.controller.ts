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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser, CurrentUserData } from '@/common/decorators/current-user.decorator';

@ApiTags('teachers')
@Controller('teachers')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new teacher' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTeacherDto: CreateTeacherDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.teachersService.create(createTeacherDto, tenantId);
  }

  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all teachers in tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.teachersService.findAll(tenantId, pageNum, limitNum, search);
  }

  /**
   * El listado (findAll) ya está reservado a administración, pero la ficha
   * individual y sus estadísticas no llevaban ningún chequeo: cualquier
   * usuario autenticado —incluido un STUDENT— podía pedir el perfil completo
   * (email, avatarUrl, lastLoginAt, departamento, especialización...) de
   * cualquier docente con solo conocer su id. Mismo patrón que
   * StudentsController.asegurarFichaPropia.
   */
  private async asegurarFichaPropia(user: CurrentUserData, teacherId: string, tenantId: string) {
    if (user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN') return;
    if (user?.role !== 'TEACHER') {
      throw new ForbiddenException('No tienes acceso a esta ficha');
    }
    const propio = await this.teachersService.esFichaDelUsuario(user.userId, teacherId, tenantId);
    if (!propio) {
      throw new ForbiddenException('Solo puedes consultar tu propia ficha');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get teacher by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.asegurarFichaPropia(user, id, tenantId);
    return this.teachersService.findOne(id, tenantId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get teacher statistics' })
  async getStats(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.asegurarFichaPropia(user, id, tenantId);
    return this.teachersService.getTeacherStats(id, tenantId);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update teacher' })
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.teachersService.update(id, updateTeacherDto, tenantId);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete teacher' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.teachersService.remove(id, tenantId);
  }
}
