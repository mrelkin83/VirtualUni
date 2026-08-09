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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LiveClassesService } from './live-classes.service';
import { CreateLiveClassDto, UpdateLiveClassDto, QueryLiveClassesDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('live-classes')
@Controller('live-classes')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class LiveClassesController {
  constructor(private readonly liveClassesService: LiveClassesService) {}

  @Get('my')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Clases de mis cursos' })
  findMy(
    @Query() query: QueryLiveClassesDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.liveClassesService.findForStudent(tenantId, userId, query);
  }

  @Post()
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Programar una clase en vivo' })
  @ApiResponse({ status: 201, description: 'Clase creada' })
  create(@Body() dto: CreateLiveClassDto, @CurrentTenant() tenantId: string) {
    return this.liveClassesService.create(tenantId, dto);
  }

  @Get()
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar clases en vivo' })
  findAll(@Query() query: QueryLiveClassesDto, @CurrentTenant() tenantId: string) {
    return this.liveClassesService.findAll(tenantId, query);
  }

  @Get(':id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'STUDENT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener una clase' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.liveClassesService.findOne(tenantId, id);
  }

  @Post(':id/start')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Iniciar la clase' })
  start(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.liveClassesService.start(tenantId, id);
  }

  @Post(':id/finish')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Finalizar la clase' })
  finish(
    @Param('id') id: string,
    @Body('grabacionUrl') grabacionUrl: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.liveClassesService.finish(tenantId, id, grabacionUrl);
  }

  @Post(':id/join')
  @Roles('STUDENT', 'TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Unirse a la clase' })
  join(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.liveClassesService.join(tenantId, id);
  }

  @Patch(':id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar una clase' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLiveClassDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.liveClassesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar una clase' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.liveClassesService.remove(tenantId, id);
  }
}
