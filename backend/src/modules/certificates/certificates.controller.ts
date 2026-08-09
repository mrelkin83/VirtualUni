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
import { CertificatesService } from './certificates.service';
import {
  CreateCertificateRequestDto,
  UpdateCertificateRequestDto,
  QueryCertificatesDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;

@ApiTags('certificates')
@Controller('certificates')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('my')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Mis solicitudes de certificado' })
  findMy(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string) {
    return this.certificatesService.findMy(tenantId, userId);
  }

  @Post()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Solicitar un certificado' })
  @ApiResponse({ status: 201, description: 'Solicitud creada' })
  create(
    @Body() dto: CreateCertificateRequestDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.certificatesService.create(tenantId, userId, dto);
  }

  @Get('stats')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Estadisticas de certificados' })
  getStats(@CurrentTenant() tenantId: string) {
    return this.certificatesService.getStats(tenantId);
  }

  @Get()
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Listar solicitudes de certificado' })
  findAll(@Query() query: QueryCertificatesDto, @CurrentTenant() tenantId: string) {
    return this.certificatesService.findAll(tenantId, query);
  }

  @Get(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Obtener una solicitud' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.certificatesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCertificateRequestDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.certificatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Eliminar una solicitud' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.certificatesService.remove(tenantId, id);
  }
}
