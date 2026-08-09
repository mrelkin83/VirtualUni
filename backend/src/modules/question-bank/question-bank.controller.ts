import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuestionBankService } from './question-bank.service';
import { CrearPreguntaDto, ActualizarPreguntaDto } from './dto/pregunta.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser, CurrentUserData } from '@/common/decorators/current-user.decorator';

@ApiTags('question-bank')
@Controller('question-bank')
// El banco es material de evaluación: solo profesorado y administración. Que
// el alumnado pudiera leerlo equivaldría a repartir el examen por adelantado.
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class QuestionBankController {
  constructor(private readonly service: QuestionBankService) {}

  @Get()
  @ApiOperation({ summary: 'Listar el banco de preguntas' })
  findAll(@CurrentTenant() tenantId: string, @Query('categoria') categoria?: string) {
    return this.service.findAll(tenantId, categoria);
  }

  @Post()
  @ApiOperation({ summary: 'Añadir una pregunta al banco' })
  create(
    @Body() dto: CrearPreguntaDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.create(tenantId, user?.userId ?? null, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar una pregunta' })
  update(@Param('id') id: string, @Body() dto: ActualizarPreguntaDto, @CurrentTenant() tenantId: string) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una pregunta' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.remove(tenantId, id);
  }
}
