import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProgramEnrollmentStatus } from '@prisma/client';
import { ProgramEnrollmentsService } from './program-enrollments.service';
import {
  CrearInscripcionDto,
  ActualizarInscripcionDto,
} from './dto/program-enrollment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;

@ApiTags('program-enrollments')
@Controller('program-enrollments')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class ProgramEnrollmentsController {
  constructor(private readonly service: ProgramEnrollmentsService) {}

  @Get()
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Inscripciones a programas del tenant' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('programId') programId?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: ProgramEnrollmentStatus,
  ) {
    return this.service.findAll(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      programId,
      studentId,
      status,
    );
  }

  @Post()
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Inscribir un estudiante a un programa' })
  create(@Body() dto: CrearInscripcionDto, @CurrentTenant() tenantId: string) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar una inscripción (nivel, estado, pensum)' })
  update(
    @Param('id') id: string,
    @Body() dto: ActualizarInscripcionDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.update(tenantId, id, dto);
  }
}

// GET /students/:id/programs vive junto a las demás rutas de students; un
// STUDENT solo puede consultar los suyos (se verifica contra su userId).
@ApiTags('program-enrollments')
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class StudentProgramsController {
  constructor(private readonly service: ProgramEnrollmentsService) {}

  @Get(':id/programs')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Programas en los que está inscrito el estudiante' })
  studentPrograms(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.studentPrograms(tenantId, id, user);
  }
}
