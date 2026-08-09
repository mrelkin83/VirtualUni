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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

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

  @Get(':id')
  @ApiOperation({ summary: 'Get teacher by ID' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.teachersService.findOne(id, tenantId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get teacher statistics' })
  getStats(@Param('id') id: string, @CurrentTenant() tenantId: string) {
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
