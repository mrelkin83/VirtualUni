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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';

@ApiTags('grades')
@Controller('grades')
// Este controlador no tenia RolesGuard ni una sola anotacion @Roles: bastaba
// estar autenticado en el tenant. Un estudiante podia leer el expediente de
// cualquier companero y modificar o borrar notas, la suya incluida.
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  /** Un estudiante solo puede consultar su propio expediente. */
  private async asegurarExpedientePropio(
    user: CurrentUserData,
    studentId: string,
    tenantId: string,
  ) {
    if (user?.role !== 'STUDENT') return;
    const propio = await this.gradesService.esExpedienteDelUsuario(
      user.userId,
      studentId,
      tenantId,
    );
    if (!propio) {
      throw new ForbiddenException('Solo puedes consultar tus propias notas');
    }
  }

  @Post()
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Registrar una calificación' })
  create(@Body() data: CreateGradeDto, @CurrentTenant() tenantId: string) {
    return this.gradesService.create(data, tenantId);
  }

  @Get('my')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Mis notas' })
  // El panel del estudiante llamaba a /grades/student/:id pasando el id de
  // USUARIO, que nunca coincide con el de estudiante: la consulta devolvia
  // siempre una lista vacia y las notas jamas se mostraban. Con esta ruta el
  // frontend no tiene que conocer su ficha, igual que en /attendance/my o
  // /certificates/my.
  async findMine(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const studentId = await this.gradesService.estudianteDelUsuario(
      user.userId,
      tenantId,
    );
    if (!studentId) {
      throw new ForbiddenException('El usuario no tiene ficha de estudiante');
    }
    return this.gradesService.findByStudent(studentId, tenantId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Notas de un estudiante' })
  async findByStudent(
    @Param('studentId') studentId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.asegurarExpedientePropio(user, studentId, tenantId);
    return this.gradesService.findByStudent(studentId, tenantId);
  }

  @Get('course/:courseId')
  // Son las notas de todo el grupo: un estudiante no tiene por que verlas.
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Notas de un curso completo' })
  findByCourse(
    @Param('courseId') courseId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.gradesService.findByCourse(courseId, tenantId);
  }

  @Get('student/:studentId/average')
  @ApiOperation({ summary: 'Promedio de un estudiante' })
  async getAverage(
    @Param('studentId') studentId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
    @Query('courseId') courseId?: string,
  ) {
    await this.asegurarExpedientePropio(user, studentId, tenantId);
    return this.gradesService.getStudentAverage(studentId, tenantId, courseId);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Corregir una calificación' })
  update(
    @Param('id') id: string,
    @Body() data: UpdateGradeDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.gradesService.update(id, data, tenantId);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar una calificación' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.gradesService.remove(id, tenantId);
  }
}
