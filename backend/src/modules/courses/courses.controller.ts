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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new course' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.coursesService.create(createCourseDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses in tenant' })
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
    return this.coursesService.findAll(tenantId, pageNum, limitNum, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    // El catalogo sigue abierto: cualquiera puede consultar un curso. Lo que
    // deja de ver el alumnado es la lista de matriculados de cursos ajenos,
    // que era la via para recolectar los datos de toda la institucion.
    return this.coursesService.findOne(
      id,
      tenantId,
      await this.filtroDeMatricula(user, tenantId),
    );
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get course statistics' })
  async getStats(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    // Mismo criterio que el detalle: las cifras son publicas dentro del
    // tenant, la lista de matriculados no.
    return this.coursesService.getCourseStats(
      id,
      tenantId,
      await this.filtroDeMatricula(user, tenantId),
    );
  }

  /** Devuelve el id de estudiante por el que filtrar, o undefined si no aplica. */
  private async filtroDeMatricula(
    user: CurrentUserData,
    tenantId: string,
  ): Promise<string | undefined> {
    if (user?.role !== 'STUDENT') return undefined;
    const propio = await this.coursesService.estudianteDelUsuario(
      user.userId,
      tenantId,
    );
    // Sin ficha, un filtro vacio devolveria la matricula entera.
    return propio ?? 'sin-ficha-de-estudiante';
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update course' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.coursesService.update(id, updateCourseDto, tenantId);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete course' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.coursesService.remove(id, tenantId);
  }

  @Post(':id/enroll')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Enroll a student in the course' })
  enrollStudent(
    @Param('id') courseId: string,
    @Body() enrollStudentDto: EnrollStudentDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.coursesService.enrollStudent(
      courseId,
      enrollStudentDto.studentId,
      tenantId,
    );
  }

  @Delete(':id/enroll/:studentId')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Unenroll a student from the course' })
  @HttpCode(HttpStatus.NO_CONTENT)
  unenrollStudent(
    @Param('id') courseId: string,
    @Param('studentId') studentId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.coursesService.unenrollStudent(courseId, studentId, tenantId);
  }
}
