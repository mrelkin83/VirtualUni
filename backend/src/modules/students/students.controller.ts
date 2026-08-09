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
} from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new student' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.studentsService.create(createStudentDto, tenantId);
  }

  @Get()
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all students in tenant' })
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
    return this.studentsService.findAll(tenantId, pageNum, limitNum, search);
  }

  /**
   * El listado general ya estaba reservado a docentes y administracion, pero
   * la ficha individual y sus estadisticas no llevaban @Roles: cualquier
   * estudiante podia consultar el expediente de un companero pasando su id.
   */
  private async asegurarFichaPropia(
    user: CurrentUserData,
    studentId: string,
    tenantId: string,
  ) {
    if (user?.role !== 'STUDENT') return;
    const propio = await this.studentsService.esFichaDelUsuario(
      user.userId,
      studentId,
      tenantId,
    );
    if (!propio) {
      throw new ForbiddenException('Solo puedes consultar tu propia ficha');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.asegurarFichaPropia(user, id, tenantId);
    return this.studentsService.findOne(id, tenantId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get student statistics' })
  async getStats(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.asegurarFichaPropia(user, id, tenantId);
    return this.studentsService.getStudentStats(id, tenantId);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update student' })
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.studentsService.update(id, updateStudentDto, tenantId);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete student' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.studentsService.remove(id, tenantId);
  }
}
