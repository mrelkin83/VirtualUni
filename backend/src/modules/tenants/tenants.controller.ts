import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';
import { TenantStatus } from '@prisma/client';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Estas rutas reciben el tenant por la ruta o la cabecera, no por el token,
   * asi que TenantGuard (que compara cabecera contra JWT) no las cubre. Sin
   * esta comprobacion, cualquier usuario autenticado podia leer el registro
   * comercial y el consumo de cualquier otro cliente con solo saber su id o
   * su slug.
   */
  private asegurarAccesoAlTenant(tenantId: string, user: CurrentUserData) {
    if (user?.role === 'SUPER_ADMIN') return;
    if (user?.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied for the requested tenant');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant (public endpoint)' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tenants (super admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: TenantStatus })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: TenantStatus,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.tenantsService.findAll(pageNum, limitNum, status);
  }

  @Get('by-subdomain/:subdomain')
  @ApiOperation({ summary: 'Get tenant by subdomain (public endpoint)' })
  findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.tenantsService.findBySubdomain(subdomain);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the tenant of the authenticated user' })
  findCurrent(@CurrentUser('tenantId') tenantId: string) {
    // Se lee del token, NO de @CurrentTenant(): ese decorador prioriza
    // request.tenantId, que el middleware rellena con la cabecera
    // X-Tenant-ID, de modo que cambiarla devolvia el tenant de otro cliente.
    return this.tenantsService.findOne(tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenant by ID or slug' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    // Se resuelve primero porque `id` admite tambien el slug: comparar el
    // parametro en crudo contra user.tenantId dejaria pasar el slug.
    const tenant = await this.tenantsService.findOne(id);
    this.asegurarAccesoAlTenant(tenant.id, user);
    return tenant;
  }

  @Get(':id/usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenant usage statistics' })
  async getUsage(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    const tenant = await this.tenantsService.findOne(id);
    this.asegurarAccesoAlTenant(tenant.id, user);
    return this.tenantsService.getUsageStats(tenant.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant settings' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    // El rol TENANT_ADMIN bastaba para entrar aqui con el id o el slug de
    // CUALQUIER cliente: se podia renombrarlo, cambiarle el plan, apropiarse
    // de su dominio propio o dejarlo en SUSPENDED, lo que impide entrar a
    // todos sus usuarios porque TenantGuard exige estado ACTIVE.
    const tenant = await this.tenantsService.findOne(id);
    this.asegurarAccesoAlTenant(tenant.id, user);
    return this.tenantsService.update(tenant.id, updateTenantDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant status (super admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TenantStatus,
  ) {
    return this.tenantsService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete tenant (super admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
