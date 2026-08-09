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
import { AssignmentsService } from './assignments.service';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  SubmitAssignmentDto,
  GradeSubmissionDto,
} from './dto/assignment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';

@ApiTags('assignments')
@Controller('assignments')
// Este controlador no tenia RolesGuard ni una sola anotacion @Roles: un
// estudiante podia crear, editar y borrar tareas, calificar entregas -- la
// suya incluida -- y entregar en nombre de otro alumno.
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear una tarea' })
  create(@Body() data: CreateAssignmentDto, @CurrentTenant() tenantId: string) {
    return this.assignmentsService.create(data, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tareas' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.assignmentsService.findAll(tenantId, courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una tarea' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    // La tarea venia con TODAS las entregas del grupo: contenido, archivo,
    // nota, retroalimentacion y el correo de cada autor. Al alumnado se le
    // devuelve unicamente la suya.
    let soloDe: string | undefined;
    if (user?.role === 'STUDENT') {
      soloDe = await this.assignmentsService.estudianteDelUsuario(
        user.userId,
        tenantId,
      );
      // Sin ficha de estudiante el filtro quedaria vacio y volveria a
      // devolverlo todo: es preferible negar el acceso que abrirlo por defecto.
      if (!soloDe) {
        throw new ForbiddenException('El usuario no tiene ficha de estudiante');
      }
    }
    return this.assignmentsService.findOne(id, tenantId, soloDe);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Editar una tarea' })
  update(
    @Param('id') id: string,
    @Body() data: UpdateAssignmentDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.assignmentsService.update(id, data, tenantId);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar una tarea' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.assignmentsService.remove(id, tenantId);
  }

  @Post(':id/submit')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Entregar una tarea' })
  async submit(
    @Param('id') id: string,
    @Body() data: SubmitAssignmentDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    // El autor sale del token. Antes venia en el cuerpo, asi que bastaba poner
    // el id de otro alumno para entregar -- o sabotear -- en su nombre.
    const studentId = await this.assignmentsService.estudianteDelUsuario(
      user.userId,
      tenantId,
    );
    if (!studentId) {
      throw new ForbiddenException('El usuario no tiene ficha de estudiante');
    }
    return this.assignmentsService.submitAssignment(
      id,
      studentId,
      data,
      tenantId,
    );
  }

  @Post('submissions/:id/grade')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Calificar una entrega' })
  grade(
    @Param('id') id: string,
    @Body() data: GradeSubmissionDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.assignmentsService.gradeSubmission(
      id,
      data.grade,
      data.feedback,
      tenantId,
    );
  }
}
